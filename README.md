<p align="center">
  <br>
  <h1 align="center">🏠 Vibe.js</h1>
  <p align="center">
    A <b>3.4&nbsp;KB</b> reactive UI engine with <b>no Virtual DOM</b>,<br>
    built for smart-home dashboards, wall panels and IoT devices.
  </p>
  <p align="center">
    <a href="https://github.com/Leonov792/vibe-js/actions"><img alt="CI" src="https://github.com/Leonov792/vibe-js/actions/workflows/ci.yml/badge.svg"></a>
    <img alt="gzip size" src="https://img.shields.io/badge/gzip-3.4%20KB-29b6f6?style=flat-square">
    <img alt="minified" src="https://img.shields.io/badge/minified-~9%20KB-9e9e9e?style=flat-square">
    <img alt="license" src="https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square">
    <img alt="zero deps" src="https://img.shields.io/badge/dependencies-0-8a2be2?style=flat-square">
  </p>
</p>

---

Vibe.js is a Vue-inspired micro-framework optimized for constrained hardware.
It keeps the familiar template syntax and reactivity model, but drops the Virtual
DOM entirely — the template is compiled in a **single pass** into a list of
bindings that write **directly to DOM nodes**. Less memory, fewer CPU cycles,
smooth 60&nbsp;FPS updates on years-old tablets and microcontrollers.

---

## ✨ Why Vibe.js

- 🚀 **Zero Virtual DOM** — single-pass compilation writes straight to DOM nodes.
  No diffing, no intermediate VNode tree, minimal allocations.
- ⚡ **Hardware reactivity** — a microtask-based scheduler coalesces bursts of
  sensor updates into a single render pass, keeping the UI at 60&nbsp;FPS.
- 🪶 **Ultra-low footprint** — the whole engine *including* the directive compiler
  is **~3.4&nbsp;KB gzipped** (~9&nbsp;KB minified), with zero dependencies.
- 🔌 **`Object.defineProperty` reactivity** — no `Proxy`, so it runs in older
  WebViews and embedded browsers where modern APIs are unavailable.
- 🧩 **Built-in IoT widgets** — ready-made `vibe-toggle`, `vibe-dimmer` and
  `vibe-chart` components out of the box.

---

## 📦 Installation

```bash
npm install vibe-js
```

Or via CDN (IIFE build, global `Vibe`):

```html
<script src="https://cdn.jsdelivr.net/npm/vibe-js/dist/vibe-full.min.js"></script>
```

Build from source:

```bash
git clone https://github.com/Leonov792/vibe-js.git
cd vibe-js
npm install
npm run build   # ESM + IIFE + types into dist/
```

---

## ⚡ Quick Start

```html
<vibe-app id="app">
  <template>
    <div class="panel">
      <h2>Boiler room</h2>

      <!-- reactive output from a sensor -->
      <p>Temperature: {{ temperature }}°C</p>

      <!-- two-way binding -->
      <input v-model="temperature" type="range" min="15" max="30" />

      <!-- relay control -->
      <button v-on:click="toggleRelay">
        {{ relayOn ? 'Turn off' : 'Turn on' }}
      </button>
    </div>
  </template>
</vibe-app>
```

```js
import { createApp } from 'vibe-js';

const app = createApp({
  data: () => ({
    temperature: 21.5,
    relayOn: false
  }),
  methods: {
    toggleRelay() {
      this.relayOn = !this.relayOn;
    }
  }
});

app.mount('#app');
```

Mutate `app.data.temperature` from anywhere — a WebSocket handler, a timer, the
console — and the number on screen updates instantly, without a reload.

---

## 🧩 Built-in Components

| Component | Purpose | Example |
| --- | --- | --- |
| `vibe-toggle` | On/off switch (relay, power, mode) | `<vibe-toggle v-model="relayOn" label="Relay" />` |
| `vibe-dimmer` | Circular brightness / temperature dial | `<vibe-dimmer v-model="brightness" />` |
| `vibe-chart` | Lightweight telemetry chart with a history buffer | `<vibe-chart :data="sensor.history" />` |

```html
<div class="controls">
  <vibe-toggle v-model="relayOn" label="Air conditioner"></vibe-toggle>
  <vibe-dimmer v-model="brightness"></vibe-dimmer>
  <vibe-chart :data="sensor.history"></vibe-chart>
</div>
```

Every widget is a regular Vibe.js component written in pure SVG/CSS — it supports
`v-model`, emits native events, and adds no heavy dependencies.

---

## 📝 Template Directives

| Directive | Description |
| --- | --- |
| `{{ expr }}` | Text interpolation |
| `v-on:click="fn"` | Event handler (`fn` is shorthand for `fn($event)`) |
| `v-bind:attr="expr"` / `:attr` | Attribute binding |
| `v-model="key"` | Two-way binding (inputs, selects, checkboxes, components) |
| `v-if="expr"` | Conditional rendering |
| `v-for="item, index in list"` | List rendering |
| `:class="{ active: flag }"` | Object class binding |

---

## 🧠 Reactivity API

```js
import { reactive, ref, computed, effect, nextTick } from 'vibe-js';

const state = reactive({ count: 0 });

effect(() => console.log(state.count)); // 0
state.count = 1;                        // schedules a microtask
await nextTick();                       // -> logs 1

const doubled = computed(() => state.count * 2);
```

### `createApp(options)`

| Option | Description |
| --- | --- |
| `data` | Function or object of initial state (wrapped in `reactive`) |
| `methods` | Methods available as `this.method()` |
| `computed` | Cached, lazy computed properties |
| `watch` | Watchers `key(newVal, oldVal)` |
| `onMounted` / `onBeforeUnmount` | Lifecycle hooks |
| `template` | HTML string or `<template>` element (optional) |

Returns `{ mount(el), unmount() }`.

---

## 🔌 IoT Platform Integration

Vibe.js pairs naturally with the Go/Elixir backend from
[`Leonov792/iot-platform`](https://github.com/Leonov792/iot-platform): sensor
data streams to the panel over WebSockets, and Vibe.js turns the incoming flow
into smooth, batched UI updates.

```js
const ws = new WebSocket('wss://iot.example.com/telemetry');

ws.onmessage = (event) => {
  const { temperature, relay } = JSON.parse(event.data);
  app.data.temperature = temperature; // screen updates immediately
  app.data.relayOn = relay;
};
```

---

## 🗂 Project Structure

```
vibe-js/
├── src/
│   ├── reactivity/     # reactive, effect, ref, computed, scheduler
│   ├── compiler/       # single-pass template compiler + directives
│   ├── runtime/        # createApp, component instance, registry
│   └── components/     # vibe-toggle, vibe-dimmer, vibe-chart
├── examples/thermostat # runnable wall-thermostat demo
├── tests/              # Vitest suite (reactivity, compiler, components, smoke)
├── scripts/            # size-budget check
└── dist/               # ESM + IIFE + type declarations (build output)
```

---

## 🧪 Development

```bash
npm install
npm run dev     # dev server with the thermostat example
npm test        # Vitest
npm run size    # enforce the gzip size budget
```

---

## 📄 License

[MIT](LICENSE) © [Leonov792](https://github.com/Leonov792)
