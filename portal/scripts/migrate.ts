import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrate() {
  const db = createClient({
    url: process.env.LIBSQL_URL!,
    authToken: process.env.LIBSQL_AUTH_TOKEN || undefined,
  });

  const schema = readFileSync(join(process.cwd(), 'lib', 'schema.sql'), 'utf-8');
  const statements = schema.split(';').map(s => s.trim()).filter(Boolean);

  for (const statement of statements) {
    await db.execute(statement);
  }

  console.log('✅ Migration concluída com sucesso!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Erro na migration:', err);
  process.exit(1);
});
