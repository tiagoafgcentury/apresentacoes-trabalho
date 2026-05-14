import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/presentations — lista todas (admin) ou só as autorizadas (viewer)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  let result;
  if (session.role === 'admin') {
    result = await db.execute('SELECT * FROM presentations ORDER BY created_at DESC');
  } else {
    result = await db.execute({
      sql: `SELECT p.* FROM presentations p
            INNER JOIN permissions perm ON perm.presentation_id = p.id
            WHERE perm.user_id = ? AND p.is_active = 1
            ORDER BY p.created_at DESC`,
      args: [session.id],
    });
  }

  return NextResponse.json(result.rows);
}

// POST /api/presentations — faz upload de novo HTML (admin only)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const file = formData.get('file') as File;

  if (!title || !file) {
    return NextResponse.json({ error: 'Título e arquivo são obrigatórios' }, { status: 400 });
  }

  const id = randomUUID();
  const fileName = `${id}.html`;
  const uploadsDir = join(process.cwd(), 'uploads');

  await mkdir(uploadsDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadsDir, fileName), Buffer.from(bytes));

  await db.execute({
    sql: `INSERT INTO presentations (id, title, description, file_path, created_by)
          VALUES (?, ?, ?, ?, ?)`,
    args: [id, title, description || null, fileName, session.id],
  });

  return NextResponse.json({ ok: true, id, title });
}
