---
name: gh-self-merge
description: Create a PR from develop to main and merge it
allowed-tools: Bash(git *), Bash(gh *)
---

# gh-self-merge

developブランチからmainブランチへのPR作成とマージを行う。

## 手順

1. git statusで現在の状態を確認
2. developブランチにいることを確認
3. `git log main..develop --oneline`でmainに含まれていないコミットを確認
4. PRタイトルと本文を作成
   - タイトルは変更内容を簡潔に
   - 本文はSummaryのみ
5. `gh pr create --base main --head develop`でPR作成
6. `gh pr merge --merge`でそのままマージ

## 注意

- ghコマンドが認証されていない場合は`gh auth login`を先に実行
- mainブランチへの直接pushは避け、必ずPR経由でマージする
