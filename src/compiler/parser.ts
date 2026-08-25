export function parseTemplate(
  source: string | HTMLTemplateElement | DocumentFragment
): DocumentFragment {
  if (typeof source === 'string') {
    const tpl = document.createElement('template');
    tpl.innerHTML = source;
    return tpl.content;
  }
  if (source instanceof HTMLTemplateElement) return source.content;
  return source as DocumentFragment;
}

const W = 'with(s){';

export function compileExpr(expr: string): (s: any) => any {
  return new Function('s', W + 'return(' + expr + ')}') as (s: any) => any;
}

export function compileHandler(expr: string): (s: any, e: any) => void {
  const t = expr.trim();
  const body = /^[A-Za-z_$][\w$]*$/.test(t) ? t + '(e)' : expr;
  return new Function('s', 'e', W + body + '}') as (s: any, e: any) => void;
}

export function compileAssignment(expr: string): (s: any, v: any) => void {
  return new Function('s', 'v', W + expr + '=v}') as (s: any, v: any) => void;
}

export function parseInterpolation(
  text: string
): { static: string[]; exprs: string[] } | null {
  const re = /\{\{((?:.|\n|\r)+?)\}\}/g;
  const parts: string[] = [];
  const exprs: string[] = [];
  let last = 0;
  let found = false;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    found = true;
    parts.push(text.slice(last, m.index));
    exprs.push(m[1].trim());
    last = m.index + m[0].length;
  }
  if (!found) return null;
  parts.push(text.slice(last));
  return { static: parts, exprs: exprs };
}

export function toDisplay(v: any): string {
  return v === null || v === undefined ? '' : String(v);
}
