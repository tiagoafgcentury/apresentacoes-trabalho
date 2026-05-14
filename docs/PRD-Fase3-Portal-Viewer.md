# PRD — Fase 3: Portal do Usuário Viewer e Exibição das Apresentações

**Versão:** 1.0  
**Fase:** 3 de 4  
**Estimativa:** 3–5 dias  
**Pré-requisito:** Fases 1 e 2 concluídas  
**Status:** 🔲 Não iniciado

---

## Objetivo da Fase

Construir a experiência do usuário final (viewer): o portal de cards com as apresentações disponíveis e o visualizador que exibe o HTML preservando 100% do design, animações e navegação originais.

---

## Entregas

### 1. Portal de Apresentações do Viewer

**Página:** `/portal`

**Funcionamento:**
- Busca apenas as apresentações que o usuário logado tem permissão de ver (via JOIN com `permissions`)
- Exibe em grid de cards (mesmo design do portal atual: dark mode, glassmorphism, borda laranja)
- Card contém: thumbnail (se houver), título, descrição e botão "Abrir"

**Query da listagem:**
```sql
SELECT p.id, p.title, p.description, p.thumbnail
FROM presentations p
INNER JOIN permissions perm ON perm.presentation_id = p.id
WHERE perm.user_id = ? AND p.is_active = 1
ORDER BY p.created_at DESC;
```

**Design do card:**
```
┌──────────────────────────┐
│  [thumbnail ou ícone]    │
│                          │
│  Título da Apresentação  │
│  Descrição curta...      │
│                          │
│  [Abrir]                 │
└──────────────────────────┘
```

---

### 2. Visualizador de Apresentação (iframe seguro)

**Página:** `/portal/view/[id]`

**Estrutura da tela:**
```
┌─────────────────────────────────────────────────────┐
│  [← Voltar ao Portal]     Título da Apresentação    │
│                                            [⛶ Tela Cheia] │
├─────────────────────────────────────────────────────┤
│                                                     │
│   <iframe src="/api/serve/{id}" />                  │
│                                                     │
│   (100% do HTML original: Reveal.js, animações,     │
│    fontes, cores — tudo preservado)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Comportamentos:**
- Barra superior mínima com título e botão de voltar
- `<iframe>` ocupa 100% do espaço restante da tela
- Botão "Tela Cheia" (`iframe.requestFullscreen()`) esconde até a barra superior
- Antes de renderizar o iframe, valida no servidor se o usuário tem permissão para essa apresentação — redireciona para `/portal` com mensagem de erro se não tiver

---

### 3. Como o HTML é Servido (preservação do design)

**Endpoint:** `GET /api/serve/[id]`

Fluxo completo:
```
1. Middleware valida JWT do cookie
2. API verifica permissão na tabela permissions
3. Lê o arquivo /uploads/{id}.html do sistema de arquivos
4. Retorna o conteúdo com header: Content-Type: text/html
```

**Por que o iframe preserva tudo:**
- O HTML roda em seu próprio contexto isolado
- Reveal.js, CSS, animações, fontes — executam normalmente dentro do iframe
- Não há nenhuma transformação ou re-estilização do conteúdo
- Se o HTML original tinha transições, partículas, gradientes → eles aparecem

**Configuração do iframe:**
```html
<iframe
  src="/api/serve/{id}"
  width="100%"
  height="100%"
  style="border: none;"
  allowfullscreen
/>
```

---

### 4. Tela de "Sem Acesso"

Se o usuário tentar acessar uma apresentação sem permissão via URL direta (`/portal/view/[id]`):
- Redireciona para `/portal` com query param `?error=forbidden`
- Portal exibe toast/alerta: "Você não tem permissão para acessar esta apresentação."

---

### 5. Header do Portal do Viewer

Componente fixo em todas as páginas do viewer:
- Nome do usuário logado (canto direito)
- Botão "Sair" → chama `POST /api/auth/logout`
- Logo/nome do sistema (canto esquerdo)

---

## Critérios de Aceite da Fase 3

- [ ] Viewer logado vê apenas as apresentações que tem permissão
- [ ] Viewer não vê apresentações de outros usuários
- [ ] Clicar em "Abrir" carrega o visualizador `/portal/view/[id]`
- [ ] O iframe exibe o HTML original com design, animações e navegação preservados
- [ ] Reveal.js funciona normalmente dentro do iframe (teclas, cliques, transições)
- [ ] Botão "Tela Cheia" expande o iframe para o tamanho total da janela
- [ ] Botão "Voltar" retorna ao portal de cards
- [ ] Acesso direto via URL sem permissão redireciona para `/portal` com mensagem de erro
- [ ] Usuário não autenticado tentando acessar qualquer rota → redireciona para `/login`
