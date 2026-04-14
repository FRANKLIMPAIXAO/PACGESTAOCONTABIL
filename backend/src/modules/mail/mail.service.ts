import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY não configurada no .env. Envios de e-mail falharão.');
    }
    this.resend = new Resend(apiKey || 'sk_test_placeholder');
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    // Essa é a URL do frontend que chamará nossa API ou podemos linkar direto para a API temporariamente
    // Como a pergunta não foi confirmada pelo user, farei apontar direto para a API e a API redireciona ou dá json "Email verificado".
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';
    const verifyUrl = `${frontendUrl.replace(/\/$/, '')}/verify-email?token=${token}`;
    const fromEmail = 'Contato PAC Gestão <contato@pacgestao.com.br>'; // Resposta do usuário.

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
        <div style="background-color: #0b1120; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #10b981; margin: 0;">PAC Gestão</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #1f2937;">Bem-vindo, ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">Obrigado por iniciar seu período de testes no PAC Gestão Contábil.</p>
          <p style="color: #4b5563; line-height: 1.6;">Para mantermos a segurança da sua conta, pedimos que confirme seu endereço de e-mail clicando no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirmar Acesso Mestre</a>
          </div>
          <p style="color: #9ca3af; font-size: 13px;">Se o botão não funcionar, copie e cole este link no seu navegador:<br>
          <a href="${verifyUrl}" style="color: #10b981; word-break: break-all;">${verifyUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">PAC Gestão Contábil - Seu escritório na nuvem.</p>
        </div>
      </div>
    `;

    const effectiveFromEmail =
      this.configService.get<string>('MAIL_FROM') ||
      fromEmail;

    try {
      const data = await this.resend.emails.send({
        from: effectiveFromEmail,
        to: email,
        subject: 'Confirme seu acesso ao PAC Gestão',
        html: htmlContent,
      });
      return data;
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail para ${email}:`, error);
      throw error;
    }
  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
    const fromEmail = 'Contato PAC Gestão <contato@pacgestao.com.br>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
        <div style="background-color: #0b1120; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #10b981; margin: 0;">PAC Gestão</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #1f2937;">Olá, ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">Recebemos uma solicitação para redefinir a senha da sua conta no PAC Gestão Contábil.</p>
          <p style="color: #4b5563; line-height: 1.6;">Se você não fez essa solicitação, basta ignorar este e-mail.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
          </div>
          <p style="color: #9ca3af; font-size: 13px;">Se o botão não funcionar, copie e cole este link no seu navegador:<br>
          <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">PAC Gestão Contábil - Seu escritório na nuvem.</p>
        </div>
      </div>
    `;

    const effectiveFromEmail =
      this.configService.get<string>('MAIL_FROM') ||
      fromEmail;

    try {
      const data = await this.resend.emails.send({
        from: effectiveFromEmail,
        to: email,
        subject: 'Redefinição de Senha - PAC Gestão',
        html: htmlContent,
      });
      return data;
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail de redefinição para ${email}:`, error);
      throw error;
    }
  }
}
