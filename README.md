# ai-settings

Claude Code / Codex の設定ファイルとカスタムスキルを管理するリポジトリ。

## シンボリックリンクの設定

このリポジトリの設定を各ツールに反映するには、以下のシンボリックリンクを貼る。

> **注意:** Windows では管理者権限のターミナル、または開発者モードの有効化が必要。

### 設定ファイル

| リンク先 | リンク元（このリポジトリ） |
|---|---|
| `~/.claude/settings.json` | `.claude/settings.json` |
| `~/.codex/config.toml` | `.codex/config.toml` |

### skills / hooks

`.agents/skills/` と `.agents/hooks/` を以下の 2 箇所に展開する。

| リンク先 | リンク元（このリポジトリ） |
|---|---|
| `~/.claude/skills` | `.agents/skills/` |
| `~/.claude/hooks` | `.agents/hooks/` |
| `~/.agent/skills` | `.agents/skills/` |
| `~/.agent/hooks` | `.agents/hooks/` |

### Mac / Linux

```bash
# 設定ファイル
ln -sf <repo>/.claude/settings.json ~/.claude/settings.json
ln -sf <repo>/.codex/config.toml ~/.codex/config.toml

# skills / hooks（~/.claude）
ln -sf <repo>/.agents/skills ~/.claude/skills
ln -sf <repo>/.agents/hooks ~/.claude/hooks

# skills / hooks（~/.agent）
mkdir -p ~/.agent
ln -sf <repo>/.agents/skills ~/.agent/skills
ln -sf <repo>/.agents/hooks ~/.agent/hooks
```

### Windows

> 管理者権限のターミナル、または開発者モードの有効化が必要。

```powershell
# PowerShell（管理者）

# 設定ファイル
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\settings.json" -Target "<repo>\.claude\settings.json"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.codex\config.toml" -Target "<repo>\.codex\config.toml"

# skills / hooks（~/.claude）
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills" -Target "<repo>\.agents\skills"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\hooks" -Target "<repo>\.agents\hooks"

# skills / hooks（~/.agent）
New-Item -ItemType Directory -Path "$env:USERPROFILE\.agent" -Force
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.agent\skills" -Target "<repo>\.agents\skills"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.agent\hooks" -Target "<repo>\.agents\hooks"
```

> `<repo>` はこのリポジトリのクローン先の絶対パスに置換

## MCP サーバーのインストール

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
claude mcp add chrome -- npx -y chrome-devtools-mcp@latest
claude mcp add prisma -- npx -y prisma mcp
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres <DATABASE_URL>
```

## スキル一覧

`.agents/skills/` に配置されたカスタムスキル。

| スキル | 説明 | 主な用途 | 依存 |
|---|---|---|---|
| **gh-self-merge** | develop → main の PR 作成＆マージ | セルフマージワークフロー | gh |
| **git-create-branch-commit-push** | ブランチ作成・コミット・プッシュ | 作業完了後のコミットフロー | git |
| **gws** | Google Workspace CLI 操作 | Drive, Gmail, Calendar, Sheets, Docs, Chat, Tasks 等 | gws |
| **image-generation** | Gemini API で画像生成 | プロンプトからの画像生成 | Gemini API |
| **image-resize** | 画像の一括リサイズ | 幅・高さ指定、フォーマット変換、品質調整 | sharp |
| **image-to-webp** | 画像を WebP に一括変換 | Web 配信用の軽量化 | sharp |
| **notion** | Notion ワークスペース操作 | ページ作成・更新、DB 操作、検索 | ncli |
| **playwright-cli** | ブラウザ自動操作 | Web テスト、フォーム入力、スクリーンショット | playwright-cli |
| **screenshot** | 開発サーバーのスクリーンショット取得 | PR の視覚的確認資料 | — |
| **video-to-mp4** | 動画を MP4 に一括変換 | H.264/H.265 エンコード、解像度・品質指定 | ffmpeg |

## ディレクトリ構成

```
ai-settings/
├── .agents/
│   ├── hooks/           # フック本体
│   │   └── notify.mjs
│   └── skills/          # カスタムスキル本体
│       ├── gh-self-merge/
│       ├── git-create-branch-commit-push/
│       ├── gws/
│       ├── image-generation/
│       ├── image-resize/
│       ├── image-to-webp/
│       ├── notion/
│       ├── playwright-cli/
│       ├── screenshot/
│       └── video-to-mp4/
├── .claude/
│   ├── settings.json    # Claude Code 設定
│   ├── hooks -> ../.agents/hooks/   # シンボリックリンク
│   └── skills -> ../.agents/skills/ # シンボリックリンク
├── .codex/
│   └── config.toml      # Codex 設定
└── .gitignore

# 展開先のシンボリックリンク（ホームディレクトリ）
~/.claude/skills  -> <repo>/.agents/skills/
~/.claude/hooks   -> <repo>/.agents/hooks/
~/.agent/skills   -> <repo>/.agents/skills/
~/.agent/hooks    -> <repo>/.agents/hooks/
```
