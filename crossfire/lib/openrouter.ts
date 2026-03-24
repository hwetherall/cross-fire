const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterCallConfig {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
}

export async function callOpenRouter(config: OpenRouterCallConfig): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Innovera Debate Engine',
    },
    body: JSON.stringify({
      model: config.model,
      messages: config.messages,
      temperature: config.temperature ?? 0.6,
      max_tokens: config.max_tokens ?? 4096,
      ...(config.jsonMode !== false ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: AbortSignal.timeout(300_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter error: ${response.status} ${body}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
