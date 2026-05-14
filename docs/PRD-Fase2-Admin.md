# PRD — Fase 2: Painel Administrativo e Controle de Permissões

**Versão:** 1.0  
**Fase:** 2 de 4  
**Estimativa:** 1 semana  
**Pré-requisito:** Fase 1 concluída  
**Status:** 🔲 Não iniciado

---

## Objetivo da Fase

Construir o painel administrativo completo, permitindo que o admin gerencie usuários, apresentações e defina quem pode ver cada conteúdo.

Ao final desta fase, o admin conseguirá:
- Criar, editar e desativar usuários
- Listar e gerenciar apresentações cadastradas
- Atribuir e revogar permissões de acesso por usuário/apresentação

---

## Entregas

### 1. Layout do Painel Admin

**Página base:** `/admin`

**Componentes:**
- Sidebar com navegação: Dashboard / Usuários / Apresentações / Logs
- Header com nome do usuário logado e botão de logout
- Área de conteúdo principal

**Design:** Dark mode consistente com o portal atual (fundo `#020617`, acentos em `#F06520`)

---

### 2. Módulo de Usuários

**Página:** `/admin/users`

**Funcionalidades:**
- Listagem de todos os usuários em tabela (nome, email, role, status, data de criação)
- Botão "Novo Usuário" → abre modal com formulário
- Editar usuário (nome, role, ativar/desativar)
- Reset de senha (admin define nova senha para o usuário)

**Endpoints necessários:**

```
GET    /api/users           → lista todos os usuários (admin only)
POST   /api/users           → cria novo usuário
PATCH  /api/users/[id]      → edita nome, role, is_active
DELETE /api/users/[id]      → desativa usuário (soft delete, não apaga)
```

**Payload de criação:**
```json
{
  "name": "João Silva",
  "email": "joao@century.com",
  "password": "senha-inicial",
  "role": "viewer"
}
```

> **Regra:** Não é possível desativar a própria conta de admin logada.

---

### 3. Módulo de Apresentações

**Página:** `/admin/presentations`

**Funcionalidades:**
- Listagem de todas as apresentações (título, descrição, data de upload, status)
- Upload de nova apresentação (formulário com título, descrição, arquivo `.html`)
- Editar metadados (título, descrição, ativar/desativar)
- Excluir apresentação (remove arquivo e registro do banco)
- Visualizar apresentação (abre `/api/serve/[id]` em nova aba)

**Endpoints necessários:**
```
GET    /api/presentations        → lista todas as apresentações
POST   /api/presentations        → upload de nova apresentação
PATCH  /api/presentations/[id]   → edita metadados
DELETE /api/presentations/[id]   → remove apresentação e arquivo
```

---

### 4. Módulo de Permissões (o mais importante)

**Página:** `/admin/presentations/[id]/permissions`

**Interface:**
```
┌─────────────────────────────────────────────┐
│  Permissões: "Software B8 - Documentação"   │
│─────────────────────────────────────────────│
│  ✅  Tiago Gomes       (admin@century.com)  │
│  ✅  João Silva        (joao@century.com)   │
│  ☐   Maria Santos      (maria@century.com)  │
│  ☐   Carlos Mendes     (carlos@century.com) │
│─────────────────────────────────────────────│
│  [Salvar Permissões]                        │
└─────────────────────────────────────────────┘
```

- Lista todos os usuários com checkbox indicando se tem ou não acesso
- Salvar faz um diff e aplica os INSERTs/DELETEs necessários na tabela `permissions`

**Endpoints necessários:**
```
GET    /api/permissions?presentation_id={id}   → lista permissões de uma apresentação
POST   /api/permissions                        → concede acesso
DELETE /api/permissions?user_id=&presentation_id=  → revoga acesso
```

**Lógica de salvamento em batch:**
```ts
// Recebe lista completa de user_ids com acesso
// Compara com o estado atual no banco
// Remove os que foram desmarcados
// Insere os que foram marcados
```

---

### 5. Painel de Controle (Dashboard)

**Página:** `/admin`  
Cards de resumo:
- Total de usuários ativos
- Total de apresentações ativas
- Últimos 5 acessos (usuário + apresentação + data)

---

## Critérios de Aceite da Fase 2

- [ ] Admin acessa `/admin` e vê o dashboard com dados reais
- [ ] Admin cria um novo usuário e ele aparece na listagem
- [ ] Admin desativa um usuário e ele não consegue mais logar
- [ ] Admin faz upload de nova apresentação via interface
- [ ] Admin desativa uma apresentação e ela some do portal dos viewers
- [ ] Admin abre a tela de permissões de uma apresentação e vê todos os usuários
- [ ] Marcar/desmarcar e salvar atualiza corretamente a tabela `permissions`
- [ ] Usuário sem permissão recebe 403 ao tentar acessar `/api/serve/{id}`
- [ ] Usuário com permissão acessa normalmente
