# WebAX Interaction Flow

## 1. Overview

This document describes the interaction flow between jcule and jellicule components in a WebAX application. It outlines how API specifications are transformed into UI components, how user interactions are processed, and how state changes are propagated back to the UI.

## 2. Interaction Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  OpenAPI Spec   │     │  OpenAPI-UxA    │     │  UIxAAS         │
│  (API Definition)│ ──> │  (Adapter)      │ ──> │  Representation │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  jellicule      │ <── │  muther-brane   │ <── │  Custom State   │
│  Components     │     │  (Orchestrator) │     │  Store          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                       │
        │                        │                       │
        ▼                        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  DOM Events     │ ──> │  insystema-vega │ ──> │  API Library    │
│  (User Actions) │     │  (Event Bus)    │     │  (HTTP Requests) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  BL Library     │
                        │  (Business Logic)│
                        └─────────────────┘
```

## 3. Detailed Flow Description

1. The `OpenAPI-UxA` parses the `OpenAPI Spec` and generates the `UIxAAS Representation`.
2. `muther-brane` consumes this representation.
3. `muther-brane` uses the `API Library` to fetch initial data from the `External API`, updating the `Custom State Store`.
4. Based on the state and the UIxAAS representation, `muther-brane` selects, instantiates, and renders `jellicule` components into the `PWA` UI, setting their properties.
5. User interaction with `jellicule` components triggers DOM events, which `muther-brane` listens for.
6. `muther-brane` translates DOM events into internal `insystema-vega` events or directly processes them.
7. Processing may involve calling `BL Library` functions or triggering `API Library` calls (based on `ActionDefinitions` in the UIxAAS output).
8. API responses lead to updates in the `Custom State Store` via `muther-brane`.
9. State changes notify `muther-brane`, which updates the properties of affected `jellicule` components, causing the UI to reactively re-render.

## 4. Component Interactions

### 4.1. API to UI Transformation

The transformation from API specification to UI components involves several steps:

1. **API Parsing**: The OpenAPI-UxA parses the OpenAPI specification to extract resources, operations, schemas, and security definitions.
2. **UIxAAS Generation**: The adapter generates a standardized UIxAAS representation that includes resources, views, fields, and actions.
3. **Component Selection**: muther-brane selects appropriate jellicule components based on the UIxAAS representation.
4. **Component Instantiation**: muther-brane instantiates the selected components and sets their properties based on the current state.
5. **Component Rendering**: The components render themselves based on their properties.

### 4.2. User Interaction Handling

User interactions with jellicule components are handled through a series of steps:

1. **Event Emission**: jellicule components emit DOM events for user interactions.
2. **Event Listening**: muther-brane listens for these events.
3. **Event Processing**: muther-brane processes the events, which may involve:
   - Updating the state directly
   - Calling business logic functions
   - Making API requests
   - Publishing events to insystema-vega
4. **State Update**: The state is updated based on the event processing.
5. **Component Update**: muther-brane updates the properties of affected components based on the new state.
6. **Component Re-rendering**: The components re-render themselves based on the updated properties.

### 4.3. State Synchronization

State synchronization across multiple tabs involves:

1. **State Change**: A state change occurs in one tab.
2. **State Broadcast**: The state change is broadcast to other tabs via comlink.
3. **State Reception**: Other tabs receive the state change.
4. **State Update**: The state is updated in all tabs.
5. **Component Update**: muther-brane updates the properties of affected components in all tabs.
6. **Component Re-rendering**: The components re-render themselves in all tabs.

## 5. Example Flow

Here's an example flow for a simple product listing application:

1. The OpenAPI-UxA parses the OpenAPI specification, which includes a `/products` endpoint.
2. The adapter generates a UIxAAS representation with a `Product` resource, a `listView`, and a `listProducts` action.
3. muther-brane consumes this representation and uses the API Library to fetch the initial product list.
4. The product list is stored in the Custom State Store.
5. muther-brane selects and instantiates a `jel-product-grid` component, setting its `products` property to the product list from the state.
6. The `jel-product-grid` component renders itself, displaying the product list.
7. A user clicks the "Add to Cart" button on a product card, triggering a `jel-add-to-cart` DOM event.
8. muther-brane listens for this event and processes it, calling the BL Library to validate the action and the API Library to add the product to the cart.
9. The API response is used to update the cart state in the Custom State Store.
10. The state change notifies muther-brane, which updates the `cart` property of the `jel-cart` component.
11. The `jel-cart` component re-renders itself, displaying the updated cart.

## 6. Multi-Tab Synchronization

In a multi-tab scenario, the flow would include:

1. A user adds a product to the cart in Tab A.
2. The cart state is updated in Tab A.
3. The state change is broadcast to Tab B via comlink.
4. Tab B receives the state change and updates its cart state.
5. muther-brane in Tab B updates the `cart` property of the `jel-cart` component.
6. The `jel-cart` component in Tab B re-renders itself, displaying the updated cart.

## 7. Conclusion

The WebAX interaction flow provides a clear separation of concerns between API specifications, business logic, and UI components. By using a standardized UIxAAS representation and a centralized muther-brane orchestrator, WebAX enables a declarative approach to building web applications from API specifications.

The flow ensures that UI components remain "dumb" and focused only on rendering and user interaction, while the business logic and state management are handled by the muther-brane orchestrator. This separation of concerns allows for a clean architecture that can adapt to different API types and UI frameworks.
