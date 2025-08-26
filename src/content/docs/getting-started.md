---
title: Getting Started
description: Get up and running with Massimo in minutes
---

# Getting Started with Massimo

Massimo is a powerful tool for generating typed HTTP clients from OpenAPI and GraphQL APIs. This guide will help you get started quickly.

## Installation

You can use Massimo directly via npx without installation:

```bash
npx @platformatic/massimo-cli [options]
```

Or install it globally:

```bash
npm install -g @platformatic/massimo-cli
# Then use:
massimo [options]
```

## Creating Your First Client

### OpenAPI Client

To create a client for an OpenAPI API:

```bash
npx @platformatic/massimo-cli http://example.com/openapi.json --name myclient
```

This command will:
1. Download the OpenAPI specification
2. Generate a typed client in the `./myclient` directory
3. Create TypeScript type definitions
4. Update your `.env` file if it exists

### GraphQL Client

For GraphQL APIs:

```bash
npx @platformatic/massimo-cli http://example.com/graphql --name myclient --type graphql
```

### Forcing Client Type

If an API supports both OpenAPI and GraphQL, you can specify which client to generate:

```bash
npx @platformatic/massimo-cli http://example.com/api --name myclient --type openapi
```

## Using the Generated Client

### JavaScript Example

```js
import myClient from './myclient/myclient.js'

// Initialize the client
const client = await myClient({ 
  url: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})

// Make API calls
const users = await client.getUsers()
console.log(users)

// Create a new resource
const newUser = await client.createUser({
  name: 'John Doe',
  email: 'john@example.com'
})
```

### TypeScript Example

```typescript
import myClient from './myclient/myclient.js'
import type { User, CreateUserRequest } from './myclient/myclient'

const client = await myClient({ 
  url: 'https://api.example.com'
})

// TypeScript provides full type safety
const users: User[] = await client.getUsers()

const userData: CreateUserRequest = {
  name: 'Jane Doe',
  email: 'jane@example.com'
}

const newUser: User = await client.createUser(userData)
```

### GraphQL Example

```js
import myClient from './myclient/myclient.js'

const client = await myClient({ url: 'https://api.example.com' })

// Execute GraphQL queries
const result = await client.graphql({
  query: `
    query GetMovies($limit: Int) {
      movies(limit: $limit) {
        id
        title
        releaseDate
      }
    }
  `,
  variables: {
    limit: 10
  }
})

console.log(result.movies)
```

## Configuration Options

### Client Options

When initializing a client, you can pass various options:

```js
const client = await myClient({
  url: 'https://api.example.com',     // API base URL
  headers: {                           // Default headers
    'Authorization': 'Bearer TOKEN'
  },
  fullResponse: false,                 // Return full response object
  throwOnError: true,                  // Throw on HTTP errors
  validateResponse: true,              // Validate responses against schema
  bodyTimeout: 30000,                  // Request body timeout (ms)
  headersTimeout: 10000                // Headers timeout (ms)
})
```

### Dynamic Headers

You can provide a function to generate headers dynamically:

```js
const client = await myClient({
  url: 'https://api.example.com',
  getHeaders: async (options) => {
    const token = await getAuthToken()
    return {
      'Authorization': `Bearer ${token}`,
      'X-Request-ID': generateRequestId()
    }
  }
})
```

## Environment Variables

The client generator automatically reads from `.env` files:

```bash
# .env
API_URL=https://api.example.com
API_KEY=your-api-key
```

Use in your client:

```js
const client = await myClient({
  url: process.env.API_URL,
  headers: {
    'X-API-Key': process.env.API_KEY
  }
})
```

## Type Generation Only

If you only need TypeScript types without the client implementation:

```bash
npx @platformatic/massimo-cli http://example.com/openapi.json --name myclient --types-only
```

This creates a single `myclient.d.ts` file with all type definitions.

## Working with Platformatic Runtime

For applications within Platformatic Runtime that aren't exposed:

1. Extract the schema using `wattpm inject`:

```bash
npx wattpm inject movies -p /documentation/json > openapi.json
```

2. Generate the client:

```bash
npx @platformatic/massimo-cli --name movies -f web/main/movies openapi.json
```

3. Use in your application:

```js
import moviesClient from './movies/movies.js'

export default async function (fastify, opts) {
  fastify.get('/movies', async (request, reply) => {
    const movies = await moviesClient.getMovies()
    return movies
  })
}
```

## Next Steps

- Learn about [Frontend Clients](/reference/frontend) for browser applications
- Explore the [Programmatic API](/reference/programmatic) for advanced use cases
- Configure [Authentication](/guides/authentication) for your clients
- Set up [Error Handling](/guides/error-handling) strategies