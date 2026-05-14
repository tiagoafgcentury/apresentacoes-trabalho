import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  // Verifica se a apresentação existe
  const presResult = await db.execute({
    sql: 'SELECT * FROM presentations WHERE id = ? AND is_active = 1',
    args: [id],
  });

  if (!presResult.rows[0]) {
    return new NextResponse('Apresentação não encontrada', { status: 404 });
  }

  // Admin pode ver qualquer apresentação; viewer precisa de permissão
  if (session.role !== 'admin') {
    const permResult = await db.execute({
      sql: 'SELECT id FROM permissions WHERE user_id = ? AND presentation_id = ?',
      args: [session.id, id],
    });

    if (!permResult.rows[0]) {
      return new NextResponse('Acesso negado', { status: 403 });
    }
  }

  // Registra log de acesso
  await db.execute({
    sql: 'INSERT INTO access_logs (id, user_id, presentation_id) VALUES (?, ?, ?)',
    args: [randomUUID(), session.id, id],
  });

  // Serve o arquivo HTML
  const filePath = presResult.rows[0].file_path as string;
  const fullPath = join(process.cwd(), 'uploads', filePath);

  try {
    const html = await readFile(fullPath, 'utf-8');
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return new NextResponse('Arquivo não encontrado', { status: 404 });
  }
}
