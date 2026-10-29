# create-qingkuai

`npm create qingkuai` is now a thin forwarder: it invokes `qingkuai init` from
[`@qingkuai/cli`](https://www.npmjs.com/package/@qingkuai/cli), where the project
templates live as the single source.

```sh
# equivalent to: qingkuai init [name] [--lang js|ts] [--force]
npm create qingkuai
```

Install the CLI directly for the full toolchain (dev / build / preview /
build-types / check / format):

```sh
npm i -g @qingkuai/cli
qingkuai init qingkuai-app
```
