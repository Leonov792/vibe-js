import { mountFragment } from '../compiler/compiler';
import { createInstance, Instance } from './instance';
import { parseTemplate } from '../compiler/parser';
import { Effect, stop } from '../reactivity/dep';
import { resolveComponent } from './registry';

export { registerComponent } from './registry';

function resolveElement(target: string | Element): Element {
  if (typeof target === 'string') {
    const found = document.querySelector(target);
    if (!found) throw new Error('Vibe: mount target not found: ' + target);
    return found;
  }
  return target;
}

export interface App {
  mount: (el: string | Element) => Instance;
  unmount: () => void;
}

export function createApp(options: any): App {
  let instance: Instance | null = null;

  return {
    mount(elOrSelector) {
      const el = resolveElement(elOrSelector);

      let template = options.template;
      if (!template) {
        const tplEl = el.querySelector('template');
        if (tplEl) {
          template = tplEl;
          if (tplEl.parentNode) tplEl.parentNode.removeChild(tplEl);
        }
      }
      const frag = template ? parseTemplate(template) : null;

      const inst = createInstance(options);
      inst.el = el;
      inst.ctx.el = el;

      const effects: Effect[] = [];
      if (frag) {
        mountFragment(frag, el, inst.ctx, effects, { resolve: resolveComponent });
      }
      inst.effects = effects;
      instance = inst;

      if (options.onMounted) options.onMounted.call(inst.ctx);
      return inst;
    },

    unmount() {
      if (!instance) return;
      if (instance.def.onBeforeUnmount) instance.def.onBeforeUnmount.call(instance.ctx);
      const effects = instance.effects;
      for (let i = 0; i < effects.length; i++) stop(effects[i]);
      effects.length = 0;
      if (instance.el) instance.el.innerHTML = '';
      instance = null;
    }
  };
}
