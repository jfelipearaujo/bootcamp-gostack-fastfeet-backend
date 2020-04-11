<p align="center">
<img src="https://user-images.githubusercontent.com/7776944/73502355-851b9c00-43a7-11ea-8f9e-64de2e46010a.png"/>
</p>

<h2 align="center">
Bootcamp FastFeet - Back End
</h2>

Este repositório faz parte de uma aplicação completa (Back-end, Front-end e Mobile) de uma transportadora fictícia, o FastFeet.

Para saber mais sobre o projeto, acesse os links abaixo:

- Etapa 1: "FastFeet, o início" / clique <a href="https://github.com/Rocketseat/bootcamp-gostack-desafio-02/blob/master/README.md#desafio-02-iniciando-aplica%C3%A7%C3%A3o">aqui</a> para saber mais sobre esta etapa
- Etapa 2: "FastFeet, continuando a aplicação" / clique <a href="https://github.com/Rocketseat/bootcamp-gostack-desafio-03/blob/master/README.md#desafio-03-continuando-aplica%C3%A7%C3%A3o">aqui</a> para saber mais sobre esta etapa

<h3 align="center">
  Banco de dados
</h3>

Atualmente o sistema conta com os seguintes bancos de dados:

- Postgres
- Redis

<h2 align="center">
	Ferramentas utilizadas
</h2>

Neste projeto foram utilizadas diversas ferramentas para ajudar no ambiente de desenvolvimento, são elas:

> Dependências

 - Bcryptjs
 - Bee-Queue
 - Cors
 - Date-fns
 - Dotenv
 - Express
 - JsonWebToken
 - Nodemailer
 - Multer
 - Postgrees
 - Sequelize
 - Sentry
 - Youch
 - YUP
 
> Dependências de desenvolvimento

 - ESLint
 - Factory Gril
 - Faker
 - Jest
 - Nodemon
 - Prettier
 - Sucrase
 - Supertest
 - SQLite 

<h2 align="center">
	Executando a API
</h2>

Para executar o projeto basta clonar este repositório e abrir o PowerShell (ou outro terminal) na pasta raiz, feito isso execute o seguinte comando:

```
yarn
```

O comando acima fará o download de todas as dependências utilizadas no projeto.

Feito isso basta rodar o comando:

```
yarn dev
```

O servidor já estará rodando, na URL http://localhost/3000

<h2 align="center">
	Testes automatizados
</h2>

A API conta com testes automatizados para todas as rotas desenvolvidas, abaixo segue o gráfico do codecoverage gerado pelo Jest:

<p align="center">
<img src="https://user-images.githubusercontent.com/7776944/79054712-9261cc00-7c1d-11ea-82fc-736f7bbe571d.png"/>
</p>

<h2 align="center">
	Testando a aplicação
</h2>

Para testar a aplicação, será necessário realizar o clone do repositório e ter instalado em sua máquina os seguintes bancos de dados:

- Postgres
- Redis

> É possível utilizar o Docker para a conteinerização das imagens dos bancos de dados
> Lembre-se de modificar o arquivo de variáveis de ambiente

Realize os testes através do Insomnia com o link abaixo:

<div align="center">
<a href="https://insomnia.rest/run/?label=GoStack%20-%20FastFeet&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fjfelipearaujo%2Fbootcamp-gostack-fastfeet-backend%2Fmaster%2Fgostack_fastfeet_backend.json" target="_blank"><img src="https://insomnia.rest/images/run.svg" alt="Run in Insomnia"></a>
</div>
