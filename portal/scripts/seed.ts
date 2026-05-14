import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seed() {
  const db = createClient({
    url: process.env.LIBSQL_URL!,
    authToken: process.env.LIBSQL_AUTH_TOKEN || undefined,
  });

  const password = await bcrypt.hash('century@2026', 12);
  const id = randomUUID();

  await db.execute({
    sql: `INSERT OR IGNORE INTO users (id, name, email, password, role)
          VALUES (?, ?, ?, ?, 'admin')`,
    args: [id, 'Tiago Gomes', 'admin@century.com', password],
  });

  console.log('✅ Usuário admin criado!');
  console.log('   Email: admin@century.com');
  console.log('   Senha: century@2026');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
