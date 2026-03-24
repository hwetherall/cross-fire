import type { Objection } from './types';

/**
 * Run web searches for objections flagged as requiring search verification.
 * Uses Tavily API. Returns formatted search results or null if no API key.
 */
export async function runSearches(objections: Objection[]): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn('TAVILY_API_KEY not set — skipping web search');
    return null;
  }

  const searchItems = objections.filter((o) => o.requiresSearch);
  if (searchItems.length === 0) return null;

  const results: string[] = [];

  for (const item of searchItems) {
    try {
      const query = `${item.quote} ${item.objection}`.slice(0, 400);
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: 'basic',
          max_results: 3,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        console.warn(`Tavily search failed for ${item.id}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const formattedResults = data.results
        ?.map(
          (r: { title: string; url: string; content: string }) =>
            `- **${r.title}** (${r.url}): ${r.content}`
        )
        .join('\n');

      if (formattedResults) {
        results.push(`### Search for objection ${item.id}\nQuery: "${query}"\n${formattedResults}`);
      }
    } catch (err) {
      console.warn(`Search error for ${item.id}:`, err);
    }
  }

  return results.length > 0 ? results.join('\n\n') : null;
}
