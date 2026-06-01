import type { ManifestInput } from "./scripts/lib/manifest.ts";

type Instances = ManifestInput["families"][number]["instances"];

/** The six static cuts every LXGW Bright sub-family ships, mapped to CSS weight/style. */
function lxgwInstances(dir: string, base: string): Instances {
  return [
    { weight: 300, style: "normal", file: `${dir}/${base}-Light.ttf` },
    { weight: 300, style: "italic", file: `${dir}/${base}-LightItalic.ttf` },
    { weight: 400, style: "normal", file: `${dir}/${base}-Regular.ttf` },
    { weight: 400, style: "italic", file: `${dir}/${base}-Italic.ttf` },
    { weight: 500, style: "normal", file: `${dir}/${base}-Medium.ttf` },
    { weight: 500, style: "italic", file: `${dir}/${base}-MediumItalic.ttf` },
  ];
}

const lxgwBrightUpstream = {
  repo: "lxgw/LxgwBright",
  version: "v5.528",
  homepage: "https://github.com/lxgw/LxgwBright",
  sourceMode: "auto",
  localPath: "~/repos/gh.lxgw.lxgwbright",
  releaseUrl: "https://github.com/lxgw/LxgwBright/archive/refs/tags/v5.528.tar.gz",
  licensePath: "OFL.txt",
} satisfies ManifestInput["families"][number]["upstream"];

const config = {
  outRoot: "packages",
  npm: {
    scope: "@daihaus",
    repository: "git+https://github.com/daihaus/webfonts.git",
  },
  generator: {
    tool: "cn-font-split",
    version: "7.4.2",
    core: "7.6.8",
    // SHA-256 of each cn-font-split core 7.6.8 release binary, verified after download (dlopen'd into
    // the build, so this is the trust boundary). Regenerate with `shasum -a 256` when bumping `core`.
    coreChecksums: {
      "aarch64-apple-darwin.dylib":
        "3a29a76a5f50e2ecffffd7f404e4c4cad80ab56213982f68609064de1fe3b514",
      "x86_64-apple-darwin.dylib":
        "2bd3651db28792c1775a793817f0a55c02a4c255157aa4535e4d6149350b8df4",
      "x86_64-unknown-linux-gnu.so":
        "db4690e3b9c4b04f6dfa5965792585c389914038f6a4c90fbe73baaf16bbf19c",
      "aarch64-unknown-linux-gnu.so":
        "af74ce9689ed0a079a389dd7bff95939d565731a0a2dc3b5136d813b8ff2607c",
      "x86_64-pc-windows-msvc.dll":
        "31784b363f59476abe2034b708a3566f41a9fab80370d18a3613b52b060cdc17",
    },
  },
  families: [
    {
      slug: "lxgw-bright",
      version: "1.0.0",
      displayName: "LXGW Bright",
      cssFamily: "LXGW Bright",
      description:
        "LXGW Bright — a semi-serif Chinese webfont (LXGW WenKai Lite + Ysabeau). Subset to unicode-range woff2.",
      keywords: ["lxgw", "serif", "kai"],
      license: { id: "OFL-1.1", reservedFontName: false },
      upstream: lxgwBrightUpstream,
      instances: lxgwInstances("LXGWBright", "LXGWBright"),
    },
    {
      slug: "lxgw-bright-gb",
      version: "1.0.0",
      displayName: "LXGW Bright GB",
      cssFamily: "LXGW Bright GB",
      description:
        "LXGW Bright GB — the Mainland China (GB) glyph cut of LXGW Bright. Subset to unicode-range woff2.",
      keywords: ["lxgw", "serif", "gb", "simplified"],
      license: { id: "OFL-1.1", reservedFontName: false },
      upstream: lxgwBrightUpstream,
      instances: lxgwInstances("LXGWBrightGB", "LXGWBrightGB"),
    },
    {
      slug: "lxgw-bright-tc",
      version: "1.0.0",
      displayName: "LXGW Bright TC",
      cssFamily: "LXGW Bright TC",
      description:
        "LXGW Bright TC — the Traditional Chinese (TC) glyph cut of LXGW Bright. Subset to unicode-range woff2.",
      keywords: ["lxgw", "serif", "tc", "traditional"],
      license: { id: "OFL-1.1", reservedFontName: false },
      upstream: lxgwBrightUpstream,
      instances: lxgwInstances("LXGWBrightTC", "LXGWBrightTC"),
    },
  ],
} satisfies ManifestInput;

export default config;
