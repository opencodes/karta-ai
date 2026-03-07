import type { KartaModule, PromptDefinition } from '../types.js';

export function buildPromptRegistry(modules: KartaModule[]): Map<string, PromptDefinition> {
  const registry = new Map<string, PromptDefinition>();

  for (const moduleDef of modules) {
    for (const prompt of moduleDef.prompts ?? []) {
      registry.set(prompt.id, prompt);
    }
  }

  return registry;
}
