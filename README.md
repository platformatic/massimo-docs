# Massimo Documentation

Official documentation for Massimo - a powerful tool for generating typed HTTP clients from OpenAPI and GraphQL APIs.

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

The `main` branch is published on https://massimo.stageplt.space

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will start at `http://localhost:4321`.

## 📁 Project Structure

```
massimo-docs/
├── src/
│   ├── assets/           # Images and logos
│   ├── content/
│   │   └── docs/        # Documentation markdown files
│   │       ├── index.mdx            # Homepage
│   │       ├── getting-started.md   # Getting started guide
│   │       └── reference/           # API reference docs
│   │           ├── overview.md      # CLI reference
│   │           ├── frontend.md      # Frontend client docs
│   │           ├── programmatic.md  # Programmatic API
│   │           └── errors.md        # Error reference
│   └── styles/          # Custom CSS styles
├── astro.config.mjs     # Astro configuration
├── package.json
└── README.md
```

## 📝 Contributing to Documentation

### Adding New Pages

1. Create a new `.md` or `.mdx` file in `src/content/docs/`
2. Add frontmatter with title and description:

```markdown
---
title: Your Page Title
description: Brief description of the page
---

# Your content here
```

3. Update the sidebar in `astro.config.mjs` if needed

### Writing Guidelines

- Use clear, concise language
- Include code examples for all features
- Provide both JavaScript and TypeScript examples where applicable
- Test all code examples before committing
- Use proper markdown formatting and headers

### Code Examples

When adding code examples:

````markdown
```js
// JavaScript example
import client from './api.js'

const api = await client({ url: 'https://api.example.com' })
const users = await api.getUsers()
```

```typescript
// TypeScript example
import client from './api'
import type { User } from './api-types'

const api = await client({ url: 'https://api.example.com' })
const users: User[] = await api.getUsers()
```
````

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🎨 Customization

### Styling

Custom styles are located in `src/styles/custom.css`. The documentation uses the Platformatic brand colors and fonts.

### Navigation

Edit the `sidebar` configuration in `astro.config.mjs` to modify the navigation structure.

## 🔗 Links

- [Massimo Repository](https://github.com/platformatic/massimo)
- [Platformatic Website](https://platformatic.dev)
- [Discord Community](https://discord.com/invite/platformatic)

## 📄 License

This documentation is part of the Massimo project and follows the same license terms.

## 🤝 Support

- [GitHub Issues](https://github.com/platformatic/massimo/issues)
- [Discord](https://discord.com/invite/platformatic)

---

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build/)
