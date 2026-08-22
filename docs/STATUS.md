# WebAX — Current State & Open Decisions

A living record of what's built, what's missing, and what still needs deciding.
(The vision + glossary live in [index.md](./index.md); the how-to in [BUILDING.md](./BUILDING.md).)

## Division of labor

| Layer | Project | Role | State |
|---|---|---|---|
| Umbrella + specs | **WebAX** | vision, structure, naming | ✅ docs |
| UI components | **jellicule** | native `<jel-*>` web components | ✅ 23 components |
| Business logic | **jcule** | BLC (muther-brane), workflow, router, sync | ✅ built + tested |
| Storage | **memory-core** | unified storage abstraction | ✅ built + tested |
| Logging | **cyber-eyes** | structured, level-filtered logging | ✅ rebuilt + tested |
| Messaging | **comlink** | inter-app messaging, trust, discovery | ❌ spec only |
| App shell | **Cyberdeck-Launcher** | app mgmt, windowing, install, share UI | 🟡 minimal (shell + install/launch + capability registry) |
| Privileged backend | **CyberdeckOS** | services (Ollama, Postgres…), hardware | 🟡 service manager + registry + token-guarded API (Docker container mgmt); device sync pending |
| Distribution | **WebAXD/DN/PDN** | packaging + P2P distribution | ❌ deferred |

The reference app is **`pet-store/`** — a working, offline-capable, multi-page PWA
proving the spec-driven stack end to end.

## What's built (✅) and what's missing

| # | Capability | Status |
|---|---|---|
| 1 | Custom components for API endpoints | ⚠️ authorable (`BaseComponent`), **not registrable** (no component registry in jcule) |
| 2 | Drop-in CSS / theming | ✅ tokens override; light/dark; ⚠️ **no `auto`**, no theming guide |
| 3 | Library depth + accessibility | ⚠️ forms/CRUD yes; DAW/Excel/Word + verified a11y no |
| 4 | Inter-app communication | ❌ comlink spec only |
| 5 | Universal share / pipeline | 🟡 capability registry built; transport (comlink) spec only |
| 6 | Install prompts | 🟡 Launcher install/launch works; standard PWA install; WebAXP deferred |

## Cyberdeck Compatibility

The idea that makes WebAX apps *composable*: a WebAX app **declares its
capabilities and requirements in its manifest**, and the Cyberdeck-Launcher
builds a **capability registry** from those declarations so apps (and the
share mechanism) can discover and connect to each other.

Sketch of the manifest `webax` field:

```json
{
  "webax": {
    "package_id": "gallery",
    "version": "1.0.0",
    "permissions": ["storage", "network"],
    "provides": [
      { "intent": "share", "type": "image", "formats": ["image/png", "image/jpeg"] }
    ],
    "requires": [
      { "intent": "tts" }
    ],
    "services": ["ollama"]
  }
}
```

- **`provides`** — what this app can *offer* other apps (intents + data formats).
- **`requires`** — what this app *needs* from others (services/capabilities).
- **`services`** — privileged backend services (CyberdeckOS).
- **`permissions`** — what the app is allowed to touch.

The Launcher reads these to power the **share sheet** ("send this image to any
app that accepts `image/*`") and **service discovery** ("find the TTS service").
This is the "compatible data formats, protocols, and semantics" layer.

## Open decisions (need to be made)

1. **Component registry (jcule)** — how do developers register custom components?
   Wire `uiHint` → a `registerComponent()` map, or another mechanism?
2. **Theme `auto` (jellicule)** — implement `prefers-color-scheme` fallback, a
   theming guide, and a JS "theme object" API on top of the raw `--jel-*` vars.
3. **Comlink transport + trust** — actual transport (BroadcastChannel / postMessage
   / WebRTC / WebSocket) and how trust levels are enforced.
4. **Cyberdeck Compatibility schema** — exact manifest vocabulary
   (`provides`/`requires`/`intents`/`formats`/`services`) and the data-format &
   semantic identifiers (MIME types? WebAX intent IDs?).
5. **Launcher windowing model** — how apps run (iframes vs. separate contexts vs.
   single-SPA with jcule routing).
6. **CyberdeckOS shim API** — which shims we build (service access, hardware) and
   their surface.
7. **Library depth + a11y (jellicule)** — spreadsheet / rich-text / timeline /
   canvas components; a11y test suite + focus management.
8. **Distribution (Phase 5)** — refine WebAXD → WebAXPDN → WebAXDN.
