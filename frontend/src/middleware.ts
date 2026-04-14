import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/verify-email'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas: deixa passar
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Verifica token no cookie (para SSR) ou deixa o client redirecionar
  // O AuthContext cuida do redirect no client-side
  return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next|favicon.ico|.*\\..*).*)'] };
