import { describe, it, expect, vi } from 'vitest';
import { reactive, toRaw, isReactive } from '../src/reactivity/reactive';
import { effect, nextTick } from '../src/reactivity/dep';
import { ref, computed } from '../src/reactivity/ref';

describe('reactivity', () => {
  it('tracks and triggers', async () => {
    const state = reactive({ count: 0 });
    const spy = vi.fn();
    effect(() => spy(state.count));
    expect(spy).toHaveBeenCalledTimes(1);

    state.count = 5;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(5);
  });

  it('batches multiple updates into one run', async () => {
    const state = reactive({ a: 1, b: 2 });
    const spy = vi.fn();
    effect(() => spy(state.a + state.b));
    expect(spy).toHaveBeenCalledTimes(1);

    state.a = 10;
    state.b = 20;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(30);
  });

  it('supports nested reactivity', async () => {
    const state = reactive({ sensor: { temperature: 20 } });
    const spy = vi.fn();
    effect(() => spy(state.sensor.temperature));

    state.sensor.temperature = 25;
    await nextTick();
    expect(spy).toHaveBeenLastCalledWith(25);
  });

  it('ref and computed', async () => {
    const a = ref(2);
    const b = ref(3);
    const c = computed(() => a.value + b.value);
    const spy = vi.fn();
    effect(() => spy(c.value));

    expect(c.value).toBe(5);
    expect(spy).toHaveBeenLastCalledWith(5);

    a.value = 10;
    await nextTick();
    expect(c.value).toBe(13);
    expect(spy).toHaveBeenLastCalledWith(13);
  });

  it('array mutation triggers', async () => {
    const state = reactive({ arr: [1, 2, 3] });
    const spy = vi.fn();
    effect(() => spy(state.arr.length));

    state.arr.push(4);
    await nextTick();
    expect(spy).toHaveBeenLastCalledWith(4);
  });

  it('toRaw and isReactive', () => {
    const raw = { x: 1 };
    const state = reactive(raw);
    expect(isReactive(state)).toBe(true);
    expect(toRaw(state)).toBe(raw);
  });
});
