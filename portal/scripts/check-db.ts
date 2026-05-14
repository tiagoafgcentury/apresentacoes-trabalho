import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function check() {
  const db = createClient({
    url: process.env.LIBSQL_URL!,
    authToken: process.env.LIBSQL_AUTH_TOKEN || undefined,
  });

  const result = await db.execute('SELECT id, name, email, role, is_active FROM users');
  console.log(JSON.stringify(result.rows, null, 2));
  process.exit(0);
}

check().catch(console.error);
