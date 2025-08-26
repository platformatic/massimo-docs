---
title: Programmatic API
description: Use Massimo client programmatically without code generation
---

# Programmatic API

Use the Massimo client directly in your code without generating files. This is useful for dynamic APIs or when you want more control over the client creation.

## OpenAPI Client

### Basic Usage

```js
import { buildOpenAPIClient } from '@platformatic/client'

const client = await buildOpenAPIClient({
  url: 'https://api.example.com/openapi.json',
  // or use a local file:
  // path: 'path/to/openapi.json',
  headers: {
    'X-API-Key': 'your-api-key'
  }
})

// Use the client
const result = await client.getUsers({ limit: 10 })
console.log(result)
```

### Configuration Options

```js
import { buildOpenAPIClient } from '@platformatic/client'
import { Agent } from 'undici'

const client = await buildOpenAPIClient({
  // Required: URL or path to OpenAPI spec
  url: 'https://api.example.com/openapi.json',
  // path: './openapi.json', // Alternative: local file
  
  // Request configuration
  headers: {
    'Authorization': 'Bearer token',
    'X-API-Key': 'key'
  },
  
  // Response handling
  fullResponse: false,      // Return full response object (default: false)
  fullRequest: false,       // Send full request object (default: false)
  throwOnError: true,       // Throw on HTTP errors (default: true)
  validateResponse: true,   // Validate response against schema (default: true)
  
  // Timeouts
  bodyTimeout: 30000,       // Body timeout in ms (default: 30000)
  headersTimeout: 10000,    // Headers timeout in ms (default: 10000)
  
  // Custom query string parser
  queryParser: (query) => {
    // Custom query string formatting
    return new URLSearchParams(query).toString()
  },
  
  // Custom Undici dispatcher
  dispatcher: new Agent({
    connections: 10,
    pipelining: 10
  })
})
```

### Dynamic Headers

Use the `getHeaders` function for dynamic header generation:

```js
const client = await buildOpenAPIClient({
  url: 'https://api.example.com/openapi.json',
  headers: {
    'X-Static-Header': 'value'
  },
  async getHeaders(options) {
    // options contains: url, method, body, headers, telemetryHeaders
    
    // Generate dynamic headers
    const token = await refreshAuthToken()
    const requestId = generateRequestId()
    
    return {
      'Authorization': `Bearer ${token}`,
      'X-Request-ID': requestId,
      'X-Timestamp': new Date().toISOString()
    }
  }
})
```

### Accessing Operation Mapping

Get the mapping between operation IDs and their HTTP methods/paths:

```js
const client = await buildOpenAPIClient({
  url: 'https://api.example.com/openapi.json'
})

const operationMap = client[Symbol.for('plt.operationIdMap')]
console.log(operationMap)
// Output:
// {
//   getUsers: { path: '/users', method: 'get' },
//   createUser: { path: '/users', method: 'post' },
//   getUserById: { path: '/users/{id}', method: 'get' }
// }
```

### TypeScript Support

```typescript
import { buildOpenAPIClient } from '@platformatic/client'
import type { ApiClient } from './types'

// Define your client interface
interface ApiClient {
  getUsers(req: GetUsersRequest): Promise<User[]>
  createUser(req: CreateUserRequest): Promise<User>
  updateUser(req: UpdateUserRequest): Promise<User>
  deleteUser(req: DeleteUserRequest): Promise<void>
}

// Create typed client
const client = await buildOpenAPIClient<ApiClient>({
  url: 'https://api.example.com/openapi.json',
  headers: {
    'Authorization': 'Bearer token'
  }
})

// TypeScript knows the methods and types
const users = await client.getUsers({ limit: 10 })
```

## GraphQL Client

### Basic Usage

```js
import { buildGraphQLClient } from '@platformatic/client'

const client = await buildGraphQLClient({
  url: 'https://api.example.com/graphql',
  headers: {
    'Authorization': 'Bearer token'
  }
})

// Execute queries
const result = await client.graphql({
  query: `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
        posts {
          title
          content
        }
      }
    }
  `,
  variables: {
    id: '123'
  }
})

console.log(result.user)
```

### Mutations

```js
const result = await client.graphql({
  query: `
    mutation CreatePost($input: PostInput!) {
      createPost(input: $input) {
        id
        title
        content
        author {
          name
        }
      }
    }
  `,
  variables: {
    input: {
      title: 'New Post',
      content: 'Post content...',
      authorId: '123'
    }
  }
})
```

### Subscriptions

```js
// GraphQL subscriptions require a WebSocket connection
const subscription = await client.graphql({
  query: `
    subscription OnCommentAdded($postId: ID!) {
      commentAdded(postId: $postId) {
        id
        content
        author {
          name
        }
      }
    }
  `,
  variables: {
    postId: '456'
  }
})
```

### TypeScript with GraphQL

```typescript
import { buildGraphQLClient } from '@platformatic/client'

interface User {
  id: string
  name: string
  email: string
}

interface GetUserResult {
  user: User
}

const client = await buildGraphQLClient({
  url: 'https://api.example.com/graphql'
})

// Type the result
const result = await client.graphql<GetUserResult>({
  query: `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
  `,
  variables: { id: '123' }
})

// TypeScript knows result.user is of type User
console.log(result.user.name)
```

## Advanced Patterns

### Client Factory

Create a reusable client factory:

```js
class ApiClientFactory {
  constructor(baseConfig = {}) {
    this.baseConfig = baseConfig
  }

  async createClient(apiUrl, additionalConfig = {}) {
    return buildOpenAPIClient({
      url: apiUrl,
      ...this.baseConfig,
      ...additionalConfig,
      headers: {
        ...this.baseConfig.headers,
        ...additionalConfig.headers
      }
    })
  }
}

// Usage
const factory = new ApiClientFactory({
  headers: {
    'X-App-Version': '1.0.0'
  },
  throwOnError: true
})

const userClient = await factory.createClient('https://users-api.example.com/openapi.json')
const ordersClient = await factory.createClient('https://orders-api.example.com/openapi.json')
```

### Request Retry Logic

Implement automatic retry for failed requests:

```js
function withRetry(client, maxRetries = 3) {
  return new Proxy(client, {
    get(target, prop) {
      const original = target[prop]
      
      if (typeof original === 'function') {
        return async function(...args) {
          let lastError
          
          for (let i = 0; i <= maxRetries; i++) {
            try {
              return await original.apply(target, args)
            } catch (error) {
              lastError = error
              
              // Don't retry on 4xx errors
              if (error.statusCode >= 400 && error.statusCode < 500) {
                throw error
              }
              
              if (i < maxRetries) {
                // Exponential backoff
                await new Promise(resolve => 
                  setTimeout(resolve, Math.pow(2, i) * 1000)
                )
              }
            }
          }
          
          throw lastError
        }
      }
      
      return original
    }
  })
}

// Usage
const client = await buildOpenAPIClient({ url: '...' })
const clientWithRetry = withRetry(client)

// Automatically retries on failure
const data = await clientWithRetry.getData()
```

### Response Caching

Add caching layer to your client:

```js
class CachedClient {
  constructor(client, ttl = 60000) {
    this.client = client
    this.cache = new Map()
    this.ttl = ttl
  }

  async get(method, params) {
    const key = `${method}:${JSON.stringify(params)}`
    
    if (this.cache.has(key)) {
      const { data, timestamp } = this.cache.get(key)
      if (Date.now() - timestamp < this.ttl) {
        return data
      }
    }
    
    const data = await this.client[method](params)
    this.cache.set(key, { data, timestamp: Date.now() })
    
    return data
  }
}

// Usage
const baseClient = await buildOpenAPIClient({ url: '...' })
const cachedClient = new CachedClient(baseClient)

// Cached for 60 seconds
const users1 = await cachedClient.get('getUsers', { limit: 10 })
const users2 = await cachedClient.get('getUsers', { limit: 10 }) // From cache
```

### Multi-tenant Clients

Handle multiple tenants with different configurations:

```js
class MultiTenantClient {
  constructor() {
    this.clients = new Map()
  }

  async getClient(tenantId) {
    if (!this.clients.has(tenantId)) {
      const config = await this.getTenantConfig(tenantId)
      const client = await buildOpenAPIClient({
        url: config.apiUrl,
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': `Bearer ${config.apiKey}`
        }
      })
      this.clients.set(tenantId, client)
    }
    
    return this.clients.get(tenantId)
  }

  async getTenantConfig(tenantId) {
    // Fetch tenant-specific configuration
    return {
      apiUrl: `https://${tenantId}.api.example.com/openapi.json`,
      apiKey: process.env[`TENANT_${tenantId}_API_KEY`]
    }
  }
}

// Usage
const multiClient = new MultiTenantClient()

async function handleRequest(tenantId, userId) {
  const client = await multiClient.getClient(tenantId)
  return client.getUser({ id: userId })
}
```

## Error Handling

The client provides detailed error information:

```js
try {
  const result = await client.someOperation()
} catch (error) {
  if (error.code === 'PLT_CLIENT_OPTIONS_URL_REQUIRED') {
    console.error('URL is required')
  } else if (error.code === 'PLT_CLIENT_INVALID_RESPONSE_FORMAT') {
    console.error('Response validation failed:', error.message)
  } else if (error.statusCode === 404) {
    console.error('Resource not found')
  } else {
    console.error('Unexpected error:', error)
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `PLT_CLIENT_OPTIONS_URL_REQUIRED` | Missing URL in client options |
| `PLT_CLIENT_FORM_DATA_REQUIRED` | FormData required for multipart request |
| `PLT_CLIENT_MISSING_PARAMS_REQUIRED` | Missing required path parameter |
| `PLT_CLIENT_WRONG_OPTS_TYPE` | Invalid option type provided |
| `PLT_CLIENT_INVALID_RESPONSE_SCHEMA` | Response validation failed |
| `PLT_CLIENT_INVALID_CONTENT_TYPE` | Invalid response content type |
| `PLT_CLIENT_INVALID_RESPONSE_FORMAT` | Response format doesn't match schema |
| `PLT_CLIENT_UNEXPECTED_CALL_FAILURE` | Unexpected request failure |

## Performance Tips

1. **Reuse clients**: Create once, use many times
2. **Connection pooling**: Use custom Agent for better performance
3. **Timeout configuration**: Set appropriate timeouts for your use case
4. **Response validation**: Disable in production for better performance
5. **Header functions**: Keep `getHeaders` lightweight and fast

```js
// Optimized client configuration
const client = await buildOpenAPIClient({
  url: 'https://api.example.com/openapi.json',
  validateResponse: process.env.NODE_ENV === 'development',
  bodyTimeout: 10000,
  headersTimeout: 5000,
  dispatcher: new Agent({
    connections: 50,
    pipelining: 10,
    keepAliveTimeout: 60000
  })
})