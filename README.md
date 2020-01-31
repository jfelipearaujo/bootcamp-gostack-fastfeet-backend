<p align="center">
<img src="https://user-images.githubusercontent.com/7776944/73502355-851b9c00-43a7-11ea-8f9e-64de2e46010a.png"/>
</p>

<h2 align="center">
Bootcamp FastFeet - Back End
</h2>

Este repositório faz parte de uma aplicação completa (Back-end, Front-end e Mobile) de uma transportadora fictícia, o FastFeet.

Para saber mais sobre o projeto, acesse os links abaixo:

- Etapa 1: "o início" / clique <a href="[https://github.com/Rocketseat/bootcamp-gostack-desafio-02/blob/master/README.md#desafio-02-iniciando-aplica%C3%A7%C3%A3o](https://github.com/Rocketseat/bootcamp-gostack-desafio-02/blob/master/README.md#desafio-02-iniciando-aplica%C3%A7%C3%A3o)">aqui</a> para saber mais sobre esta etapa

<h3 align="center">
  Banco de dados
</h3>

Atualmente o sistema conta com os seguintes bancos de dados:

- Postgres

<h2 align="center">
	Ferramentas utilizadas
</h2>

Neste projeto foram utilizadas diversas ferramentas para ajudar no ambiente de desenvolvimento e outras para incorporar o projeto, são elas:

 - Express
 - Sucrase
 - Nodemon
 - ESLint
 - Prettier
 - Sequelize
 - Bcryptjs
 - JSONWebToken
 - YUP

<h2 align="center">
	Executando o server
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
	Middlewares
</h2>

- Validador verificando se existe um token no header das requisições e se o mesmo é válido

<h2 align="center">
	Testando a aplicação
</h2>

Para testar a aplicação, será necessário realizar o clone do repositório e ter instalado na máquina os seguintes bancos de dados:

- Postgres
> É possível utilizar o Docker para a conteinerização das imagens dos bancos de dados

Realize os testes através do Insomnia (certifique-se te tê-lo instalado em sua máquina):

<div align="center">
<a href="https://insomnia.rest/run/?label=GoStack%20-%20FastFeet&uri=https%3A%2F%2Fgithub.com%2Fjfelipearaujo%2Fbootcamp-gostack-fastfeet-backend%2Fblob%2Fmaster%2Fgostack_fastfeet_backend_2020-01-30.json" target="_blank"><img src="https://insomnia.rest/images/run.svg" alt="Run in Insomnia"></a>
</div>
