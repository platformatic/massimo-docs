---
title: CLI Reference
description: Complete reference for the Massimo CLI commands and options
---

# Massimo CLI Reference

The Massimo CLI (`massimo-cli`) creates Fastify plugins that expose clients for remote OpenAPI or GraphQL APIs.

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
| `--module <esm\|cjs>`          |       | Module format (ESM or CommonJS)                    | Auto-detect      |
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
| `--type-extension`             |       | Force TypeScript declaration file extensions       | `false`          |
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

### Module Format Examples

**Generate ESM client:**

```bash
massimo https://api.example.com/openapi.json --name my-api --module esm
```

**Generate CommonJS client:**

```bash
massimo https://api.example.com/openapi.json --name my-api --module cjs
```

**Auto-detect module format from package.json:**

```bash
# Detects from "type": "module" in package.json
massimo https://api.example.com/openapi.json --name my-api
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

**Force TypeScript declaration file extensions:**

```bash
# Generate .d.mts for ESM or .d.cts for CommonJS based on module format
massimo https://api.example.com/openapi.json --types-only --type-extension --name my-api
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

## Module Format Detection

Massimo automatically detects your project's module format:

1. **ESM (ECMAScript Modules)**: Generated when your `package.json` contains `"type": "module"`
   - Output files use `.mjs` extension
   - Uses `import`/`export` syntax

2. **CommonJS**: Generated when `package.json` doesn't have `"type": "module"` or has `"type": "commonjs"`
   - Output files use `.cjs` extension
   - Uses `require`/`module.exports` syntax

3. **Override**: Use `--module esm` or `--module cjs` to force a specific format

## TypeScript Declaration File Extensions

When generating TypeScript declaration files, Massimo can intelligently determine the appropriate file extension:

### Default Behavior

- TypeScript declaration files are generated with the `.d.ts` extension by default

### With `--type-extension` Flag

When you use the `--type-extension` flag, Massimo generates module-specific TypeScript declaration files:

1. **ESM Projects**: Generates `.d.mts` files (TypeScript declaration for ESM modules)
2. **CommonJS Projects**: Generates `.d.cts` files (TypeScript declaration for CommonJS modules)

### Extension Determination Rules

The TypeScript declaration file extension is determined by the following precedence:

1. **Explicit `--type-extension` flag**: Forces generation of module-specific extensions
2. **Module format**: Based on `--module` flag or detected module type from package.json
3. **Parent package.json**: Falls back to the `"type"` field in the parent package.json

### Examples

```bash
# Generate .d.mts for ESM project
massimo https://api.example.com/openapi.json --types-only --type-extension --module esm --name my-api

# Generate .d.cts for CommonJS project  
massimo https://api.example.com/openapi.json --types-only --type-extension --module cjs --name my-api

# Auto-detect and generate appropriate extension
massimo https://api.example.com/openapi.json --types-only --type-extension --name my-api
```

## See Also

- [Frontend Client Reference](/reference/frontend)
- [Programmatic API](/reference/programmatic)
- [Error Handling](/reference/errors)
