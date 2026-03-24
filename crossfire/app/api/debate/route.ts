import { NextRequest } from 'next/server';
import { DebateConfigSchema } from '@/lib/schemas';
import { runDebate } from '@/lib/orchestrator';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = DebateConfigSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { error: 'Invalid request body', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const config = parseResult.data;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send heartbeat pings every 15s to keep the connection alive
        // while waiting for LLM responses
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: 'heartbeat' }) + '\n')
            );
          } catch {
            // Stream already closed
            clearInterval(heartbeat);
          }
        }, 15_000);

        try {
          for await (const event of runDebate(config)) {
            const chunk = JSON.stringify(event) + '\n';
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          const errorChunk =
            JSON.stringify({ type: 'error', data: { message: errorMsg } }) + '\n';
          controller.enqueue(encoder.encode(errorChunk));
        } finally {
          clearInterval(heartbeat);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}
