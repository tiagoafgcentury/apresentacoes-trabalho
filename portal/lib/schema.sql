-- Usuários do sistema
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT DEFAULT 'viewer',
  is_active  INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Apresentações cadastradas
CREATE TABLE IF NOT EXISTS presentations (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  file_path   TEXT NOT NULL,
  thumbnail   TEXT,
  created_by  TEXT REFERENCES users(id),
  created_at  TEXT DEFAULT (datetime('now')),
  is_active   INTEGER DEFAULT 1
);

-- Permissões: quem pode ver o quê
CREATE TABLE IF NOT EXISTS permissions (
  id               TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES users(id),
  presentation_id  TEXT REFERENCES presentations(id),
  granted_at       TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, presentation_id)
);

-- Log de acessos
CREATE TABLE IF NOT EXISTS access_logs (
  id               TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES users(id),
  presentation_id  TEXT REFERENCES presentations(id),
  accessed_at      TEXT DEFAULT (datetime('now'))
);
