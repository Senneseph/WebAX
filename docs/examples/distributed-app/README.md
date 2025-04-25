# WebAXP Distributed Application Example

This example demonstrates how to build and distribute a WebAXP application using WebAXD and WebAXPDN. The application is a simple todo list that can be distributed and accessed through the WebAXP Distribution Network.

## Overview

This example showcases:

1. Building a WebAXP application
2. Distributing the application through WebAXPDN
3. Accessing the distributed application
4. Updating the application
5. Offline support

## Project Structure

```
distributed-app/
├── app/                      # Source code
│   ├── src/                  # Source code
│   │   ├── index.ts          # Main entry point
│   │   ├── components/       # UI components
│   │   ├── state/            # State management
│   │   ├── api/              # API integration
│   │   └── utils/            # Utility functions
│   ├── environment/          # Environment configuration
│   ├── tests/                # Test files
│   └── assets/               # Static assets
├── cicda/                    # CI/CD configuration
│   ├── build/                # Build configuration
│   ├── environment/          # Environment configuration for CI/CD
│   └── tests/                # Test runners and configuration
├── develop/                  # Developer tools
│   └── environment/          # Environment configuration for development
├── dist/                     # Distribution files (generated)
├── docs/                     # Documentation
├── webaxp.config.js          # WebAXP configuration
├── package.json              # Package configuration
└── README.md                 # Project overview
```

## WebAXP Configuration

The application is configured to use WebAXPDN for distribution:

```javascript
// webaxp.config.js
module.exports = {
  // WebAXP configuration
  webaxp: {
    // Application configuration
    app: {
      name: 'Todo App',
      version: '1.0.0',
      description: 'A simple todo list application',
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourceMaps: true,
      minify: true,
    },
  },
  
  // WebAXPDN configuration
  webaxpdn: {
    // Enable WebAXPDN
    enabled: true,
    
    // Distribution options
    distribution: {
      // Automatically distribute on build
      autoDist: true,
      
      // Distribution model
      model: 'p2p',
    },
    
    // Network options
    network: {
      // Signaling server
      signaling: 'wss://signaling.webax.net',
      
      // Maximum number of peers
      maxPeers: 10,
    },
    
    // Security options
    security: {
      // Enable encryption
      encrypt: true,
      
      // Access control
      access: 'public',
    },
  },
};
```

## Application Code

The application is a simple todo list:

```typescript
// src/index.ts
import { initializeBusinessLogic, JculeProvider, AppRouter } from '@net.webax/jcule';
import { TodoList } from './components/TodoList';
import { TodoForm } from './components/TodoForm';
import { DefaultLayout } from './components/DefaultLayout';

// Create Business Logic Controller
const businessLogic = initializeBusinessLogic({
  // API configuration
  api: {
    baseUrl: '',
    spec: '',
  },
  
  // Route configuration
  routes: [
    {
      path: '/',
      layout: 'default',
      components: {
        todoList: {
          dataBinding: {
            todos: 'todos',
          },
          eventBinding: {
            onToggle: (id) => ({
              type: 'TOGGLE_TODO',
              payload: { id },
            }),
            onDelete: (id) => ({
              type: 'DELETE_TODO',
              payload: { id },
            }),
          },
        },
        todoForm: {
          eventBinding: {
            onAdd: (text) => ({
              type: 'ADD_TODO',
              payload: { text },
            }),
          },
        },
      },
    },
  ],
  
  // State configuration
  state: {
    initialState: {
      todos: [],
    },
    persistence: {
      enabled: true,
      storage: 'local-storage',
      key: 'todo-app-state',
    },
  },
});

// Component registry
const components = {
  todoList: TodoList,
  todoForm: TodoForm,
};

// Layout registry
const layouts = {
  default: DefaultLayout,
};

// Render the application
const root = document.getElementById('root');
if (root) {
  root.innerHTML = `
    <div id="app"></div>
  `;
  
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div class="app-container">
        <jcule-provider>
          <app-router></app-router>
        </jcule-provider>
      </div>
    `;
    
    // Initialize the JculeProvider
    const jculeProvider = document.querySelector('jcule-provider');
    if (jculeProvider) {
      jculeProvider.setAttribute('business-logic', JSON.stringify(businessLogic));
      jculeProvider.setAttribute('components', JSON.stringify(components));
      jculeProvider.setAttribute('layouts', JSON.stringify(layouts));
    }
  }
}
```

## Building and Distributing the Application

To build and distribute the application:

```bash
# Install dependencies
npm install

# Build and distribute the application
npm run build
```

This will:

1. Build the application to the /dist folder
2. Package the contents of the /dist folder for distribution
3. Distribute the package through the WebAXPDN network
4. Return a distribution ID that can be used to access the application

## Accessing the Distributed Application

The distributed application can be accessed using the WebAXPDN URL:

```
webaxpdn://distribution-id
```

Or through the WebAXPDN gateway:

```
https://gateway.webax.net/webaxpdn/distribution-id
```

## Embedding the Distributed Application

The distributed application can be embedded in another web page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Embedded Todo App</title>
  <script src="https://cdn.webax.net/webaxpdn-loader.js"></script>
</head>
<body>
  <h1>Embedded Todo App</h1>
  
  <div id="app-container"></div>
  
  <script>
    // Load the distributed application
    WebAXPDN.loadApp('webaxpdn://distribution-id', {
      container: '#app-container',
      offline: true,
    });
  </script>
</body>
</html>
```

## Updating the Application

To update the application:

1. Make changes to the application code
2. Build and distribute the application again
3. The distribution ID will remain the same, but the content will be updated
4. Users will automatically receive the updated application

## Offline Support

The application includes offline support:

```javascript
// Cache the application for offline use
WebAXPDN.cacheApp('webaxpdn://distribution-id');

// Check if the application is cached
const isCached = await WebAXPDN.isAppCached('webaxpdn://distribution-id');

// Load the application (will use the cached version if offline)
const app = await WebAXPDN.loadApp('webaxpdn://distribution-id');
```

## Advanced Features

### Custom Distribution Options

```javascript
// Distribute with custom options
const distributionId = await WebAXPDN.distribute('./dist', {
  // Distribution model
  model: 'distributed',
  
  // Content options
  content: {
    // Content name
    name: 'Todo App',
    
    // Content version
    version: '1.0.0',
    
    // Content description
    description: 'A simple todo list application',
  },
  
  // Security options
  security: {
    // Enable encryption
    encrypt: true,
    
    // Access control
    access: 'restricted',
    
    // Access control list
    acl: [
      'user1@example.com',
      'user2@example.com',
    ],
  },
});
```

### Peer-to-Peer Communication

```javascript
// Connect to another user
const connection = await WebAXPDN.connect('user-id');

// Send a message
connection.send({
  type: 'chat-message',
  content: 'Hello, world!',
});

// Receive messages
connection.on('message', (message) => {
  console.log('Received:', message);
});
```

### Content Sharing

```javascript
// Share content with another user
await WebAXPDN.shareContent('webaxpdn://content-id', 'user-id');

// Receive shared content
WebAXPDN.on('content-shared', (content) => {
  console.log('Received shared content:', content);
});
```

## Conclusion

This example demonstrates how to build and distribute a WebAXP application using WebAXD and WebAXPDN. The application can be distributed through the WebAXP Distribution Network, accessed offline, and updated seamlessly.

By leveraging the WebAX distribution system, developers can create applications that are more resilient, efficient, and user-centric, reducing reliance on centralized infrastructure while improving performance and user experience.
