# WebAX Specification

## 1. Introduction

### 1.1 Purpose

The WebAX (Web Application Experience) specification defines a comprehensive framework for building, distributing, and running web applications with a focus on performance, offline capabilities, and seamless user experiences. It extends Progressive Web App (PWA) concepts with additional standards for packaging, distribution, and inter-application communication.

### 1.2 Scope

This specification covers:

- The WebAXP packaging format
- The WebAXD distribution mechanism
- The WebAXDN peer-to-peer network
- The WebAX-Lib standard library
- The Comlink communication protocol

### 1.3 Terminology

- **WebAX**: Web Application Experience
- **WebAXP**: Web Application Experience Package
- **WebAXD**: Web Application Experience Distribution
- **WebAXDN**: Web Application Experience Distribution Network
- **WebAX-Lib**: The standard library for WebAX applications
- **Comlink**: The communication protocol for inter-application messaging

## 2. WebAXP (Web Application Experience Package)

### 2.1 Overview

A WebAXP is a self-contained application package that includes all the resources needed to run the application. It extends the PWA model with additional metadata and capabilities.

### 2.2 Package Structure

A WebAXP package has the following structure:

```
my-webax-app/
├── manifest.json       # Extended PWA manifest with WebAX metadata
├── index.html          # Application entry point
├── assets/             # Static assets (images, fonts, etc.)
├── js/                 # JavaScript files
├── css/                # CSS files
├── service-worker.js   # Service worker for offline functionality
└── webax.json          # WebAX-specific configuration
```

### 2.3 Manifest Extensions

WebAXP extends the standard PWA manifest with additional fields:

```json
{
  "name": "My WebAX App",
  "short_name": "MyApp",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4285f4",
  "icons": [...],
  
  "webax": {
    "version": "1.0.0",
    "publisher": "example.com",
    "package_id": "my-webax-app",
    "dependencies": {
      "webax-lib": "^1.0.0"
    },
    "permissions": [
      "storage",
      "network",
      "notifications"
    ],
    "distribution": {
      "webtorrent": "magnet:?xt=urn:btih:...",
      "archive": "https://example.com/my-webax-app.zip",
      "repo": "https://github.com/example/my-webax-app.git"
    }
  }
}
```

### 2.4 webax.json Configuration

The `webax.json` file provides additional configuration options:

```json
{
  "build": {
    "output_dir": "dist",
    "bundle": true,
    "minify": true
  },
  "development": {
    "server": {
      "port": 8080,
      "https": true
    }
  },
  "distribution": {
    "channels": ["stable", "beta", "dev"],
    "auto_update": true
  },
  "integration": {
    "comlink": {
      "expose": ["api.getData", "api.sendData"],
      "connect": ["storage-service", "auth-service"]
    }
  }
}
```

## 3. WebAXD (Web Application Experience Distribution)

### 3.1 Overview

WebAXD defines how WebAX packages are discovered, advertised, and installed.

### 3.2 Registry System

The primary discovery mechanism is a decentralized registry system:

1. **Publisher Registry**: Each publisher hosts a registry file at `/.well-known/webax-registry.json`
2. **Launcher Aggregation**: The WebAX Launcher aggregates registries from trusted publishers
3. **User Control**: Users can add or remove publishers from their trusted list

### 3.3 Registry Format

```json
{
  "publisher": "example.com",
  "updated": "2023-04-13T12:34:56Z",
  "packages": [
    {
      "package_id": "my-webax-app",
      "name": "My WebAX App",
      "description": "A sample WebAX application",
      "version": "1.0.0",
      "manifest_url": "https://example.com/my-webax-app/manifest.json",
      "icon_url": "https://example.com/my-webax-app/icon.png",
      "screenshots": [
        "https://example.com/my-webax-app/screenshot1.png"
      ],
      "categories": ["productivity", "tools"],
      "distribution": {
        "webtorrent": "magnet:?xt=urn:btih:...",
        "archive": "https://example.com/my-webax-app.zip",
        "repo": "https://github.com/example/my-webax-app.git"
      }
    }
  ]
}
```

### 3.4 webax:// Protocol

WebAXD defines the `webax://` protocol for direct installation links:

- **Format**: `webax://install/publisher/package_id`
- **Example**: `webax://install/example.com/my-webax-app`
- **Handling**: The WebAX Launcher registers as a protocol handler
- **Security**: Validates the publisher against the manifest

### 3.5 Installation Process

1. User discovers a WebAX app (via registry, link, or QR code)
2. Launcher fetches the manifest from the publisher
3. Launcher verifies the publisher (domain matches `webax.publisher`)
4. Launcher downloads the package (via WebTorrent, archive, or Git)
5. Launcher installs the package and registers it locally
6. (Optional) User opts to seed the package via WebTorrent

## 4. WebAXDN (Web Application Experience Distribution Network)

### 4.1 Overview

WebAXDN defines the peer-to-peer network for distributing WebAX packages.

### 4.2 Network Architecture

- **Protocol**: WebTorrent (BitTorrent over WebRTC)
- **Peers**: WebAX Launcher instances that opt to seed packages
- **Trackers**: Standard BitTorrent trackers or WebTorrent-specific trackers
- **DHT**: Distributed Hash Table for peer discovery (when supported)

### 4.3 Seeding Process

1. User installs a WebAX package
2. Launcher prompts to join the distribution network
3. If accepted, the package is seeded via WebTorrent
4. Launcher tracks seeding status (peers, bandwidth)
5. User can control seeding via the PWA Shares screen

## 5. WebAX-Lib (Standard Library)

### 5.1 Overview

WebAX-Lib is a standard library that provides common functionality for WebAX applications. It is hosted at webax.net and can be included in any WebAX application.

### 5.2 Library Structure

```
webax-lib/
├── core/             # Core functionality
│   ├── storage.js    # Enhanced storage APIs
│   ├── network.js    # Network utilities
│   └── utils.js      # General utilities
├── ui/               # UI components
│   ├── components/   # Reusable UI components
│   └── themes/       # Theming system
├── services/         # Common services
│   ├── auth.js       # Authentication
│   ├── sync.js       # Data synchronization
│   └── analytics.js  # Usage analytics
└── modules/          # Optional modules
    ├── cyber-eyes/   # Logging system
    ├── comlink/      # Inter-app communication
    └── webaxdn/      # P2P distribution
```

### 5.3 Importing WebAX-Lib

WebAX-Lib can be imported in several ways:

```javascript
// Import the entire library
import WebAX from 'https://lib.webax.net/webax-lib.js';

// Import specific modules
import { storage, network } from 'https://lib.webax.net/webax-lib.js';

// Import a specific component
import { CyberEyes } from 'https://lib.webax.net/modules/cyber-eyes.js';
```

### 5.4 Key Features

1. **Pure Functions**: Emphasis on pure, composable functions
2. **Tree-Shaking**: Only the used parts of the library are included in the bundle
3. **Versioning**: Strict semantic versioning for stability
4. **Documentation**: Comprehensive documentation and examples
5. **Testing**: Extensive test coverage for reliability

## 6. Comlink (Communication Protocol)

### 6.1 Overview

Comlink is a trust-based messaging system for communication between WebAX apps and services.

### 6.2 Communication Layers

Comlink operates across multiple layers:

1. **Intra-Browser**: Communication between WebAX apps in the same browser
2. **Inter-Process**: Communication between the browser and OS services
3. **Network**: Communication between devices over the network

### 6.3 Trust Levels

Comlink defines different trust levels:

1. **Owned Devices**: Full access between your own devices
2. **Trusted Apps**: Limited access between apps from trusted publishers
3. **Untrusted Apps**: Restricted access requiring explicit permission

### 6.4 Message Format

```json
{
  "from": "app://example.com/my-webax-app",
  "to": "app://example.com/another-app",
  "id": "msg-123456",
  "type": "request",
  "action": "getData",
  "data": {
    "query": "user-profile"
  },
  "timestamp": 1617979200000
}
```

### 6.5 Permission Model

Comlink implements a permission model for secure communication:

1. **Origin Verification**: Messages are verified against the sender's origin
2. **Permission Requests**: Apps must request permission to communicate with other apps
3. **User Consent**: Users must approve communication between untrusted apps

## 7. Security Considerations

### 7.1 Package Integrity

WebAX packages should be verified for integrity:

1. **Signature Verification**: Packages can be signed by the publisher
2. **Hash Verification**: Package contents can be verified against published hashes
3. **Publisher Verification**: The publisher domain is verified against the manifest

### 7.2 Permission Model

WebAX implements a permission model for secure access to device features:

1. **Explicit Permissions**: Apps must declare required permissions in the manifest
2. **User Consent**: Users must approve permission requests
3. **Revocation**: Users can revoke permissions at any time

### 7.3 Communication Security

Comlink ensures secure communication between apps:

1. **Origin Verification**: Messages are verified against the sender's origin
2. **Permission Model**: Apps must request permission to communicate
3. **User Consent**: Users must approve communication between untrusted apps

## 8. Implementation Guidelines

### 8.1 WebAX Application Structure

WebAX applications should follow this recommended structure:

```
my-webax-app/
├── app/              # Interactive demo application
├── cicd/             # CI/CD configuration
├── develop/          # Development files
│   ├── src/          # Source code
│   ├── tests/        # Test files
│   └── examples/     # Example implementations
├── dist/             # Distribution files
└── docs/             # Documentation
```

### 8.2 Development Workflow

1. Create a new project using the WebAX CLI:
   ```bash
   webax create my-webax-app
   ```

2. Configure the project in `webax.json`

3. Develop the application in the `develop/src` directory

4. Build the application:
   ```bash
   webax build
   ```

5. Test the application:
   ```bash
   webax test
   ```

6. Create a WebAXP package:
   ```bash
   webax package
   ```

7. Publish the package:
   ```bash
   webax publish
   ```

### 8.3 Best Practices

1. **Offline First**: Design applications to work without an internet connection
2. **Performance**: Optimize for limited hardware environments
3. **Security**: Follow security best practices for web applications
4. **Accessibility**: Ensure applications are accessible to all users
5. **Testing**: Write comprehensive tests for all functionality

## 9. Future Considerations

### 9.1 WebAX CLI

A command-line interface for creating, building, testing, and publishing WebAX applications.

### 9.2 WebAX DevTools

Browser extensions and developer tools for debugging and profiling WebAX applications.

### 9.3 WebAX Store

A centralized store for discovering and installing WebAX applications.

### 9.4 WebAX Runtime

A dedicated runtime for running WebAX applications outside of a browser.

## 10. References

1. [Progressive Web Apps](https://web.dev/progressive-web-apps/)
2. [Web Components](https://www.webcomponents.org/)
3. [WebTorrent](https://webtorrent.io/)
4. [WebRTC](https://webrtc.org/)
5. [Service Workers](https://developers.google.com/web/fundamentals/primers/service-workers)

## Appendix A: WebAX Manifest Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "WebAX Manifest",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "short_name": { "type": "string" },
    "start_url": { "type": "string" },
    "display": { "type": "string" },
    "background_color": { "type": "string" },
    "theme_color": { "type": "string" },
    "icons": { "type": "array" },
    "webax": {
      "type": "object",
      "properties": {
        "version": { "type": "string" },
        "publisher": { "type": "string" },
        "package_id": { "type": "string" },
        "dependencies": { "type": "object" },
        "permissions": { "type": "array" },
        "distribution": { "type": "object" }
      },
      "required": ["version", "publisher", "package_id"]
    }
  },
  "required": ["name", "start_url", "webax"]
}
```

## Appendix B: WebAX Registry Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "WebAX Registry",
  "type": "object",
  "properties": {
    "publisher": { "type": "string" },
    "updated": { "type": "string", "format": "date-time" },
    "packages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "package_id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "version": { "type": "string" },
          "manifest_url": { "type": "string", "format": "uri" },
          "icon_url": { "type": "string", "format": "uri" },
          "screenshots": { "type": "array" },
          "categories": { "type": "array" },
          "distribution": { "type": "object" }
        },
        "required": ["package_id", "name", "version", "manifest_url"]
      }
    }
  },
  "required": ["publisher", "updated", "packages"]
}
```
