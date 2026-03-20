---
name: git-create-branch-commit-push
description: 作業完了後のコミットとプッシュをサポート。「コミットして」「プッシュして」などと言われた時に使用。
---

# コミット〜プッシュサポート

作業完了後のコミット、プッシュまでの一連のフローをサポートします。

## フロー概要

```
1. 変更内容の確認
2. スクリーンショット取得（UIの場合）
3. 品質チェック
4. コミット
5. プッシュ
```

## 手順詳細

### 1. 変更内容の確認

```bash
git status
git diff
```

ブランチがmainの場合は以下の命名規則で新規ブランチを切る。

```
[種類]/[タスク番号]-[タスク概要]
```

- 種類: `feature`, `fix`, `refactor`, `chore` など
- タスク番号/issue番号: チケットやissueがある場合に付与
- タスク概要: 英語のケバブケース（例: `add-user-list`）

例: `feature/1234-add-user-list`, `fix/5678-header-layout`

### 2. スクリーンショット取得（UIの場合）

UIに関する変更の場合は **screenshot** スキルに沿ってスクリーンショットを取得する。

### 3. 品質チェック

プロジェクトに合った品質チェックを実行する（format, lint, type check, test など）。
`package.json` の scripts を確認し、利用可能なものを実行すること。

### 4. コミット

**commit-message** スキルに沿ってコミットメッセージを提案し、ユーザーの許可を得てからコミットする。
コミットメッセージにAIが生成した旨は記載しない。`Co-Authored-By` も付けないこと。

### 5. プッシュ

```bash
git push -u origin <branch-name>
```

### 6. PR 作成

`gh pr create` でPRを作成する場合、以下のルールに従うこと。

- PR body に `🤖 Generated withを付けない
- タイトルは70文字以内、本文は簡潔に

```bash
gh pr create --title "タイトル" --body "## Summary
- 変更点1
- 変更点2
```
