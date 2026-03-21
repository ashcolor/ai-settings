---
name: image-generation
description: Gemini API を使った汎用画像生成スキル。プロンプトから画像を生成し、参照画像による顔の一貫性確保やアスペクト比指定にも対応。「画像を生成して」「イラストを作って」「写真風の画像がほしい」などと言われた時に使用。
allowed-tools: Bash(gemini:*)
---

# 画像生成スキル

Gemini API を使って画像を生成する汎用スキル。

## 生成スクリプト

スキルディレクトリ内の `scripts/generate_image.mjs` を使用する。

```
Usage: node .agents/skills/image-generation/scripts/generate_image.mjs --prompt "..." --output path.png [options]

Options:
  --prompt, -p   画像生成プロンプト (必須)
  --output, -o   出力ファイルパス (必須, プロジェクトルートからの相対 or 絶対パス)
  --ref,    -r   参照画像パス (複数可: --ref a.jpg --ref b.jpg)
  --model,  -m   モデル: pro (default) / flash / flash31
  --model-id     Gemini model ID を直接指定
  --aspect, -a   アスペクト比 (default: 4:3)
                   1:1, 9:16, 16:9, 3:4, 4:3, 3:2, 2:3, 5:4, 4:5, 21:9
  --help,   -h   ヘルプ表示
```

APIキーは環境変数 `GEMINI_API_KEY`（または `GOOGLE_AI_API_KEY`）から取得。未設定の場合は `.mcp.json` 内を自動探索する。

## セットアップ

`~/.claude/settings.local.json` の `env` に Gemini API キーを設定する:

```json
{
  "env": {
    "GEMINI_API_KEY": "your-api-key-here"
  }
}
```

APIキーは [Google AI Studio](https://aistudio.google.com/apikey) で取得できる。

### APIキーの探索順

1. 環境変数 `GEMINI_API_KEY`
2. 環境変数 `GOOGLE_AI_API_KEY`
3. `.mcp.json` 内の全 MCP サーバーから `GEMINI_API_KEY` / `GOOGLE_AI_API_KEY` を自動探索

## API 設定

| 項目 | 値 |
|------|-----|
| モデル | `gemini-3-pro-image-preview`（高品質・デフォルト）/ `gemini-2.5-flash-image`（高速）/ `gemini-3.1-flash-image-preview` |
| APIエンドポイント | `https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent` |

## プロンプト作成ガイドライン

### 基本構成

```
[被写体の描写], [服装・外見], [表情], [ポーズ・構図], [背景・場所], [画風指定]
```

### 画風プリセット

| 画風 | プロンプト追加文 |
|------|-----------------|
| 写真風 | `photorealistic, cinematic lighting, shot on 85mm lens, shallow depth of field, detailed skin texture` |
| アニメ風 | `anime style, cel shading, vibrant colors` |
| 水彩風 | `watercolor painting style, soft edges, flowing colors` |
| 油絵風 | `oil painting style, rich textures, visible brushstrokes` |
| フラットデザイン | `flat design, minimal, clean lines, vector art style` |

### アスペクト比の選び方

| 用途 | 推奨アスペクト比 |
|------|-----------------|
| SNS アイコン・プロフィール | `1:1` |
| スマホ壁紙・ストーリーズ | `9:16` |
| PC 壁紙・バナー | `16:9` |
| ポートレート・挿絵 | `3:4` または `4:3` |
| ウルトラワイド | `21:9` |

### 参照画像の使い方

参照画像を指定すると、顔や外見の一貫性を保った画像を生成できる。

- `--ref` で参照画像を指定（複数可）
- 参照画像には**絶対パス**を使うのが確実
- プロンプト内で参照画像との対応を明記する（例: "The person should have the face from the first reference image"）
- `--ref` の指定順とプロンプト内の記述順を一致させること
- 年齢を変えたい場合: `He should look like a younger, 15-year-old version of the person in the reference image.` のように明示

## 使用例

### 基本（テキストのみ）

```bash
node .agents/skills/image-generation/scripts/generate_image.mjs \
  -p "A serene Japanese garden with a stone lantern, koi pond, and maple trees in autumn colors. Photorealistic, golden hour lighting." \
  -o output/garden.png
```

### 参照画像付き（人物）

```bash
node .agents/skills/image-generation/scripts/generate_image.mjs \
  -p "A young man (use the face from the reference image) standing on a rooftop at sunset, wearing a casual white t-shirt, wind blowing through hair. Photorealistic, cinematic lighting." \
  -r path/to/face.jpg \
  -o output/portrait.png
```

### 複数参照画像（2人構図）

```bash
node .agents/skills/image-generation/scripts/generate_image.mjs \
  -p "Two people sitting at a cafe. The person on the left (use the face from the first reference image) is smiling, the person on the right (use the face from the second reference image) is reading a book. Warm indoor lighting, photorealistic." \
  -r path/to/person1.jpg \
  -r path/to/person2.jpg \
  -o output/cafe.png
```

### Flash モデル + ワイド

```bash
node .agents/skills/image-generation/scripts/generate_image.mjs \
  -p "A panoramic view of Tokyo skyline at night, neon lights reflecting on wet streets. Cinematic, cyberpunk atmosphere." \
  -o output/tokyo.png \
  -m flash -a 16:9
```

## 実行手順

1. ユーザーの要望からプロンプトを組み立てる
2. 適切なモデル・アスペクト比を選択
3. `generate_image.mjs` を実行
4. 出力画像を目視チェック（Read ツールで確認）
5. 必要に応じてプロンプトを調整して再生成
