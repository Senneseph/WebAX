# Building a WebAX application

This is the step-by-step guide to building a WebAX application. It assumes an
empty context — read it top to bottom and you can assemble a working app.

## The idea

A WebAX app is a single-page web app where you supply **three specifications**
and the platform does the heavy lifting:

1. **API spec** — an OpenAPI document describing your endpoints.
2. **Workflow spec** — a decision tree describing your business rules.
3. (Optional) **UI spec** — layout overrides; the UI is otherwise generated.

The libraries:

| Package | Role |
|---|---|
| `@net.webax/jcule` | Business Logic Controller (BLC): `openApiToUxAAS`, `MutherBrane`, `createWorkflow`, `createRouter`, `createStore`, `createEventBus`, `createApiClient` |
| `@net.webax/jellicule` | UI component library: native `<jel-*>` custom elements |
| `@net.webax/memory-core` | Storage abstraction (`MemoryCore`) |
| `@net.webax/cyber-eyes` | Structured logging (`CyberEyes`) |

## Step 1 — your OpenAPI spec

An OpenAPI 3 document with at least one `components.schemas` entry and paths:

```json
{
  "openapi": "3.0.3",
  "info": { "title": "Pet Store", "version": "1.0.0" },
  "servers": [{ "url": "https://example.com/api/v3" }],
  "paths": {
    "/pet": {
      "post": { "operationId": "addPet", "responses": { "200": { "description": "ok" } } },
      "put":  { "operationId": "updatePet", "responses": { "200": { "description": "ok" } } }
    },
    "/pet/findByStatus": {
      "get": { "operationId": "findPetsByStatus", "responses": { "200": { "description": "ok" } } }
    },
    "/pet/{petId}": {
      "get": {
        "operationId": "getPetById",
        "parameters": [{ "name": "petId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": { "200": { "description": "ok" } }
      }
    }
  },
  "components": {
    "schemas": {
      "Pet": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "id": { "type": "integer", "format": "int64" },
          "name": { "type": "string" },
          "status": { "type": "string", "enum": ["available", "pending", "sold"] }
        }
      }
    }
  }
}
```

## Step 2 — your workflow spec

A finite-state description of the business rules:

```json
{
  "states": ["available", "pending", "sold"],
  "initial": "available",
  "transitions": [
    { "from": "available", "to": "pending", "on": "adopt" },
    { "from": "pending", "to": "sold", "on": "complete" },
    { "from": "pending", "to": "available", "on": "cancel" }
  ]
}
```

## Step 3 — wire it up

```js
import {
  openApiToUxAAS, createStore, createEventBus, createApiClient,
  createWorkflow, MutherBrane, createRouter,
} from 'jcule';
import 'jellicule';                 // registers <jel-*> elements + design tokens
import { MemoryCore } from 'memory-core';
import { CyberEyes } from 'cyber-eyes';

const log = new CyberEyes('app', 'main');

// Load the specs
const [spec, workflowSpec] = await Promise.all([
  fetch('./petstore.json').then((r) => r.json()),
  fetch('./workflow.json').then((r) => r.json()),
]);

// Build the BLC
const uiaas = openApiToUxAAS(spec);       // OpenAPI → UIxAAS (resources/views/actions/fields)
const workflow = createWorkflow(workflowSpec);
const store = createStore({});
const bus = createEventBus();
const api = createApiClient({ baseUrl: spec.servers[0].url });
const memory = new MemoryCore({ localStorage: window.localStorage });
const brane = new MutherBrane({ store, bus, api });
brane.load(uiaas);

bus.on('action:complete', (e) => log.info({ message: 'action', action: e.action }));

// Render a generated form from the spec
const container = document.getElementById('app');
brane.renderView('Pet', 'createForm', container);

// Or drive data + the workflow yourself:
const pets = await brane.list('Pet');       // GET the list action
const next = workflow.next('available', 'adopt'); // → 'pending'
await api.request('PUT', '/pet', { body: { name: 'Rex', status: next } });
```

`brane.renderView(resourceName, viewType, container)` generates the UI from the
OpenAPI spec: it maps fields to `jel-*` components and wires the view's primary
action to the API.

## The jellicule components

Native custom elements (prefix `jel-`), configured by attributes and emitting
`bubbles: true, composed: true` CustomEvents:

- **Inputs**: `jel-input`, `jel-textarea`, `jel-select`, `jel-checkbox`, `jel-radio`, `jel-button`, `jel-label`, `jel-link`
- **Layout**: `jel-container`, `jel-grid`, `jel-card` (has a `footer` slot), `jel-divider`, `jel-spacer`
- **Display**: `jel-list`, `jel-table`, `jel-badge`, `jel-tag`
- **Feedback**: `jel-alert`, `jel-spinner`, `jel-modal`, `jel-toast`
- **Form**: `jel-form`, `jel-field` (`label`, `hint`, `error` attributes)

Key events (all bubble + composed, so you can listen at `document` level):

- `jel-click` (button/link)
- `jel-input`, `jel-change` (inputs/selects/textarea; detail `{ value, name }`)
- `jel-change` (checkbox/radio; detail `{ checked, name, value }`)
- `jel-submit` (form; detail `{ values, form }`)
- `jel-dismiss` (alert/modal/toast/tag)

Add a `reveal` attribute to any element for the "bloom" pop-in animation.

### Handling an action (button → workflow → API)

Components emit `jel-*` events — **listen for those, not native `click`/`change`**.
The data lives on the element itself, not on `event.target`:

```js
const adoptBtn = document.createElement('jel-button');
adoptBtn.textContent = 'Adopt';
adoptBtn.addEventListener('jel-click', () => {
  const next = workflow.next(pet.status, 'adopt');   // use the item's ACTUAL status
  if (next) {
    await api.request('PUT', '/pet', { body: { ...pet, status: next } });
    await memory.useStore('localStorage').set('pets', await brane.list('Pet')); // cache
  }
});
```

Notes:
- `event.detail` carries the payload (e.g. `{ value, name }`, `{ checked }`).
- Read attributes off the element you created (`adoptBtn` / `pet`), not `event.target`.
- `workflow.next(status, event)` takes the item's **current** status, not a hardcoded one.

## Routing

```js
const router = createRouter([
  { path: '/', render: () => { /* home */ } },
  { path: '/pet/:id', render: ({ id }) => { /* detail */ } },
]);
router.start();          // reads location, listens to popstate
router.navigate('/pet/7'); // pushState + render
```

## Cyberdeck Compatibility & installation

To make your app a first-class Cyberdeck citizen, add a `webax` field to its PWA
`manifest.json`. This declares what the app **provides** and **requires**; the
Cyberdeck-Launcher reads it to build a capability registry and power the share
mechanism:

```json
{
  "name": "My App",
  "start_url": "/my-app/index.html",
  "display": "standalone",
  "webax": {
    "package_id": "my-app",
    "version": "1.0.0",
    "publisher": "me",
    "permissions": ["storage", "network"],
    "provides": [{ "intent": "share", "type": "image", "formats": ["image/png", "image/jpeg"] }],
    "requires": [{ "intent": "tts" }],
    "services": ["postgres", { "type": "redis", "memory": "256m", "cpus": "0.5" }]
  }
}
```

- `package_id` — unique app id; `permissions` — capabilities the app may use.
- `provides` — intents + data types the app can hand off (e.g. `share:image`).
- `requires` — capabilities the app needs from other apps/services.
- `services` — docker services the app needs (CyberdeckOS stands them up + cleans them up on uninstall). A string is a bare type; an object adds `type`, `env`, `memory`, `cpus`.

**OpenAI-protocol capability:** services expose an OpenAI-compatible `/v1` endpoint
(e.g. Ollama, llama.cpp). The Cyberdeck Launcher relays requests through
CyberdeckOS's `/proxy` — e.g. `POST /proxy { service: "ollama", path: "/v1/chat/completions", method: "POST", body: { model, messages } }` — which is what lets an LLM self-develop, test, and install new apps from within the Launcher.

**Install on the Cyberdeck:** serve the app over HTTP (with its manifest). In the
Cyberdeck-Launcher, enter the app URL + manifest URL and click **Install**, then
**Launch** — the Launcher stores the app (memory-core) and opens it in a window.

## WebAX-ifying an existing project (starting from a git repo)

1. Find or write an **OpenAPI spec** for the project's API (derive one from its
   endpoints if none exists).
2. Write a **workflow spec** for its business rules (states + transitions).
3. Copy the wiring from *Step 3* (`openApiToUxAAS` → `MutherBrane` → `renderView`).
4. Add a `webax` manifest field (above) for Cyberdeck Compatibility.
5. Serve it and install it on the Cyberdeck-Launcher.

## Reference app

A complete, working example lives in `../pet-store/` (the Pet Store demo):
`specs/petstore.json`, `specs/workflow.json`, and `app/main.js`.
