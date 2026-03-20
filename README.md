# ai-settings

Claude Code / Codex の設定ファイルとカスタムスキルを管理するリポジトリ。

## シンボリックリンクの設定

このリポジトリの設定を各ツールに反映するには、以下のシンボリックリンクを貼る。

> **注意:** Windows では管理者権限のターミナル、または開発者モードの有効化が必要。

| リンク先 | リンク元（このリポジトリ） |
|---|---|
| `~/.claude/settings.json` | `.claude/settings.json` |
| `~/.claude/skills/` | `.agents/skills/` |
| `~/.codex/config.toml` | `.codex/config.toml` |

### Mac / Linux

```bash
ln -sf <repo>/.claude/settings.json ~/.claude/settings.json
ln -sf <repo>/.agents/skills ~/.claude/skills
ln -sf <repo>/.codex/config.toml ~/.codex/config.toml
```

### Windows

> 管理者権限のターミナル、または開発者モードの有効化が必要。

```powershell
# PowerShell（管理者）
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\settings.json" -Target "<repo>\.claude\settings.json"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills" -Target "<repo>\.agents\skills"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.codex\config.toml" -Target "<repo>\.codex\config.toml"
```

> `<repo>` はこのリポジトリのクローン先の絶対パスに置換

## スキル一覧

`.agents/skills/` に配置されたカスタムスキル。

| スキル | 説明 | 主な用途 | 依存 |
|---|---|---|---|
| **image-resize** | 画像の一括リサイズ | 幅・高さ指定、フォーマット変換、品質調整 | sharp |
| **image-to-webp** | 画像を WebP に一括変換 | Web 配信用の軽量化 | sharp |
| **video-to-mp4** | 動画を MP4 に一括変換 | H.264/H.265 エンコード、解像度・品質指定 | ffmpeg |
| **notion** | Notion ワークスペース操作 | ページ作成・更新、DB 操作、検索 | ncli |
| **playwright-cli** | ブラウザ自動操作 | Web テスト、フォーム入力、スクリーンショット | playwright-cli |
| **gh-self-merge** | develop → main の PR 作成＆マージ | セルフマージワークフロー | gh |

## ディレクトリ構成

```
ai-settings/
├── .agents/
│   └── skills/          # カスタムスキル本体
│       ├── gh-self-merge/
│       ├── image-resize/
│       ├── image-to-webp/
│       ├── notion/
│       ├── playwright-cli/
│       └── video-to-mp4/
├── .claude/
│   ├── settings.json    # Claude Code 設定
│   └── skills -> ../.agents/skills/  # シンボリックリンク
├── .codex/
│   └── config.toml      # Codex 設定
└── .gitignore
```
