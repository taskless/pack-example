import pk from "../package.json" with { type: "json" };
import { type Manifest } from "./__generated__/manifest.js";

export const manifest = {
  schema: "pre2",
  name: "testpack",
  version: pk.version,
  description: "Test / example pack, never published to prod",
  permissions: {
    body: true, // wants access to the body of the request and response
  },
  fields: [
    {
      name: "testField",
      type: "string",
      description: "Test field that should exist in the lifecycle",
      default: "test_field_value",
    },
  ],
  charts: [],
} satisfies Manifest;
