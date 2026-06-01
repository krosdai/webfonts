import { execFile } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, open, rename, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";

import type { Family } from "./manifest.ts";
import { expandTilde, repoRoot } from "./util.ts";

const exec = promisify(execFile);

async function isDir(p: string): Promise<boolean> {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

/** Run `tar`, translating a missing binary into a clear, actionable error. */
async function runTar(
  args: string[],
  slug: string,
): Promise<{ stdout: string; stderr: string }> {
  try {
    return await exec("tar", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `${slug}: 'tar' was not found on PATH — install tar, or use sourceMode "local" / --source-root`,
        { cause: err },
      );
    }
    throw err;
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

  // Stage the download + extraction outside `dest`, then rename() so an interrupted run never leaves
  // a partial directory that the next run would treat as a valid cache hit.
  const tarball = `${dest}.tar.gz.tmp`;
  const staging = `${dest}.staging`;
  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });

  // Stream the download straight to disk — never buffer a multi-hundred-MB tarball in memory.
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tarball));

  // Validate the archive header on disk: a real GitHub tarball starts with the gzip magic (1f 8b).
  const fh = await open(tarball, "r");
  try {
    const head = Buffer.alloc(2);
    await fh.read(head, 0, 2, 0);
    if (head[0] !== 0x1f || head[1] !== 0x8b) {
      throw new Error(`${slug}: source is not a gzip tarball: ${url.href}`);
    }
  } finally {
    await fh.close();
  }

  // Defense-in-depth: reject path-traversal / absolute members before extracting. BSD/busybox/older
  // GNU tar don't refuse `..` entries, and the threat model here is a compromised upstream archive.
  const listing = await runTar(["tzf", tarball], slug);
  for (const entry of listing.stdout.split("\n")) {
    const name = entry.trim();
    if (name && (name.startsWith("/") || name.split("/").includes(".."))) {
      throw new Error(`${slug}: refusing tarball with unsafe path member: ${name}`);
    }
  }
  // GitHub archive tarballs wrap everything in a top-level dir; strip it.
  await runTar(["xzf", tarball, "-C", staging, "--strip-components=1"], slug);
  await rm(tarball, { force: true });
  await rename(staging, dest);
  return dest;
}
