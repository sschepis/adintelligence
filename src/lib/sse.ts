// Shared SSE helpers for streaming edge-function responses.
import { supabase } from "@/integrations/supabase/client";

export interface SseEvent {
  event: string;
  data: any;
}

/**
 * Open an SSE stream against a Supabase edge function and dispatch each
 * parsed event to `onEvent`. Resolves when the stream ends.
 */
export async function streamEdgeFunction(opts: {
  functionName: string;
  body: unknown;
  signal?: AbortSignal;
  onEvent: (evt: SseEvent) => void;
}): Promise<void> {
  const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/${opts.functionName}`;
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(apikey ? { apikey } : {}),
    },
    body: JSON.stringify(opts.body),
    signal: opts.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Edge function ${opts.functionName} failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIndex: number;
    while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      const parsed = parseSseEvent(rawEvent);
      if (parsed) opts.onEvent(parsed);
    }
  }
}

function parseSseEvent(raw: string): SseEvent | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith(":")) continue;
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  const dataStr = dataLines.join("\n");
  try {
    return { event, data: JSON.parse(dataStr) };
  } catch {
    return { event, data: dataStr };
  }
}
