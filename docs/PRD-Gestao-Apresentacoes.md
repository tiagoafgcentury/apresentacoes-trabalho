# Documento de Requisitos (PRD) - Sistema de Gestão de Apresentações Executivas

## 1. Visão Geral
Este documento descreve o plano para organizar, proteger e expandir o portal de apresentações corporativas. O objetivo é permitir a inclusão de novas apresentações baseadas em HTML de forma escalável, mantendo a segurança e a identidade visual.

## 2. Estrutura do Sistema (Arquitetura)
O sistema opera como um **Portal Estático** com autenticação em nível de sessão.

### 2.1 Estrutura de Diretórios
```text
/ (raiz)
├── docs/                       # Documentação e PRDs
├── assets/                     # Recursos compartilhados (Logos, CSS comum)
├── index.html                  # Portal Principal (Menu de Acesso)
└── [nome-da-apresentacao]/     # Diretório específico da apresentação
    ├── index.html              # Arquivo principal da apresentação
    └── assets/                 # Imagens/vídeos específicos desta apresentação
```

## 3. Requisitos Funcionais

### 3.1 Portal Principal (Landing Page)
- **Menu Dinâmico:** Exibir cards com título, descrição e link para as apresentações internas.
- **Autenticação Unificada:** Exigir senha `century00` no primeiro acesso.
- **Single Sign-On (SSO):** Ao logar no portal, todas as apresentações internas devem ser liberadas automaticamente via `sessionStorage`.

### 3.2 Apresentações Internas
- **Independência Tecnológica:** Cada apresentação pode usar diferentes frameworks (Reveal.js, slides.com, Vanilla HTML) dentro de seu próprio diretório.
- **Check de Autenticação:** Cada `index.html` deve conter o script de verificação de sessão para garantir que o acesso direto seja bloqueado se o usuário não estiver logado.
- **Navegação de Retorno:** Incluir um botão "Voltar" ou link para o portal principal.

## 4. Segurança e Autenticação
- **Mecanismo:** JavaScript local com validação de string.
- **Sessão:** Uso de `sessionStorage.getItem('authenticated')`.
- **UX de Acesso:** Tela de login em *glassmorfismo* com foco automático no campo de senha e suporte à tecla Enter.

## 5. Fluxo de Inclusão de Novas Apresentações
Para incluir uma nova apresentação no sistema, o desenvolvedor/autor deve:

1. **Criar Pasta:** Criar uma nova pasta na raiz do projeto (ex: `docs/vendas-2026`).
2. **Preparar HTML:** Colocar o arquivo `index.html` da apresentação na pasta.
3. **Injetar Segurança:** Copiar o bloco de script e a `div#login-screen` padrão para o novo arquivo (ver Apêndice A).
4. **Atualizar Portal:** Adicionar um novo `<a class="card">` no `index.html` da raiz com o link para a nova pasta.

## 6. Próximos Passos (Roadmap)
- **Centralização de Script:** Mover a lógica de segurança para um arquivo `assets/js/auth.js` compartilhado para facilitar atualizações futuras.
- **Templates de Design:** Criar um template base de Reveal.js com a identidade visual da Century (cores, logos, fontes) já configuradas.
- **Busca:** Adicionar filtro de busca no portal se o número de apresentações crescer significativamente.

---

## Apêndice A: Snippet de Segurança Padrão
Este código deve ser colado logo após a tag `<body>` em qualquer novo arquivo HTML:

```html
<script src="../assets/js/auth.js"></script>
<!-- Ou o bloco inline utilizado atualmente -->
```
