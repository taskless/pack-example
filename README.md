# Taskless Example Pack

> This repository is a work in progress

Curious aboout how Taskless Packs work with WebAssembly? This project is a node.js / JavaScript version of a Taskless Pack, but doubles as a reference implementation for building Taskless Packs in other languages.

# How Taskless Packs Work

More information is available in the [Taskless Pack Documentation](https://docs.taskless.io/advanced/pack-architecture/), but the process can be summarized as follows:

1. The Taskless Loader is language specific and is designed to intercept calls to third party services from within your application.
2. On every call to a third party service, the Taskless Loader will run your loaded collection of Packs against the request and response.
3. The request and response are passed transparently to your service and application

- Packs cannot make external requests or access the disk, and are fully sandbox by default
- Packs can only report on aspects of the request and response, including headers, body, and metadata
- In the background, this metadata captured by Packs is sent to either the Taskless Cloud or your console depending on your Taskless configuration

This scaffold includes:

- A model example for WebAssembly Packs on taskless.io
- Manifest example including enabling body capture
- Build commands using Extism to create the WebAssembly Pack
- Sample commands in package.json for testing and publishing the Pack

# Other Languages

If you are interested in building Taskless Packs in other languages, the process is similar to the one outlined above. The main differences are:

- You will need an [Extism](https://extism.org/) Plugin Development Kit (PDK) for your language of choice. This will let you build your WebAssembly Pack. You'll need to suport a `pre` and `post` insertion point, which are called before and after the request is sent to the third party service respectively.
- We recommend using a pattern like the Manifest in this repo, as your WebAssembly module cannoyt reference back to your code as a compiled binary. This lets you easily generate a `manifest.json` while also having access to your configuration's default values if the user has not set them.

# Running Tests w/ @taskless/pack

The `@taskless/pack` package on npm provides a way to run tests against your Taskless Pack. You can use it to validate that your Pack is working as expected.

```sh
pnpx @taskless/pack test --manifest ./dist/manifest.json --wasm ./dist/pack.wasm --fixture ./test/fixture.json
```

| Option       | Description                                          |
| ------------ | ---------------------------------------------------- |
| `--manifest` | Path to the Pack's manifest file                     |
| `--wasm`     | Path to the Pack's WebAssembly binary                |
| `--fixture`  | Path to a JSON file containing a fixture for testing |

# Publishing Your Pack

The `@taskless/pack` package also provides a way to publish your Pack to the Taskless Cloud. If you have pack uploads enabled. You'll need your `TASKLESS_API_KEY` set in your environment variables or in a `.env` file that is readable with the `--env` option.

```sh
pnpx @taskless/pack publish --manifest ./dist/manifest.json --wasm ./dist/pack.wasm
```
