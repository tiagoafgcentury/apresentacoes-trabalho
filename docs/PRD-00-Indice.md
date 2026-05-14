# Portal de Apresentações Executivas — Índice do Projeto

**Versão:** 1.0  
**Data:** Maio 2026  
**Status:** Em Planejamento

---

## Visão Geral

Sistema web para gestão de apresentações executivas em HTML, com controle de acesso por usuário, painel administrativo e preservação total do design e animações das apresentações importadas.

---

## Stack Definitiva

| Camada | Tecnologia |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Banco de dados (local) | SQLite (arquivo `database.db`) |
| Banco de dados (produção) | Turso (`@libsql/client`) |
| Autenticação | bcrypt + JWT próprio (cookie HttpOnly) |
| Armazenamento de HTMLs | Pasta `/uploads` local |
| Hospedagem | Vercel |

---

## Documentos por Fase

| Arquivo | Fase | Descrição | Status |
|---|---|---|---|
| [PRD-Fase1-Setup-Auth.md](./PRD-Fase1-Setup-Auth.md) | Fase 1 | Scaffold, banco, login e upload de HTML | ✅ Concluído |
| [PRD-Fase2-Admin.md](./PRD-Fase2-Admin.md) | Fase 2 | Painel admin, usuários e permissões | ✅ Concluído |
| [PRD-Fase3-Portal-Viewer.md](./PRD-Fase3-Portal-Viewer.md) | Fase 3 | Portal do usuário viewer e exibição via iframe | ✅ Concluído |
| [PRD-Fase4-Polimento.md](./PRD-Fase4-Polimento.md) | Fase 4 | Logs, busca, thumbnails e deploy final | ✅ Concluído |

---

## Estrutura Final do Projeto

```
/apresentacoes-portal/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (admin)/
│   │   ├── admin/page.tsx
│   │   ├── admin/users/page.tsx
│   │   └── admin/presentations/page.tsx
│   ├── (viewer)/
│   │   └── portal/page.tsx
│   └── api/
│       ├── auth/login/route.ts
│       ├── auth/logout/route.ts
│       ├── presentations/route.ts
│       ├── presentations/[id]/route.ts
│       ├── serve/[id]/route.ts
│       ├── users/route.ts
│       └── permissions/route.ts
├── lib/
│   ├── db.ts           (cliente SQLite/Turso)
│   ├── auth.ts         (JWT helpers)
│   └── schema.sql      (criação das tabelas)
├── uploads/            (HTMLs das apresentações)
├── database.db         (SQLite local — não subir no git)
├── .env.local
└── .env.production
```

---

## Modelo de Dados (Schema SQL)

```sql
-- Usuários do sistema
CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,        -- bcrypt hash
  role       TEXT DEFAULT 'viewer', -- 'admin' | 'viewer'
  is_active  INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Apresentações cadastradas
CREATE TABLE presentations (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  file_path   TEXT NOT NULL,       -- /uploads/{id}.html
  thumbnail   TEXT,
  created_by  TEXT REFERENCES users(id),
  created_at  TEXT DEFAULT (datetime('now')),
  is_active   INTEGER DEFAULT 1
);

-- Permissões: quem pode ver o quê
CREATE TABLE permissions (
  id               TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES users(id),
  presentation_id  TEXT REFERENCES presentations(id),
  granted_at       TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, presentation_id)
);

-- Log de acessos
CREATE TABLE access_logs (
  id               TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES users(id),
  presentation_id  TEXT REFERENCES presentations(id),
  accessed_at      TEXT DEFAULT (datetime('now'))
);
```

---

## Variáveis de Ambiente

```env
# .env.local (desenvolvimento)
LIBSQL_URL=file:./database.db
LIBSQL_AUTH_TOKEN=
JWT_SECRET=chave-secreta-local-qualquer

# .env.production (Vercel + Turso)
LIBSQL_URL=libsql://<seu-banco>.turso.io
LIBSQL_AUTH_TOKEN=<token-do-turso>
JWT_SECRET=<string-longa-e-aleatoria>
```
