---
name: image-generation
description: Codex CLI の組み込み image_gen ツール（gpt-image）を使った汎用画像生成スキル。プロンプトから画像を生成し、参照画像による顔の一貫性確保やアスペクト比指定にも対応。「画像を生成して」「イラストを作って」「写真風の画像がほしい」などと言われた時に使用。
allowed-tools: Bash(codex exec:*)
---

# 画像生成スキル

Codex CLI の組み込み `image_gen` ツール（gpt-image 系モデル）を使って画像を生成する汎用スキル。

## 仕組み

`codex exec` を非対話で起動し、プロンプト内で画像生成と保存先を指示する。
Codex 側が組み込みの `image_gen` ツールを自動で呼び出し、指定パスに画像を書き出す。

```bash
codex exec --dangerously-bypass-approvals-and-sandbox --cd "$PWD" "<画像生成指示>"
```

## セットアップ

Codex CLI にログイン済みであること。

```bash
codex login status   # "Logged in using ChatGPT" と出れば OK
```

### 参照画像の使い方

参照画像を渡すと、顔や外見の一貫性を保った画像を生成できる。
`codex exec` の `-i / --image` で入力画像を添付し、プロンプトで対応を明記する。

- `-i path/to/face.jpg`（複数可: `-i a.jpg -i b.jpg`）
- 参照画像には**絶対パス**を使うのが確実
- プロンプト内で参照画像との対応を明記する（例: "添付1枚目の人物の顔を使って"）
- 添付順とプロンプト内の記述順を一致させること
- 年齢を変えたい場合は「添付の人物を15歳くらい若くした姿で」のように明示
