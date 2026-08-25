import { effect, Effect, stop } from '../reactivity/dep';
import { createInstance } from '../runtime/instance';
import { resolveComponent } from '../runtime/registry';
import {
  parseTemplate,
  compileExpr,
  compileHandler,
  compileAssignment,
  parseInterpolation,
  toDisplay
} from './parser';
import { processDirectives } from './directives';

const doc = document;
const slice = Array.prototype.slice;

export interface CompileContext {
  resolve?: (tag: string) => any;
}

export function mountFragment(
  frag: DocumentFragment,
  container: Node,
  scope: any,
  effects: Effect[],
  ctx: CompileContext
) {
  const children = slice.call(frag.childNodes);
  for (let i = 0; i < children.length; i++) {
    mountNode(children[i], container, scope, effects, ctx);
  }
}

function mountNode(
  node: any,
  container: Node,
  scope: any,
  effects: Effect[],
  ctx: CompileContext
) {
  if (node.nodeType === 1) {
    mountElement(node as Element, container, scope, effects, ctx);
  } else if (node.nodeType === 3) {
    mountText(node as Text, container, scope, effects);
  } else {
    container.appendChild(node);
  }
}

function mountText(node: Text, container: Node, scope: any, effects: Effect[]) {
  const parsed = parseInterpolation(node.nodeValue || '');
  if (!parsed) {
    container.appendChild(node);
    return;
  }
  const fns: ((scope: any) => any)[] = [];
  for (let i = 0; i < parsed.exprs.length; i++) fns.push(compileExpr(parsed.exprs[i]));
  const text = doc.createTextNode('');
  effects.push(
    effect(() => {
      let s = parsed.static[0];
      for (let i = 0; i < fns.length; i++) {
        s += toDisplay(fns[i](scope)) + parsed.static[i + 1];
      }
      text.data = s;
    })
  );
  const parent = node.parentNode;
  if (parent) parent.replaceChild(text, node);
  else container.appendChild(text);
}

function mountElement(
  el: Element,
  container: Node,
  scope: any,
  effects: Effect[],
  ctx: CompileContext
) {
  if (el.hasAttribute('v-if')) {
    const cond = el.getAttribute('v-if') || 'true';
    el.removeAttribute('v-if');
    const parent = el.parentNode;
    if (parent) parent.removeChild(el);
    const show = compileExpr(cond);
    const anchor = doc.createComment('v-if');
    container.appendChild(anchor);
    mountElementBody(el, scope, effects, ctx);
    let inserted = false;
    effects.push(
      effect(() => {
        if (show(scope)) {
          if (!inserted) {
            container.insertBefore(el, anchor);
            inserted = true;
          }
        } else if (inserted) {
          container.removeChild(el);
          inserted = false;
        }
      })
    );
    return;
  }

  if (el.hasAttribute('v-for')) {
    mountFor(el, container, scope, effects, ctx);
    return;
  }

  mountElementBody(el, scope, effects, ctx);
  container.appendChild(el);
}

function mountElementBody(el: Element, scope: any, effects: Effect[], ctx: CompileContext) {
  const tag = el.tagName.toLowerCase();
  if (ctx.resolve && ctx.resolve(tag)) {
    mountComponentElement(el, scope, effects, ctx);
    return;
  }
  processDirectives(el, scope, effects);
  const children = slice.call(el.childNodes);
  for (let i = 0; i < children.length; i++) {
    mountNode(children[i], el, scope, effects, ctx);
  }
}

function mountFor(
  el: Element,
  container: Node,
  scope: any,
  effects: Effect[],
  ctx: CompileContext
) {
  const expr = el.getAttribute('v-for') || '';
  el.removeAttribute('v-for');
  const parent = el.parentNode;
  if (parent) parent.removeChild(el);
  const anchor = doc.createComment('v-for');
  container.appendChild(anchor);

  const match = /^\s*(.+?)\s+in\s+(.+?)\s*$/.exec(expr);
  if (!match) return;

  const left = match[1].trim();
  let itemName = left;
  let indexName = '';
  const comma = left.indexOf(',');
  if (comma !== -1) {
    itemName = left.slice(0, comma).trim();
    indexName = left.slice(comma + 1).trim();
  }
  const listExpr = compileExpr(match[2].trim());

  let itemEffects: Effect[] = [];
  let inserted: Node[] = [];

  effects.push(
    effect(() => {
      const list = listExpr(scope) || [];

      for (let i = 0; i < itemEffects.length; i++) stop(itemEffects[i]);
      itemEffects = [];

      for (let i = 0; i < inserted.length; i++) {
        const n = inserted[i];
        if (n.parentNode) n.parentNode.removeChild(n);
      }
      inserted = [];

      for (let i = 0; i < list.length; i++) {
        const itemScope = createItemScope(scope, itemName, list[i], indexName, i);
        const clone = el.cloneNode(true) as Element;
        const ieff: Effect[] = [];
        mountElement(clone, container, itemScope, ieff, ctx);
        inserted.push(clone);
        for (let j = 0; j < ieff.length; j++) itemEffects.push(ieff[j]);
      }

      for (let i = 0; i < inserted.length; i++) {
        container.insertBefore(inserted[i], anchor);
      }
    })
  );
}

function createItemScope(
  parent: any,
  itemName: string,
  item: any,
  indexName: string,
  index: number
) {
  const scope = Object.create(parent);
  Object.defineProperty(scope, itemName, {
    get() {
      return item;
    },
    set() {},
    enumerable: true,
    configurable: true
  });
  if (indexName) {
    Object.defineProperty(scope, indexName, {
      value: index,
      enumerable: true,
      configurable: true
    });
  }
  return scope;
}

function mountComponentElement(el: Element, scope: any, effects: Effect[], ctx: CompileContext) {
  const def = ctx.resolve!(el.tagName.toLowerCase());
  const child = createInstance(def);
  child.el = el;
  child.ctx.el = el;
  bindComponentProps(el, child, scope, effects);

  const frag = parseTemplate(def.template);
  const childEffects: Effect[] = [];
  mountFragment(frag, el, child.ctx, childEffects, ctx);
  child.effects = childEffects;
  for (let i = 0; i < childEffects.length; i++) effects.push(childEffects[i]);
}

function bindComponentProps(el: Element, child: any, scope: any, effects: Effect[]) {
  const attrs: Attr[] = [];
  for (let i = 0; i < el.attributes.length; i++) attrs.push(el.attributes[i]);

  for (let a = 0; a < attrs.length; a++) {
    const name = attrs[a].name;
    const value = attrs[a].value;

    if (name === 'v-model') {
      const read = compileExpr(value);
      const write = compileAssignment(value);
      effects.push(
        effect(() => {
          child.data.value = read(scope);
        })
      );
      const onEvent = (e: any) => {
        const detail = e.detail !== undefined ? e.detail : e.target ? e.target.value : undefined;
        write(scope, detail);
      };
      el.addEventListener('input', onEvent);
      el.addEventListener('change', onEvent);
      el.removeAttribute(name);
    } else if (name.indexOf('v-on:') === 0) {
      const eventName = name.slice(5);
      const handler = compileHandler(value);
      el.removeAttribute(name);
      el.addEventListener(eventName, (e) => handler(scope, e));
    } else if (name.charAt(0) === ':' || name.indexOf('v-bind:') === 0) {
      const prop = name.charAt(0) === ':' ? name.slice(1) : name.slice(7);
      const read = compileExpr(value);
      el.removeAttribute(name);
      effects.push(
        effect(() => {
          child.data[prop] = read(scope);
        })
      );
    } else if (name !== 'class' && name !== 'id' && name !== 'style') {
      const cur = child.data[name];
      const numeric = typeof cur === 'number' && value !== '' && !isNaN(Number(value));
      child.data[name] = numeric ? Number(value) : value;
      el.removeAttribute(name);
    }
  }
}
