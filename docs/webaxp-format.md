# WebAXP Format

## Overview

WebAXP (Web Application Experience Package) is the packaging format for WebAX applications. It extends the Progressive Web App (PWA) model with additional metadata and capabilities to enable better distribution, offline functionality, and inter-application communication.

## Package Structure

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

## Manifest Extensions

WebAXP extends the standard PWA manifest with additional fields in a `webax` object:

```json
{
  "name": "My WebAX App",
  "short_name": "MyApp",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4285f4",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  
  "webax": {
    "version": "1.0.0",
    "publisher": "example.com",
    "package_id": "my-webax-app",
    "dependencies": {
      "webax-lib": "^1.0.0",
      "another-webax-lib": "^2.0.0"
    },
    "permissions": [
      "storage",
      "network",
      "notifications",
      "camera",
      "microphone",
      "geolocation"
    ],
    "distribution": {
      "webtorrent": "magnet:?xt=urn:btih:...",
      "archive": "https://example.com/my-webax-app.zip",
      "repo": "https://github.com/example/my-webax-app.git"
    },
    "comlink": {
      "expose": [
        "api.getData",
        "api.sendData"
      ],
      "connect": [
        "storage-service",
        "auth-service"
      ]
    },
    "updates": {
      "auto": true,
      "check_interval": 86400,
      "channels": ["stable", "beta", "dev"]
    }
  }
}
```

### WebAX Manifest Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | String | The version of the WebAX package (semver) |
| `publisher` | String | The domain of the publisher (must match the origin) |
| `package_id` | String | A unique identifier for the package |
| `dependencies` | Object | Dependencies on other WebAX packages or libraries |
| `permissions` | Array | Permissions required by the application |
| `distribution` | Object | Distribution methods for the package |
| `comlink` | Object | Comlink communication configuration |
| `updates` | Object | Update configuration for the package |

### Dependencies

The `dependencies` object specifies other WebAX packages or libraries that this package depends on. The keys are package IDs, and the values are semver version ranges.

```json
"dependencies": {
  "webax-lib": "^1.0.0",
  "another-webax-lib": "^2.0.0"
}
```

### Permissions

The `permissions` array specifies the permissions required by the application. These permissions must be granted by the user before the application can access the corresponding features.

```json
"permissions": [
  "storage",
  "network",
  "notifications",
  "camera",
  "microphone",
  "geolocation"
]
```

### Distribution

The `distribution` object specifies the methods by which the package can be distributed. This includes WebTorrent magnet links, direct download URLs, and Git repository URLs.

```json
"distribution": {
  "webtorrent": "magnet:?xt=urn:btih:...",
  "archive": "https://example.com/my-webax-app.zip",
  "repo": "https://github.com/example/my-webax-app.git"
}
```

### Comlink

The `comlink` object specifies the Comlink communication configuration for the application. This includes the APIs that the application exposes to other applications and the services that the application connects to.

```json
"comlink": {
  "expose": [
    "api.getData",
    "api.sendData"
  ],
  "connect": [
    "storage-service",
    "auth-service"
  ]
}
```

### Updates

The `updates` object specifies the update configuration for the package. This includes whether updates are automatic, how often to check for updates, and which update channels to use.

```json
"updates": {
  "auto": true,
  "check_interval": 86400,
  "channels": ["stable", "beta", "dev"]
}
```

## webax.json Configuration

The `webax.json` file provides additional configuration options for the WebAX package. This file is used during development and is not included in the final package.

```json
{
  "build": {
    "output_dir": "dist",
    "bundle": true,
    "minify": true,
    "sourcemaps": true,
    "targets": {
      "browsers": ["last 2 versions", "not dead"]
    }
  },
  "development": {
    "server": {
      "port": 8080,
      "https": true,
      "proxy": {
        "/api": "https://api.example.com"
      }
    },
    "hot_reload": true,
    "debug": true
  },
  "distribution": {
    "channels": ["stable", "beta", "dev"],
    "auto_update": true,
    "webtorrent": true,
    "archive": true,
    "repo": true
  },
  "integration": {
    "comlink": {
      "expose": ["api.getData", "api.sendData"],
      "connect": ["storage-service", "auth-service"]
    }
  },
  "testing": {
    "framework": "jest",
    "coverage": true,
    "e2e": "cypress"
  }
}
```

### Build Configuration

The `build` object specifies the build configuration for the WebAX package. This includes the output directory, whether to bundle and minify the code, whether to generate sourcemaps, and the browser targets.

```json
"build": {
  "output_dir": "dist",
  "bundle": true,
  "minify": true,
  "sourcemaps": true,
  "targets": {
    "browsers": ["last 2 versions", "not dead"]
  }
}
```

### Development Configuration

The `development` object specifies the development configuration for the WebAX package. This includes the development server configuration, whether to enable hot reloading, and whether to enable debug mode.

```json
"development": {
  "server": {
    "port": 8080,
    "https": true,
    "proxy": {
      "/api": "https://api.example.com"
    }
  },
  "hot_reload": true,
  "debug": true
}
```

### Distribution Configuration

The `distribution` object specifies the distribution configuration for the WebAX package. This includes the update channels, whether to enable automatic updates, and which distribution methods to use.

```json
"distribution": {
  "channels": ["stable", "beta", "dev"],
  "auto_update": true,
  "webtorrent": true,
  "archive": true,
  "repo": true
}
```

### Integration Configuration

The `integration` object specifies the integration configuration for the WebAX package. This includes the Comlink communication configuration.

```json
"integration": {
  "comlink": {
    "expose": ["api.getData", "api.sendData"],
    "connect": ["storage-service", "auth-service"]
  }
}
```

### Testing Configuration

The `testing` object specifies the testing configuration for the WebAX package. This includes the testing framework, whether to enable code coverage, and the end-to-end testing framework.

```json
"testing": {
  "framework": "jest",
  "coverage": true,
  "e2e": "cypress"
}
```

## Service Worker

WebAXP requires a service worker for offline functionality. The service worker should be registered in the application's entry point:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service worker registered:', registration.scope);
      })
      .catch(error => {
        console.error('Service worker registration failed:', error);
      });
  });
}
```

The service worker should implement the following features:

- Caching of application assets
- Offline functionality
- Background synchronization
- Push notifications

## WebAX-Lib Integration

WebAXP packages can integrate with WebAX-Lib, the standard library for WebAX applications. WebAX-Lib provides common functionality for WebAX applications, including storage, networking, UI components, and services.

```javascript
// Import the entire library
import WebAX from 'https://lib.webax.net/webax-lib.js';

// Import specific modules
import { storage, network } from 'https://lib.webax.net/webax-lib.js';

// Import a specific component
import { CyberEyes } from 'https://lib.webax.net/modules/cyber-eyes.js';
```

## Comlink Integration

WebAXP packages can integrate with Comlink, the communication protocol for inter-application messaging. Comlink enables WebAX applications to communicate with each other and with system services.

```javascript
// Import Comlink
import { Comlink } from 'https://lib.webax.net/modules/comlink.js';

// Create a Comlink instance
const comlink = new Comlink({
  appId: 'app://example.com/my-webax-app'
});

// Send a message to another app
comlink.send('app://example.com/another-app', {
  action: 'getData',
  query: 'user-profile'
});

// Subscribe to messages from another app
comlink.subscribe('app://example.com/another-app', (data) => {
  console.log('Received data:', data);
});
```

## Package Validation

WebAXP packages can be validated using the WebAX CLI:

```bash
webax validate my-webax-app
```

The validation process checks:

1. The presence and correctness of the manifest.json file
2. The presence and correctness of the webax.json file
3. The presence of required files (index.html, service-worker.js)
4. The validity of the dependencies
5. The validity of the permissions
6. The validity of the distribution methods
7. The validity of the Comlink configuration

## Package Creation

WebAXP packages can be created using the WebAX CLI:

```bash
webax create my-webax-app
```

This creates a new WebAXP package with the following structure:

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

## Package Building

WebAXP packages can be built using the WebAX CLI:

```bash
webax build my-webax-app
```

This builds the WebAXP package and creates the distribution files in the `dist` directory.

## Package Publishing

WebAXP packages can be published using the WebAX CLI:

```bash
webax publish my-webax-app
```

This publishes the WebAXP package to the specified distribution methods (WebTorrent, archive, repo) and updates the publisher's registry.
