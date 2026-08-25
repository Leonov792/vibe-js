import { createDep, track, trigger, effect } from './dep';

export interface Ref<T> {
  value: T;
}

export function ref<T>(value: T): Ref<T> {
  const dep = createDep();
  return {
    get value(): T {
      track(dep);
      return value;
    },
    set value(v: T) {
      if (v === value) return;
      value = v;
      trigger(dep);
    }
  };
}

export function computed<T>(getter: () => T): Ref<T> {
  let value: any;
  let dirty = true;
  const dep = createDep();
  const run = effect(
    () => {
      value = getter();
      dirty = false;
      trigger(dep);
    },
    true,
    () => {
      dirty = true;
      trigger(dep);
    }
  );
  return {
    get value(): T {
      if (dirty) run();
      track(dep);
      return value;
    }
  };
}
