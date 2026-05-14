import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  // Não permitir deletar a si mesmo
  if (id === session.id) {
    return NextResponse.json({ error: 'Você não pode excluir seu próprio usuário' }, { status: 400 });
  }

  try {
    // Remove permissões vinculadas
    await db.execute({
      sql: 'DELETE FROM permissions WHERE user_id = ?',
      args: [id],
    });

    // Remove logs vinculados
    await db.execute({
      sql: 'DELETE FROM access_logs WHERE user_id = ?',
      args: [id],
    });

    // Remove o usuário
    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
  }
}
