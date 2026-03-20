---
name: image-to-webp
description: Convert local images to WebP with sharp for web delivery. Use when users ask to batch-compress images for websites, keep originals in a source directory, and output WebP files under public.
allowed-tools: Bash(node *), Bash(pnpm *), Bash(npm *)
---

# image-to-webp

Convert images in a project to WebP with a reusable sharp script.

## Workflow

1. `sharp` is auto-resolved: project-local → global → auto-install globally.
2. Prepare source and destination directories in the target project.
   - Default source: `original-images`
   - Default destination: `public`
3. Run the script from this skill with working directory set to the target project.

```bash
node <skill-dir>/scripts/to-webp.mjs [inputDir] [outputDir] [quality] [maxWidth]
```

## Defaults

- `inputDir`: `original-images`
- `outputDir`: `public`
- `quality`: `80` (1-100)
- `maxWidth`: `0` (disabled; keep original width)

## Examples

```bash
node <skill-dir>/scripts/to-webp.mjs
node <skill-dir>/scripts/to-webp.mjs original-images public 80 1200
node <skill-dir>/scripts/to-webp.mjs assets/source public/img 75 800
```

## Notes

- Recursively scans input directory.
- Preserves relative subdirectories in output.
- Replaces extension with `.webp`.
- Skips non-image files.
