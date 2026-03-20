---
name: gws
description: >
  Google Workspace CLI (gws) で Drive, Gmail, Calendar, Sheets, Docs, Chat, Tasks などを操作する。
  Use when user asks to interact with Google Workspace services: send email, list drive files,
  check calendar, read/write sheets, create docs, send chat messages, manage tasks, etc.
  Also triggers on keywords: "gws", "Google Drive", "Gmail", "Google Calendar", "Sheets", "Docs", "Google Chat", "Tasks".
compatibility: Requires gws installed and authenticated (gws auth login). Claude Code only.
metadata:
  author: googleworkspace
  version: 1.0.0
  source: https://github.com/googleworkspace/cli
---

# Google Workspace CLI (gws)

One CLI for all of Google Workspace. Discovery Service ベースで全 API を動的に構築。

- Repository: https://github.com/googleworkspace/cli
- npm: `npm install -g @googleworkspace/cli`

## Authentication

```bash
gws auth setup       # 初回: GCP プロジェクト作成 + OAuth 設定 + ログイン (要 gcloud)
gws auth login       # 2回目以降のログイン
gws auth login -s drive,gmail,sheets   # スコープを絞る (未検証アプリ向け)
```

## CLI Syntax

```bash
gws <service> <resource> <method> [flags]
```

### Global Flags

| Flag | Description |
|------|-------------|
| `--format <FORMAT>` | `json` (default), `table`, `yaml`, `csv` |
| `--dry-run` | API を呼ばずにリクエスト内容を表示 |
| `--params '{"key":"val"}'` | URL/クエリパラメータ |
| `--json '{"key":"val"}'` | リクエストボディ |
| `--page-all` | 自動ページネーション (NDJSON) |
| `-o, --output <PATH>` | バイナリレスポンスをファイルに保存 |
| `--upload <PATH>` | ファイルアップロード (multipart) |

## Security Rules

- **Never** output secrets (API keys, tokens) directly
- **Always** confirm with user before executing write/delete commands
- Prefer `--dry-run` for destructive operations

## Shell Tips

- **zsh `!` expansion:** `Sheet1!A1` 等は `"Sheet1!A1"` とダブルクォートで囲む
- **JSON with double quotes:** `--params` / `--json` はシングルクォートで囲む

---

## Services & Helper Commands

### Drive

```bash
gws drive files list --params '{"pageSize": 10}'
gws drive files get --params '{"fileId": "<ID>"}'
```

**+upload** — ファイルアップロード:
```bash
gws drive +upload <file> [--parent <FOLDER_ID>]
```

### Gmail

```bash
gws gmail users.messages list --params '{"userId": "me", "maxResults": 5}'
```

**+send** — メール送信:
```bash
gws gmail +send --to <EMAILS> --subject <SUBJECT> --body <TEXT> [--cc <EMAILS>] [--bcc <EMAILS>] [--html] [--attach <FILE>]
```

**+read** — メール本文取得:
```bash
gws gmail +read --id <MESSAGE_ID> [--headers]
```

**+triage** — 未読メール一覧:
```bash
gws gmail +triage [--max 20] [--query "is:unread"]
```

**+reply / +reply-all / +forward** — 返信・転送:
```bash
gws gmail +reply --id <ID> --body <TEXT>
gws gmail +reply-all --id <ID> --body <TEXT>
gws gmail +forward --id <ID> --to <EMAILS>
```

### Calendar

```bash
gws calendar events list --params '{"calendarId": "primary", "maxResults": 10}'
```

**+agenda** — 今後の予定一覧:
```bash
gws calendar +agenda [--today | --tomorrow | --week | --days <N>] [--calendar <NAME>] [--timezone <TZ>]
```

**+insert** — 予定作成:
```bash
gws calendar +insert --summary <TEXT> --start <TIME> --end <TIME> [--calendar <ID>]
```

### Sheets

```bash
gws sheets spreadsheets create --json '{"properties": {"title": "My Sheet"}}'
```

**+read** — セル値取得:
```bash
gws sheets +read --spreadsheet <ID> --range "Sheet1!A1:D10"
```

**+append** — 行追加:
```bash
gws sheets +append --spreadsheet <ID> [--values "a,b,c"]
```

### Docs

```bash
gws docs documents get --params '{"documentId": "<ID>"}'
```

**+write** — テキスト追記:
```bash
gws docs +write --document <ID> --text <TEXT>
```

### Chat

```bash
gws chat spaces list
```

**+send** — メッセージ送信:
```bash
gws chat +send --space <SPACE_NAME> --text <TEXT>
```

### Tasks

```bash
gws tasks tasklists list
gws tasks tasks list --params '{"tasklist": "<ID>"}'
gws tasks tasks insert --params '{"tasklist": "<ID>"}' --json '{"title": "Buy milk"}'
```

### Other Services

`gws <service> --help` で各サービスのリソース・メソッド一覧を確認可能:

- `gws admin` — Admin SDK (reports, directory)
- `gws people` — Contacts / People API
- `gws keep` — Google Keep
- `gws meet` — Google Meet
- `gws classroom` — Google Classroom
- `gws forms` — Google Forms
- `gws slides` — Google Slides

### Schema Introspection

```bash
gws schema drive.files.list        # メソッドのリクエスト/レスポンススキーマを表示
gws drive --help                   # サービスのリソース一覧
gws drive files --help             # リソースのメソッド一覧
```
