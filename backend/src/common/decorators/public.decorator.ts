import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator @Public() para marcar rotas que NÃO precisam de JWT.
 * Exemplo: Login, Registro, Health Check.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
