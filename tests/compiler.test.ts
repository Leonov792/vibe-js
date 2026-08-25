import { describe, it, expect } from 'vitest';
import { createApp } from '../src/index';
import { nextTick } from '../src/reactivity/dep';

describe('compiler', () => {
  it('renders interpolation', () => {
    document.body.innerHTML = '<div id="app"></div>';
    createApp({
      template: '<p>Temp: {{ sensor.temperature }}°C</p>',
      data: () => ({ sensor: { temperature: 20 } })
    }).mount('#app');
    expect(document.querySelector('#app p')!.textContent).toBe('Temp: 20°C');
  });

  it('updates on reactive change', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const app = createApp({
      template: '<p>{{ count }}</p>',
      data: () => ({ count: 0 })
    });
    const inst = app.mount('#app');
    inst.data.count = 5;
    await nextTick();
    expect(document.querySelector('#app p')!.textContent).toBe('5');
  });

  it('v-on click handler', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    createApp({
      template: '<button v-on:click="inc">{{ count }}</button>',
      data: () => ({ count: 0 }),
      methods: { inc() { this.count++; } }
    }).mount('#app');
    const btn = document.querySelector('#app button')!;
    btn.dispatchEvent(new Event('click'));
    await nextTick();
    expect(btn.textContent).toBe('1');
  });

  it('v-if toggles visibility', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const app = createApp({
      template: '<div><p v-if="show">hello</p></div>',
      data: () => ({ show: false })
    });
    const inst = app.mount('#app');
    expect(document.querySelector('#app p')).toBeNull();

    inst.data.show = true;
    await nextTick();
    expect(document.querySelector('#app p')!.textContent).toBe('hello');
  });

  it('v-for renders a list', () => {
    document.body.innerHTML = '<div id="app"></div>';
    createApp({
      template: '<ul><li v-for="item in items">{{ item }}</li></ul>',
      data: () => ({ items: ['a', 'b', 'c'] })
    }).mount('#app');
    const lis = document.querySelectorAll('#app li');
    expect(lis.length).toBe(3);
    expect(lis[1].textContent).toBe('b');
  });

  it('v-for updates on array mutation', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const app = createApp({
      template: '<ul><li v-for="item in items">{{ item }}</li></ul>',
      data: () => ({ items: ['a'] })
    });
    const inst = app.mount('#app');
    expect(document.querySelectorAll('#app li').length).toBe(1);

    inst.data.items.push('b');
    await nextTick();
    expect(document.querySelectorAll('#app li').length).toBe(2);
  });

  it('v-model two-way binding', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const app = createApp({
      template: '<input v-model="text">',
      data: () => ({ text: 'hi' })
    });
    const inst = app.mount('#app');
    const input = document.querySelector('#app input')! as HTMLInputElement;
    expect(input.value).toBe('hi');

    input.value = 'yo';
    input.dispatchEvent(new Event('input'));
    await nextTick();
    expect(inst.data.text).toBe('yo');
  });
});
