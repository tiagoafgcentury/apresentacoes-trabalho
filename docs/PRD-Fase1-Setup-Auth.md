# PRD — Fase 1: Scaffold, Banco de Dados, Autenticação e Upload de HTML

**Versão:** 1.0  
**Fase:** 1 de 4  
**Estimativa:** 1–2 semanas  
**Pré-requisito:** Nenhum  
**Status:** 🔲 Não iniciado

---

## Objetivo da Fase

Criar a base funcional do sistema: projeto Next.js configurado, banco SQLite rodando localmente, login funcionando e o primeiro HTML de apresentação sendo servido de forma segura.

Ao final desta fase, será possível:
- Fazer login com email e senha
- Fazer upload de um arquivo HTML
- Acessar a apresentação via URL protegida (com autenticação)

---

## Entregas

### 1. Scaffold do Projeto Next.js

**Tarefas:**
- [ ] Criar projeto: `npx create-next-app@latest ./portal --typescript --app --tailwind --no-src-dir`
- [ ] Instalar dependências:
  ```bash
  npm install @libsql/client bcryptjs jsonwebtoken
  npm install -D @types/bcryptjs @types/jsonwebtoken
  ```
- [ ] Criar arquivo `.env.local` com as variáveis de ambiente
- [ ] Criar arquivo `.gitignore` incluindo `database.db` e `uploads/`

**Estrutura inicial de pastas:**
```
/
├── app/
├── lib/
├── uploads/         (criado manualmente, ignorado pelo git)
├── .env.local
└── database.db      (gerado automaticamente)
```

---

### 2. Banco de Dados SQLite Local

**Arquivo:** `lib/db.ts`  
Inicializa o cliente `@libsql/client` com suporte a SQLite local e Turso na nuvem via variáveis de ambiente.

**Arquivo:** `lib/schema.sql`  
Contém o SQL de criação das 4 tabelas (users, presentations, permissions, access_logs).

**Arquivo:** `scripts/migrate.ts`  
Script que lê o `schema.sql` e executa no banco. Rodar uma vez na instalação:
```bash
npx ts-node scripts/migrate.ts
```

**Arquivo:** `scripts/seed.ts`  
Cria o primeiro usuário admin para acesso inicial:
```ts
// Cria admin padrão: admin@century.com / century@2026
```

---

### 3. Autenticação (Login / Logout)

**Fluxo:**
```
POST /api/auth/login
  body: { email, password }
  
  1. Busca usuário na tabela users pelo email
  2. bcrypt.compare(password, user.password)
  3. Se OK: gera JWT com { id, role, name }
  4. Define cookie HttpOnly "session" com o JWT
  5. Retorna { ok: true }
  
POST /api/auth/logout
  1. Apaga o cookie "session"
  2. Retorna { ok: true }
```

**Middleware (`middleware.ts`):**
- Rotas protegidas: `/portal/*`, `/admin/*`, `/api/presentations/*`, `/api/serve/*`
- Lê o cookie `session`, valida o JWT
- Se inválido ou ausente → redireciona para `/login`
- Se válido mas role `viewer` tentar `/admin/*` → redireciona para `/portal`

**Páginas:**
- `/login` → Formulário de email + senha (dark mode, glassmorphism, mesmo estilo do portal atual)

---

### 4. Upload e Armazenamento de HTML

**Endpoint:** `POST /api/presentations`  
Aceita `multipart/form-data`:
```
title       : string
description : string (opcional)
file        : .html
```

**Processamento:**
1. Valida que o usuário é `admin`
2. Gera um UUID para a apresentação
3. Salva o arquivo em `/uploads/{uuid}.html`
4. Insere registro na tabela `presentations`
5. Retorna `{ id, title }`

---

### 5. Endpoint Seguro para Servir o HTML

**Endpoint:** `GET /api/serve/[id]`

**Lógica:**
1. Valida JWT do cookie (usuário autenticado)
2. Verifica se existe registro em `permissions` para (user_id, presentation_id)
3. Se não tem permissão → `403 Forbidden`
4. Se tem permissão → lê o arquivo `/uploads/{id}.html` e retorna como `text/html`

> **Importante:** O HTML é retornado diretamente como resposta, não como redirecionamento para o arquivo. Isso garante que o arquivo nunca seja acessível publicamente.

---

## Critérios de Aceite da Fase 1

- [ ] `npm run dev` sobe o projeto sem erros
- [ ] Script de migrate cria as tabelas no `database.db`
- [ ] Script de seed cria o usuário admin inicial
- [ ] Login com credenciais corretas redireciona para `/portal`
- [ ] Login com credenciais erradas exibe mensagem de erro
- [ ] Logout limpa o cookie e redireciona para `/login`
- [ ] Admin consegue fazer upload de um `.html` via endpoint
- [ ] `GET /api/serve/{id}` retorna 403 para usuário sem permissão
- [ ] `GET /api/serve/{id}` retorna o HTML correto para usuário com permissão

---

## Dependências

```json
{
  "@libsql/client": "^0.6.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0"
}
```
