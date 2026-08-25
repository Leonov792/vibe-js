export { createApp } from './runtime/app';
export { registerComponent, resolveComponent } from './runtime/registry';
export { reactive, toRaw, isReactive, observe } from './reactivity/reactive';
export { effect, stop, nextTick } from './reactivity/dep';
export { ref, computed } from './reactivity/ref';
export type { ComponentOptions, Instance } from './runtime/instance';
