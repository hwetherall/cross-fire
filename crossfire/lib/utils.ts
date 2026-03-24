import { jsonrepair } from 'jsonrepair';

/**
 * Strip markdown code fences from LLM output.
 * Models often wrap JSON in ```json ... ``` blocks.
 */
export function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();

  // Remove ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Also handle case where there's preamble text before the JSON
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  return cleaned;
}

/**
 * Parse LLM output as JSON with repair and cleaning.
 */
export function parseLLMJson(raw: string): unknown {
  const cleaned = stripMarkdownFences(raw);
  const repaired = jsonrepair(cleaned);
  return JSON.parse(repaired);
}
