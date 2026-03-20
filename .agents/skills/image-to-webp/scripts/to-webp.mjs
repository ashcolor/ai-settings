#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const inputDir = path.resolve(process.argv[2] ?? "original-images");
const outputDir = path.resolve(process.argv[3] ?? "public");
const qualityRaw = Number.parseInt(process.argv[4] ?? "80", 10);
const maxWidthRaw = Number.parseInt(process.argv[5] ?? "0", 10);

const quality = Number.isFinite(qualityRaw)
  ? Math.min(100, Math.max(1, qualityRaw))
  : 80;
const maxWidth = Number.isFinite(maxWidthRaw) && maxWidthRaw > 0 ? maxWidthRaw : 0;

const imageExts = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".tif",
  ".tiff",
  ".bmp",
  ".gif",
]);

import { execSync } from "node:child_process";

function loadSharp() {
  // 1. Try project-local sharp
  try {
    const requireFromCwd = createRequire(path.join(process.cwd(), "package.json"));
    return requireFromCwd("sharp");
  } catch {}

  // 2. Try global sharp
  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf-8" }).trim();
    const requireFromGlobal = createRequire(path.join(globalRoot, "sharp", "package.json"));
    return requireFromGlobal("sharp");
  } catch {}

  // 3. Install globally and retry
  console.log("[INFO] sharp not found. Installing globally...");
  try {
    execSync("npm install -g sharp", { stdio: "inherit" });
    const globalRoot = execSync("npm root -g", { encoding: "utf-8" }).trim();
    const requireFromGlobal = createRequire(path.join(globalRoot, "sharp", "package.json"));
    return requireFromGlobal("sharp");
  } catch {
    console.error("[ERROR] Failed to install sharp globally.");
    process.exit(1);
  }
}

async function collectFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

async function main() {
  const sharp = loadSharp();

  try {
    const inputStat = await fs.stat(inputDir);
    if (!inputStat.isDirectory()) {
      console.error(`[ERROR] Input is not a directory: ${inputDir}`);
      process.exit(1);
    }
  } catch {
    console.error(`[ERROR] Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const sources = await collectFiles(inputDir);
  let converted = 0;

  for (const sourcePath of sources) {
    const ext = path.extname(sourcePath).toLowerCase();
    if (!imageExts.has(ext)) {
      continue;
    }

    const relativePath = path.relative(inputDir, sourcePath);
    const outputPath = path
      .join(outputDir, relativePath)
      .replace(/\.[^.]+$/, ".webp");

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    let pipeline = sharp(sourcePath);
    if (maxWidth > 0) {
      pipeline = pipeline.resize({
        width: maxWidth,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    await pipeline.webp({ quality }).toFile(outputPath);
    converted += 1;
    console.log(`[OK] ${sourcePath} -> ${outputPath}`);
  }

  console.log(`Converted ${converted} file(s).`);
}

await main();
