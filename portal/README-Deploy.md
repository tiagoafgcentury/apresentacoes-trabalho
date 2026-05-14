# Guia de Deploy - Portal de Apresentações Century

Este projeto foi desenvolvido em Next.js 14+ e está pronto para ser hospedado na **Vercel** com banco de dados **Turso**.

## 1. Banco de Dados (Turso)

Como o projeto usa o protocolo `libsql`, a transição do SQLite local para o Turso é transparente.

1.  Crie uma conta no [Turso](https://turso.tech).
2.  Crie um novo banco de dados: `turso db create century-presentations`.
3.  Obtenha a URL do banco: `turso db show century-presentations --url`.
4.  Gere um token de acesso: `turso db tokens create century-presentations`.

## 2. Configuração na Vercel

1.  Suba o código para um repositório no GitHub.
2.  Importe o projeto na Vercel.
3.  Configure as seguintes Variáveis de Ambiente (Environment Variables):
    *   `LIBSQL_URL`: URL do Turso (ex: `libsql://...`)
    *   `LIBSQL_AUTH_TOKEN`: Token gerado no Turso.
    *   `JWT_SECRET`: Uma string longa e aleatória para segurança dos tokens.
    *   `NODE_ENV`: `production`

## 3. Armazenamento de Arquivos

Atualmente o sistema salva arquivos na pasta `/uploads` local.
> [!IMPORTANT]
> Para produção na Vercel (que tem sistema de arquivos somente-leitura), recomenda-se:
> 1.  Alterar o `app/api/presentations/route.ts` para usar **Vercel Blob** ou **AWS S3**.
> 2.  Ou manter o uso de arquivos estáticos dentro de `public/uploads` se as apresentações forem poucas e fixas (não recomendado para upload dinâmico em runtime).

## 4. Scripts Iniciais

Após o deploy, você pode rodar os scripts de migration e seed remotamente (se configurar o `LIBSQL_URL` localmente apontando para o Turso) ou via uma rota de API temporária.
