---
name: tts-generation
description: ローカルの Irodori-TTS リポジトリを使った日本語 TTS の WAV 生成スキル。テキスト読み上げ、参照音声によるボイスクローン、caption による声質・感情のコントロールが必要なときに使用する。「音声を生成して」「テキストを読み上げて」「ボイスを作って」「TTS で喋らせて」などと言われた時に使用。
---

# 音声生成スキル（Irodori-TTS）

ローカルにある Irodori-TTS の `infer.py` を使って、テキストから WAV を生成する。スキル本文にユーザー環境の絶対パスを固定で書かない。

## リポジトリの見つけ方

1. ユーザーが Irodori-TTS の場所を指定している場合は、そのパスを使う。
2. `IRODORI_TTS_DIR` が設定されている場合は、その値を使う。
3. どちらもない場合は、現在の作業場所の近くや一般的な開発ディレクトリから `irodori_tts` または `Irodori-TTS` を探す。
4. 見つからない場合だけ、ユーザーにリポジトリの場所を確認する。

PowerShell では、作業前に次のように変数化してから移動する。

```powershell
$ttsRoot = $env:IRODORI_TTS_DIR
if (-not $ttsRoot) {
  $ttsRoot = Get-ChildItem -Path (Split-Path -Parent $PWD) -Directory -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in @('irodori_tts', 'Irodori-TTS') -and (Test-Path (Join-Path $_.FullName 'infer.py')) } |
    Select-Object -First 1 -ExpandProperty FullName
}
if (-not $ttsRoot) { throw "Irodori-TTS repository was not found. Ask the user for its location." }
Set-Location $ttsRoot
```

## 基本コマンド

迷ったら `Aratako/Irodori-TTS-600M-v3-VoiceDesign` を使う。caption による声質・感情コントロールが効き、`--no-ref` で標準的な読み上げにも使える。

```powershell
uv run python infer.py `
  --hf-checkpoint Aratako/Irodori-TTS-600M-v3-VoiceDesign `
  --text "<読み上げるテキスト>" `
  --caption "<声質・感情の指定>" `
  --no-ref `
  --output-wav outputs/sample.wav
```

## 使い分け

| やりたいこと | チェックポイント | 主な引数 |
| --- | --- | --- |
| 標準的な読み上げ | `Aratako/Irodori-TTS-500M-v3` | `--no-ref` |
| 参照音声でボイスクローン | `Aratako/Irodori-TTS-500M-v3` | `--ref-wav path.wav` |
| caption で声質・感情を指定 | `Aratako/Irodori-TTS-600M-v3-VoiceDesign` | `--caption "..." --no-ref` |
| クローンと感情コントロール | `Aratako/Irodori-TTS-600M-v3-VoiceDesign` | `--ref-wav path.wav --caption "..."` |
