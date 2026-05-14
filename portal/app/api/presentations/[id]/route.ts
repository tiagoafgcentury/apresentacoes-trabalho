import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  try {
    // Busca o caminho do arquivo antes de deletar
    const result = await db.execute({
      sql: 'SELECT file_path FROM presentations WHERE id = ?',
      args: [id],
    });

    const presentation = result.rows[0];
    if (!presentation) {
      return NextResponse.json({ error: 'Apresentação não encontrada' }, { status: 404 });
    }

    // 1. Remove permissões vinculadas
    await db.execute({
      sql: 'DELETE FROM permissions WHERE presentation_id = ?',
      args: [id],
    });

    // 2. Remove logs vinculados
    await db.execute({
      sql: 'DELETE FROM access_logs WHERE presentation_id = ?',
      args: [id],
    });

    // 3. Remove a apresentação do banco
    await db.execute({
      sql: 'DELETE FROM presentations WHERE id = ?',
      args: [id],
    });

    // 4. Tenta remover o arquivo físico
    try {
      const filePath = join(process.cwd(), 'uploads', presentation.file_path as string);
      await unlink(filePath);
    } catch (e) {
      console.error('Erro ao remover arquivo físico:', e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao excluir apresentação' }, { status: 500 });
  }
}
