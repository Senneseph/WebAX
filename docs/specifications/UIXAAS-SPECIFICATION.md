# UIxAAS: User Interface API Adapter Specification

## 1. Overview

The User Interface API Adapter Specification (UIxAAS) defines the standard structure and semantics of the intermediate "Adapted API Representation" used in WebAX applications. This specification ensures consistency regardless of the source API type (OpenAPI, GraphQL, etc.) and provides a standardized format for UI generation.

UIxAAS is a core component of the WebAX architecture, bridging the gap between API specifications and UI components. It enables the declarative mapping of API endpoints to UI components, making it possible to generate interactive user interfaces directly from API specifications.

## 2. Key Components

### 2.1 UIxAAS (User Interface API Adapter Specification)

Defines the standard structure and semantics of the intermediate "Adapted API Representation". This specification ensures consistency regardless of the source API type and provides a standardized format for UI generation.

### 2.2 UxA (User Interface Adapter)

An implementation within `jcule` that conforms to UIxAAS. It consumes a specific API definition format (e.g., OpenAPI) and produces the Adapted API Representation.

#### 2.2.1 OpenAPI-UxA (Initial Implementation)

Parses an OpenAPI v3.x document, identifies resources/entities, derives potential UI views (list, detail, create, edit), normalizes schema properties into fields, extracts actions (API operations), and handles security definitions, outputting the result in the UIxAAS format.

## 3. Architecture

The UIxAAS architecture consists of several key components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  API Definition │     │  UxA Adapter    │     │  UIxAAS Output  │
│  (OpenAPI, etc) │ ──> │  (OpenAPI-UxA)  │ ──> │  (Standardized) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  UI Components  │ <── │  BLC (jcule)    │ <── │  UI-API Mapping │
│  (jellicule)    │     │  (muther-brane) │     │  (Declarative)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **API Definition**: The source API specification (OpenAPI, GraphQL, etc.)
2. **UxA Adapter**: Transforms the API definition into the standardized UIxAAS format
3. **UIxAAS Output**: The standardized representation of the API for UI generation
4. **UI-API Mapping**: Declarative mapping of API endpoints to UI components
5. **BLC (jcule)**: The Business Logic Controller that orchestrates UI generation
6. **UI Components**: The jellicule components that render the UI

## 4. UIxAAS Structure Definition (v0.1)

This defines the target output format produced by a UxA (like `OpenAPI-UxA`) and consumed by `muther-brane`.

```typescript
/**
 * Top-level structure for the UIxAAS Adapted API Representation.
 */
interface UIxAAS_Output {
  /** Version of the UIxAAS specification this output conforms to. */
  uiAASVersion: string; // e.g., "0.1.0"
  /** Information about the original source API specification. */
  sourceSpec: {
    type: 'OpenAPI'; // Could support others like GraphQL in the future
    version: string; // e.g., '3.0.3'
    url?: string;    // Optional URL of the source document
  };
  /** Global information about the API itself. */
  globalInfo: {
    title: string;
    description?: string;
    apiVersion: string; // Version of the API described
    baseUrl?: string; // Base URL for API calls (if determinable)
  };
  /**
   * Core resources/entities derived from the API.
   * Keyed by a unique resource name (e.g., "Pet", "User").
   */
  resources: {
    [resourceName: string]: ResourceDefinition;
  };
  /**
   * Optional: A central place for adapted/normalized schema definitions
   * referenced elsewhere (e.g., in fields, actions). Keyed by schema name.
   */
  schemas?: {
    [schemaName: string]: AdaptedSchema;
  };
}

/**
 * Defines a primary resource or entity within the API.
 */
interface ResourceDefinition {
  name: string; // The unique name/key for this resource (e.g., "Pet")
  label: string; // Human-readable label (e.g., "Pet", "User Account")
  description?: string;
  /** Name of the field typically used as the primary identifier (e.g., "id"). */
  identifierField?: string;
  /** Different UI views associated with this resource. */
  views: {
    [viewType in ViewType]?: ViewDefinition; // e.g., { "listView": {...}, "detailView": {...} }
  };
  /** Actions that can be performed related to this resource. */
  actions: {
    [actionName: string]: ActionDefinition; // e.g., { "listPets": {...}, "createPet": {...} }
  };
}

/** Standard view types, extensible with custom strings. */
type ViewType = 'listView' | 'detailView' | 'createForm' | 'editForm' | string;

/**
 * Defines a specific UI view for a resource.
 */
interface ViewDefinition {
  type: ViewType;
  label: string; // e.g., "Available Pets", "Create New Pet"
  description?: string;
  /** Fields to be displayed or interacted with in this view. */
  fields: FieldDefinition[];
  /** Optional: Name of the key action associated with this view (e.g., 'listPets' for listView). */
  primaryAction?: string; // References key in ResourceDefinition.actions
  // Future: Could add layout hints, default sorting/filtering for lists
}

/**
 * Defines a single field within a view.
 */
interface FieldDefinition {
  name: string; // Original property name (e.g., "petName")
  label: string; // Human-readable label (e.g., "Pet Name")
  description?: string;
  /** Normalized data type suitable for UI mapping. */
  dataType: AdaptedDataType;
  isRequired: boolean;
  isReadOnly: boolean; // If true, typically display-only in forms
  defaultValue?: any;
  placeholder?: string; // Hint text for inputs
  /** Validation rules derived from the schema. */
  validationRules?: ValidationRules;
  /** Options for 'enum' dataType. */
  options?: EnumOption[];
  /** For 'relation' dataType: the name of the related resource key. */
  relatedResource?: string; // References key in UIxAAS_Output.resources
  /** For 'list' or 'object': reference (string) or inline schema definition. */
  itemSchema?: AdaptedSchema | string; // References key in UIxAAS_Output.schemas or inline
  /** Optional hint for muther-brane to select a specific jellicule component. */
  uiHint?: string; // e.g., 'textarea', 'password', 'slider', 'multi-select'
}

/** Normalized data types. */
type AdaptedDataType =
  | 'text' | 'number' | 'integer' | 'boolean' | 'date' | 'datetime' | 'email' | 'url' | 'uuid'
  | 'enum' | 'object' | 'list' | 'relation' // 'relation' links to another resource
  | string; // Allow custom types

interface EnumOption {
  value: string | number | boolean;
  label?: string; // Optional display label for the value
}

interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex
  minimum?: number;
  maximum?: number;
  // Add others like 'multipleOf', format specifics if needed
}

/**
 * Defines an action (API operation) that can be performed.
 * Designed to be interpretable by both UI triggers and machines (AI).
 */
interface ActionDefinition {
  name: string; // Unique action name within the resource (e.g., "listPets")
  label: string; // Human-readable label (e.g., "List Pets", "Create Pet")
  /** Clear description of the action's purpose (critical for AI). */
  description?: string;
  /** Helps categorize the action's nature. */
  type: 'query' | 'mutation' | 'custom'; // query=read, mutation=create/update/delete
  operationId?: string; // Original OpenAPI operationId
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path template, e.g., "/pets" or "/pets/{petId}". */
  pathTemplate: string;
  /** Parameters required for the action (path, query, header, cookie). */
  parameters: ActionParameter[];
  /** Description of the request body, if applicable. */
  requestBody?: RequestBodyDefinition;
  /** Description of the expected successful response. */
  successResponse: ResponseDefinition;
  /** Optional: Descriptions of potential error responses. */
  errorResponses?: { [statusCode: string]: ResponseDefinition };
  /** Security schemes required for this action. */
  securityRequirements?: SecurityRequirement[];
}

interface ActionParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description?: string;
  isRequired: boolean;
  /** Reference (string) or inline adapted schema for the parameter. */
  schema: AdaptedSchema | string;
}

interface RequestBodyDefinition {
  description?: string;
  isRequired: boolean;
  contentType: string; // e.g., "application/json"
  /** Reference (string) or inline adapted schema for the body. */
  schema: AdaptedSchema | string;
}

interface ResponseDefinition {
  description: string;
  contentType?: string; // e.g., "application/json"
  /** Reference (string) or inline adapted schema for the response body. */
  schema?: AdaptedSchema | string;
}

/** Simplified/normalized representation of an OpenAPI schema. */
interface AdaptedSchema {
  type: AdaptedDataType; // 'object', 'list', 'text', etc.
  description?: string;
  format?: string; // Further specifies type, e.g., 'date-time', 'email'
  properties?: { [propertyName: string]: AdaptedSchema | string }; // For 'object'
  required?: string[]; // For 'object'
  items?: AdaptedSchema | string; // For 'list'
  enum?: any[]; // For 'enum'
  // Include relevant constraints directly if not using ValidationRules separately
}

/** Defines a security requirement for an action. */
interface SecurityRequirement {
  /** Key = Security Scheme Name (defined globally), Value = Required Scopes array. */
  [schemeName: string]: string[];
}
```

## 5. Implementation Guidelines

### 5.1 Creating a UxA Adapter

To create a UxA adapter for a specific API type:

1. Parse the API definition
2. Identify resources/entities
3. Derive UI views (list, detail, create, edit)
4. Normalize schema properties into fields
5. Extract actions (API operations)
6. Handle security definitions
7. Output the result in the UIxAAS format

### 5.2 Using UIxAAS with jcule

The jcule Business Logic Controller (BLC) consumes the UIxAAS output to:

1. Generate UI components
2. Map API operations to UI actions
3. Handle data validation and transformation
4. Manage state and updates
5. Coordinate with other BLC instances for multi-tab support

### 5.3 Integration with jellicule

The jellicule UI components are selected and configured based on the UIxAAS output:

1. Field types map to specific component types
2. Validation rules are applied to components
3. Actions are mapped to event handlers
4. Views are rendered with appropriate layouts

## 6. Technology Choices

- **Language:** TypeScript
- **UI Library (`jellicule`):** Standard Web Components (implementation detail of `jellicule`, e.g., using Lit, Stencil, or vanilla JS)
- **`jcule` State Management:** Custom observable store
- **`jcule` Internal Communication:** Custom event bus (`insystema-vega`)

## 7. Next Steps

1. Begin implementation of the `OpenAPI-UxA` to produce the defined UIxAAS output.
2. Develop the initial version of the Custom State Store.
3. Implement the `insystema-vega` event bus.
4. Start defining the core logic for `muther-brane` to consume the UIxAAS output and interact with the state store/event bus.
5. Concurrently, the `jellicule` library needs development, defining the actual Web Components and their APIs (properties, attributes, events, CSS custom properties for styling).
6. Implement the `jcule` API and BL libraries.
7. Integrate `muther-brane` with `jellicule` components for rendering.

## 8. Future Directions

1. **Support for Additional API Types**: Extend UIxAAS to support GraphQL, gRPC, and other API types
2. **Advanced UI Hints**: Enhance the uiHint field to provide more specific UI rendering instructions
3. **Layout Specifications**: Add support for layout specifications in the ViewDefinition
4. **Internationalization**: Add support for internationalization of labels and descriptions
5. **Custom Actions**: Enhance support for custom actions beyond standard CRUD operations

## 9. Conclusion

The UIxAAS specification provides a standardized format for representing API definitions in a way that can be easily consumed by UI generation tools. By separating the API adaptation from the UI generation, UIxAAS enables a flexible and extensible approach to building web applications from API specifications.

The muther-brane component of jcule uses UIxAAS to orchestrate the generation of UI components, handling the mapping of API operations to UI actions, and managing the application state. This separation of concerns allows for a clean architecture that can adapt to different API types and UI frameworks.
