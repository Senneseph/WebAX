# WebAX Package Naming Convention

## Overview

This document outlines the naming convention for WebAX packages published to NPM. A consistent naming convention ensures that packages are easily identifiable as part of the WebAX ecosystem and prevents name collisions with other packages.

## Scope Naming

All WebAX packages should use the `@net.webax` scope, which aligns with the webax.net domain:

```
@net.webax/{package-name}
```

### Benefits of Scoped Packages

1. **Namespace Protection**: Prevents name collisions with other packages in the NPM registry
2. **Brand Recognition**: Clearly identifies packages as part of the WebAX ecosystem
3. **Grouping**: Makes it easy to find all WebAX packages
4. **Consistency**: Aligns with the webax.net domain

## Package Naming Patterns

Package names should follow these guidelines:

1. **Use Lowercase**: All package names should be lowercase
2. **Use Hyphens**: Use hyphens to separate words, not underscores or camelCase
3. **Be Descriptive**: Names should clearly describe the package's purpose
4. **Be Concise**: Names should be as short as possible while still being descriptive

### Core Packages

Core packages should have simple, descriptive names:

- `@net.webax/jcule`: Business Logic Controller
- `@net.webax/jellicule`: UI Component Library
- `@net.webax/basic-freedom`: Basic UI Components

### Extension Packages

Extension packages should use a prefix that indicates their relationship to a core package:

- `@net.webax/jcule-openapi`: OpenAPI adapter for jcule
- `@net.webax/jellicule-bootstrap`: Bootstrap theme for jellicule
- `@net.webax/jellicule-material`: Material Design theme for jellicule

### Tool Packages

Tool packages should use a suffix that indicates they are tools:

- `@net.webax/spec-extractor`: Component specification extractor
- `@net.webax/pwa-builder`: Progressive Web App builder
- `@net.webax/image-transformer`: Image transformation tool
- `@net.webax/api-generator`: API client generator

## Examples

Here are examples of correctly named WebAX packages:

```
@net.webax/jcule
@net.webax/jellicule
@net.webax/basic-freedom
@net.webax/jcule-openapi
@net.webax/jellicule-bootstrap
@net.webax/jellicule-material
@net.webax/spec-extractor
@net.webax/pwa-builder
@net.webax/image-transformer
@net.webax/api-generator
```

## Implementation

To implement this naming convention in your package.json:

```json
{
  "name": "@net.webax/jcule",
  "version": "0.1.0",
  "description": "Business Logic Controller for WebAX applications"
}
```

## NPM Organization

To use the `@net.webax` scope, you need to create an NPM organization:

1. Go to https://www.npmjs.com/org/create
2. Create the organization (one-time fee of $7)
3. Add team members and set permissions

## Conclusion

Following a consistent naming convention is essential for creating a cohesive ecosystem of WebAX packages. By using the `@net.webax` scope and following the naming patterns outlined in this document, you can ensure that your packages are easily identifiable and maintainable.
