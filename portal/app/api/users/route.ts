import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// Lista todos os usuários
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return new NextResponse('Acesso negado', { status: 403 });

  const result = await db.execute('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
  return NextResponse.json(result.rows);
}

// Cria novo usuário
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return new NextResponse('Acesso negado', { status: 403 });

  const { name, email, password, role } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const id = randomUUID();

    await db.execute({
      sql: 'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      args: [id, name, email, hash, role || 'viewer'],
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
  }
}
