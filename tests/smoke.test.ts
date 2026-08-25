import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const file = 'dist/vibe.min.js';

function loadVibe(): any {
  const code = readFileSync(file, 'utf8');
  return new Function(code + '\nreturn Vibe;')();
}

describe.skipIf(!existsSync(file))('smoke (minified bundle)', () => {
  it('toRaw / isReactive / caching', () => {
    const Vibe = loadVibe();
    const raw = { x: 1 };
    const s = Vibe.reactive(raw);
    expect(Vibe.isReactive(s)).toBe(true);
    expect(Vibe.toRaw(s)).toBe(raw);
    expect(Vibe.reactive(raw)).toBe(s);
  });

  it('reactivity + mount work end-to-end', async () => {
    const Vibe = loadVibe();
    document.body.innerHTML = '<div id="app"></div>';
    const app = Vibe.createApp({
      template: '<p>{{ sensor.temperature }}</p>',
      data: () => ({ sensor: { temperature: 20 } })
    });
    const inst = app.mount('#app');
    expect(document.querySelector('#app p')!.textContent).toBe('20');

    inst.data.sensor.temperature = 25;
    await Vibe.nextTick();
    expect(document.querySelector('#app p')!.textContent).toBe('25');
  });

  it('v-for + array mutation in bundle', async () => {
    const Vibe = loadVibe();
    document.body.innerHTML = '<div id="app"></div>';
    const app = Vibe.createApp({
      template: '<ul><li v-for="item in items">{{ item }}</li></ul>',
      data: () => ({ items: ['a'] })
    });
    const inst = app.mount('#app');
    expect(document.querySelectorAll('#app li').length).toBe(1);

    inst.data.items.push('b');
    await Vibe.nextTick();
    expect(document.querySelectorAll('#app li').length).toBe(2);
  });
});
