#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

// --- Parse arguments ---
const args = process.argv.slice(2);
const positional = [];
const opts = {
  width: 0,
  height: 0,
  fit: "inside",
  quality: 80,
  format: "",
  suffix: "",
  dryRun: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--width":
      opts.width = Number.parseInt(args[++i], 10);
      break;
    case "--height":
      opts.height = Number.parseInt(args[++i], 10);
      break;
    case "--fit":
      opts.fit = args[++i];
      break;
    case "--quality":
      opts.quality = Math.min(100, Math.max(1, Number.parseInt(args[++i], 10)));
      break;
    case "--format":
      opts.format = args[++i].replace(/^\./, "").toLowerCase();
      break;
    case "--suffix":
      opts.suffix = args[++i];
      break;
    case "--dry-run":
      opts.dryRun = true;
      break;
    default:
      positional.push(args[i]);
  }
}

const inputDir = path.resolve(positional[0] ?? ".");
const outputDir = path.resolve(positional[1] ?? inputDir);

if (opts.width <= 0 && opts.height <= 0) {
  console.error("[ERROR] At least one of --width or --height is required.");
  process.exit(1);
}

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

const formatExtMap = {
  jpg: ".jpg",
  jpeg: ".jpg",
  png: ".png",
  webp: ".webp",
  avif: ".avif",
};

function loadSharp() {
  try {
    const requireFromCwd = createRequire(
      path.join(process.cwd(), "package.json"),
    );
    return requireFromCwd("sharp");
  } catch {}

  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf-8" }).trim();
    const requireFromGlobal = createRequire(
      path.join(globalRoot, "sharp", "package.json"),
    );
    return requireFromGlobal("sharp");
  } catch {}

  console.log("[INFO] sharp not found. Installing globally...");
  try {
    execSync("npm install -g sharp", { stdio: "inherit" });
    const globalRoot = execSync("npm root -g", { encoding: "utf-8" }).trim();
    const requireFromGlobal = createRequire(
      path.join(globalRoot, "sharp", "package.json"),
    );
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
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const sharp = loadSharp();

  try {
    const stat = await fs.stat(inputDir);
    if (!stat.isDirectory()) {
      console.error(`[ERROR] Not a directory: ${inputDir}`);
      process.exit(1);
    }
  } catch {
    console.error(`[ERROR] Directory not found: ${inputDir}`);
    process.exit(1);
  }

  const sources = (await collectFiles(inputDir)).filter((f) =>
    imageExts.has(path.extname(f).toLowerCase()),
  );

  if (sources.length === 0) {
    console.log("No image files found.");
    return;
  }

  sources.sort((a, b) => a.localeCompare(b));

  if (opts.dryRun) {
    console.log("[DRY RUN] No files will be written.\n");
  }

  let processed = 0;

  for (const sourcePath of sources) {
    const ext = path.extname(sourcePath);
    const baseName = path.basename(sourcePath, ext);
    const relativePath = path.relative(inputDir, sourcePath);
    const relativeDir = path.dirname(relativePath);

    const outExt = opts.format
      ? formatExtMap[opts.format] ?? ext
      : ext;
    const outName = `${baseName}${opts.suffix}${outExt}`;
    const outPath = path.join(outputDir, relativeDir, outName);

    if (opts.dryRun) {
      console.log(`${sourcePath} -> ${outPath}`);
      processed += 1;
      continue;
    }

    await fs.mkdir(path.dirname(outPath), { recursive: true });

    const resizeOpts = { fit: opts.fit, withoutEnlargement: true };
    if (opts.width > 0) resizeOpts.width = opts.width;
    if (opts.height > 0) resizeOpts.height = opts.height;

    let pipeline = sharp(sourcePath).resize(resizeOpts);

    if (opts.format) {
      pipeline = pipeline.toFormat(opts.format, { quality: opts.quality });
    } else {
      const lowerExt = ext.toLowerCase();
      if ([".jpg", ".jpeg"].includes(lowerExt)) {
        pipeline = pipeline.jpeg({ quality: opts.quality });
      } else if (lowerExt === ".webp") {
        pipeline = pipeline.webp({ quality: opts.quality });
      } else if (lowerExt === ".avif") {
        pipeline = pipeline.avif({ quality: opts.quality });
      }
    }

    await pipeline.toFile(outPath);
    processed += 1;
    console.log(`[OK] ${sourcePath} -> ${outPath}`);
  }

  console.log(
    `\n${opts.dryRun ? "Would process" : "Processed"} ${processed} file(s) out of ${sources.length}.`,
  );
}

await main();
