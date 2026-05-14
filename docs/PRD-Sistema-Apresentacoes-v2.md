# PRD — Sistema de Gestão de Apresentações Executivas (v2)
**Versão:** 2.0  
**Data:** Maio 2026  
**Autor:** Tiago Gomes  
**Status:** Planejamento

---

## 1. Visão do Produto

Evoluir o portal atual (HTML estático + autenticação por sessão) para uma **plataforma web completa**, com backend, banco de dados e painel administrativo, que permita:

- Upload de apresentações em HTML com **preservação total do design, animações e navegação originais**.
- Controle de acesso por usuário e permissão por apresentação.
- Gestão centralizada sem necessidade de editar arquivos HTML manualmente.

---

## 2. Problema Atual e Limitações

| Limitação | Impacto |
|---|---|
| Senha única em JS (visível no código-fonte) | Segurança fraca |
| Adicionar nova apresentação exige edição de HTML | Não escalável |
| Sem controle de "quem pode ver o quê" | Todos veem tudo |
| Sem histórico de acesso ou auditoria | Sem visibilidade |

---

## 3. Arquitetura Proposta

### 3.1 Stack Tecnológico Recomendado

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Frontend (Portal)** | Next.js (App Router) | Simples, com API Routes embutidas |
| **Backend (API)** | Next.js API Routes | Sem servidor separado necessário |
| **Banco de Dados (local)** | **SQLite** (arquivo `.db`) | Zero configuração para testes locais |
| **Banco de Dados (prod)** | **Turso** (SQLite na nuvem) | Mesma API, só muda a variável de ambiente |
| **Autenticação** | JWT manual (jsonwebtoken + bcrypt) | Sem dependências externas de auth |
| **Armazenamento (HTML)** | Upload local (pasta `/uploads`) | Arquivos servidos pelo próprio Next.js |
| **Hospedagem** | Vercel | Deploy gratuito, automático via GitHub |

> **Vantagem do `@libsql/client`:** O mesmo SDK funciona com SQLite local e com Turso na nuvem. A troca entre ambientes é feita apenas por variáveis de ambiente, sem alterar uma linha de código.

> **Nota:** O GitHub Pages não suporta backend. Migração para Vercel é gratuita e leva menos de 30 minutos.

### 3.2 Estratégia de Banco por Ambiente

```
# .env.local (desenvolvimento - SQLite local)
LIBSQL_URL=file:./database.db
LIBSQL_AUTH_TOKEN=          # vazio para SQLite local

# .env.production (Turso na nuvem)
LIBSQL_URL=libsql://<seu-banco>.turso.io
LIBSQL_AUTH_TOKEN=<token-gerado-pelo-turso>
```

O cliente é inicializado uma única vez no projeto:

```ts
// lib/db.ts
import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.LIBSQL_URL!,
  authToken: process.env.LIBSQL_AUTH_TOKEN,
});
```

Isso significa que:
- **Localmente:** roda com um arquivo `database.db` na pasta do projeto, sem internet
- **Em produção:** aponta para o Turso na nuvem, sem mudar código
- **Migrations:** o mesmo script SQL cria as tabelas nos dois ambientes

---

### 3.2 Como o HTML Importado é Exibido

Este é o ponto técnico mais importante do sistema. O objetivo é **preservar 100% do design original** do arquivo HTML gerado.

**Solução: Wrapper com `<iframe>`**

```
┌─────────────────────────────────────────────────┐
│  NAVBAR DO SISTEMA (controles + usuário + logout) │
├─────────────────────────────────────────────────┤
│                                                   │
│   ┌─────────────────────────────────────────┐    │
│   │                                         │    │
│   │   <iframe src="/api/serve/{id}">        │    │
│   │                                         │    │
│   │   [ CONTEÚDO HTML ORIGINAL ]            │    │
│   │   (Reveal.js, animações, CSS, tudo      │    │
│   │    preservado como foi gerado)           │    │
│   │                                         │    │
│   └─────────────────────────────────────────┘    │
│                                                   │
└─────────────────────────────────────────────────┘
```

- O sistema adiciona apenas a **barra superior** (controles, usuário logado, botão sair).
- O HTML da apresentação é servido isoladamente dentro do iframe.
- Reveal.js, transições, fontes, cores — tudo roda exatamente como foi criado.
- Opcionalmente, o sistema pode oferecer um **modo "tela cheia"** que esconde até a barra superior.

---

## 4. Modelo de Dados (SQLite via Turso)

### Tabela: `users`
```sql
CREATE TABLE users (
  id         TEXT PRIMARY KEY,  -- UUID gerado no app
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,     -- bcrypt hash
  role       TEXT DEFAULT 'viewer', -- 'admin' | 'viewer'
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Tabela: `presentations`
```sql
CREATE TABLE presentations (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  file_path   TEXT NOT NULL,    -- caminho local: /uploads/{id}.html
  thumbnail   TEXT,             -- /uploads/{id}.png (opcional)
  created_by  TEXT REFERENCES users(id),
  created_at  TEXT DEFAULT (datetime('now')),
  is_active   INTEGER DEFAULT 1 -- 0 = desativada
);
```

### Tabela: `permissions`
```sql
CREATE TABLE permissions (
  id               TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES users(id),
  presentation_id  TEXT REFERENCES presentations(id),
  granted_at       TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, presentation_id)
);
```

### Tabela: `access_logs`
```sql
CREATE TABLE access_logs (
  id               TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES users(id),
  presentation_id  TEXT REFERENCES presentations(id),
  accessed_at      TEXT DEFAULT (datetime('now'))
);
```

---

## 5. Funcionalidades por Módulo

### 5.1 Autenticação
- Login com email + senha armazenados **na tabela `users` do Turso/SQLite**
- Senha armazenada como hash `bcrypt` (nunca em texto puro)
- Sessão via **JWT gerado pelo próprio Next.js** (`jsonwebtoken`), sem serviço externo
- Token enviado como cookie `HttpOnly` para proteção contra XSS

### 5.2 Painel Administrativo (role: `admin`)
- **Usuários:** Criar, editar, ativar/desativar usuários
- **Apresentações:** Upload de HTML + assets (ZIP), definir título, descrição, thumbnail
- **Permissões:** Atribuir quais usuários têm acesso a quais apresentações
- **Logs:** Histórico de quem acessou o quê e quando

### 5.3 Portal do Usuário (role: `viewer`)
- Ver apenas as apresentações às quais tem permissão
- Interface de cards idêntica ao portal atual (dark mode, glassmorphism)
- Abrir apresentação em modo iframe com opção de tela cheia

### 5.4 Upload de Apresentação
1. Admin faz upload de um arquivo `.html` (ou `.zip` com assets) pelo painel
2. Sistema salva o arquivo na pasta `/uploads/{id}.html` no próprio servidor
3. Metadata (título, descrição, caminho) é salvo na tabela `presentations` do Turso/SQLite
4. Sistema gera um endpoint seguro: `GET /api/serve/[id]`
5. O endpoint valida o JWT do usuário **e a permissão na tabela `permissions`** antes de servir o HTML
6. Apresentação aparece no portal apenas para usuários autorizados

---

## 6. Fluxo de Uso

### Adicionar nova apresentação:
```
Admin → Painel → "Nova Apresentação"
     → Upload do .html (gerado no Reveal.js, Canva, etc.)
     → Define: Título, Descrição, Thumbnail
     → Seleciona usuários com acesso
     → Salva → Aparece no portal dos usuários autorizados
```

### Acessar apresentação (viewer):
```
Usuário → Login (email + senha)
        → Vê cards das apresentações que tem acesso
        → Clica → Abre em iframe (design 100% preservado)
        → Log de acesso registrado automaticamente
```

---

## 7. Roadmap de Implementação

### Fase 1 — MVP (1-2 semanas)
- [ ] Setup Next.js + Turso (`@libsql/client`)
- [ ] Login com email/senha (JWT, bcrypt)
- [ ] Upload de arquivo `.html` para pasta `/uploads`
- [ ] Endpoint seguro `/api/serve/[id]` (valida JWT antes de servir)
- [ ] Portal com listagem de apresentações do usuário
- [ ] Exibição via `<iframe>` com preservação total do HTML

### Fase 2 — Painel Admin (1 semana)
- [ ] CRUD de usuários
- [ ] Gerenciar permissões por apresentação
- [ ] Ativar/desativar apresentações

### Fase 3 — Polimento (dias)
- [ ] Log de acessos
- [ ] Thumbnail manual no upload
- [ ] Busca no portal

---

## 8. Considerações de Segurança

- O HTML é servido pelo backend, **nunca exposto diretamente** como arquivo estático
- Cada requisição ao endpoint `/api/serve/{id}` valida o JWT do usuário e a permissão na tabela `permissions`
- Usuário sem permissão recebe `403 Forbidden`
- Logs de auditoria completos para rastreabilidade

---

## 9. Decisão de Hospedagem

> **Ação necessária:** Migrar de **GitHub Pages** para **Vercel**.
>
> - Vercel tem plano gratuito generoso
> - Suporte nativo a Next.js e API Routes
> - Deploy automático via GitHub (como hoje)
> - Migração leva menos de 30 minutos
> - O banco Turso é externo (nuvem), então funciona perfeitamente com Vercel

---

## 10. Próximo Passo Imediato

1. Validar e aprovar este PRD
2. Criar conta no Supabase (gratuita)
3. Iniciar Fase 1: scaffold do projeto Next.js
