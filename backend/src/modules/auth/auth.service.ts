import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

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
    const verificationToken = this.jwtService.sign(
      { sub: result.user.id, type: 'email-verification' },
      { secret: this.configService.get('JWT_SECRET'), expiresIn: '2h' },
    );

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
      throw new UnauthorizedException('Você precisa confirmar seu e-mail antes de acessar. Verifique sua caixa de entrada.');
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
