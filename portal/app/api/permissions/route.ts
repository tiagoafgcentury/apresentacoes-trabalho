import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { randomUUID } from 'crypto';

// GET /api/permissions?presentation_id=123
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return new NextResponse('Acesso negado', { status: 403 });

  const { searchParams } = new URL(request.url);
  const presentationId = searchParams.get('presentation_id');

  if (!presentationId) return NextResponse.json({ error: 'ID ausente' }, { status: 400 });

  const result = await db.execute({
    sql: 'SELECT user_id FROM permissions WHERE presentation_id = ?',
    args: [presentationId],
  });

  const userIds = result.rows.map(r => r.user_id as string);
  return NextResponse.json(userIds);
}

// POST /api/permissions (salva array de usuários para uma apresentação)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return new NextResponse('Acesso negado', { status: 403 });

  const { presentation_id, user_ids } = await request.json();

  if (!presentation_id || !Array.isArray(user_ids)) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  try {
    // 1. Remove todas as permissões atuais dessa apresentação
    await db.execute({
      sql: 'DELETE FROM permissions WHERE presentation_id = ?',
      args: [presentation_id],
    });

    // 2. Insere as novas
    for (const userId of user_ids) {
      await db.execute({
        sql: 'INSERT INTO permissions (id, user_id, presentation_id) VALUES (?, ?, ?)',
        args: [randomUUID(), userId, presentation_id],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erro ao salvar permissões:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
