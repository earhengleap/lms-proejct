// app/api/comments/sse/route.ts

// File: app/api/comments/sse/route.ts

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const chapterId = req.nextUrl.searchParams.get('chapterId');

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Keep the connection alive
      const interval = setInterval(() => {
        sendEvent('ping');
      }, 15000);

      // Store the connection
      const connectionId = Date.now().toString();
      (global as any).connections = (global as any).connections || {};
      (global as any).connections[connectionId] = sendEvent;

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        delete (global as any).connections[connectionId];
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}