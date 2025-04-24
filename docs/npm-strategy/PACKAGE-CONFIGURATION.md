# WebAX Package Configuration

## Overview

This document outlines the standard configuration for WebAX packages published to NPM. Following a consistent configuration ensures that packages are built, tested, and published in a predictable way.

## Package.json Configuration

The `package.json` file is the central configuration file for an NPM package. Here's a template for WebAX packages:

```json
{
  "name": "@net.webax/package-name",
  "version": "0.1.0",
  "description": "Description of the package",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "LICENSE",
    "README.md"
  ],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint app/src --ext .ts,.tsx",
    "dev": "rollup -c -w",
    "start": "cd app && npm start",
    "prepublishOnly": "npm run build"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/webax/package-name.git"
  },
  "keywords": [
    "webax",
    "package-name"
  ],
  "author": "WebAX Team",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/webax/package-name/issues"
  },
  "homepage": "https://webax.net/package-name",
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^18.15.11",
    "@typescript-eslint/eslint-plugin": "^5.57.1",
    "@typescript-eslint/parser": "^5.57.1",
    "eslint": "^8.38.0",
    "jest": "^29.5.0",
    "rollup": "^3.20.2",
    "rollup-plugin-typescript2": "^0.34.1",
    "rollup-plugin-terser": "^7.0.2",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.4"
  },
  "peerDependencies": {
    "typescript": ">=4.0.0"
  }
}
```

### Key Fields

- **name**: The package name, including the `@net.webax` scope
- **version**: The package version, following semantic versioning
- **description**: A brief description of the package
- **main**: The CommonJS entry point
- **module**: The ES Module entry point
- **types**: The TypeScript declarations entry point
- **files**: The files to include in the published package
- **scripts**: NPM scripts for building, testing, and publishing
- **repository**: The Git repository URL
- **keywords**: Keywords for NPM search
- **author**: The package author
- **license**: The package license
- **bugs**: The URL for reporting issues
- **homepage**: The package homepage
- **publishConfig**: Configuration for publishing to NPM
- **devDependencies**: Development dependencies
- **peerDependencies**: Peer dependencies

## TypeScript Configuration

The `tsconfig.json` file configures the TypeScript compiler. Here's a template for WebAX packages:

```json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "esnext",
    "lib": ["dom", "esnext"],
    "declaration": true,
    "declarationDir": "dist",
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "moduleResolution": "node",
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "suppressImplicitAnyIndexErrors": true,
    "noImplicitAny": true,
    "strictFunctionTypes": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react",
    "jsxFactory": "createElement",
    "jsxFragmentFactory": "Fragment"
  },
  "include": ["app/src"],
  "exclude": ["node_modules", "dist", "cicda/tests"]
}
```

## Rollup Configuration

The `rollup.config.js` file configures the Rollup bundler. Here's a template for WebAX packages:

```javascript
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'app/src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/index.min.js',
      format: 'iife',
      name: pkg.name.replace('@net.webax/', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      useTsconfigDeclarationDir: true
    })
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ]
};
```

## Jest Configuration

The `jest.config.js` file configures the Jest testing framework. Here's a template for WebAX packages:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/app/tests/**/*.test.ts?(x)'],
  collectCoverage: true,
  collectCoverageFrom: [
    'app/src/**/*.{ts,tsx}',
    '!app/src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## ESLint Configuration

The `.eslintrc.js` file configures the ESLint linter. Here's a template for WebAX packages:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    browser: true,
    jest: true
  },
  rules: {
    // Add custom rules here
  }
};
```

## Prettier Configuration

The `.prettierrc` file configures the Prettier code formatter. Here's a template for WebAX packages:

```json
{
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

## NPM Scripts

The following NPM scripts should be included in every WebAX package:

- **build**: Build the package using Rollup
- **test**: Run tests using Jest
- **lint**: Lint the source code using ESLint
- **dev**: Watch for changes and rebuild using Rollup
- **start**: Start the demo application
- **prepublishOnly**: Build the package before publishing

## Implementation

To implement these configurations, you can use the following commands:

```bash
# Create the configuration files
cat > package.json << 'EOF'
{
  "name": "@net.webax/package-name",
  "version": "0.1.0",
  "description": "Description of the package",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "LICENSE",
    "README.md"
  ],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint app/src --ext .ts,.tsx",
    "dev": "rollup -c -w",
    "start": "cd app && npm start",
    "prepublishOnly": "npm run build"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/webax/package-name.git"
  },
  "keywords": [
    "webax",
    "package-name"
  ],
  "author": "WebAX Team",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/webax/package-name/issues"
  },
  "homepage": "https://webax.net/package-name",
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^18.15.11",
    "@typescript-eslint/eslint-plugin": "^5.57.1",
    "@typescript-eslint/parser": "^5.57.1",
    "eslint": "^8.38.0",
    "jest": "^29.5.0",
    "rollup": "^3.20.2",
    "rollup-plugin-typescript2": "^0.34.1",
    "rollup-plugin-terser": "^7.0.2",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.4"
  },
  "peerDependencies": {
    "typescript": ">=4.0.0"
  }
}
