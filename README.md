# Meal Tracker API

Meal Tracker API é uma aplicação backend desenvolvida para gerenciar usuários e suas refeições, fornecendo métricas detalhadas sobre a dieta dos usuários. O projeto é desenvolvido usando Node.js, Fastify, Knex.js e SQLite, e inclui autenticação JWT.

## Funcionalidades

- **Cadastro e Autenticação de Usuários**: Permite criar novos usuários e autenticar-se no sistema.
- **Gerenciamento de Refeições**: Usuários podem registrar, editar, deletar e visualizar refeições.
- **Métricas de Refeições**: Fornece métricas como quantidade total de refeições, refeições dentro e fora da dieta, e a melhor sequência de refeições dentro da dieta.

## Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Fastify](https://www.fastify.io/)
- [Knex.js](https://knexjs.org/)
- [SQLite](https://www.sqlite.org/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [zod](https://zod.dev/)

## Instalação

1. Clone o repositório:
```bash
   git clone https://github.com/seu-usuario/meal-tracker-api.git
   cd meal-tracker-api
```
2. Instale as dependências:
```bash
    npm install
```
3. Configure as variáveis de ambiente:
    Crie um arquivo .env na raiz do projeto com o seguinte conteúdo:
```bash
    DATABASE_CLIENT=sqlite
    DATABASE_URL=./db.sqlite
    JWT_SECRET=seu_segredo_jwt
    PORT=3000
```
4. Execute as migrações do banco de dados:
```bash
    npm run knex migrate:latest
```
5. Inicie o servidor:
```bash
    npm run dev
```
# Middleware

Autenticação
A autenticação é feita através de JWT. O token JWT deve ser enviado no cabeçalho das requisições como Authorization: Bearer <token>.

# Verificação do Token

O middleware de verificação do token (authMiddleware) é usado para proteger as rotas que requerem autenticação. Ele verifica o token JWT e adiciona as informações do usuário à requisição.