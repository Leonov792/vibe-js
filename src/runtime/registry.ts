import type { ComponentOptions } from './instance';

const registry: Record<string, ComponentOptions> = {};

export function registerComponent(name: string, def: ComponentOptions): void {
  registry[name.toLowerCase()] = def;
}

export function resolveComponent(name: string): ComponentOptions | undefined {
  return registry[name.toLowerCase()];
}
