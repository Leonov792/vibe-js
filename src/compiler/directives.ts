import { effect, Effect } from '../reactivity/dep';
import {
  compileExpr,
  compileHandler,
  compileAssignment,
  parseInterpolation,
  toDisplay
} from './parser';

export function processDirectives(el: Element, scope: any, effects: Effect[]) {
  const attrs: Attr[] = [];
  for (let i = 0; i < el.attributes.length; i++) attrs.push(el.attributes[i]);

  for (let a = 0; a < attrs.length; a++) {
    const name = attrs[a].name;
    const value = attrs[a].value;

    if (name.indexOf('v-on:') === 0) {
      const eventName = name.slice(5);
      const handler = compileHandler(value);
      el.removeAttribute(name);
      el.addEventListener(eventName, (e) => handler(scope, e));
    } else if (name === 'v-model') {
      el.removeAttribute(name);
      applyModel(el, value, scope, effects);
    } else if (name.charAt(0) === ':' || name.indexOf('v-bind:') === 0) {
      const attr = name.charAt(0) === ':' ? name.slice(1) : name.slice(7);
      if (attr === 'class') {
        const base = el.getAttribute('class') || '';
        const read = compileExpr(value);
        el.removeAttribute(name);
        effects.push(effect(() => el.setAttribute('class', mergeClass(base, read(scope)))));
      } else {
        const read = compileExpr(value);
        el.removeAttribute(name);
        effects.push(effect(() => setAttribute(el, attr, read(scope))));
      }
    } else {
      const parsed = parseInterpolation(value);
      if (parsed) {
        const fns: ((scope: any) => any)[] = [];
        for (let i = 0; i < parsed.exprs.length; i++) fns.push(compileExpr(parsed.exprs[i]));
        el.removeAttribute(name);
        effects.push(
          effect(() => {
            let s = parsed.static[0];
            for (let i = 0; i < fns.length; i++) {
              s += toDisplay(fns[i](scope)) + parsed.static[i + 1];
            }
            el.setAttribute(name, s);
          })
        );
      }
    }
  }
}

function applyModel(el: Element, expr: string, scope: any, effects: Effect[]) {
  const read = compileExpr(expr);
  const write = compileAssignment(expr);
  const tag = el.tagName.toLowerCase();

  if (tag === 'input' && (el as any).type === 'checkbox') {
    effects.push(effect(() => ((el as any).checked = !!read(scope))));
    el.addEventListener('change', (e) => write(scope, (e.target as any).checked));
  } else if (tag === 'select') {
    effects.push(effect(() => ((el as any).value = read(scope))));
    el.addEventListener('change', (e) => write(scope, (e.target as any).value));
  } else {
    effects.push(effect(() => ((el as any).value = read(scope))));
    el.addEventListener('input', (e) => write(scope, (e.target as any).value));
  }
}

function setAttribute(el: Element, attr: string, v: any) {
  if (v === false || v === null || v === undefined) {
    el.removeAttribute(attr);
    return;
  }
  if (attr === 'value' && 'value' in el) {
    (el as any).value = v;
    return;
  }
  el.setAttribute(attr, v === true ? '' : String(v));
}

function mergeClass(base: string, v: any): string {
  if (v === null || v === undefined || v === false) return base;
  if (typeof v === 'string') return base ? base + ' ' + v : v;
  if (Array.isArray(v)) {
    let out = base;
    for (let i = 0; i < v.length; i++) out = mergeClass(out, v[i]);
    return out;
  }
  if (typeof v === 'object') {
    let extra = '';
    for (const k in v) if (v[k]) extra += (extra ? ' ' : '') + k;
    return base ? (extra ? base + ' ' + extra : base) : extra;
  }
  return base;
}
