export interface Effect {
  (): void;
  _deps: Dep[];
  _dead?: boolean;
  _scheduler?: (e: Effect) => void;
}

export interface Dep {
  _subs: Effect[];
}

const effectStack: Effect[] = [];
let activeEffect: Effect | null = null;

const queue: Effect[] = [];
let flushing = false;

const queueTask: (fn: () => void) => void =
  typeof Promise !== 'undefined'
    ? (fn) => {
        Promise.resolve().then(fn);
      }
    : (fn) => {
        setTimeout(fn, 0);
      };

function flush() {
  for (;;) {
    const run = queue.splice(0, queue.length);
    if (run.length === 0) break;
    for (let i = 0; i < run.length; i++) {
      const e = run[i];
      if (e._dead) continue;
      e();
    }
  }
  flushing = false;
}

function schedule(e: Effect) {
  if (e._dead) return;
  if (e._scheduler) {
    e._scheduler(e);
    return;
  }
  if (queue.indexOf(e) === -1) queue.push(e);
  if (!flushing) {
    flushing = true;
    queueTask(flush);
  }
}

export function createDep(): Dep {
  return { _subs: [] };
}

export function track(dep: Dep) {
  if (!activeEffect) return;
  const deps = activeEffect._deps;
  if (deps.indexOf(dep) === -1) deps.push(dep);
  if (dep._subs.indexOf(activeEffect) === -1) dep._subs.push(activeEffect);
}

export function trigger(dep: Dep) {
  const subs = dep._subs.slice();
  for (let i = 0; i < subs.length; i++) schedule(subs[i]);
}

export function effect(
  fn: () => void,
  lazy?: boolean,
  scheduler?: (e: Effect) => void
): Effect {
  const run = function () {
    if (run._dead) return;
    if (effectStack.indexOf(run) !== -1) return;
    cleanup(run);
    effectStack.push(run);
    activeEffect = run;
    try {
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack.length ? effectStack[effectStack.length - 1] : null;
    }
  } as Effect;
  run._deps = [];
  run._scheduler = scheduler;
  if (!lazy) run();
  return run;
}

export function cleanup(e: Effect) {
  const deps = e._deps;
  for (let i = 0; i < deps.length; i++) {
    const d = deps[i];
    const idx = d._subs.indexOf(e);
    if (idx !== -1) d._subs.splice(idx, 1);
  }
  deps.length = 0;
}

export function stop(e: Effect) {
  e._dead = true;
  cleanup(e);
}

export function nextTick(cb?: () => void): Promise<void> {
  return new Promise<void>((resolve) => {
    queueTask(() => {
      if (cb) cb();
      resolve();
    });
  });
}
