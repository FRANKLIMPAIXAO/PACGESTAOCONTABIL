import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // Validação automática dos DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Remove campos não declarados no DTO
      forbidNonWhitelisted: true, // Rejeita campos desconhecidos
      transform: true,       // Converte tipos automaticamente
    }),
  );

  // CORS — permite acesso do frontend
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  // Swagger (documentação da API)
  const config = new DocumentBuilder()
    .setTitle('PAC Gestão Contábil — API')
    .setDescription('API profissional para gestão operacional de escritórios contábeis. Sistema multi-tenant com isolamento por escritório.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Autenticação', 'Login, registro e refresh token')
    .addTag('Clientes', 'CRUD de clientes do escritório')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  console.log(`🚀 PAC Gestão Contábil API rodando em: http://localhost:${port}/api/docs`);
}

bootstrap();
