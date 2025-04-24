# WebAX Documentation Standards

## Overview

This document outlines the standards for documenting WebAX packages. Comprehensive and consistent documentation is essential for ensuring that packages are usable, maintainable, and accessible to developers of all skill levels.

## Documentation Types

WebAX packages should include the following types of documentation:

1. **README**: Overview of the package
2. **API Documentation**: Detailed documentation of the package's API
3. **Examples**: Example usage of the package
4. **Tutorials**: Step-by-step guides for common tasks
5. **Guides**: In-depth explanations of concepts and features
6. **Reference**: Comprehensive reference documentation
7. **Changelog**: Record of changes between versions

## README Format

The README.md file is the entry point for package documentation. It should follow this format:

```markdown
# Package Name

Brief description of the package.

## Installation

```bash
npm install @net.webax/package-name
```

## Quick Start

```typescript
import { someFunction } from '@net.webax/package-name';

// Example usage
const result = someFunction();
console.log(result);
```

## Features

- Feature 1: Brief description
- Feature 2: Brief description
- Feature 3: Brief description

## Documentation

For more detailed documentation, see:

- [API Documentation](./docs/api/README.md)
- [Examples](./docs/examples/README.md)
- [Tutorials](./docs/tutorials/README.md)
- [Guides](./docs/guides/README.md)
- [Reference](./docs/reference/README.md)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

This package is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
```

## API Documentation

API documentation should be generated from code comments using a tool like TypeDoc. It should follow these guidelines:

1. **Complete**: Document all public APIs
2. **Accurate**: Ensure documentation matches the actual behavior
3. **Consistent**: Use consistent terminology and formatting
4. **Examples**: Include examples for each API
5. **Types**: Document parameter and return types
6. **Errors**: Document possible errors and how to handle them

### Example TypeDoc Comment

```typescript
/**
 * Calculates the total price of items in a cart.
 *
 * @param items - The items in the cart
 * @returns The total price of all items
 * @throws {Error} If any item has an invalid price or quantity
 *
 * @example
 * ```typescript
 * const items = [
 *   { id: 1, name: 'Product 1', price: 10, quantity: 2 },
 *   { id: 2, name: 'Product 2', price: 20, quantity: 1 }
 * ];
 *
 * const total = calculateTotal(items);
 * console.log(total); // 40
 * ```
 */
export function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
```

## Examples

Examples should demonstrate common use cases for the package. They should follow these guidelines:

1. **Simple**: Start with simple examples and progress to more complex ones
2. **Complete**: Include all necessary imports and setup
3. **Runnable**: Ensure examples can be run without modification
4. **Commented**: Include comments explaining key concepts
5. **Organized**: Organize examples by feature or use case

### Example Structure

```
examples/
├── basic/
│   ├── simple-usage.ts
│   └── README.md
├── advanced/
│   ├── complex-usage.ts
│   └── README.md
└── README.md
```

### Example File

```typescript
// examples/basic/simple-usage.ts

// Import the package
import { createBusinessLogic, JculeProvider } from '@net.webax/jcule';

// Define configuration
const config = {
  api: {
    spec: '/api/openapi.yaml',
    baseUrl: 'https://api.example.com/v1'
  },
  routes: [
    {
      path: '/',
      layout: 'MainLayout',
      components: {
        'Header': {},
        'Footer': {}
      }
    }
  ]
};

// Create business logic controller
const businessLogic = createBusinessLogic(config);

// Use in a React component
function App() {
  return (
    <JculeProvider businessLogic={businessLogic}>
      <div id="app" />
    </JculeProvider>
  );
}

export default App;
```

## Tutorials

Tutorials should provide step-by-step instructions for common tasks. They should follow these guidelines:

1. **Progressive**: Start with basic concepts and build on them
2. **Complete**: Include all necessary steps
3. **Contextual**: Explain why each step is necessary
4. **Tested**: Ensure tutorials work as described
5. **Accessible**: Write for developers of all skill levels

### Tutorial Structure

```
tutorials/
├── getting-started/
│   ├── 01-installation.md
│   ├── 02-basic-usage.md
│   └── 03-advanced-usage.md
├── integration/
│   ├── 01-react-integration.md
│   ├── 02-vue-integration.md
│   └── 03-angular-integration.md
└── README.md
```

### Tutorial Example

```markdown
# Getting Started with jcule

This tutorial will guide you through the process of setting up jcule in a React application.

## Prerequisites

- Node.js 14 or later
- npm 6 or later
- A React application

## Step 1: Install jcule

```bash
npm install @net.webax/jcule
```

## Step 2: Create a Configuration File

Create a file named `jcule-config.ts` with the following content:

```typescript
export const jculeConfig = {
  api: {
    spec: '/api/openapi.yaml',
    baseUrl: 'https://api.example.com/v1'
  },
  routes: [
    {
      path: '/',
      layout: 'MainLayout',
      components: {
        'Header': {},
        'Footer': {}
      }
    }
  ]
};
```

## Step 3: Create a Business Logic Controller

```typescript
import { createBusinessLogic } from '@net.webax/jcule';
import { jculeConfig } from './jcule-config';

export const businessLogic = createBusinessLogic(jculeConfig);
```

## Step 4: Integrate with React

```typescript
import React from 'react';
import { JculeProvider } from '@net.webax/jcule';
import { businessLogic } from './business-logic';

function App() {
  return (
    <JculeProvider businessLogic={businessLogic}>
      <div id="app" />
    </JculeProvider>
  );
}

export default App;
```

## Next Steps

Now that you have jcule set up in your React application, you can:

- [Configure API Integration](./02-api-integration.md)
- [Define Routes and Layouts](./03-routes-and-layouts.md)
- [Create Custom Components](./04-custom-components.md)
```

## Guides

Guides should provide in-depth explanations of concepts and features. They should follow these guidelines:

1. **Conceptual**: Focus on explaining concepts rather than step-by-step instructions
2. **Comprehensive**: Cover all aspects of the topic
3. **Contextual**: Explain how the topic fits into the larger picture
4. **Examples**: Include examples to illustrate concepts
5. **References**: Include references to related documentation

### Guide Structure

```
guides/
├── concepts/
│   ├── business-logic-controller.md
│   ├── ui-to-api-mapping.md
│   └── event-based-communication.md
├── features/
│   ├── state-management.md
│   ├── routing.md
│   └── api-integration.md
└── README.md
```

### Guide Example

```markdown
# UI-to-API Mapping

This guide explains the concept of UI-to-API mapping in jcule and how it enables declarative UI generation from API specifications.

## What is UI-to-API Mapping?

UI-to-API mapping is a technique for generating UI components directly from API specifications. It allows you to define the relationship between API endpoints and UI components in a declarative way, reducing the amount of boilerplate code needed to connect your UI to your API.

## How it Works

jcule uses the UIxAAS (User Interface API Adapter Specification) to standardize the representation of API specifications. The UIxAAS output is then consumed by the muther-brane component, which selects and renders the appropriate UI components based on the specification.

### 1. API Specification

The process starts with an API specification, such as an OpenAPI document:

```yaml
openapi: 3.0.0
info:
  title: Product API
  version: 1.0.0
paths:
  /products:
    get:
      summary: List all products
      responses:
        200:
          description: A list of products
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'
components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        price:
          type: number
        description:
          type: string
```

### 2. UIxAAS Representation

The OpenAPI-UxA adapter transforms the API specification into a UIxAAS representation:

```json
{
  "uiAASVersion": "0.1.0",
  "sourceSpec": {
    "type": "OpenAPI",
    "version": "3.0.0"
  },
  "globalInfo": {
    "title": "Product API",
    "apiVersion": "1.0.0"
  },
  "resources": {
    "Product": {
      "name": "Product",
      "label": "Product",
      "identifierField": "id",
      "views": {
        "listView": {
          "type": "listView",
          "label": "Products",
          "fields": [
            {
              "name": "id",
              "label": "ID",
              "dataType": "integer",
              "isRequired": true,
              "isReadOnly": true
            },
            {
              "name": "name",
              "label": "Name",
              "dataType": "text",
              "isRequired": true,
              "isReadOnly": false
            },
            {
              "name": "price",
              "label": "Price",
              "dataType": "number",
              "isRequired": true,
              "isReadOnly": false
            }
          ],
          "primaryAction": "listProducts"
        }
      },
      "actions": {
        "listProducts": {
          "name": "listProducts",
          "label": "List Products",
          "type": "query",
          "httpMethod": "GET",
          "pathTemplate": "/products",
          "parameters": [],
          "successResponse": {
            "description": "A list of products",
            "contentType": "application/json",
            "schema": "ProductList"
          }
        }
      }
    }
  },
  "schemas": {
    "ProductList": {
      "type": "list",
      "items": "Product"
    },
    "Product": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "name": {
          "type": "text"
        },
        "price": {
          "type": "number"
        },
        "description": {
          "type": "text"
        }
      },
      "required": ["id", "name", "price"]
    }
  }
}
```

### 3. UI Configuration

You can then define a UI configuration that maps the UIxAAS representation to UI components:

```typescript
const config = {
  api: {
    spec: '/api/openapi.yaml',
    baseUrl: 'https://api.example.com/v1'
  },
  routes: [
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
            direction: 'sortDirection'
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
            })
          }
        }
      }
    }
  ]
};
```

### 4. UI Generation

jcule uses this configuration to generate the appropriate UI components:

```jsx
function ProductList({ products, loading, error, onProductClick }) {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="product-list">
      {products.map(product => (
        <div key={product.id} className="product-item" onClick={() => onProductClick(product)}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

## Benefits

UI-to-API mapping provides several benefits:

1. **Reduced Boilerplate**: Less code needed to connect UI to API
2. **Consistency**: Consistent UI generation across the application
3. **Maintainability**: Changes to the API are automatically reflected in the UI
4. **Productivity**: Faster development of UI components
5. **Documentation**: Self-documenting UI-to-API relationships

## Best Practices

When using UI-to-API mapping, follow these best practices:

1. **Keep API Specifications Clean**: Ensure your API specifications are well-structured and consistent
2. **Use Semantic Names**: Use meaningful names for resources, views, and actions
3. **Provide Clear Labels**: Use clear and concise labels for fields and actions
4. **Document Relationships**: Document the relationship between API endpoints and UI components
5. **Test Generated UIs**: Test the generated UI components to ensure they behave as expected

## Related Guides

- [Business Logic Controller](./business-logic-controller.md)
- [Event-Based Communication](./event-based-communication.md)
- [State Management](../features/state-management.md)
```

## Reference

Reference documentation should provide comprehensive information about the package's API. It should follow these guidelines:

1. **Complete**: Document all public APIs
2. **Organized**: Organize documentation by module or feature
3. **Searchable**: Make documentation easy to search
4. **Versioned**: Provide documentation for each version
5. **Cross-Referenced**: Include links to related documentation

### Reference Structure

```
reference/
├── api/
│   ├── business-logic-controller.md
│   ├── jcule-provider.md
│   └── app-router.md
├── types/
│   ├── config-types.md
│   ├── state-types.md
│   └── event-types.md
└── README.md
```

### Reference Example

```markdown
# BusinessLogicController

The `BusinessLogicController` is the core component of jcule. It manages application state, handles routing, communicates with APIs, processes events from UI components, and updates UI components based on state changes.

## Constructor

```typescript
constructor(config: JculeConfig)
```

Creates a new `BusinessLogicController` instance.

### Parameters

- `config`: The configuration object for the controller.

### Returns

A new `BusinessLogicController` instance.

### Example

```typescript
import { BusinessLogicController } from '@net.webax/jcule';

const config = {
  api: {
    spec: '/api/openapi.yaml',
    baseUrl: 'https://api.example.com/v1'
  },
  routes: [
    {
      path: '/',
      layout: 'MainLayout',
      components: {
        'Header': {},
        'Footer': {}
      }
    }
  ]
};

const controller = new BusinessLogicController(config);
```

## Methods

### getState

```typescript
getState(): JculeState
```

Gets the current state of the controller.

#### Returns

The current state of the controller.

#### Example

```typescript
const state = controller.getState();
console.log(state);
```

### setState

```typescript
setState(state: Partial<JculeState>): void
```

Sets the state of the controller.

#### Parameters

- `state`: The new state to set.

#### Example

```typescript
controller.setState({
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

### dispatch

```typescript
dispatch(action: JculeAction): void
```

Dispatches an action to the controller.

#### Parameters

- `action`: The action to dispatch.

#### Example

```typescript
controller.dispatch({
  type: 'NAVIGATE',
  payload: {
    path: '/products'
  }
});
```

### subscribe

```typescript
subscribe(listener: (state: JculeState) => void): () => void
```

Subscribes to state changes.

#### Parameters

- `listener`: The function to call when the state changes.

#### Returns

A function to unsubscribe from state changes.

#### Example

```typescript
const unsubscribe = controller.subscribe(state => {
  console.log('State changed:', state);
});

// Later, to unsubscribe
unsubscribe();
```

## Properties

### config

```typescript
readonly config: JculeConfig
```

The configuration object for the controller.

#### Example

```typescript
console.log(controller.config);
```

### state

```typescript
readonly state: JculeState
```

The current state of the controller.

#### Example

```typescript
console.log(controller.state);
```

## Related

- [JculeProvider](./jcule-provider.md)
- [AppRouter](./app-router.md)
- [JculeConfig](../types/config-types.md)
- [JculeState](../types/state-types.md)
- [JculeAction](../types/event-types.md)
```

## Changelog

The CHANGELOG.md file should record all notable changes between versions. It should follow these guidelines:

1. **Chronological**: List changes in reverse chronological order (newest first)
2. **Categorized**: Categorize changes as Added, Changed, Deprecated, Removed, Fixed, or Security
3. **Versioned**: Group changes by version
4. **Dated**: Include the release date for each version
5. **Linked**: Include links to issues, pull requests, and contributors

### Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature 1
- New feature 2

### Changed
- Change 1
- Change 2

## [1.0.0] - 2023-04-01

### Added
- Initial release
- Feature 1
- Feature 2

### Fixed
- Bug 1
- Bug 2

## [0.1.0] - 2023-03-01

### Added
- Alpha release
- Basic functionality

[Unreleased]: https://github.com/webax/package-name/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/webax/package-name/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/webax/package-name/releases/tag/v0.1.0
```

## Documentation Tools

Several tools can help generate and maintain documentation:

1. **TypeDoc**: Generates API documentation from TypeScript code
2. **Docusaurus**: Creates documentation websites
3. **Storybook**: Documents and tests UI components
4. **JSDoc**: Generates API documentation from JavaScript code
5. **Markdown**: Writes documentation in Markdown format

### TypeDoc Configuration

```json
// typedoc.json
{
  "entryPoints": ["app/src/index.ts"],
  "out": "docs/api",
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeExternals": true,
  "readme": "none",
  "name": "Package Name API Documentation",
  "plugin": ["typedoc-plugin-markdown"]
}
```

### Docusaurus Configuration

```js
// docusaurus.config.js
module.exports = {
  title: 'Package Name',
  tagline: 'Package description',
  url: 'https://webax.net',
  baseUrl: '/package-name/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'webax',
  projectName: 'package-name',
  themeConfig: {
    navbar: {
      title: 'Package Name',
      logo: {
        alt: 'Package Name Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/webax/package-name',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'API Reference',
              to: '/docs/api',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/webax/package-name',
            },
            {
              label: 'NPM',
              href: 'https://www.npmjs.com/package/@net.webax/package-name',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} WebAX. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/webax/package-name/edit/main/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
```

### Storybook Configuration

```js
// .storybook/main.js
module.exports = {
  stories: ['../app/src/**/*.stories.mdx', '../app/src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
};
```

## Conclusion

Following consistent documentation standards is essential for creating usable and maintainable WebAX packages. By adhering to the standards outlined in this document, you can ensure that your packages are well-documented and accessible to developers of all skill levels.
