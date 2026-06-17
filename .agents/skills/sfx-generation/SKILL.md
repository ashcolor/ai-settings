---
name: sfx-generation
description: ローカルの Stable Audio 3 リポジトリを使った効果音（SFX）の WAV 生成スキル。テキストプロンプトから効果音・ワンショット・サンプルを生成し、参照音声によるオーディオ編集（audio-to-audio）やインペイント・継続にも対応する。「効果音を作って」「SFX を生成して」「足音の音がほしい」「環境音を作って」などと言われた時に使用。
---

# 効果音生成スキル（Stable Audio 3）

ローカルにある Stable Audio 3 の `stable-audio` CLI を使って、テキストから効果音の WAV を生成する。スキル本文にユーザー環境の絶対パスを固定で書かない。

## リポジトリの見つけ方

1. ユーザーが Stable Audio 3 の場所を指定している場合は、そのパスを使う。
2. `STABLE_AUDIO_3_DIR` が設定されている場合は、その値を使う。
3. どちらもない場合は、現在の作業場所の近くや一般的な開発ディレクトリから `stable-audio-3` または `stable_audio_3` を探す。
4. 見つからない場合だけ、ユーザーにリポジトリの場所を確認する。

PowerShell では、作業前に次のように変数化してから移動する。

```powershell
$saRoot = $env:STABLE_AUDIO_3_DIR
if (-not $saRoot) {
  $saRoot = Get-ChildItem -Path (Split-Path -Parent $PWD) -Directory -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in @('stable-audio-3', 'stable_audio_3') -and (Test-Path (Join-Path $_.FullName 'pyproject.toml')) } |
    Select-Object -First 1 -ExpandProperty FullName
}
if (-not $saRoot) { throw "Stable Audio 3 repository was not found. Ask the user for its location." }
Set-Location $saRoot
```

## 基本コマンド

迷ったら効果音専用の `small-sfx` モデルを使う。CPU で動き、GPU 不要。短い効果音はこれで十分。

```powershell
uv run stable-audio `
  --model small-sfx `
  -p "<効果音の説明>" `
  --duration 3 `
  -o outputs/sfx.wav
```

## 使い分け

| やりたいこと | モデル | 主な引数 |
| --- | --- | --- |
| 効果音・ワンショット・サンプル | `small-sfx`（CPU、最大120s） | `-p "..." --duration N` |
| 高品質な SFX / 音楽も混ぜたい | `medium`（GPU・CUDA 必須、最大380s） | `-p "..." --duration N` |
| 既存音をプロンプトで編集 | 同上 | `--init-audio in.wav --init-noise-level 0.6` |
| 一部だけ作り直す（インペイント） | 同上 | `--inpaint-audio in.wav --inpaint-start 4 --inpaint-end 8` |
| クリップを延長（継続） | 同上 | `--inpaint-audio in.wav --inpaint-start <元の長さ> --inpaint-end <延長後> --duration <延長後>` |

> `small-sfx` は効果音専用、`small-music` は音楽専用。音楽を含む効果音や高品質が必要なときだけ `medium` を使う（Flash Attention 2 が必要）。
