# CLAUDE.md

## 作業の進め方

- レビューと作業は codex に委任する。委任には `codex` CLI を Bash で直接呼ぶ。
  - 実装・修正・調査 → `codex exec --sandbox workspace-write "<依頼内容>"` に委譲する（書き込み可）。読み取りだけで済ませたいときは `--sandbox read-only` にする。
  - コードレビュー → `codex exec review --uncommitted`（未コミット差分が対象）。ブランチ比較は `codex exec review --base <branch>`、特定コミットは `--commit <sha>`。
  - レビュー結果を受け取ったら、勝手に修正を当てない。どの指摘を直すかをユーザーに確認してから着手する。
  - codex の実行は作業対象リポジトリのルートで行う（`-C <dir>` で作業ディレクトリを指定できる）。
  - codex CLI が使えるか不明なときは `codex login status` と `codex --version` で確認する。
- 確認するときは、`.vscode/tasks.json` に記載のポートで dev が起動されている前提で確認する。

## 記載スタイル

- ファイルに何かを記載するときは、`**`（太字マーカー）を極力使わない。
