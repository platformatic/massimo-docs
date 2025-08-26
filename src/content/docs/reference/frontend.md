---
title: Frontend Client
description: Generate browser-compatible clients for OpenAPI servers
---

# Frontend Client

Create implementation and type files that expose a client for a remote OpenAPI server, using `fetch` and compatible with any browser.

## Generating the Client

To create a browser-compatible client for an OpenAPI API:

```bash
npx @platformatic/massimo-cli http://example.com/openapi.json \
  --frontend \
  --language <language> \
  --name <clientname>
```

- `<language>`: Either `js` (JavaScript) or `ts` (TypeScript)
- `<clientname>`: Name of generated files (default: `api`)

This creates two files:
- `clientname.js` (or `.ts`) - Client implementation
- `clientname-types.d.ts` - TypeScript definitions

## Usage Patterns

The frontend client provides two usage patterns:

### 1. Named Operations

Import and use individual operations:

```js
import { setBaseUrl, getMovies, createMovie } from './api.js'

// Set the base URL globally
setBaseUrl('http://my-server-url.com')

// Use the operations
const movies = await getMovies({ limit: 10 })
console.log(movies)

const newMovie = await createMovie({
  title: 'The Matrix',
  year: 1999
})
```

### 2. Factory Pattern

Create a client instance with its own configuration:

```js
import build from './api.js'

// Create a client instance
const client = build('http://my-server-url.com')

// Use the client
const movies = await client.getMovies({ limit: 10 })
const newMovie = await client.createMovie({
  title: 'The Matrix',
  year: 1999
})
```

You can use both patterns in the same application - they operate independently.

## Configuration

### Setting Default Headers

Configure headers for all requests:

```js
import { setDefaultHeaders, getMovies } from './api.js'

// Set headers globally
setDefaultHeaders({
  'Authorization': 'Bearer MY_TOKEN',
  'X-API-Key': 'my-api-key'
})

// All requests will include these headers
const movies = await getMovies({})
```

With the factory pattern:

```js
import build from './api.js'

const client = build('http://my-server-url.com', {
  headers: {
    'Authorization': 'Bearer MY_TOKEN',
    'X-API-Key': 'my-api-key'
  }
})
```

### Fetch Parameters

Customize the underlying `fetch` behavior:

```js
import { setDefaultFetchParams, getMovies } from './api.js'

setDefaultFetchParams({
  keepalive: false,
  mode: 'cors',
  credentials: 'include',
  cache: 'no-cache'
})

// These parameters will be passed to fetch()
const movies = await getMovies({})
```

## TypeScript Support

### Type Definitions

The generated type file includes:

```typescript
// Request/Response types for each operation
export interface GetMoviesRequest {
  limit?: number;
  offset?: number;
  genre?: string;
}

export interface GetMoviesResponseOK {
  id: number;
  title: string;
  year: number;
}

// API interface with all operations
export interface Api {
  setBaseUrl(newUrl: string): void;
  setDefaultHeaders(headers: Object): void;
  setDefaultFetchParams(fetchParams: RequestInit): void;
  getMovies(req: GetMoviesRequest): Promise<Array<GetMoviesResponseOK>>;
  createMovie(req: CreateMovieRequest): Promise<CreateMovieResponse>;
  // ... other operations
}

// Factory function type
type PlatformaticFrontendClient = Omit<Api, 'setBaseUrl'>
export default function build(url: string): PlatformaticFrontendClient
```

### Using with TypeScript

```typescript
import build from './api'
import type { GetMoviesRequest, Movie } from './api-types'

const client = build('http://api.example.com')

const request: GetMoviesRequest = {
  limit: 10,
  genre: 'action'
}

const movies: Movie[] = await client.getMovies(request)
```

## Real-World Examples

### React Integration

```jsx
import { useState, useEffect } from 'react'
import build from './api'

const apiClient = build(process.env.REACT_APP_API_URL)

function MovieList() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovies() {
      try {
        const data = await apiClient.getMovies({ limit: 20 })
        setMovies(data)
      } catch (error) {
        console.error('Failed to fetch movies:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMovies()
  }, [])

  if (loading) return <div>Loading...</div>
  
  return (
    <ul>
      {movies.map(movie => (
        <li key={movie.id}>{movie.title}</li>
      ))}
    </ul>
  )
}
```

### Vue.js Integration

```vue
<template>
  <div>
    <ul v-if="!loading">
      <li v-for="movie in movies" :key="movie.id">
        {{ movie.title }}
      </li>
    </ul>
    <div v-else>Loading...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import build from './api'

const client = build(import.meta.env.VITE_API_URL)
const movies = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    movies.value = await client.getMovies({ limit: 20 })
  } finally {
    loading.value = false
  }
})
</script>
```

### Authentication Flow

```js
import build from './api'

class ApiService {
  constructor() {
    this.client = build(process.env.API_URL)
    this.token = localStorage.getItem('authToken')
    
    if (this.token) {
      this.setAuthToken(this.token)
    }
  }

  setAuthToken(token) {
    this.token = token
    this.client = build(process.env.API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    localStorage.setItem('authToken', token)
  }

  async login(credentials) {
    const response = await this.client.login(credentials)
    this.setAuthToken(response.token)
    return response
  }

  async logout() {
    await this.client.logout()
    this.token = null
    localStorage.removeItem('authToken')
    this.client = build(process.env.API_URL)
  }

  // Proxy methods to client
  getMovies(params) {
    return this.client.getMovies(params)
  }
}

export default new ApiService()
```

## Error Handling

The client throws errors for failed requests:

```js
import { getMovies } from './api'

try {
  const movies = await getMovies({ limit: 10 })
} catch (error) {
  if (error.message.includes('401')) {
    // Handle unauthorized
    console.error('Authentication required')
  } else if (error.message.includes('404')) {
    // Handle not found
    console.error('Resource not found')
  } else {
    // Handle other errors
    console.error('Request failed:', error)
  }
}
```

## File Upload Support

For multipart/form-data requests:

```js
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('title', 'My Document')

const response = await client.uploadFile(formData)
```

## Request Interceptors

Add request/response interceptors:

```js
import build from './api'

const client = build('http://api.example.com')

// Wrap client methods to add interceptors
const interceptedClient = new Proxy(client, {
  get(target, prop) {
    const original = target[prop]
    
    if (typeof original === 'function') {
      return async function(...args) {
        // Before request
        console.log(`Calling ${prop} with:`, args)
        
        try {
          // Make request
          const result = await original.apply(target, args)
          
          // After successful response
          console.log(`${prop} succeeded:`, result)
          
          return result
        } catch (error) {
          // Handle errors
          console.error(`${prop} failed:`, error)
          throw error
        }
      }
    }
    
    return original
  }
})
```

## Performance Optimization

### Request Caching

```js
class CachedApiClient {
  constructor(baseUrl) {
    this.client = build(baseUrl)
    this.cache = new Map()
  }

  async getMovies(params) {
    const key = JSON.stringify(params)
    
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }
    
    const data = await this.client.getMovies(params)
    this.cache.set(key, data)
    
    // Clear cache after 5 minutes
    setTimeout(() => this.cache.delete(key), 5 * 60 * 1000)
    
    return data
  }
}
```

### Request Debouncing

```js
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Usage in search
const searchMovies = debounce(async (query) => {
  const results = await client.searchMovies({ q: query })
  displayResults(results)
}, 300)
```

## Browser Compatibility

The generated client uses standard `fetch` API and works in:
- Chrome 42+
- Firefox 39+
- Safari 10.1+
- Edge 14+

For older browsers, include a fetch polyfill:

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=fetch"></script>
```

## Bundle Size Optimization

The frontend client is designed to be lightweight:
- No external dependencies
- Tree-shakeable when using named exports
- Typically < 10KB minified

For optimal bundle size with webpack/rollup:

```js
// Only import what you need
import { getMovies, createMovie } from './api'

// Instead of
import * as api from './api'
```