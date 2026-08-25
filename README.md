[![UI Engine](https://shields.io)](https://github.com)
[![Size](https://shields.io)](https://github.com)
[![License](https://shields.io)](https://github.com)

# 🏠 Vibe.js

**Сверхлёгкий реактивный UI-движок без Virtual DOM**, созданный специально для дашбордов умного дома, настенных панелей и IoT-устройств.

---

## ✨ Главные преимущества

- 🚀 **Zero Virtual DOM** — прямая запись в DOM-узлы (Single-pass compilation). Экономит оперативную память на старых планшетах и микроконтроллерах.
- ⚡ **Real-time Hardware Reactivity** — оптимизированный scheduler на микротасках объединяет пачки обновлений от датчиков, защищая интерфейс от фризов (60 FPS).
- 🪶 **Ultra-low Footprint** — весь фреймворк со встроенным компилятором директив весит всего **~3.4 KB** в сжатом виде (gzip).
- 🧩 **Built-in IoT Widgets** — готовые к работе компоненты из коробки (`vibe-toggle`, `vibe-dimmer`, `vibe-chart`).

---

## ⚡ Быстрый старт

Подключите фреймворк и инициализируйте приложение одной функцией `createApp`:

```html
<script src="https://cdn.jsdelivr.net/npm/vibe-js/dist/vibe-full.min.js"></script>
```

```js
import { createApp } from 'vibe-js';

createApp({
  data: () => ({
    temperature: 21.5,
    relayOn: false
  }),
  methods: {
    toggleRelay() {
      this.relayOn = !this.relayOn;
    }
  }
}).mount('#app');
```

```html
<vibe-app id="app">
  <template>
    <div class="panel">
      <h2>Котельная</h2>

      <!-- Реактивный вывод с датчика -->
      <p>Температура: {{ temperature }}°C</p>

      <!-- Двусторонняя привязка -->
      <input v-model="temperature" type="range" min="15" max="30" />

      <!-- Управление реле -->
      <button v-on:click="toggleRelay">
        {{ relayOn ? 'Выключить' : 'Включить' }}
      </button>
    </div>
  </template>
</vibe-app>
```

Измените `temperature` на сервере или в консоли — цифра на экране обновится мгновенно, без перезагрузки интерфейса.

Локальная разработка:

```bash
npm install
npm run dev     # dev-сервер с примером термостата
npm run build   # ESM + IIFE + типы
npm test        # Vitest
npm run size    # проверка бюджета размера (gzip)
```

---

## 🧩 Экосистема виджетов

| Виджет | Назначение | Пример |
| --- | --- | --- |
| `vibe-toggle` | Переключатель (реле, питание, режим) | `<vibe-toggle v-model="relayOn" label="Реле" />` |
| `vibe-dimmer` | Круговой регулятор яркости / температуры | `<vibe-dimmer v-model="brightness" />` |
| `vibe-chart` | Легковесный график телеметрии с буфером истории | `<vibe-chart :data="sensor.history" />` |

Все виджеты — это обычные компоненты Vibe.js, поддерживающие `v-model` и нативные события. Они написаны на чистом SVG/CSS и не тянут тяжёлые зависимости.

```html
<div class="controls">
  <vibe-toggle v-model="relayOn" label="Кондиционер"></vibe-toggle>
  <vibe-dimmer v-model="brightness"></vibe-dimmer>
  <vibe-chart :data="sensor.history"></vibe-chart>
</div>
```

---

## 🔌 Интеграция с IoT-платформой

Vibe.js идеально сочетается с бэкендом на Go/Elixir из репозитория
[`Leonov792/iot-platform`](https://github.com/Leonov792/iot-platform): данные от
железных датчиков доставляются на экран панели по WebSockets мгновенно, а
реактивный scheduler Vibe.js мгновенно превращает входящий поток в плавное
обновление интерфейса.

```js
const ws = new WebSocket('wss://iot.example.com/telemetry');

ws.onmessage = (event) => {
  const { temperature, relay } = JSON.parse(event.data);
  app.data.temperature = temperature; // экран обновляется сразу
  app.data.relayOn = relay;
};
```

---

## 📄 Лицензия

MIT © [Leonov792](https://github.com/Leonov792)
