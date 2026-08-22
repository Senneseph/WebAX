# WebAX — "The Browser is the OS"

**WebAX** (Web Application Experience) is an umbrella of specifications,
libraries, and conventions for building, distributing, and running web
applications. The central idea:

> The UI is not a component API — it is a **specification of page layouts**.
> Business logic is a **flowchart / decision-tree system**. UI state is a
> **subset of application state**.

To author a WebAX app you supply **three specifications** — no framework glue:

1. **API spec** — an endpoint specification (OpenAPI).
2. **UI spec** — how the data is laid out, and how the UI messages the core.
3. **Workflow spec** — the business-rules decision tree.

The platform (jcule) consumes those specs, renders the UI with jellicule
components, drives state through the BLC, and the app is running. The
**acceptance test** is a cold-start LLM: empty context, pointed at
[`docs/index.md`](./docs/index.md), asked to build a working app — where it
stumbles is where the docs and platform need work. It passes.

## The ecosystem

Each project is its own repository, checked out side-by-side. (All repos are
currently **private** — links resolve for you and any collaborators you add.)

| Project | What it is | Status |
|---|---|---|
| **[WebAX](https://github.com/Senneseph/WebAX)** | This umbrella: specs + naming + entrypoint | ✅ docs |
| **Runtime** | | |
| [jcule](https://github.com/Senneseph/jcule) | Business Logic Controller (BLC): `openApiToUxAAS`, `MutherBrane`, `createWorkflow`, router, store, event bus, api client | ✅ built + tested |
| [jellicule](https://github.com/Senneseph/jellicule) | UI component library — native `<jel-*>` web components, dumb by design | ✅ 34 components |
| [memory-core](https://github.com/Senneseph/memory-core) | Unified storage abstraction (browser + network, access control, caching, sync) | ✅ built + tested |
| [comlink](https://github.com/Senneseph/comlink) | Secure, trust-based inter-app messaging (tabs, processes, network) | ❌ spec only |
| [cyber-eyes](https://github.com/Senneseph/cyber-eyes) | Standardized, structured logging | ✅ built + tested |
| [basic-freedom](https://github.com/Senneseph/basic-freedom) | General-purpose standard library (testing, collections, validation, i18n) | 🟡 stdlib |
| **Packaging & distribution** | | |
| [WebAXP](https://github.com/Senneseph/WebAXP) | The **packaging format** (bundle + `webax` manifest field) — *not* the framework | 🟡 spec |
| [WebAXD](https://github.com/Senneseph/WebAXD) | Distribution layer: unified API over direct / P2P / distributed models | ❌ deferred |
| [WebAXDN](https://github.com/Senneseph/WebAXDN) | Distribution network (device-to-device sync chains) | ❌ deferred |
| [WebAXPDN](https://github.com/Senneseph/WebAXPDN) | P2P distribution network for WebAXP, built on WebAXD | ❌ deferred |
| **Platform** | | |
| [Cyberdeck-Launcher](https://github.com/Senneseph/Cyberdeck-Launcher) | App launcher / windowing (install, launch, capability registry, share) | 🟡 minimal |
| [CyberdeckOS](https://github.com/Senneseph/CyberdeckOS) | Privileged backend shims (Ollama, Postgres, Docker service manager) — we build shims, not the OS | 🟡 service manager |
| **Tooling** | | |
| [WebAX-Template](https://github.com/Senneseph/WebAX-Template) | Bootstrap template for new WebAX apps | 🟡 early |
| [jcule-builder](https://github.com/Senneseph/jcule-builder) | Visual drag-and-drop builder: OpenAPI spec → jellicule UI | 🟡 early |
| [jelliculegize](https://github.com/Senneseph/jelliculegize) | Port existing apps into WebAX (incl. jcule-tsx transcriber) | 🟡 early |
| [transcribulator](https://github.com/Senneseph/transcribulator) | Translate libraries to basic-freedom style, pure-functional, WASM-targeted | 🟡 early |
| [project-management](https://github.com/Senneseph/project-management) | OpenProject CLI (`op`) + docker-compose wrapper (`dc`) for this meta-project | ✅ tool |
| **Apps (the proof)** | | |
| [pet-store](https://github.com/Senneseph/pet-store) | The reference app / acceptance test: OpenAPI → jcule → jellicule, workflow-enforced | ✅ working |
| [agenda](https://github.com/Senneseph/agenda) | Task list + day planner + kanban. Lock-screen "what to do now", RFC 5545 calendar sync, LLM/voice command API | ✅ working |
| [Cheap-Chess](https://github.com/Senneseph/Cheap-Chess) | Chess engine + PWA (fixed-size search, center-control scoring, exception learning, UCI) | ✅ working |
| [Font-Viewer](https://github.com/Senneseph/Font-Viewer) | Demo: OS-level tools are easy to build (font browser/previewer) | ✅ demo |
| [Cyberdeck-Arcade](https://github.com/Senneseph/Cyberdeck-Arcade) | Browser-based emulation platform for classic gaming | 🟡 side project |
| [intercom](https://github.com/Senneseph/intercom) | Communications app: a meta-messaging area where messages from all apps are collected (Google Wave-style) | 🟡 foundation |
| **Meta** | | |
| [STYLE-GUIDE](https://github.com/Senneseph/STYLE-GUIDE) | Versioned style guide for promptcraft + project structure | ✅ docs |

## Documentation

- [`docs/index.md`](./docs/index.md) — **canonical entrypoint**. The vision,
  glossary (authoritative naming), architectural principles, and the reference
  test. *LLMs: start here.*
- [`docs/BUILDING.md`](./docs/BUILDING.md) — build a WebAX app step by step:
  specs → wiring → components → routing → Cyberdeck Compatibility.
- [`docs/STATUS.md`](./docs/STATUS.md) — what's built, what's missing, open
  decisions.
- [`docs/specification.md`](./docs/specification.md) — the full specification.
- [`docs/PACKAGE-STRUCTURE.md`](./docs/PACKAGE-STRUCTURE.md) — canonical repo
  layout used across the ecosystem.

## Getting started

1. Read [`docs/index.md`](./docs/index.md) — the whole idea in one page.
2. Follow [`docs/BUILDING.md`](./docs/BUILDING.md) to assemble an app from the
   three specs.
3. Clone [WebAX-Template](https://github.com/Senneseph/WebAX-Template) and
   build a new WebAX app.
4. Run the reference app to see all systems firing:
   ```bash
   # build the libraries once (from the meta-project root)
   (cd jcule && npm install && npm run build)
   (cd jellicule && npm install && npm run build)
   python3 -m http.server 8000
   # open http://localhost:8000/pet-store/app/
   ```
5. Want a deeper example? [agenda](https://github.com/Senneseph/agenda) is a
   full production-shaped app (lock screen, calendar, kanban) with a complete
   OpenAPI contract, workflow spec, and natural-language command API —
   the best demonstration of what spec-driven development produces.

## Contributing

Spec-first: every feature begins as a specification; documentation is treated
like code. Open decisions live in [`docs/STATUS.md`](./docs/STATUS.md).

MIT.
