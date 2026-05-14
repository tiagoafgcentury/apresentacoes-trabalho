import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    console.log('Tentativa de login para:', email);

    // Busca usuário no banco
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? AND is_active = 1',
      args: [email],
    });

    console.log('Resultado da busca no banco:', result.rows.length, 'usuário(s) encontrado(s)');

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Valida senha
    const valid = await bcrypt.compare(password, user.password as string);
    console.log('Senha válida?', valid);

    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    console.log('Gerando token para role:', user.role);

    // Gera JWT
    const token = signToken({
      id: user.id as string,
      name: user.name as string,
      email: user.email as string,
      role: user.role as 'admin' | 'viewer',
    });

    // Define cookie HttpOnly
    const response = NextResponse.json({ ok: true, role: user.role });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
