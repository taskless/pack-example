// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference lib="es2021" />

/*
Each export here must also be an export inside of your src/index.ts file.
Extism layers this defintion on top opf your exports in order to create
a map of function names to memory addresses.

Failure to keep this in sync results in calling functions that do not
exist, or calling one function and getting the result of another function.
*/

declare module "main" {
  export function pre(): I32;
  export function post(): I32;
  export function chunk(): I32;
}
