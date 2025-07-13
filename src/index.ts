import { readInput, writeOutput } from "./helpers.js";
import { manifest } from "./manifest.js";

/** left as an example of passing context into outputs */
type Context = {
  fromPre: string;
  currentChunk?: string;
  lines?: string[];
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
    },
  });
}

/**
 * chunk() is called for each chunk of the response body
 * it's data is base64 encoded
 */
export function chunk() {
  const input = readInput<Context>();
  const chunk = input.chunk;

  if (!chunk) {
    return;
  }

  // take base64 encoded chunk and decode it
  const decoder = new TextDecoder("utf8");
  const decodedChunk = decoder.decode(Host.base64ToArrayBuffer(chunk));
  const current = (input.context.currentChunk ?? "") + decodedChunk;

  // if no newlines, save the current chunk and return
  if (!current.includes("\n")) {
    writeOutput<Context>({
      context: {
        currentChunk: current,
      },
    });

    return;
  }

  // split the current chunk by newlines, add to the context lines
  const lines = (input.context.lines ?? [])
    .concat(current.split("\n"))
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // save the lines and reset the current chunk
  writeOutput<Context>({
    context: {
      currentChunk: "",
      lines,
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

  writeOutput<Context>({
    capture: {
      // hardcoded capture in post lifecycle
      testPost: "test_post_value",
      // explicit capture from the prior context
      testPostFromPre: input.context.fromPre,
      testResponseData: responseDataC,
      testChunk: input.context.lines?.join("~~~"),
    },
  });
}
