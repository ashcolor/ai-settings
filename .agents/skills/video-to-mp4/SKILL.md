---
name: video-to-mp4
description: Convert video files to MP4 using ffmpeg. Use when users ask to convert, transcode, or re-encode videos to MP4 format.
allowed-tools: Bash(node *), Bash(ffmpeg *)
---

# video-to-mp4

Convert video files to MP4 (H.264/AAC) using ffmpeg.

## Prerequisites

- `ffmpeg` must be installed and available in PATH.

## Workflow

1. Confirm ffmpeg is available.
2. Run the script from this skill with working directory set to the target project.

```bash
node <skill-dir>/scripts/to-mp4.mjs <input> [outputDir] [options...]
```

## Positional arguments

- `input`: source file or directory (required)
- `outputDir`: destination directory (default: same directory as input file)

## Options

| Option | Description | Default |
|---|---|---|
| `--crf <0-51>` | Quality (lower = better, 0 = lossless) | `23` |
| `--preset <name>` | Encoding speed: `ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow` | `medium` |
| `--codec <name>` | Video codec: `h264`, `h265` | `h264` |
| `--resolution <WxH>` | Target resolution (e.g. `1920x1080`, `1280x720`) | (keep original) |
| `--audio-codec <name>` | Audio codec | `aac` |
| `--audio-bitrate <rate>` | Audio bitrate (e.g. `128k`, `192k`) | `128k` |
| `--no-audio` | Strip audio track | |
| `--dry-run` | Preview commands without executing | |

## Examples

```bash
# Convert a single file
node <skill-dir>/scripts/to-mp4.mjs video.avi

# Convert all videos in a directory
node <skill-dir>/scripts/to-mp4.mjs ./raw-videos ./converted

# High quality H.265 encoding
node <skill-dir>/scripts/to-mp4.mjs input.mkv ./out --codec h265 --crf 18 --preset slow

# Downscale to 720p
node <skill-dir>/scripts/to-mp4.mjs input.mov --resolution 1280x720

# Dry run to preview
node <skill-dir>/scripts/to-mp4.mjs ./videos ./out --dry-run
```

## Supported input formats

`.avi`, `.mkv`, `.mov`, `.wmv`, `.flv`, `.webm`, `.m4v`, `.ts`, `.mts`, `.3gp`, `.mpg`, `.mpeg`, `.mp4`, `.ogv`, `.vob`

## Notes

- Recursively scans input directory.
- Preserves relative subdirectories in output.
- `.mp4` input files are re-encoded (not copied).
- Output file name: `[original name].mp4`.
