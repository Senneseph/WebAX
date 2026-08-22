# WebAX Package Structure and Naming Convention

This document outlines the package structure and naming convention for WebAX packages.

## Package Naming Convention

WebAX packages follow a domain-based naming convention:

```text
@net.webax/{package-name}
```

Where `{package-name}` is the name of the package, such as:

- Web framework implementation (jcule)
- UI component library implementation (jellicule)
- Logging implementation (cyber-eyes)
- Communication implementation (comlink)
- Storage implementation (memory-core)

This naming convention ensures that all WebAX packages are grouped together and easily identifiable.

## Package Structure

Each WebAX package follows a consistent directory structure:

```text
{package-name}/
├── app/                      # Source code and interactive demo application
│   ├── src/                  # Source code
│   ├── environment/          # Environment configuration (Docker, etc.)
│   ├── assets/               # Static assets
│   └── tests/                # Test files (written here, run by cicda)
├── cicda/                    # SICADTDA (CI/CD) configuration
│   ├── environment/          # Dockerfile(s) for the build + test container
│   ├── build/                # CI build scripts (tsconfig.json lives at the repo root)
│   └── tests/                # Test runner configuration (jest.config.js, setup)
├── develop/                  # Optional developer tools
│   └── environment/          # Environment configuration for development
├── dist/                     # Distribution files
│   └── environment/          # Environment configuration for distribution
└── docs/                     # Documentation
    ├── api/                  # API documentation
    ├── guides/               # Usage guides
    ├── examples/             # Example implementations
    └── specifications/       # Detailed specifications
```

### `/app`

The `/app` directory contains the source code and an interactive demo application. This includes:

- Source code for the package
- Interactive demo application that showcases the package's functionality
- Test files that verify the package's functionality
- Environment configuration for running the application

The demo application should:

- Be self-contained and runnable with just Docker installed
- Demonstrate the key features of the package
- Provide a good user experience for exploring the package
- Include documentation on how to use the demo

### `/cicda`

The `/cicda` directory contains configuration files for the Self-Contained Integrated Continuous Automatic Development, Testing, and Deployment Approach (SICADTDA). This includes:

- Test runners and configuration
- Build scripts
- Deployment scripts
- Environment configuration for CI/CD

The SICADTDA approach ensures that all development, testing, and deployment processes are automated and integrated into the package itself, without requiring external CI/CD systems.

### `/develop`

The `/develop` directory contains optional developer tools that can be used when the developer doesn't have their own tools installed. This includes:

- Code editor (code-server)
- Terminal
- Debugging tools
- Environment configuration for development

The `/develop` directory is not required for using the package, but provides a convenient development environment for contributors who don't have their own tools.

### `/dist`

The `/dist` directory contains the distribution files for the package, including:

- Compiled JavaScript files
- TypeScript declaration files
- CSS files
- Other assets
- Environment configuration for distribution

### `/docs`

The `/docs` directory contains documentation for the package, including:

- API reference
- Usage guides
- Example implementations
- Detailed specifications
- Architecture documentation
- Design decisions
- Contributing guidelines

### `/environment` Directories

Each major directory (`/app`, `/cicda`, `/develop`, `/dist`) contains an `/environment` subdirectory that includes:

- Docker configuration files
- Environment variables
- Configuration files for services
- Other environment-specific files

The base directory should contain a `docker-compose.yaml` file (not `.yml`) that can be used to launch the environment with `docker-compose up`.

## Architectural Principles

### Business Logic Controller (BLC)

The Business Logic Controller (BLC) is the central component of the WebAX architecture, implemented by jcule. It:

1. Manages application state
2. Handles routing
3. Communicates with APIs
4. Processes events from UI components
5. Updates UI components based on state changes

### UI Component Isolation

UI components (implemented by jellicule) should:

1. **Not communicate directly with each other**
2. Only report events to the BLC
3. Receive updates from the BLC
4. Be as "dumb" as possible, focusing only on rendering and user interaction

### Multi-Tab Support

WebAX applications should work seamlessly across multiple browser tabs:

1. Each tab has its own instance of the BLC
2. BLCs communicate with each other via a messaging system (e.g., comlink)
3. There is ONE true application state that all tabs sync with
4. State updates are broadcast to all UI instances to keep them in sync
5. The UI is a view into the application state, not the source of truth

## Package.json Structure

Each WebAX package should have a `package.json` file with the following structure:

```json
{
  "name": "@net.webax/{package-name}",
  "version": "0.1.0",
  "description": "Description of the package",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "LICENSE",
    "README.md"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "jest",
    "lint": "eslint app/src --ext .ts",
    "start": "cd app && docker-compose up"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/webax/{package-name}.git"
  },
  "keywords": [
    "webax",
    "{package-name}"
  ],
  "author": "WebAX Team",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/webax/{package-name}/issues"
  },
  "homepage": "https://webax.net/{package-name}",
  "devDependencies": {
    // Development dependencies
  },
  "peerDependencies": {
    "typescript": ">=4.0.0"
  }
}
```

## Build Configuration

Each WebAX package builds with the TypeScript compiler (`tsc`). No bundler is required — components are native web components shipped as ES modules:

```bash
npm run build   # tsc -p tsconfig.json
```

The build emits browser-native ES modules into `dist/` plus `.d.ts` type declarations. Relative imports use explicit `.js` extensions so the output runs directly in the browser with no bundler.

## TypeScript Configuration

Each WebAX package should use TypeScript with the following configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["dom", "esnext"],
    "declaration": true,
    "declarationDir": "dist",
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "app/src",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["app/src"],
  "exclude": ["node_modules", "dist", "cicda/tests"]
}
```

## Documentation Structure

Each WebAX package should include the following documentation:

### README.md

The README.md file should include:

- Package name and description
- Installation instructions
- Basic usage examples
- Links to more detailed documentation
- License information

### API.md

The API.md file should include:

- Detailed API reference
- Interface definitions
- Method descriptions
- Parameter descriptions
- Return value descriptions
- Example usage

### ARCHITECTURE.md

The ARCHITECTURE.md file should include:

- High-level architecture overview
- Component descriptions
- Data flow diagrams
- Design decisions
- Implementation details

### CONTRIBUTING.md

The CONTRIBUTING.md file should include:

- How to contribute to the package
- Development setup instructions
- Coding standards
- Pull request process
- Issue reporting guidelines

## Publishing Process

To publish a WebAX package:

1. Update the version number in `package.json`
2. Build the package: `npm run build`
3. Test the package: `npm test`
4. Publish to npm: `npm publish --access public`

## Versioning

WebAX packages follow semantic versioning (SemVer):

- **Major version**: Incompatible API changes
- **Minor version**: Backwards-compatible functionality additions
- **Patch version**: Backwards-compatible bug fixes

## Dependencies

WebAX packages should minimize dependencies and clearly document any dependencies they have. Dependencies should be:

- Stable and well-maintained
- Lightweight
- Compatible with the WebAX ecosystem
- Properly typed with TypeScript

## Best Practices

When creating WebAX packages:

1. **Follow the naming convention**: Use the `@net.webax/{package-name}` format
2. **Follow the directory structure**: Use the standard directory structure
3. **Document thoroughly**: Provide comprehensive documentation
4. **Test thoroughly**: Write tests for all functionality
5. **Minimize dependencies**: Keep dependencies to a minimum
6. **Use TypeScript**: Write all code in TypeScript
7. **Follow semantic versioning**: Use semantic versioning for releases
8. **Isolate UI components**: UI components should not communicate directly with each other
9. **Support multiple tabs**: Applications should work seamlessly across multiple browser tabs
10. **Use the BLC pattern**: The Business Logic Controller should be the central component of the application
