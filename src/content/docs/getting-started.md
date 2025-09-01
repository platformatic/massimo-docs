---
title: Getting Started
description: Get up and running with Massimo in minutes
---

# Getting Started with Massimo

Massimo is a powerful tool for generating typed HTTP clients from OpenAPI and GraphQL APIs. This guide will help you get started quickly.

## Installation

You can use Massimo directly via npx without installation:

```bash
npx massimo-cli [options]
```

Or install it globally:

```bash
npm install -g massimo-cli
# Then use:
massimo [options]
```

## Creating Your First Client

### OpenAPI Client

To create a client for an OpenAPI API:

```bash
npx massimo-cli http://example.com/openapi.json --name myclient
```

This command will:

1. Download the OpenAPI specification
2. Generate a typed client in the `./myclient` directory
3. Create TypeScript type definitions

### GraphQL Client

For GraphQL APIs:

```bash
npx massimo-cli http://example.com/graphql --name myclient --type graphql
```

### Forcing Client Type

If an API supports both OpenAPI and GraphQL, you can specify which client to generate:

```bash
npx massimo-cli http://example.com/api --name myclient --type openapi
```

### Example Usage in JavaScript (GraphQL)

Use the client in your JavaScript application, by calling a GraphQL endpoint:

```js
import myClient from "./myclient/myclient.mjs";

/**  @type {import('fastify').FastifyPluginAsync<{}> */
export default async function (app, opts) {
  const client = await myClient({ url: "URL" });

  app.post("/", async (request, reply) => {
    const res = await client.graphql({
      query: "query { movies { title } }",
    });
    return res;
  });
}
```

### Example Usage in TypeScript (OpenAPI)

Use the client in Typescript application, by calling an OpenAPI endpoint:

```ts
import { type FastifyInstance } from "fastify";
import myClient from "./myclient/myclient.mjs";

export default async function (app: FastifyInstance) {
  const client = await myClient({ url: "URL" });

  app.get("/", async (request, reply) => {
    return client.get({});
  });
}
```

Note that the generator will also update the `.env` and `.env.sample` files if they exist.

## Generating a client for an unexposed application running within Platformatic Runtime

You can use the Platformatic Management API to extract the schema of an application which is not exposed.

Let's say you have an application created via `wattpm create`:

```bash
$ npx wattpm create
Hello User, welcome to Watt 3.0.0!
? Where would you like to create your project? example
? Which package manager do you want to use? pnpm
? Which kind of application do you want to create? @platformatic/db
? What is the name of the application? movies
? What is the connection string? sqlite://./db.sqlite
? Do you want to create default migrations? yes
? Do you want to use TypeScript? no
? Do you want to create another application? yes
? Which kind of application do you want to create? @platformatic/service
? What is the name of the application? main
? Do you want to use TypeScript? no
? Do you want to create another application? no
? Which application should be exposed? main
? What port do you want to use? 3042
```

As you can see, the `movies` application is not exposed so it is not possible to pass the URL to `massimo`.

To download the OpenAPI schema, you can use the `wattpm inject` command:

```bash
$ npx wattpm inject movies -p /documentation/json > openapi.json
```

Now you can generate a client

```bash
$ npx --package massimo-cli plt-client --name movies -f web/main/movies openapi.json
```

This will create the client in the `web/main/movies` folder.

Now you can modify your `web/main/routes/root.js` file to add another route to use the new client:

```js
import myClient from "./movies/movies.mjs";

export default async function (fastify, opts) {
  fastify.get("/example", async (request, reply) => {
    return { hello: fastify.example };
  });

  fastify.get("/movies", async (request, reply) => {
    const movies = await myClient.getMovies();
    return movies;
  });
}
```

Finally, test your application by doing:

```bash
curl http://127.0.0.1:3042/movies
```

## Types Generator

Types for the client are automatically generated for both OpenAPI and GraphQL schemas. You can generate only the types with the `--types-only` flag.

### Example

```bash
$ npx --package massimo-cli plt-client http://example.com/to/schema/file --name myclient --types-only
```

This will create the single `myclient.d.ts` file.

### OpenAPI Types

We provide a fully typed experience for OpenAPI, typing both the request and response for
each individual OpenAPI operation. Take a look at the example below:

```typescript
// Omitting some types for brevity

interface Client {
  getMovies(req: GetMoviesRequest): Promise<Array<GetMoviesResponse>>;
  createMovie(req: CreateMovieRequest): Promise<CreateMovieResponse>;
  updateMovies(req: UpdateMoviesRequest): Promise<Array<UpdateMoviesResponse>>;
  getMovieById(req: GetMovieByIdRequest): Promise<GetMovieByIdResponse>;
  updateMovie(req: UpdateMovieRequest): Promise<UpdateMovieResponse>;
  updateMovie(req: UpdateMovieRequest): Promise<UpdateMovieResponse>;
  deleteMovies(req: DeleteMoviesRequest): Promise<DeleteMoviesResponse>;
  getQuotesForMovie(
    req: GetQuotesForMovieRequest,
  ): Promise<Array<GetQuotesForMovieResponse>>;
  getQuotes(req: GetQuotesRequest): Promise<Array<GetQuotesResponse>>;
  createQuote(req: CreateQuoteRequest): Promise<CreateQuoteResponse>;
  updateQuotes(req: UpdateQuotesRequest): Promise<Array<UpdateQuotesResponse>>;
  getQuoteById(req: GetQuoteByIdRequest): Promise<GetQuoteByIdResponse>;
  updateQuote(req: UpdateQuoteRequest): Promise<UpdateQuoteResponse>;
  updateQuote(req: UpdateQuoteRequest): Promise<UpdateQuoteResponse>;
  deleteQuotes(req: DeleteQuotesRequest): Promise<DeleteQuotesResponse>;
  getMovieForQuote(
    req: GetMovieForQuoteRequest,
  ): Promise<GetMovieForQuoteResponse>;
}

export function generateQuotesClient(
  opts: PlatformaticClientOptions,
): Promise<Client>;
export default generateQuotesClient;
```

### GraphQL Types

We provide a partially typed experience for GraphQL, because we do not want to limit
how you are going to query the remote system. Take a look at this example:

```typescript
export interface Movie {
  id?: string;

  title?: string;

  releasedDate?: string;

  createdAt?: string;

  preferred?: string;

  quotes?: Array<Quote>;
}
export interface Quote {
  id?: string;

  quote?: string;

  likes?: number;

  dislikes?: number;

  movie?: Movie;
}
export interface MoviesCount {
  total?: number;
}
export interface QuotesCount {
  total?: number;
}
export interface MovieDeleted {
  id?: string;
}
export interface QuoteDeleted {
  id?: string;
}

interface GraphQLQueryOptions {
  query: string;
  headers: Record<string, string>;
  variables: Record<string, unknown>;
}

interface GraphQLClient {
  graphql<T>(options: GraphQLQueryOptions): Promise<T>;
}

export function generateQuotesClient(
  opts: PlatformaticClientOptions,
): Promise<GraphQLClient>;
export default generateQuotesClient;
```

Given only you can know what GraphQL query you are producing, you are responsible for typing
it accordingly.

## Use the Fastify plugin

```js
const fastify = require("fastify")();
const pltClient = require("massimo/fastify-plugin");

fastify.register(pltClient, { url: "http://example.com", type: "graphql" });

// GraphQL
fastify.post("/", async (request, reply) => {
  const res = await request.movies.graphql({
    query: 'mutation { saveMovie(input: { title: "foo" }) { id, title } }',
  });
  return res;
});

// OpenAPI (you need to register the plugin with `openapi` type)
fastify.post("/", async (request, reply) => {
  const res = await request.movies.createMovie({ title: "foo" });
  return res;
});

fastify.listen({ port: 3000 });
```

Note that you would need to install `massimo` as a dependency.

### Adding types information to the fastify Plugin

To add types information to your plugin, you can either extend the `FastifyRequest` interface globally or locally.

```ts
import { type MoviesClient } from "./movies/movies.ts";
import fastify, { type FastifyRequest } from "fastify";
import pltClient from "massimo/fastify-plugin.js";

const server = fastify();
server.register(pltClient, { url: "http://example.com", type: "openapi" });

// Method A: extend the interface globally
declare module "fastify" {
  interface FastifyRequest {
    movies: MoviesClient;
  }
}

server.get("/movies", async (request: FastifyRequest, reply: FastifyReply) => {
  return request.movies.getMovies();
});

// Method B: use a local request extension
interface MoviesRequest extends FastifyRequest {
  movies: MoviesClient;
}

server.get("/movies", async (request: MoviesRequest, reply: FastifyReply) => {
  return request.movies.getMovies();
});
```

### Method Names in OpenAPI

The names of the operations are defined in the OpenAPI specification using the [`operationId`](https://swagger.io/specification/). If it's not specified, the name is generated by combining the parts of the path, like `/something/{param1}/` and a method `GET`, it generates `getSomethingParam1`.

### Authentication

To add necessary headers for downstream services requiring authentication, configure them in your plugin:

```js
/// <reference path="./myclient" />

/**  @type {import('fastify').FastifyPluginAsync<{}> */
module.exports = async function (app, opts) {
  app.configureMyclient({
    async getHeaders(req, reply) {
      return {
        foo: "bar",
      };
    },
  });

  app.post("/", async (request, reply) => {
    const res = await request.myclient.graphql({
      query: "query { movies { title } }",
    });
    return res;
  });
};
```

### Telemetry propagation

To correctly propagate telemetry information, be sure to get the client from the request object:

```js
fastify.post("/", async (request, reply) => {
  const res = await request.movies.createMovie({ title: "foo" });
  return res;
});
```

## Errors in Platformatic Client

Platformatic Client throws the following errors when an unexpected situation occurs:

- `PLT_MASSIMO_OPTIONS_URL_REQUIRED` => in your client options, you should provide a valid `url`
- `PLT_MASSIMO_FORM_DATA_REQUIRED` => you should pass a `FormData` object (from `undici` request) since you're doing a `multipart/form-data` request
- `PLT_MASSIMO_MISSING_PARAMS_REQUIRED` => a url path params is missing (and should be added) when doing the client request
- `PLT_MASSIMO_WRONG_OPTS_TYPE` => a wrong client option type has been passed (and should be properly updated)
- `PLT_MASSIMO_INVALID_RESPONSE_SCHEMA` => response can't be properly validated due to missing status code
- `PLT_MASSIMO_INVALID_CONTENT_TYPE` => response contains an invalid content type
- `PLT_MASSIMO_INVALID_RESPONSE_FORMAT` => body response doesn't match with the provided schema
- `PLT_MASSIMO_UNEXPECTED_CALL_FAILURE` => there has been an unexpected failure when doing the client request
