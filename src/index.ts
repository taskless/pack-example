import { readInput, writeOutput } from "./helpers.js";
import { manifest } from "./manifest.js";

/** left as an example of passing context into outputs */
type Context = {
  fromPre: string;
  currentChunk?: string;
  lines: number;
};

/**
 * pre() is called before the request is sent to the host
 */
export function pre() {
  const input = readInput();

  // your defaults are not available in input, only values that come
  // from the taskless loader (read from taskless.io)
  const testFieldConfigurationValue =
    (input.configuration?.testField as string | undefined) ??
    manifest.fields.find((f) => f.name === "testField")?.default ??
    undefined;

  // you can use the request object to capture data from the request
  // and pass it to the telemetry system
  writeOutput<Context>({
    capture: {
      // explicit capture from request
      url: input.request.url,
      // config values exist
      testField: testFieldConfigurationValue,
      // hardcoded capture
      testPre: "test_pre_value",
    },
    context: {
      // setting context to be used in post
      fromPre: "from_pre_context_value",
      lines: 0, // used for tracking lines received in chunk
    },
  });
}

/**
 * chunk() is called for each chunk of the response body
 * it's data is base64 encoded
 *
 * This chunk() is looking for newlines, which are a sign of
 * Server-Sent Events (SSE) or similar streaming responses.
 */
export function chunk() {
  const input = readInput<Context>();
  const chunk = input.chunk;

  // handle any received chunks in SSE format
  if (chunk) {
    const decoder = new TextDecoder("utf8");
    const decodedChunk = decoder.decode(Host.base64ToArrayBuffer(chunk));
    const current = (input.context.currentChunk ?? "") + decodedChunk;

    // if it does not contain a pair of newlines, put it back and return
    if (!current.includes("\n\n")) {
      writeOutput<Context>({
        context: {
          currentChunk: current,
        },
      });
    }

    const lines = current.split("\n\n");
    const nextChunk = lines.pop() ?? "";
    const payloads: Record<string, string> = {};
    for (const [index, line] of lines.entries()) {
      const key = `chunk${input.context.lines + index + 1}`;
      payloads[key] = line;
    }

    writeOutput<Context>({
      context: {
        currentChunk: nextChunk,
        lines: input.context.lines + lines.length,
      },
      capture: {
        // capture the payloads received in this chunk
        ...payloads,
      },
    });

    return;
  }

  // post stream. the current chunk is our last capture
  const captureKey = `chunk${input.context.lines + 1}`;
  const lastChunk =
    (input.context.currentChunk?.length ?? 0) > 0
      ? input.context.currentChunk
      : undefined;
  writeOutput<Context>({
    context: {
      currentChunk: "",
      lines: 0,
    },
    capture: {
      // capture the last chunk received
      [captureKey]: lastChunk,
    },
  });
}

/**
 * post() is called after the request is sent to the host
 * and contains the response body
 */
export function post() {
  const input = readInput<Context, unknown, { c: number; d: number }>();

  const responseDataC = input.response?.body?.c;

  const lastChunk = input.context.currentChunk;
  const hasLastChunk = lastChunk && lastChunk.length > 0;

  writeOutput<Context>({
    capture: {
      // hardcoded capture in post lifecycle
      testPost: "test_post_value",
      // explicit capture from the prior context
      testPostFromPre: input.context.fromPre,
      testResponseData: responseDataC,
    },
  });
}
