import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.LIBSQL_URL!,
  authToken: process.env.LIBSQL_AUTH_TOKEN || undefined,
});
