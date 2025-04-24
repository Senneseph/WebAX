# Relationship Between Web Framework and UI Component Library

This document explains the relationship between a WebAX-compliant web framework and UI component library, how they work together, and their respective responsibilities.

## Overview

The web framework and UI component library are complementary parts of the WebAX ecosystem:

- The **web framework** handles routing, state management, and API integration
- The **UI component library** provides the visual building blocks

Together, they form a complete solution for building web applications, with a clean separation of concerns between the framework and UI components.

## Division of Responsibilities

```ascii
+---------------------------------------------------------------+
|                        Application                            |
+---------------------------------------------------------------+
|                       Web Framework                           |
|                                                               |
|  +----------------+  +----------------+  +----------------+   |
|  | Router         |  | State Manager  |  | Event Bus     |   |
|  +----------------+  +----------------+  +----------------+   |
|                                                               |
|  +----------------+  +----------------+  +----------------+   |
|  | UI-API Mapper  |  | API Client     |  | Engine        |   |
|  +----------------+  +----------------+  +----------------+   |
|                                                               |
+---------------------------------------------------------------+
|                     UI Component Library                      |
|                                                               |
|  +----------------+  +----------------+  +----------------+   |
|  | Data Display   |  | Form           |  | Navigation    |   |
|  | Components     |  | Components     |  | Components    |   |
|  +----------------+  +----------------+  +----------------+   |
|                                                               |
|  +----------------+  +----------------+  +----------------+   |
|  | Feedback       |  | Action         |  | Layout        |   |
|  | Components     |  | Components     |  | Components    |   |
|  +----------------+  +----------------+  +----------------+   |
|                                                               |
+---------------------------------------------------------------+
```

### Web Framework Responsibilities

The web framework is responsible for:

1. **Routing**: Handling navigation between views
2. **State Management**: Managing application state
3. **API Integration**: Communicating with APIs
4. **UI-to-API Mapping**: Mapping API endpoints to UI components
5. **Event Handling**: Managing the event bus for component communication

### UI Component Library Responsibilities

The UI component library is responsible for:

1. **UI Components**: Providing the visual building blocks
2. **Component Rendering**: Rendering components to the DOM
3. **Event Publishing**: Publishing events when user interactions occur
4. **Data Binding**: Binding data to components
5. **Accessibility**: Ensuring components are accessible

## How They Work Together

The web framework and UI component library work together through a well-defined interface:

1. **Component Registration**: UI components are registered with the web framework engine
2. **Event Bus**: UI components publish events to the web framework event bus
3. **State Binding**: The web framework binds state to UI components
4. **Rendering**: The web framework uses UI components to render the UI

### Example Flow

1. User clicks a button in a UI component
2. The UI component publishes a `ui:click` event to the event bus
3. The web framework handles the event, updating the application state
4. The web framework notifies subscribers of the state change
5. UI components that subscribe to the state are updated
6. The UI is re-rendered to reflect the new state

## Integration Points

### Component Registration

UI components are registered with the web framework engine:

```typescript
// Initialize the web framework engine with UI components
const engine = new WebFramework.Engine({
  spec: uiApiSpec,
  container: document.getElementById('app'),
  components: {
    'data-table': UIComponents.DataTable,
    'button': UIComponents.Button,
    'form': UIComponents.Form,
    'text-field': UIComponents.TextField
  }
});
```

### Event Bus Integration

UI components publish events to the web framework event bus:

```typescript
// UI component
class Button extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const element = document.createElement('button');
    
    element.addEventListener('click', () => {
      // Publish event to the event bus
      this.eventBus.publish('ui:click', {
        componentId: this.props.id,
        event
      });
    });
    
    return element;
  }
}
```

### State Binding

The web framework binds state to UI components:

```typescript
// UI-API mapping
{
  "type": "DataTable",
  "id": "pet-table",
  "props": {
    "columns": [
      { "field": "id", "header": "ID" },
      { "field": "name", "header": "Name" },
      { "field": "status", "header": "Status" }
    ]
  },
  "bindings": {
    "data": "pets"
  }
}
```

### Rendering

The web framework uses UI components to render the UI:

```typescript
// Web framework engine
class Engine {
  // ...
  
  renderView(viewId) {
    const view = this.views.get(viewId);
    
    if (!view) return;
    
    // Clear the container
    this.container.innerHTML = '';
    
    // Render each component in the view
    for (const componentSpec of view.components) {
      const ComponentClass = this.components[componentSpec.type];
      
      if (!ComponentClass) {
        console.error(`Component type "${componentSpec.type}" not found`);
        continue;
      }
      
      // Create the component
      const component = new ComponentClass({
        id: componentSpec.id,
        ...componentSpec.props,
        eventBus: this.eventBus
      });
      
      // Render the component
      const element = component.render();
      
      // Add the component to the container
      this.container.appendChild(element);
      
      // Store the component for later reference
      this.renderedComponents.set(componentSpec.id, component);
    }
  }
  
  // ...
}
```

## TSX Approach

The WebAX ecosystem recommends using TSX as the templating system for creating UI components:

```tsx
// UI component
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick
}) => (
  <button
    className={`ui-button ui-button-${variant}`}
    onClick={onClick}
  >
    {children}
  </button>
);

// Web framework view
const ListView = () => {
  const { state, dispatch } = useFramework();
  
  return (
    <div>
      <h1>List</h1>
      
      <DataTable
        columns={[
          { field: 'id', header: 'ID' },
          { field: 'name', header: 'Name' },
          { field: 'status', header: 'Status' }
        ]}
        data={state.items}
        onRowClick={(item) => dispatch({ type: 'SELECT_ITEM', item })}
      />
      
      <Button
        variant="primary"
        onClick={() => dispatch({ type: 'NAVIGATE', path: '/items/new' })}
      >
        Add Item
      </Button>
    </div>
  );
};
```

## Package Dependencies

The web framework may depend on the UI component library, but the UI component library should not depend on the web framework. This ensures that UI components can be used independently of the web framework.

```json
// Web framework package.json
{
  "name": "@net.webax/web-framework",
  "dependencies": {
    "@net.webax/ui-components": "^0.1.0"
  }
}

// UI component library package.json
{
  "name": "@net.webax/ui-components",
  "dependencies": {
    // No dependency on web framework
  }
}
```

## Use Cases

### Using Web Framework and UI Component Library Together

The most common use case is to use the web framework and UI component library together to build a complete web application:

```typescript
import { Engine } from '@net.webax/web-framework';
import { DataTable, Button, Form } from '@net.webax/ui-components';

// Initialize the engine with UI components
const engine = new Engine({
  spec: uiApiSpec,
  container: document.getElementById('app'),
  components: {
    'data-table': DataTable,
    'button': Button,
    'form': Form
  }
});

// Start the engine
engine.start();
```

### Using UI Component Library Independently

UI components can be used independently of the web framework:

```typescript
import { DataTable, Button } from '@net.webax/ui-components';

// Create a data table
const dataTable = new DataTable({
  id: 'item-table',
  columns: [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Name' },
    { field: 'status', header: 'Status' }
  ],
  data: [
    { id: 1, name: 'Item 1', status: 'active' },
    { id: 2, name: 'Item 2', status: 'inactive' }
  ]
});

// Render the data table
document.getElementById('app').appendChild(dataTable.render());
```

### Using Web Framework With Custom Components

The web framework can be used with custom components instead of the standard UI component library:

```typescript
import { Engine } from '@net.webax/web-framework';
import { MyDataTable, MyButton, MyForm } from './my-components';

// Initialize the engine with custom components
const engine = new Engine({
  spec: uiApiSpec,
  container: document.getElementById('app'),
  components: {
    'data-table': MyDataTable,
    'button': MyButton,
    'form': MyForm
  }
});

// Start the engine
engine.start();
```

## Best Practices

When working with the web framework and UI component library:

1. **Use the Web Framework for Framework Concerns**: Use the web framework for routing, state management, and API integration
2. **Use the UI Component Library for UI Concerns**: Use the UI component library for UI components and rendering
3. **Keep Components Dumb**: UI components should be "dumb" and not contain business logic
4. **Use the Event Bus**: Use the event bus for communication between components
5. **Follow the UI-to-API Mapping**: Use the UI-to-API mapping to connect components to APIs
6. **Use TSX for Components**: Use TSX for defining UI components
7. **Document Component Interfaces**: Document the props and events for each component
