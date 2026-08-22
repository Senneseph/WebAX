# WebAX — "The Browser is the OS"

> This is the canonical entrypoint for the WebAX ecosystem. Start here.
>
> **To build your own WebAX app, read [BUILDING.md](./BUILDING.md).**
>
> **Current state & open decisions: [STATUS.md](./STATUS.md).**

## What WebAX is

**WebAX** (Web Application Experience) is the umbrella term for a collection of specifications, libraries, and conventions for building, distributing, and running web applications. The central idea:

> **In WebAX, the browser is the operating system.**

We treat the UI not as a component API, but as a **specification of page layouts**. The core business logic is a **flowchart / decision-tree system**. UI state is a **subset of application state**.

To author a new component you provide three specifications — no framework glue code:

1. **API spec** — an endpoint specification (e.g., OpenAPI).
2. **UI spec** — a layout specification that explains how to represent the data and how to message the core for changes.
3. **Workflow / business-rules spec** — a task-list / decision-tree transaction agreement.

A separate library, runtime, and service handle the heavy lifting of API handling. The core connects to the back-end, loads the current UI layout according to its state, and the application is running.

> Don't like how something looks? Enter edit mode and override the display spec. Want a new workflow? Chain API calls together with intermediate UIs. As little UI plumbing as possible, with the core logic system preventing most bad things from happening.

## The three inputs → running app

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   API spec      │     │   UI spec       │     │  Workflow spec  │
│   (OpenAPI)     │     │  (layout, data) │     │ (decision-tree) │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   ┌───────────────────────────────────────────────────────────┐
   │                      jcule (BLC)                          │
   │                 core orchestrator: muther-brane           │
   └───────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
   │ jellicule    │    │ memory-core      │    │ comlink /        │
   │ (web comps)  │    │ (storage)        │    │ cyber-eyes       │
   └──────────────┘    └──────────────────┘    └──────────────────┘
```

The pipeline that turns a spec into a UI:

1. **UxA / OpenAPI-UxA** parses an API spec and produces the **UIxAAS** adapted representation (a normalized, UI-ready view of the API: resources, views, fields, actions).
2. **muther-brane** (the BLC core) consumes the adapted representation + UI spec + workflow spec.
3. **muther-brane** renders **jellicule** components into the DOM and wires them to the API.
4. Components emit events → muther-brane updates the **state store** → affected components re-render.

## Glossary (authoritative naming)

| Name | What it is |
|---|---|
| **WebAX** | The umbrella term: specs + libraries + conventions for PWAs where UI is a spec. |
| **WebAXP** | The **packaging format** for a WebAX app (bundle + `webax` manifest field). *Not* the framework. |
| **WebAXD** | The distribution layer: a unified API over direct / P2P / distributed distribution models. |
| **WebAXDN** | The distribution network (device-to-device sync, Brave-style sync chains). |
| **WebAXPDN** | The P2P distribution network for WebAXP packages, built on WebAXD. |
| **jcule** | Business Logic Controller (BLC) framework. Core orchestrator = **muther-brane** ("mother-brain"). Subsystems: **UIxAAS**, **UxA/OpenAPI-UxA**, **insystema-vega** (event bus), custom **state store**. |
| **jellicule** | UI component library: **native web components** (Custom Elements), "dumb" by design, theming via CSS custom properties. |
| **memory-core** | Unified storage abstraction (browser + network stores, access control, caching, sync). Only the mother-brain talks to it. |
| **comlink** | Secure, trust-based inter-app messaging (intra-browser, inter-process, network). |
| **cyber-eyes** | Standardized logging system. |
| **basic-freedom** | General-purpose standard library (testing, collections, validation, i18n, errors). |
| **Cyberdeck** | Anything with a browser can become a WebAX Cyberdeck. |
| **Cyberdeck-Launcher** | PWA launcher / windowing system (WebOS-style). |
| **CyberdeckOS** | Privileged backend service layer (we build only the shims, not the OS). |
| **jcule-builder** | Visual drag-and-drop builder: OpenAPI spec → jellicule UI. |
| **jelliculegize** | Porting/adapting apps into WebAX (incl. jcule-tsx transcriber). |
| **WebAX-Template** | Bootstrap template for new WebAX apps. |
| **Font-Viewer** | Demo app proving OS-level tools are easy to build. |

### Naming notes

- **`muther-brane` ≠ `memory-core`.** muther-brane (also written "mother-brain") is jcule's core orchestrator. memory-core is a *separate* storage layer. They are not the same thing.
- **jellicule is native web components**, not React. (React was a temporary bootstrap; it is being removed.)
- **WebAX = umbrella; WebAXP = packaging format.** WebAXP is not the application framework.

## Core architectural principles

1. **UI components do not communicate with each other directly.** They emit events to the BLC; the BLC updates state; state flows back to components.
2. **UI components are "dumb."** They render from props, capture interactions, and emit events. No business logic, no direct API calls, no global-state access.
3. **The BLC is the single source of truth.** All state changes flow through it; UI state is derived from application state.
4. **Multi-tab support.** Each tab runs its own BLC; BLCs sync via comlink against one true state.
5. **Spec-first.** Every feature begins as a specification; documentation is treated like code.

## Building a WebAX application (the workflow)

1. Provide an **API spec** (OpenAPI).
2. Provide a **UI spec** (how data is laid out + how the UI messages the core).
3. Provide a **workflow spec** (task list / decision tree).
4. The **OpenAPI-UxA** adapter normalizes the API into **UIxAAS**.
5. **muther-brane** renders the app with **jellicule** components and drives state through the **BLC**.
6. Storage goes through **memory-core**; inter-app/inter-tab messaging through **comlink**; logging through **cyber-eyes**.

## The reference test: Pet Store

The acceptance test is to build a friendly, interactive **Pet Store** UI from the Pet Store OpenAPI spec, with basic business logic, where **all systems are firing** and ready for other people to test.

The verification method is a **cold test**: fire up an LLM with an empty context, point it at *this* document as the entrypoint, and have it build its own Pet Store WebAX application. Where it stumbles is where the documentation (and the platform) need work.

## Implementation status

| Component | Status |
|---|---|
| WebAX specifications | Defined (spec-first docs) |
| jcule (BLC) | Spec-only — implementation starting |
| jellicule | Being rebuilt as native web components (React bootstrap being removed) |
| memory-core | Spec/API design only |
| comlink | Early scaffolding + spec |
| cyber-eyes | Most complete — has src, core, dist, demo |
| WebAXP / WebAXD / WebAXDN / WebAXPDN | Spec only — distribution deferred |

## Where things live

Each project is its own git repository, checked out side-by-side under the meta-project root:

```
WebAX/            # umbrella specs + this entrypoint (docs/index.md)
jcule/            # Business Logic Controller (BLC)
jellicule/        # UI component library (native web components)
memory-core/      # storage abstraction
comlink/          # messaging
cyber-eyes/       # logging
basic-freedom/    # stdlib
WebAXP/           # packaging format
WebAXD/ WebAXDN/ WebAXPDN/   # distribution (deferred)
jcule-builder/ jelliculegize/ WebAX-Template/  # tooling
Cyberdeck-Launcher/ CyberdeckOS/  # launcher + OS shims
Font-Viewer/ Cyberdeck-Arcade/ Cyberdeck-InterComm/  # apps/demos
STYLE-GUIDE/      # style guide
```
