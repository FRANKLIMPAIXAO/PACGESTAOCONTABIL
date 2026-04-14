import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  private createEmailVerificationToken(userId: string) {
    return this.jwtService.sign(
      { sub: userId, type: 'email-verification' },
      { secret: this.configService.get('JWT_SECRET'), expiresIn: '2h' },
    );
  }

  async register(dto: RegisterDto) {
    // Verificar se o e-mail já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Criar escritório + usuário OWNER em transação atômica
    const result = await this.prisma.$transaction(async (tx) => {
      const slug = dto.officeName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const office = await tx.office.create({
        data: {
          name: dto.officeName,
          slug: `${slug}-${Date.now().toString(36)}`,
          status: 'TRIAL',
        },
      });

      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: 'OWNER',
          officeId: office.id,
        },
      });

      return { user, office };
    });

    // Gerar token de verificação de email (2 horas)
    const verificationToken = this.createEmailVerificationToken(result.user.id);

    // Enviar E-mail em background (não travar o request vitaliciamente)
    this.mailService.sendVerificationEmail(result.user.email, result.user.name, verificationToken)
      .catch((err) => console.error('Erro ao disparar email Resend:', err));

    return {
      message: 'Conta criada com sucesso. Verifique seu e-mail para confirmar o acesso.',
      user: {
        id: result.user.id,
        email: result.user.email,
      }
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { office: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Você precisa confirmar seu e-mail para fazer login.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário desativado. Contate o administrador.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.officeId, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      office: {
        id: user.office.id,
        name: user.office.name,
        slug: user.office.slug,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { office: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    // Deletar o token usado (rotação de refresh token)
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const tokens = await this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.officeId,
      stored.user.role,
    );

    return {
      user: {
        id: stored.user.id,
        name: stored.user.name,
        email: stored.user.email,
        role: stored.user.role,
      },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { message: 'Logout realizado com sucesso' };
  }

  async resendVerificationEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { message: 'Se existir uma conta pendente para este e-mail, enviaremos uma nova confirmação.' };
    }

    if (user.emailVerified) {
      return { message: 'Este e-mail já foi confirmado. Você já pode acessar o sistema.' };
    }

    const verificationToken = this.createEmailVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return { message: 'Enviamos um novo e-mail de confirmação. Verifique sua caixa de entrada e spam.' };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (decoded.type !== 'email-verification') {
        throw new UnauthorizedException('Token inválido');
      }

      await this.prisma.user.update({
        where: { id: decoded.sub },
        data: {
          emailVerified: true,
          isActive: true,
        },
      });

      return { message: 'E-mail verificado com sucesso. Você já pode fazer login.' };
    } catch (e) {
      throw new UnauthorizedException('Link de verificação expirado ou inválido.');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { message: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: expiresAt,
      },
    });

    this.mailService.sendPasswordResetEmail(user.email, user.name, rawToken)
      .catch((err) => console.error('Erro ao enviar email de reset:', err));

    return { message: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;
    
    // Calcula o hash local do token recebido para bater com o do banco
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Link de redefinição inválido ou expirado. Solicite novamente.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: 'Senha redefinida com sucesso. Você já pode fazer login.' };
  }

  private async generateTokens(userId: string, email: string, officeId: string, role: string) {
    const payload = { sub: userId, email, officeId, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
    });

    const refreshTokenValue = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }
}
