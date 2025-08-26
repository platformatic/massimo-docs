---
title: CLI Reference
description: Complete reference for the Massimo CLI commands and options
---

# Massimo CLI Reference

The Massimo CLI (`@platformatic/massimo-cli`) provides commands to generate typed HTTP clients from OpenAPI and GraphQL APIs.

## Basic Usage

```bash
npx @platformatic/massimo-cli [url|file] [options]
# or if installed globally:
massimo [url|file] [options]
```

## Commands

### `massimo`

Generate a typed client from an OpenAPI or GraphQL schema.

#### Arguments

- `url|file` - URL to the API schema or path to a local schema file

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name`, `-n` | Name for the generated client | `api` |
| `--type`, `-t` | Force client type (`openapi` or `graphql`) | Auto-detect |
| `--output`, `-o` | Output directory for generated files | Current directory |
| `--types-only` | Generate only TypeScript types | `false` |
| `--frontend` | Generate frontend client (browser-compatible) | `false` |
| `--language`, `-l` | Language for frontend client (`js` or `ts`) | `js` |
| `--header`, `-H` | Add custom header (repeatable) | - |

#### Examples

**Generate from URL:**
```bash
npx @platformatic/massimo-cli https://api.example.com/openapi.json --name my-api
# or
massimo https://api.example.com/openapi.json --name my-api
```

**Generate from local file:**
```bash
massimo ./schema.json --name my-api
```

**Force GraphQL client:**
```bash
massimo https://api.example.com/graphql --type graphql --name my-api
```

**Frontend client with TypeScript:**
```bash
massimo https://api.example.com/openapi.json --frontend --language ts --name my-api
```

**Types only:**
```bash
massimo https://api.example.com/openapi.json --types-only --name my-api
```

**With custom headers:**
```bash
massimo https://api.example.com/openapi.json \
  --header "Authorization: Bearer TOKEN" \
  --header "X-API-Key: KEY" \
  --name my-api
```

## Generated Files

### Standard Client

When generating a standard (Node.js) client:

```
my-api/
├── my-api.js         # Client implementation
├── my-api.d.ts       # TypeScript definitions
└── package.json      # Package configuration
```

### Frontend Client

When using `--frontend`:

```
my-api.js             # Browser-compatible client
my-api-types.d.ts     # TypeScript definitions
```

### Types Only

When using `--types-only`:

```
my-api.d.ts           # TypeScript definitions only
```

## Schema Detection

Massimo automatically detects the schema type:

1. **OpenAPI**: Looks for OpenAPI/Swagger specification structure
2. **GraphQL**: Detects GraphQL introspection endpoint or schema

If both are available, OpenAPI is preferred unless `--type graphql` is specified.

## Environment Configuration

The CLI respects environment variables and `.env` files:

```bash
# .env
API_URL=https://api.example.com
API_KEY=secret-key
```

Generated clients will include references to these variables when appropriate.

## Working with Private APIs

For APIs requiring authentication during schema retrieval:

```bash
# Using headers for authentication
massimo https://private-api.com/openapi.json \
  --header "Authorization: Bearer ${TOKEN}" \
  --name private-api
```

## Integration with Build Tools

### Package.json Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "generate:client": "massimo https://api.example.com/openapi.json --name api",
    "generate:types": "massimo https://api.example.com/openapi.json --types-only --name api"
  }
}
```

### Pre-commit Hooks

Regenerate clients before commits:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run generate:client"
    }
  }
}
```

## Troubleshooting

### Common Issues

**Schema not found:**
- Verify the URL is correct
- Check if authentication is required
- Ensure the schema endpoint is accessible

**Type generation fails:**
- Check schema validity
- Ensure all referenced types are defined
- Verify OpenAPI/GraphQL version compatibility

**Client generation errors:**
- Check write permissions in output directory
- Verify Node.js version compatibility
- Clear npm cache if necessary

### Debug Mode

Enable debug output:

```bash
DEBUG=platformatic:client massimo [options]
```

## Version Information

Check CLI version:

```bash
massimo --version
```

## See Also

- [Frontend Client Reference](/reference/frontend)
- [Programmatic API](/reference/programmatic)
- [Error Handling](/reference/errors)