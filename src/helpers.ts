import { type PluginOutput, type PluginInput } from "@taskless/loader";
import { type PartialDeep } from "type-fest";

export const readInput = <
  TContext extends Record<string, unknown> = Record<string, unknown>,
  TRequestBody = unknown,
  TResponseBody = unknown,
>() => {
  return JSON.parse(Host.inputString()) as PluginInput<
    TContext,
    TRequestBody,
    TResponseBody
  >;
};

export const writeOutput = <
  TContext extends Record<string, unknown> = Record<string, unknown>,
>(
  data: PartialDeep<PluginOutput<TContext>>
) => {
  Host.outputString(JSON.stringify(data));
};

export const isValidHost = (hostName: string, domains: string[]): boolean => {
  // domains contain a * as a simple wildcard for any number of characters
  // ie: *.stripe.com
  return domains.some((domain) => {
    const regex = new RegExp(
      `^${domain.replaceAll(".", "\\.").replace("*", ".*")}$`
    );
    return regex.test(hostName);
  });
};
