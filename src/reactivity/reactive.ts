import { createDep, track, trigger } from './dep';

const dp = Object.defineProperty;
const isArr = Array.isArray;

function isObject(v: any): boolean {
  return v !== null && typeof v === 'object';
}

export function reactive<T>(target: T): T {
  if (!isObject(target)) return target;
  if ((target as any)['_o']) return (target as any)['_o'];
  if ((target as any)['_r']) return target;
  return isArr(target) ? (makeArray(target as any) as any) : (makeObj(target as any) as any);
}

function trackChild(value: any) {
  if (value && value['_d']) track(value['_d']);
}

function makeObj(target: any): any {
  const proxy: any = {};
  dp(proxy, '_r', { value: target });
  dp(proxy, '_d', { value: createDep() });
  dp(target, '_o', { value: proxy });

  Object.keys(target).forEach((key) => {
    let value = observe(target[key]);
    const dep = createDep();
    dp(proxy, key, {
      enumerable: true,
      configurable: true,
      get() {
        track(dep);
        trackChild(value);
        return value;
      },
      set(v) {
        if (v === value) return;
        value = observe(v);
        trigger(dep);
      }
    });
  });
  return proxy;
}

function makeArray(target: any[]): any[] {
  const dep = createDep();
  dp(target, '_r', { value: target });
  dp(target, '_o', { value: target });
  dp(target, '_d', { value: dep });

  for (let i = 0; i < target.length; i++) target[i] = observe(target[i]);

  'push,pop,shift,unshift,splice,sort,reverse'.split(',').forEach((m) => {
    const orig = (target as any)[m];
    dp(target, m, {
      value: function () {
        const r = orig.apply(this, arguments);
        trigger(dep);
        return r;
      }
    });
  });
  return target;
}

export function observe(value: any): any {
  return isObject(value) ? reactive(value) : value;
}

export function toRaw(value: any): any {
  return value && value['_r'] ? value['_r'] : value;
}

export function isReactive(value: any): boolean {
  return !!(value && value['_r']);
}
