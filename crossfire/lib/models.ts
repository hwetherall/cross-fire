// VERIFY: Check https://openrouter.ai/models for current model strings before first deploy

export const MODELS = {
  'opus-4.6': {
    id: 'anthropic/claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    bestFor: 'Nuanced strategic defense (Blue Team)',
    costTier: 'high' as const,
  },
  'gpt-5.4': {
    id: 'openai/gpt-5.4',
    name: 'GPT-5.4',
    provider: 'OpenAI',
    bestFor: 'Sharp analytical critique (Red Team)',
    costTier: 'high' as const,
  },
  'gemini-pro-3.1': {
    id: 'google/gemini-pro-3.1',
    name: 'Gemini Pro 3.1',
    provider: 'Google',
    bestFor: 'Broad knowledge, fact-checking',
    costTier: 'medium' as const,
  },
} as const;

export type ModelKey = keyof typeof MODELS;

export const DEFAULT_PAIRING = {
  redTeam: 'gpt-5.4' as ModelKey,
  blueTeam: 'opus-4.6' as ModelKey,
};

export function getModelId(key: string): string {
  if (key in MODELS) {
    return MODELS[key as ModelKey].id;
  }
  // Allow passing raw OpenRouter model IDs directly
  return key;
}
