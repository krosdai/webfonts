import { mkdir, rename, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";

import { extract } from "tar";

import type { Family } from "./manifest.ts";
import { expandTilde, repoRoot } from "./util.ts";

async function isDir(p: string): Promise<boolean> {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Resolve the directory that holds a family's source font files.
 *
 * - `auto` (default): use the local clone if present, else download the release tarball.
 * - `local`: require the configured local clone.
 * - `release`: always download + extract the upstream tarball into `.cache/`.
 *
 * `override` (from `--source-root`) wins over the manifest when set.
 */
export async function resolveSourceRoot(family: Family, override?: string): Promise<string> {
  if (override) return expandTilde(override);

  const { sourceMode, localPath, releaseUrl, version } = family.upstream;

  if (sourceMode !== "release" && localPath) {
    const root = expandTilde(localPath);
    if (await isDir(root)) return root;
    if (sourceMode === "local") throw new Error(`${family.slug}: localPath not found: ${root}`);
  } else if (sourceMode === "local") {
    throw new Error(`${family.slug}: sourceMode "local" requires upstream.localPath`);
  }

  // auto (local clone absent) or release
  if (!releaseUrl)
    throw new Error(`${family.slug}: no usable local clone and no upstream.releaseUrl`);
  return downloadRelease(family.slug, version, releaseUrl);
}

/** Download + extract the upstream tarball, committing to the cache dir atomically via rename(). */
async function downloadRelease(
  slug: string,
  version: string,
  releaseUrl: string,
): Promise<string> {
  const cacheDir = join(repoRoot, ".cache", "sources");
  const dest = join(cacheDir, `${slug}-${version}`);
  // `dest` only ever exists as the result of a completed rename() below, so a hit is always whole.
  if (await isDir(dest)) return dest;

  const url = new URL(releaseUrl);
  if (url.protocol !== "https:") {
    throw new Error(`${slug}: refusing non-https source download: ${url.href}`);
  }

  await mkdir(cacheDir, { recursive: true });
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`${slug}: download failed (HTTP ${String(res.status)}): ${url.href}`);
  if (!res.body) throw new Error(`${slug}: empty response body: ${url.href}`);

  // Extract into a sibling staging dir, then rename() — an interrupted run never leaves a partial dir
  // that the next run would treat as a valid cache hit. node-tar streams the archive (no full-tarball
  // buffer), strips the top-level dir, refuses `..`/absolute members, and the filter drops symlinks /
  // hardlinks / devices, so a compromised upstream archive can't escape `staging`.
  const staging = `${dest}.staging`;
  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });
  try {
    await pipeline(
      Readable.fromWeb(res.body),
      createGunzip(),
      extract({
        cwd: staging,
        strip: 1,
        filter: (_path, entry) => entry.type === "File" || entry.type === "Directory",
      }),
    );
  } catch (err) {
    await rm(staging, { recursive: true, force: true });
    throw new Error(`${slug}: failed to extract source archive: ${url.href}`, { cause: err });
  }
  await rename(staging, dest);
  return dest;
}
