# WebAX Dependency Management

## Overview

This document outlines the strategy for managing dependencies in WebAX packages. Proper dependency management ensures that packages are lightweight, maintainable, and compatible with a wide range of environments.

## Dependency Types

NPM packages can have three types of dependencies:

1. **dependencies**: Required for the package to function in production
2. **devDependencies**: Required for development, testing, and building
3. **peerDependencies**: Required by the consumer of the package

### Dependencies

Dependencies are packages that are required for your package to function in production. They are installed automatically when your package is installed.

```json
{
  "dependencies": {
    "lodash": "^4.17.21",
    "axios": "^0.21.1"
  }
}
```

### DevDependencies

DevDependencies are packages that are only required during development, testing, or building. They are not installed when your package is installed as a dependency of another package.

```json
{
  "devDependencies": {
    "typescript": "^4.5.4",
    "jest": "^27.4.7",
    "rollup": "^2.70.1"
  }
}
```

### PeerDependencies

PeerDependencies are packages that are required by the consumer of your package. They are not installed automatically when your package is installed, but a warning is shown if they are not installed.

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

## Dependency Management Principles

### 1. Minimize External Dependencies

WebAX packages should minimize external dependencies to reduce the risk of security vulnerabilities, compatibility issues, and bloated bundle sizes.

#### Guidelines

- **Evaluate Necessity**: Only add dependencies that provide significant value
- **Consider Alternatives**: Use built-in functionality when possible
- **Bundle Size**: Consider the impact on bundle size
- **Maintenance**: Consider the maintenance status of the dependency
- **Security**: Consider the security track record of the dependency

### 2. Use Peer Dependencies for Frameworks

Frameworks like React should be specified as peer dependencies to avoid duplicate installations and version conflicts.

#### Example

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

### 3. Pin Dependency Versions

Dependency versions should be pinned to ensure consistent behavior across installations.

#### Guidelines

- **Dependencies**: Use exact versions (`1.2.3`) or compatible versions (`^1.2.3`)
- **DevDependencies**: Use exact versions (`1.2.3`) or compatible versions (`^1.2.3`)
- **PeerDependencies**: Use version ranges (`>=1.2.3`)

#### Example

```json
{
  "dependencies": {
    "lodash": "^4.17.21",
    "axios": "^0.21.1"
  },
  "devDependencies": {
    "typescript": "^4.5.4",
    "jest": "^27.4.7"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

### 4. Monitor Bundle Size

WebAX packages should monitor their bundle size to ensure they are lightweight and performant.

#### Tools

- **rollup-plugin-visualizer**: Visualizes the bundle size
- **bundlephobia**: Analyzes the bundle size of NPM packages
- **webpack-bundle-analyzer**: Analyzes the bundle size of webpack bundles

#### Example

```bash
# Install rollup-plugin-visualizer
npm install --save-dev rollup-plugin-visualizer

# Add to rollup.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  // ...
  plugins: [
    // ...
    visualizer({
      filename: 'bundle-analysis.html',
      open: true
    })
  ]
};
```

### 5. Use Tree-Shaking

WebAX packages should be designed to support tree-shaking, which allows unused code to be eliminated during bundling.

#### Guidelines

- **ES Modules**: Use ES modules for better tree-shaking
- **Side Effects**: Specify `"sideEffects": false` in package.json
- **Pure Functions**: Use pure functions when possible
- **Avoid Global State**: Avoid global state and side effects

#### Example

```json
{
  "name": "@net.webax/package-name",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "sideEffects": false
}
```

### 6. Use Dependency Auditing

WebAX packages should regularly audit their dependencies for security vulnerabilities.

#### Tools

- **npm audit**: Checks for known security vulnerabilities
- **snyk**: Checks for known security vulnerabilities
- **dependabot**: Automatically updates dependencies

#### Example

```bash
# Run npm audit
npm audit

# Fix vulnerabilities
npm audit fix

# Run snyk test
npx snyk test

# Fix vulnerabilities
npx snyk wizard
```

## Dependency Management for Specific Packages

### jcule

jcule should have minimal dependencies and should not depend on any UI framework.

```json
{
  "dependencies": {
    "openapi-types": "^12.1.0"
  },
  "peerDependencies": {
    "typescript": ">=4.0.0"
  }
}
```

### jellicule

jellicule should have minimal dependencies and should use web components for UI.

```json
{
  "dependencies": {
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0",
    "typescript": ">=4.0.0"
  }
}
```

## Conclusion

Following a consistent dependency management strategy is essential for creating maintainable and reliable WebAX packages. By adhering to the principles outlined in this document, you can ensure that your packages are lightweight, secure, and compatible with a wide range of environments.
