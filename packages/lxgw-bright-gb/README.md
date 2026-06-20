# @krosdai/lxgw-bright-gb

LXGW Bright GB — the Mainland China (GB) glyph cut of LXGW Bright. Subset to unicode-range woff2.

- **font-family:** `LXGW Bright GB`
- **weights:** 300, 400, 500 · **styles:** normal, italic
- **license:** OFL-1.1 — generated from [lxgw/LxgwBright@v5.528](https://github.com/lxgw/LxgwBright) with cn-font-split

## CSS entry points

Every file lazy-loads only the glyph chunks a page actually uses (per `unicode-range`). Import the
narrowest one that covers the weights/styles you use — `.woff2` bytes are shared, so mixing files
never double-downloads a glyph.

| File | Contains |
| --- | --- |
| `index.css` | all weights × all styles |
| `weight-<weight>.css` | one weight, all styles — e.g. `weight-400.css` |
| `style-<style>.css` | one style, all weights — e.g. `style-normal.css` |
| `<weight>-<style>.css` | exactly one cut — e.g. `400-normal.css` |

## Use via jsDelivr (no install)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@krosdai/lxgw-bright-gb@2.0.0/index.css" />
<style>
  body {
    font-family: "LXGW Bright GB", serif;
  }
</style>
```

Narrower is smaller:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@krosdai/lxgw-bright-gb@2.0.0/weight-400.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@krosdai/lxgw-bright-gb@2.0.0/400-normal.css" />
```

## Use via npm (bundlers)

```sh
npm install @krosdai/lxgw-bright-gb
```

```js
import "@krosdai/lxgw-bright-gb";                // full bundle (index.css)
import "@krosdai/lxgw-bright-gb/weight-400.css"; // one weight, all styles
import "@krosdai/lxgw-bright-gb/style-normal.css";   // one style, all weights
import "@krosdai/lxgw-bright-gb/400-normal.css";      // exactly one cut
```

Pin an exact version; the CSS already contains the `@font-face` rules.

## Install locally (without publishing)

Build the tarball (`npm pack` in this folder, or `pnpm pack:fonts` from the monorepo root), then:

```sh
npm install ./krosdai-lxgw-bright-gb-2.0.0.tgz
```

Or point a dependency straight at the built package folder:

```jsonc
// package.json
{ "dependencies": { "@krosdai/lxgw-bright-gb": "file:../path/to/packages/lxgw-bright-gb" } }
```
