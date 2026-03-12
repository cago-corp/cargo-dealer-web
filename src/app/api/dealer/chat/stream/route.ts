import { getDealerSession } from "@/shared/auth/session";
import { fetchDealerChatStreamCursorForSession } from "@/shared/api/dealer-chat-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function encodeSseEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  const session = await getDealerSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;
  let closed = false;

  const closeStream = () => {
    if (closed) {
      return;
    }

    closed = true;

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    try {
      controllerRef?.close();
    } catch {
      return;
    }
  };

  const sendEvent = (event: string, data: unknown) => {
    if (closed || !controllerRef) {
      return;
    }

    try {
      controllerRef.enqueue(encoder.encode(encodeSseEvent(event, data)));
    } catch {
      closeStream();
    }
  };

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      let lastCursor = "";

      const run = async () => {
        if (closed) {
          return;
        }

        try {
          const snapshot = await fetchDealerChatStreamCursorForSession(session);

          if (snapshot.cursor !== lastCursor) {
            lastCursor = snapshot.cursor;
            sendEvent("sync", snapshot);
          } else {
            sendEvent("ping", { at: Date.now() });
          }
        } catch {
          sendEvent("error", { at: Date.now() });
        }
      };

      sendEvent("connected", { at: Date.now() });
      void run();

      intervalId = setInterval(() => {
        void run();
      }, 2500);
      request.signal.addEventListener("abort", closeStream, { once: true });
    },
    cancel() {
      closeStream();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
