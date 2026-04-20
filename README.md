# 💻 Progest - Frontend (Vue.js)

Este é o repositório do Frontend do sistema ProGest, desenvolvido em Vue.js com Vite.

> **Atenção:** A API do Backend deve estar rodando para que o sistema funcione.

---

## ⚡ Forma 1: Rodando com Node/NPM + XAMPP (Local)

**Pré-requisitos:** Node.js instalado.

### Passo a Passo
1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Aponte para o Backend:** Crie um `.env.development` na raiz:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
3. **Inicie o servidor:**
   ```bash
   npm run dev
   ```
   ✅ *Acesse a URL gerada no terminal (ex: `http://localhost:5173`).*

---

## 🐳 Forma 2: Usando Docker (Modo Produção/Local)

Neste modo, o frontend roda dentro de um container Nginx e se comunica com o Traefik.

### Passo a Passo

1. **Preparar Variáveis (.env):** Copie o arquivo `.env.example` para `.env` e ajuste:
    * Local: `APP_DOMAIN=app.localhost` e `VITE_API_URL=http://${APP_DOMAIN}/api`
    * Produção (em `.env.production`): `APP_DOMAIN=sistema-hospital.com.br` e `VITE_API_URL=https://${APP_DOMAIN}/api`
      - O domínio ainda precisa ser definido e registrado.
2.  **Suba o container localmente:**
    ```bash
    docker compose -f docker-compose.local.yml up -d --build
    ```
    O parâmetro --build é obrigatório sempre que você alterar a URL da API no .env.
3.  **Acesse:** http://app.localhost (Local) ou seu domínio oficial.

-----

## 🚨 Dicas Rápidas

   * **Mudança de Link:** O domínio único agora governa o frontend e backend. Ajuste apenas `APP_DOMAIN` em seus `.env`.
   * **Problemas de CORS:** Agora são extintos nativamente na produção e no Docker local pois a API compartilha a base do Frontend (ex: `/api`).
   * **Banco Vazio:** Se o sistema logar mas não mostrar nada, certifique-se de ter rodado o comando `php artisan db:seed` no backend.

---

### Guia de Deploy Online (Após adquirir domínio)

Para provisionar o painel para a web definitivamente com certificado SSL gratuito:

1.  **DNS**: Crie um apontamento Tipo `A` do seu domínio na sua registradora para o IP do seu host.
2.  **SSL Config**: No arquivo `docker-compose.yml` da pasta `traefik-proxy`, preencha a propriedade de e-mail `--certificatesresolvers.myresolver.acme.email=...` com um e-mail válido seu.
3.  **Variável de Produção**: Tenha certeza que criou os `.env` com a seguinte variável base:
    ```env
    APP_DOMAIN=sistema-hospital.com.br
    ```
4.  **Comando Final (Produção)**: No terminal, navegue nas 3 pastas (proxy, backend e frontend) e inicie os containers:
    ```bash
    docker compose up -d --build
    ```
    > ⚠️ **Aviso Importante:** Repare que o comando de Produção acima **NÃO USA** a flag `-f docker-compose.local.yml`. Ao omitir o arquivo, o Docker lerá o `docker-compose.yml` original, que ativa as configurações reais de domínio e o SSL Let's Encrypt padrão de produção.
    O Frontend ficará responsivo no root do domínio, e a API automaticamente aninhada em `/api` sob o mesmo domínio de forma segura.
