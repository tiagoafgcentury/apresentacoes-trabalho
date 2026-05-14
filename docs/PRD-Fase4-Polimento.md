# PRD — Fase 4: Polimento, Logs, Deploy e Migração para Produção

**Versão:** 1.0  
**Fase:** 4 de 4  
**Estimativa:** 3–5 dias  
**Pré-requisito:** Fases 1, 2 e 3 concluídas  
**Status:** 🔲 Não iniciado

---

## Objetivo da Fase

Finalizar o sistema com recursos de auditoria, melhorias de UX, e preparar o ambiente de produção com Turso + Vercel substituindo o GitHub Pages atual.

---

## Entregas

### 1. Log de Acessos (Auditoria)

**Quando registrar:** Sempre que um usuário acessa `/api/serve/[id]` com sucesso.

**Endpoint:** Inserção automática dentro de `GET /api/serve/[id]`:
```sql
INSERT INTO access_logs (id, user_id, presentation_id, accessed_at)
VALUES (?, ?, ?, datetime('now'));
```

**Painel admin — página de Logs (`/admin/logs`):**
- Tabela com: usuário, apresentação, data/hora do acesso
- Filtros: por usuário, por apresentação, por intervalo de data
- Exportação futura (CSV)

---

### 2. Thumbnails das Apresentações

**Opção A (simples):** Upload manual de imagem no momento do cadastro da apresentação
- Campo adicional no formulário de upload: `thumbnail` (aceita `.jpg`, `.png`, `.webp`)
- Salvo em `/uploads/{id}-thumb.jpg`

**Opção B (automática, fase futura):** Usar `puppeteer` para tirar screenshot do primeiro slide
- Não implementar nesta fase, documentar como próximo passo

**Fallback:** Se não houver thumbnail, exibir ícone padrão (📊) com fundo gradiente no card.

---

### 3. Busca e Filtro no Portal

**No portal do viewer (`/portal`):**
- Campo de busca no topo filtra os cards em tempo real por título e descrição
- Implementado via filtro no lado do cliente (sem nova requisição ao servidor)

**No painel admin (listagens):**
- Campo de busca nas páginas de usuários e apresentações
- Filtro de status (ativo/inativo)

---

### 4. Melhorias de UX

**Toast notifications:**
- Sucesso ao salvar permissões, criar usuário, fazer upload
- Erro ao falhar operações

**Estados de loading:**
- Skeleton cards enquanto o portal carrega
- Spinner durante uploads de arquivo

**Confirmação de ações destrutivas:**
- Modal de confirmação antes de excluir apresentação ou desativar usuário

**Responsividade:**
- Portal e admin adaptados para tablet (mínimo 768px)

---

### 5. Migração para Produção (Turso + Vercel)

**Passo a passo:**

#### 5.1 Criar banco no Turso
```bash
# Instalar CLI do Turso
npm install -g turso

# Login
turso auth login

# Criar banco
turso db create portal-apresentacoes

# Obter URL e token
turso db show portal-apresentacoes
turso db tokens create portal-apresentacoes
```

#### 5.2 Rodar migrations no Turso
```bash
# Apontar para o banco do Turso
LIBSQL_URL=libsql://<seu-banco>.turso.io \
LIBSQL_AUTH_TOKEN=<token> \
npx ts-node scripts/migrate.ts

# Criar usuário admin em produção
LIBSQL_URL=libsql://<seu-banco>.turso.io \
LIBSQL_AUTH_TOKEN=<token> \
npx ts-node scripts/seed.ts
```

#### 5.3 Deploy no Vercel
```bash
# Instalar CLI do Vercel
npm install -g vercel

# Fazer deploy
vercel

# Configurar variáveis de ambiente no painel Vercel:
# LIBSQL_URL     = libsql://<seu-banco>.turso.io
# LIBSQL_AUTH_TOKEN = <token>
# JWT_SECRET     = <string-aleatória-longa>
```

#### 5.4 Armazenamento de uploads em produção

> **Atenção:** O Vercel não persiste arquivos entre deploys (sistema de arquivos efêmero).

**Opção recomendada para produção:** Vercel Blob Storage (gratuito até 1GB)
- Substituir o `fs.writeFile` por `put()` do `@vercel/blob`
- URL do arquivo fica em `blob.url` em vez de `/uploads/{id}.html`
- O endpoint `/api/serve/[id]` faz fetch da URL do blob e retorna o conteúdo

**Script de migração dos uploads locais para o Blob:**
- Documentar como tarefa separada quando o sistema for para produção

---

### 6. Segurança Final

- [ ] Validar tamanho máximo de upload (ex: 10MB por arquivo)
- [ ] Validar que o arquivo enviado é realmente HTML (verificar Content-Type e extensão)
- [ ] Rate limiting na rota `/api/auth/login` (máx 5 tentativas por IP/minuto)
- [ ] Headers de segurança no `next.config.js`:
  ```js
  headers: [
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
  ]
  ```

---

### 7. Documentação Final

- [ ] Atualizar `PRD-00-Indice.md` com status "Concluído" em todas as fases
- [ ] Criar `docs/OPERACAO.md` com guia de uso do sistema:
  - Como criar usuários
  - Como fazer upload de apresentação
  - Como gerenciar permissões
  - Como acessar logs

---

## Critérios de Aceite da Fase 4

- [ ] Log de acesso é registrado a cada visualização de apresentação
- [ ] Admin visualiza histórico de acessos no painel
- [ ] Cards com thumbnail exibem a imagem corretamente
- [ ] Cards sem thumbnail exibem ícone fallback
- [ ] Busca filtra cards em tempo real no portal
- [ ] Toasts de sucesso/erro funcionam em todas as operações do admin
- [ ] Banco criado no Turso com schema idêntico ao local
- [ ] Deploy no Vercel funcionando com variáveis de produção
- [ ] Primeiro usuário admin consegue logar em produção
- [ ] Upload e visualização de apresentação funciona em produção

---

## Próximos Passos Pós-Fase 4 (Backlog Futuro)

| Item | Prioridade |
|---|---|
| Thumbnails automáticos via Puppeteer | Média |
| Exportação de logs em CSV | Baixa |
| SSO corporativo (SAML/LDAP) | Baixa |
| Suporte a upload ZIP (HTML + assets) | Alta |
| Versionamento de apresentações | Média |
| Notificação por email ao receber acesso | Baixa |
