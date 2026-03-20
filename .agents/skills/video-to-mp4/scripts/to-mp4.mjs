#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { execSync, spawn } from "node:child_process";

// --- CLI parsing ---
const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--dry-run") {
    flags.dryRun = true;
  } else if (args[i] === "--no-audio") {
    flags.noAudio = true;
  } else if (args[i].startsWith("--") && i + 1 < args.length) {
    const key = args[i].replace(/^--/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    flags[key] = args[++i];
  } else {
    positional.push(args[i]);
  }
}

const input = positional[0] ? path.resolve(positional[0]) : null;
const outputDir = positional[1] ? path.resolve(positional[1]) : null;

const crf = Number.parseInt(flags.crf ?? "23", 10);
const preset = flags.preset ?? "medium";
const codec = flags.codec ?? "h264";
const resolution = flags.resolution ?? null;
const audioCodec = flags.audioCodec ?? "aac";
const audioBitrate = flags.audioBitrate ?? "128k";
const noAudio = flags.noAudio ?? false;
const dryRun = flags.dryRun ?? false;

if (!input) {
  console.error("Usage: to-mp4.mjs <input> [outputDir] [options...]");
  console.error("  input: file or directory (required)");
  console.error("  outputDir: destination directory (default: same as input)");
  console.error("\nOptions:");
  console.error("  --crf <0-51>          Quality (default: 23)");
  console.error("  --preset <name>       Encoding preset (default: medium)");
  console.error("  --codec <h264|h265>   Video codec (default: h264)");
  console.error("  --resolution <WxH>    Target resolution (e.g. 1920x1080)");
  console.error("  --audio-codec <name>  Audio codec (default: aac)");
  console.error("  --audio-bitrate <r>   Audio bitrate (default: 128k)");
  console.error("  --no-audio            Strip audio track");
  console.error("  --dry-run             Preview without executing");
  process.exit(1);
}

// --- Check ffmpeg ---
try {
  execSync("ffmpeg -version", { stdio: "ignore" });
} catch {
  console.error("[ERROR] ffmpeg is not installed or not in PATH.");
  process.exit(1);
}

// --- Supported extensions ---
const videoExts = new Set([
  ".avi",
  ".mkv",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  ".m4v",
  ".ts",
  ".mts",
  ".3gp",
  ".mpg",
  ".mpeg",
  ".mp4",
  ".ogv",
  ".vob",
]);

// --- Helpers ---
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

function buildFFmpegArgs(inputPath, outputPath) {
  const ffArgs = ["-i", inputPath, "-y"];

  // Video codec
  const vcodec = codec === "h265" ? "libx265" : "libx264";
  ffArgs.push("-c:v", vcodec);
  ffArgs.push("-crf", String(crf));
  ffArgs.push("-preset", preset);

  // Resolution
  if (resolution) {
    const [w, h] = resolution.split("x");
    ffArgs.push("-vf", `scale=${w}:${h}`);
  }

  // Audio
  if (noAudio) {
    ffArgs.push("-an");
  } else {
    ffArgs.push("-c:a", audioCodec);
    ffArgs.push("-b:a", audioBitrate);
  }

  // MP4 compatibility
  ffArgs.push("-movflags", "+faststart");

  ffArgs.push(outputPath);
  return ffArgs;
}

function runFFmpeg(ffArgs) {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", ffArgs, { stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}

// --- Main ---
async function main() {
  let inputStat;
  try {
    inputStat = await fs.stat(input);
  } catch {
    console.error(`[ERROR] Input not found: ${input}`);
    process.exit(1);
  }

  const filesToConvert = [];

  if (inputStat.isDirectory()) {
    const allFiles = await collectFiles(input);
    for (const f of allFiles) {
      const ext = path.extname(f).toLowerCase();
      if (videoExts.has(ext)) {
        const rel = path.relative(input, f);
        const outBase = outputDir ?? path.dirname(f);
        const outPath = path.join(
          outBase,
          outputDir ? rel : path.basename(f)
        );
        const finalOut = outPath.replace(/\.[^.]+$/, ".mp4");
        filesToConvert.push({ input: f, output: finalOut });
      }
    }
  } else {
    const ext = path.extname(input).toLowerCase();
    if (!videoExts.has(ext)) {
      console.error(`[ERROR] Unsupported file format: ${ext}`);
      process.exit(1);
    }
    const outBase = outputDir ?? path.dirname(input);
    const outPath = path.join(outBase, path.basename(input)).replace(/\.[^.]+$/, ".mp4");
    filesToConvert.push({ input, output: outPath });
  }

  if (filesToConvert.length === 0) {
    console.log("No video files found.");
    return;
  }

  console.log(`Found ${filesToConvert.length} video(s) to convert.\n`);

  let converted = 0;
  let failed = 0;

  for (const { input: inPath, output: outPath } of filesToConvert) {
    // Avoid overwriting input when output path is the same
    let finalOutPath = outPath;
    if (path.resolve(inPath) === path.resolve(outPath)) {
      const dir = path.dirname(outPath);
      const base = path.basename(outPath, ".mp4");
      finalOutPath = path.join(dir, `${base}_converted.mp4`);
    }

    const ffArgs = buildFFmpegArgs(inPath, finalOutPath);

    if (dryRun) {
      console.log(`[DRY RUN] ffmpeg ${ffArgs.join(" ")}`);
      converted++;
      continue;
    }

    await fs.mkdir(path.dirname(finalOutPath), { recursive: true });
    console.log(`[CONVERTING] ${inPath} -> ${finalOutPath}`);

    try {
      await runFFmpeg(ffArgs);
      converted++;
      console.log(`[OK] ${finalOutPath}\n`);
    } catch (err) {
      failed++;
      console.error(`[FAIL] ${inPath}: ${err.message}\n`);
    }
  }

  console.log(`\nDone. Converted: ${converted}, Failed: ${failed}`);
}

await main();
