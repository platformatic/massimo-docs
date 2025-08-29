---
title: CLI Reference
description: Complete reference for the Massimo CLI commands and options
---

# Massimo CLI Reference

The Massimo CLI (`@platformatic/massimo-cli`) creates Fastify plugins that expose clients for remote OpenAPI or GraphQL APIs.

## Basic Usage

```bash
npx massimo-cli [url|file] [options]
# or if installed globally:
massimo [url|file] [options]
```

## Commands

### `massimo`

Generate a client plugin from an OpenAPI or GraphQL schema.

#### Arguments

- `url|file` - URL to the API schema or path to a local schema file

#### Options

| Option                         | Alias | Description                                        | Default          |
| ------------------------------ | ----- | -------------------------------------------------- | ---------------- |
| `--name <name>`                | `-n`  | Name of the client                                 | Required         |
| `--folder <name>`              | `-f`  | Name of the plugin folder                          | Same as `--name` |
| `--config <path>`              | `-c`  | Path to the configuration file                     | -                |
| `--typescript`                 | `-t`  | Generate the client plugin in TypeScript           | `false`          |
| `--frontend`                   |       | Generate browser-compatible client using `fetch`   | `false`          |
| `--language <js\|ts>`          |       | Language for frontend client                       | `js`             |
| `--full-response`              |       | Return full response object instead of just body   | `false`          |
| `--full-request`               |       | Wrap parameters in `body`, `headers`, `query`      | `false`          |
| `--full`                       |       | Enable both `--full-request` and `--full-response` | `false`          |
| `--optional-headers <headers>` |       | Comma-separated headers marked as optional         | -                |
| `--validate-response`          |       | Validate response body against schema              | `false`          |
| `--url-auth-headers <headers>` |       | Auth headers for schema URL (JSON string)          | -                |
| `--types-only`                 |       | Generate only TypeScript types                     | `false`          |
| `--types-comment`              |       | Add comment to generated `.d.ts` file              | `false`          |
| `--with-credentials`           |       | Add `credentials: 'include'` to fetch requests     | `false`          |
| `--props-optional`             |       | Define properties as optional unless required      | `true`           |
| `--skip-config-update`         |       | Skip updating Platformatic/Watt config             | `true`           |
| `--retry-timeout-ms <ms>`      |       | Retry timeout for HTTP requests                    | -                |

## Usage Examples

### Basic Examples

**Generate OpenAPI client:**

```bash
massimo http://example.com/openapi.json -n myclient
```

**Generate GraphQL client:**

```bash
massimo http://example.com/graphql -n myclient
```

**Use local schema file:**

```bash
massimo path/to/schema.json -n myclient
```

### Advanced Examples

**TypeScript plugin:**

```bash
massimo https://api.example.com/openapi.json --name my-api --typescript
```

**Frontend client with TypeScript:**

```bash
massimo https://api.example.com/openapi.json --frontend --language ts --name my-api
```

**Types only:**

```bash
massimo https://api.example.com/openapi.json --types-only --name my-api
```

**Full response/request objects:**

```bash
massimo https://api.example.com/openapi.json --full --name my-api
```

**With authentication headers:**

```bash
massimo https://private-api.com/openapi.json \
  --url-auth-headers '{"Authorization":"Bearer TOKEN"}' \
  --name private-api
```

**Browser client with credentials:**

```bash
massimo https://api.example.com/openapi.json \
  --frontend \
  --with-credentials \
  --name my-api
```

## See Also

- [Frontend Client Reference](/reference/frontend)
- [Programmatic API](/reference/programmatic)
- [Error Handling](/reference/errors)
