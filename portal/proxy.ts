import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_ROUTES = ['/login'];
const ADMIN_ROUTES = ['/admin'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas: deixa passar
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Lê o cookie de sessão
  const token = request.cookies.get('session')?.value;
  const session = token ? verifyToken(token) : null;

  // Sem sessão: redireciona para login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Viewer tentando acessar área admin: redireciona para portal
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*', '/api/presentations/:path*', '/api/serve/:path*', '/api/users/:path*', '/api/permissions/:path*'],
};
