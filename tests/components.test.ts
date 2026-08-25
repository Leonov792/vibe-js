import { describe, it, expect } from 'vitest';
import { createApp } from '../src/index';
import '../src/components/toggle';
import '../src/components/chart';
import { nextTick } from '../src/reactivity/dep';

describe('components', () => {
  it('vibe-toggle v-model', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const app = createApp({
      template: '<vibe-toggle v-model="on" label="Power"></vibe-toggle>',
      data: () => ({ on: false })
    });
    const inst = app.mount('#app');

    const btn = document.querySelector('#app .vibe-toggle')!;
    expect(btn.textContent).toContain('Power');

    btn.dispatchEvent(new Event('click'));
    await nextTick();
    expect(inst.data.on).toBe(true);
  });

  it('vibe-chart renders points from data', () => {
    document.body.innerHTML = '<div id="app"></div>';
    createApp({
      template: '<vibe-chart v-bind:data="history"></vibe-chart>',
      data: () => ({ history: [10, 20, 30] })
    }).mount('#app');
    const polyline = document.querySelector('#app .vibe-chart__line')!;
    expect(polyline.getAttribute('points')).toBe('0.0,80.0 100.0,40.0 200.0,0.0');
  });
});
