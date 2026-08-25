import { reactive } from '../reactivity/reactive';
import { computed } from '../reactivity/ref';
import { effect, Effect } from '../reactivity/dep';

const dp = Object.defineProperty;
const doc = document;

export interface ComponentOptions {
  template?: string | HTMLTemplateElement;
  data?: (() => object) | object;
  methods?: Record<string, (this: any, ...args: any[]) => any>;
  computed?: Record<string, (this: any) => any>;
  watch?: Record<string, (this: any, newVal: any, oldVal: any) => void>;
  onMounted?: (this: any) => void;
  onBeforeUnmount?: (this: any) => void;
}

export interface Instance {
  data: any;
  computed: Record<string, any>;
  methods: Record<string, (...args: any[]) => any>;
  ctx: any;
  effects: Effect[];
  el: Element | null;
  def: ComponentOptions;
}

function emitEvent(el: Element, name: string, detail: any) {
  let ev: any;
  if (typeof CustomEvent === 'function') {
    ev = new CustomEvent(name, { detail: detail, bubbles: true });
  } else {
    ev = doc.createEvent('CustomEvent');
    ev.initCustomEvent(name, true, false, detail);
  }
  el.dispatchEvent(ev);
}

export function createInstance(def: ComponentOptions): Instance {
  const rawData = typeof def.data === 'function' ? def.data() : def.data || {};
  const dataProxy: any = reactive(rawData as object);

  const instance: Instance = {
    data: dataProxy,
    computed: {},
    methods: {},
    ctx: null as any,
    effects: [],
    el: null,
    def
  };

  const ctx: any = {};
  Object.keys(dataProxy).forEach((k) => {
    dp(ctx, k, {
      get() {
        return dataProxy[k];
      },
      set(v) {
        dataProxy[k] = v;
      },
      enumerable: true,
      configurable: true
    });
  });

  if (def.computed) {
    Object.keys(def.computed).forEach((k) => {
      const c = computed(() => def.computed![k].call(ctx));
      instance.computed[k] = c;
      dp(ctx, k, {
        get() {
          return c.value;
        },
        enumerable: true,
        configurable: true
      });
    });
  }

  if (def.methods) {
    Object.keys(def.methods).forEach((k) => {
      const fn = function (...args: any[]) {
        return def.methods![k].apply(ctx, args);
      };
      instance.methods[k] = fn;
      ctx[k] = fn;
    });
  }

  ctx.$emit = function (name: string, detail?: any) {
    if (this.el) emitEvent(this.el, name, detail);
  };

  instance.ctx = ctx;

  if (def.watch) {
    Object.keys(def.watch).forEach((k) => {
      let oldVal: any;
      let first = true;
      effect(() => {
        const newVal = dataProxy[k];
        if (first) {
          first = false;
          oldVal = newVal;
          return;
        }
        if (newVal === oldVal) return;
        const prev = oldVal;
        oldVal = newVal;
        def.watch![k].call(ctx, newVal, prev);
      });
    });
  }

  return instance;
}
