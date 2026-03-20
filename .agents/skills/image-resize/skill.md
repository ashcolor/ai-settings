---
name: image-resize
description: Batch resize images using sharp. Use when users ask to resize, scale, or change dimensions of images in a directory.
allowed-tools: Bash(node *), Bash(pnpm *), Bash(npm *)
---

# image-resize

Batch resize images in a directory using sharp.

## Workflow

1. `sharp` is auto-resolved: project-local → global → auto-install globally.
2. Run the script from this skill with working directory set to the target project.

```bash
node <skill-dir>/scripts/resize.mjs [inputDir] [outputDir] [options...]
```

## Options

| Option | Description | Default |
|---|---|---|
| `--width <px>` | Target width in pixels | (none) |
| `--height <px>` | Target height in pixels | (none) |
| `--fit <mode>` | Resize fit: `cover`, `contain`, `fill`, `inside`, `outside` | `inside` |
| `--quality <1-100>` | Output quality (JPEG/WebP/AVIF) | `80` |
| `--format <fmt>` | Force output format: `jpg`, `png`, `webp`, `avif` | (keep original) |
| `--suffix <text>` | Append suffix to filename (e.g. `_thumb`) | (none) |
| `--dry-run` | Preview changes without writing files | |

At least one of `--width` or `--height` is required.

## Positional arguments

- `inputDir`: source directory (default: `.`)
- `outputDir`: destination directory (default: same as input, in-place overwrite unless `--suffix` is set)

## Examples

```bash
# Resize all images to max 1200px wide (preserve aspect ratio)
node <skill-dir>/scripts/resize.mjs ./images ./images-resized --width 1200

# Generate thumbnails with suffix
node <skill-dir>/scripts/resize.mjs ./photos ./photos --width 300 --height 300 --fit cover --suffix _thumb

# Convert and resize to WebP at quality 70
node <skill-dir>/scripts/resize.mjs ./src ./dist --width 800 --format webp --quality 70

# Dry run to preview
node <skill-dir>/scripts/resize.mjs ./images ./out --width 640 --dry-run
```

## Naming and output conventions

- Output file name: `[元のファイル名]_[サイズ].[拡張子]` (e.g., `logo.png` を 50px にリサイズ → `logo_50.png`)
  - サイズ部分は `--width` と `--height` の指定に応じて `W`, `WxH`, または `xH` の形式にする
  - 例: `--width 50` → `_50`, `--width 50 --height 30` → `_50x30`, `--height 30` → `_x30`
- 保存場所は元の画像と同じディレクトリにする
- これを実現するには `--suffix` オプションを使い、`inputDir` と `outputDir` を同じディレクトリに指定する

## Notes

- Recursively scans input directory.
- Preserves relative subdirectories in output.
- Skips non-image files.
- `inside` fit (default) never enlarges and keeps aspect ratio within the given box.
