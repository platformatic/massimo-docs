---
title: Error Reference
description: Complete guide to error handling in Massimo clients
---

# Error Reference

Massimo provides detailed error information to help you handle failures gracefully. This guide covers all error types and how to handle them.

## Error Codes

Massimo clients use specific error codes to identify different failure scenarios:

| Error Code | Description | Common Causes |
|------------|-------------|---------------|
| `PLT_MASSIMO_OPTIONS_URL_REQUIRED` | URL is required in client options | Missing or undefined URL when creating client |
| `PLT_MASSIMO_FORM_DATA_REQUIRED` | FormData object required | Multipart/form-data request without FormData |
| `PLT_MASSIMO_MISSING_PARAMS_REQUIRED` | Missing required path parameter | URL path parameter not provided |
| `PLT_MASSIMO_WRONG_OPTS_TYPE` | Wrong option type provided | Invalid type for client configuration option |
| `PLT_MASSIMO_INVALID_RESPONSE_SCHEMA` | Response validation failed | Response missing required status code |
| `PLT_MASSIMO_INVALID_CONTENT_TYPE` | Invalid content type in response | Server returned unexpected content type |
| `PLT_MASSIMO_INVALID_RESPONSE_FORMAT` | Response doesn't match schema | Response body doesn't match OpenAPI schema |
| `PLT_MASSIMO_UNEXPECTED_CALL_FAILURE` | Unexpected request failure | Network error or server unavailable |

## Error Handling Patterns

### Basic Error Handling

```js
import { buildOpenAPIClient } from '@platformatic/client'

try {
  const client = await buildOpenAPIClient({
    url: 'https://api.example.com/openapi.json'
  })
  
  const result = await client.getUser({ id: '123' })
  console.log(result)
} catch (error) {
  console.error('Error:', error.message)
  console.error('Error code:', error.code)
  console.error('Status code:', error.statusCode)
}
```

### Handling Specific Error Types

```js
try {
  const result = await client.createUser(userData)
} catch (error) {
  switch (error.code) {
    case 'PLT_MASSIMO_OPTIONS_URL_REQUIRED':
      console.error('Client configuration error: URL is required')
      break
      
    case 'PLT_MASSIMO_INVALID_RESPONSE_FORMAT':
      console.error('Server returned invalid data:', error.message)
      // Log for debugging
      console.debug('Expected schema:', error.schema)
      console.debug('Received data:', error.data)
      break
      
    case 'PLT_MASSIMO_MISSING_PARAMS_REQUIRED':
      console.error('Missing required parameter:', error.param)
      break
      
    default:
      // Handle HTTP status codes
      if (error.statusCode) {
        handleHttpError(error.statusCode, error.message)
      } else {
        console.error('Unexpected error:', error)
      }
  }
}

function handleHttpError(statusCode, message) {
  switch (statusCode) {
    case 400:
      console.error('Bad request:', message)
      break
    case 401:
      console.error('Authentication required')
      // Redirect to login
      break
    case 403:
      console.error('Access forbidden')
      break
    case 404:
      console.error('Resource not found')
      break
    case 429:
      console.error('Too many requests - rate limited')
      break
    case 500:
      console.error('Server error - try again later')
      break
    default:
      console.error(`HTTP ${statusCode}: ${message}`)
  }
}
```

## Common Error Scenarios

### Configuration Errors

#### Missing URL

```js
// ❌ This will throw PLT_MASSIMO_OPTIONS_URL_REQUIRED
const client = await buildOpenAPIClient({
  headers: { 'X-API-Key': 'key' }
  // url is missing!
})

// ✅ Correct usage
const client = await buildOpenAPIClient({
  url: 'https://api.example.com/openapi.json',
  headers: { 'X-API-Key': 'key' }
})
```

#### Wrong Option Types

```js
// ❌ This will throw PLT_MASSIMO_WRONG_OPTS_TYPE
const client = await buildOpenAPIClient({
  url: 'https://api.example.com/openapi.json',
  headers: 'Authorization: Bearer token' // Should be an object!
})

// ✅ Correct usage
const client = await buildOpenAPIClient({
  url: 'https://api.example.com/openapi.json',
  headers: {
    'Authorization': 'Bearer token'
  }
})
```

### Request Errors

#### Missing Path Parameters

```js
// Assuming endpoint: /users/{userId}/posts/{postId}

// ❌ This will throw PLT_MASSIMO_MISSING_PARAMS_REQUIRED
const post = await client.getPost({ 
  userId: '123' 
  // postId is missing!
})

// ✅ Correct usage
const post = await client.getPost({ 
  userId: '123',
  postId: '456'
})
```

#### FormData for File Uploads

```js
// ❌ This will throw PLT_MASSIMO_FORM_DATA_REQUIRED
const result = await client.uploadFile({
  file: fileContent // Wrong! Should use FormData
})

// ✅ Correct usage
const formData = new FormData()
formData.append('file', fileInput.files[0])
const result = await client.uploadFile(formData)
```

### Response Errors

#### Invalid Response Format

```js
// When server response doesn't match the expected schema
try {
  const users = await client.getUsers()
} catch (error) {
  if (error.code === 'PLT_MASSIMO_INVALID_RESPONSE_FORMAT') {
    console.error('Server returned unexpected data structure')
    
    // In development, log details for debugging
    if (process.env.NODE_ENV === 'development') {
      console.debug('Expected:', error.expectedSchema)
      console.debug('Received:', error.actualData)
    }
    
    // Return fallback data or handle gracefully
    return []
  }
}
```

#### Invalid Content Type

```js
try {
  const data = await client.getData()
} catch (error) {
  if (error.code === 'PLT_MASSIMO_INVALID_CONTENT_TYPE') {
    console.error(`Expected JSON but got: ${error.contentType}`)
    
    // Maybe the server is returning HTML error page
    if (error.contentType.includes('text/html')) {
      console.error('Server might be down or returning error page')
    }
  }
}
```

## Error Recovery Strategies

### Retry with Exponential Backoff

```js
async function callWithRetry(fn, maxRetries = 3) {
  let lastError
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry client errors (4xx)
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error
      }
      
      // Don't retry validation errors
      if (error.code?.startsWith('PLT_MASSIMO_INVALID')) {
        throw error
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`)
      }
    }
  }
  
  throw lastError
}

// Usage
const data = await callWithRetry(() => client.getData())
```

### Circuit Breaker Pattern

```js
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold
    this.timeout = timeout
    this.failures = 0
    this.nextAttempt = Date.now()
    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN')
      }
      this.state = 'HALF_OPEN'
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  onSuccess() {
    this.failures = 0
    this.state = 'CLOSED'
  }

  onFailure() {
    this.failures++
    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
      this.nextAttempt = Date.now() + this.timeout
    }
  }
}

// Usage
const breaker = new CircuitBreaker()

try {
  const data = await breaker.call(() => client.getData())
} catch (error) {
  if (error.message === 'Circuit breaker is OPEN') {
    console.error('Service temporarily unavailable')
  }
}
```

### Fallback Handling

```js
class ApiClientWithFallback {
  constructor(primaryClient, fallbackClient) {
    this.primary = primaryClient
    this.fallback = fallbackClient
  }

  async getData(params) {
    try {
      return await this.primary.getData(params)
    } catch (error) {
      console.warn('Primary API failed, using fallback:', error.message)
      
      // Use fallback for server errors
      if (error.statusCode >= 500 || error.code === 'PLT_MASSIMO_UNEXPECTED_CALL_FAILURE') {
        return await this.fallback.getData(params)
      }
      
      // Don't use fallback for client errors
      throw error
    }
  }
}
```

## Debugging Errors

### Enable Debug Logging

```bash
# Enable debug output for Massimo
DEBUG=platformatic:client npm start
```

### Custom Error Logger

```js
function createLoggingClient(client) {
  return new Proxy(client, {
    get(target, prop) {
      const original = target[prop]
      
      if (typeof original === 'function') {
        return async function(...args) {
          const start = Date.now()
          
          try {
            const result = await original.apply(target, args)
            console.log(`✅ ${prop} succeeded in ${Date.now() - start}ms`)
            return result
          } catch (error) {
            console.error(`❌ ${prop} failed in ${Date.now() - start}ms`)
            console.error('Error details:', {
              code: error.code,
              statusCode: error.statusCode,
              message: error.message,
              method: prop,
              arguments: args
            })
            throw error
          }
        }
      }
      
      return original
    }
  })
}

const client = await buildOpenAPIClient({ url: '...' })
const debugClient = createLoggingClient(client)
```

## Error Monitoring

### Integration with Error Tracking Services

```js
import * as Sentry from '@sentry/node'

async function callApi(client, method, params) {
  try {
    return await client[method](params)
  } catch (error) {
    // Add context for error tracking
    Sentry.withScope((scope) => {
      scope.setTag('api.method', method)
      scope.setContext('api.error', {
        code: error.code,
        statusCode: error.statusCode,
        params: params
      })
      
      // Don't report client errors
      if (error.statusCode >= 400 && error.statusCode < 500) {
        scope.setLevel('warning')
      }
      
      Sentry.captureException(error)
    })
    
    throw error
  }
}
```

## Best Practices

1. **Always handle errors**: Never ignore caught errors
2. **Log appropriately**: Use different log levels for different error types
3. **Fail fast for configuration errors**: Don't retry invalid configurations
4. **Retry transient failures**: Implement retry logic for network issues
5. **Provide user feedback**: Show meaningful error messages to users
6. **Monitor errors**: Track error rates and types in production
7. **Test error scenarios**: Write tests for error handling paths
8. **Document expected errors**: Make error behavior clear in your API documentation