# WebAX Application Integration

## Overview

This document outlines the strategies for integrating WebAX packages into applications. Proper integration ensures that applications can leverage the full power of the WebAX ecosystem while maintaining flexibility and customization options.

## Integration Methods

There are several methods for integrating WebAX packages into applications:

1. **NPM Installation**: Installing published packages from NPM
2. **Local Development**: Using local packages during development
3. **Git Submodules**: Including packages as Git submodules
4. **Monorepo**: Managing packages and applications in a monorepo

### 1. NPM Installation

The most common method for integrating WebAX packages is to install them from NPM.

#### Installation

```bash
# Install jcule
npm install @net.webax/jcule

# Install jellicule
npm install @net.webax/jellicule
```

#### Usage

```typescript
// Import from jcule
import { createBusinessLogic, JculeProvider } from '@net.webax/jcule';

// Import from jellicule
import { Button, Input, Card } from '@net.webax/jellicule';
```

### 2. Local Development

During development, it's often useful to use local packages to test changes before publishing.

#### Package.json Configuration

```json
{
  "dependencies": {
    "@net.webax/jcule": "file:../jcule",
    "@net.webax/jellicule": "file:../jellicule"
  }
}
```

#### Installation

```bash
# Install local packages
npm install
```

#### Usage

```typescript
// Import from local jcule
import { createBusinessLogic, JculeProvider } from '@net.webax/jcule';

// Import from local jellicule
import { Button, Input, Card } from '@net.webax/jellicule';
```

### 3. Git Submodules

Git submodules can be used to include WebAX packages directly in your application repository.

#### Adding Submodules

```bash
# Add jcule as a submodule
git submodule add https://github.com/webax/jcule.git packages/jcule

# Add jellicule as a submodule
git submodule add https://github.com/webax/jellicule.git packages/jellicule
```

#### Package.json Configuration

```json
{
  "dependencies": {
    "@net.webax/jcule": "file:packages/jcule",
    "@net.webax/jellicule": "file:packages/jellicule"
  }
}
```

#### Installation

```bash
# Initialize and update submodules
git submodule update --init --recursive

# Install dependencies
npm install
```

### 4. Monorepo

A monorepo can be used to manage WebAX packages and applications in a single repository.

#### Monorepo Structure

```
monorepo/
├── packages/
│   ├── jcule/
│   ├── jellicule/
│   └── ...
├── apps/
│   ├── app1/
│   ├── app2/
│   └── ...
├── package.json
└── lerna.json
```

#### Lerna Configuration

```json
{
  "packages": ["packages/*", "apps/*"],
  "version": "independent",
  "npmClient": "npm",
  "command": {
    "publish": {
      "ignoreChanges": ["*.md"],
      "message": "chore(release): publish"
    },
    "bootstrap": {
      "npmClientArgs": ["--no-package-lock"]
    }
  }
}
```

#### Package.json Configuration

```json
{
  "name": "webax-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "bootstrap": "lerna bootstrap",
    "build": "lerna run build",
    "test": "lerna run test",
    "lint": "lerna run lint"
  },
  "devDependencies": {
    "lerna": "^4.0.0"
  }
}
```

## Integration with IMS Prime

IMS Prime is an example application that demonstrates the integration of WebAX packages.

### Package.json Configuration

```json
{
  "name": "ims-prime",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@net.webax/jcule": "^1.0.0",
    "@net.webax/jellicule": "^1.0.0",
    "@net.webax/basic-freedom": "^1.0.0"
  }
}
```

### Application Structure

```
ims-prime/
├── app/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   ├── api.ts
│   │   │   ├── routes.ts
│   │   │   └── theme.ts
│   │   ├── components/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   └── ...
│   │   └── layouts/
│   │       ├── MainLayout.tsx
│   │       ├── ProductLayout.tsx
│   │       └── ...
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── ...
│   └── tests/
│       ├── components/
│       ├── layouts/
│       └── ...
├── cicda/
│   ├── environment/
│   └── tests/
├── develop/
│   └── environment/
├── dist/
├── docs/
│   ├── api/
│   ├── guides/
│   └── examples/
├── package.json
└── tsconfig.json
```

### Integration Example

```typescript
// src/index.ts
import { createBusinessLogic, JculeProvider } from '@net.webax/jcule';
import { ThemeProvider } from '@net.webax/jellicule';
import { apiConfig } from './config/api';
import { routesConfig } from './config/routes';
import { themeConfig } from './config/theme';
import { MainLayout, ProductLayout } from './layouts';
import { ProductList, ProductDetail } from './components';

// Create business logic controller
const businessLogic = createBusinessLogic({
  api: apiConfig,
  routes: routesConfig
});

// Register layouts
const layouts = {
  MainLayout,
  ProductLayout
};

// Register components
const components = {
  ProductList,
  ProductDetail
};

// Render the application
function App() {
  return (
    <JculeProvider businessLogic={businessLogic} layouts={layouts} components={components}>
      <ThemeProvider theme={themeConfig}>
        <div id="app" />
      </ThemeProvider>
    </JculeProvider>
  );
}

export default App;
```

## Customization

WebAX packages are designed to be customizable to meet the specific needs of each application.

### Customizing jcule

jcule can be customized through configuration:

```typescript
// Create a custom business logic controller
const businessLogic = createBusinessLogic({
  api: {
    spec: '/api/openapi.yaml',
    baseUrl: 'https://api.example.com/v1',
    auth: {
      type: 'bearer',
      tokenUrl: '/auth/token',
      refreshUrl: '/auth/refresh'
    }
  },
  routes: [
    {
      path: '/',
      layout: 'MainLayout',
      components: {
        'Header': {},
        'Footer': {}
      }
    },
    {
      path: '/products',
      layout: 'ProductLayout',
      data: {
        products: {
          endpoint: '/products',
          params: {
            page: 'page',
            pageSize: 'limit',
            sort: 'sortBy',
            direction: 'sortDirection',
            category: (value) => value || undefined
          }
        }
      },
      components: {
        'ProductList': {
          dataBinding: {
            products: 'products.data',
            loading: 'products.loading',
            error: 'products.error'
          },
          eventBinding: {
            onProductClick: (product) => ({
              type: 'NAVIGATE',
              payload: { path: `/products/${product.id}` }
            }),
            onAddToCart: (product) => ({
              type: 'ADD_TO_CART',
              payload: { productId: product.id, quantity: 1 }
            })
          }
        }
      }
    }
  ],
  plugins: [
    {
      name: 'auth',
      config: {
        storage: 'localStorage',
        tokenKey: 'auth_token',
        refreshTokenKey: 'refresh_token'
      }
    }
  ]
});
```

### Customizing jellicule

jellicule can be customized through theming:

```typescript
// Create a custom theme
const theme = {
  colors: {
    primary: {
      50: '#e6f7ff',
      100: '#bae7ff',
      500: '#1890ff',
      900: '#003a8c'
    },
    secondary: {
      50: '#f0f5ff',
      100: '#d6e4ff',
      500: '#2f54eb',
      900: '#061178'
    },
    success: {
      50: '#f6ffed',
      100: '#d9f7be',
      500: '#52c41a',
      900: '#135200'
    },
    error: {
      50: '#fff1f0',
      100: '#ffccc7',
      500: '#ff4d4f',
      900: '#a8071a'
    }
  },
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'system-ui, sans-serif',
    mono: 'Menlo, monospace'
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  space: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
    '6xl': '12rem'
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  }
};

// Use the custom theme
function App() {
  return (
    <ThemeProvider theme={theme}>
      <div id="app" />
    </ThemeProvider>
  );
}
```

## Conclusion

Proper integration of WebAX packages into applications is essential for leveraging the full power of the WebAX ecosystem. By following the strategies outlined in this document, you can ensure that your applications are well-structured, maintainable, and customizable.
