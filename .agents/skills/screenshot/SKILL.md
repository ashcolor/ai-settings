---
name: screenshot
description: 開発サーバーの画面スクリーンショットを取得してファイルに保存。PR作成時の視覚的な確認資料として使用。「スクリーンショットを取得」「画面キャプチャ」などと言われた時に使用。
---

# 開発サーバースクリーンショット取得

開発サーバーで表示中の画面のスクリーンショットを取得し、`.screenshots.local/`ディレクトリに保存します。

## 前提条件

- 開発サーバーが起動していること
- playwright-cli が利用可能であること

## 実行手順

### 1. 保存先ディレクトリの確認・作成

```bash
mkdir -p .screenshots.local
```

### 2. 開発サーバーの起動確認

開発サーバーが起動しているか確認し、起動していなければ起動する。

### 3. ブラウザを開いて画面サイズを設定

```bash
playwright-cli open [開発サーバーURL]
playwright-cli resize 1920 1080
```

**注意:** デフォルトのビューポートは小さいため、PR用のスクリーンショットでは必ず設定すること。

### 4. スクリーンショット取得

#### 4.1 対象ページに移動

```bash
playwright-cli goto [対象URL]
```

#### 4.2 ページ読み込み待機

```bash
sleep 3
```

**注意:** SPAの場合、ルーティングやデータ読み込みに時間がかかる場合があるため、必要に応じて待機時間を調整すること。

#### 4.3 スクリーンショット取得

```bash
playwright-cli screenshot --filename=.screenshots.local/[ファイル名].png
```

**ファイル名の命名規則:**
- `[YYYYMMDD-HHMMSS]-[画面名]-[状態].png`
- 小文字・ハイフン区切り
- 例: `20250126-143025-login-page.png`, `20250126-143030-dashboard-page.png`

**日時プレフィックスの取得:**
```bash
date +%Y%m%d-%H%M%S
```

### 5. 保存結果の確認

```bash
ls -lh .screenshots.local/
```

### 6. スクリーンショットの内容確認とviewport調整

撮影後は必ずスクリーンショットの内容を確認し、画面全体が収まっているかをチェックする。

**確認ポイント:**
- ページの下部まで撮影できているか
- 必要な要素がすべて含まれているか
- 見切れている部分がないか

**画面全体が収まっていない場合:**

縦に長いページの場合は、viewportの高さを調整して再撮影する。

```bash
# 例: 高さを2400pxに設定（縦長ページ用）
playwright-cli resize 1920 2400
playwright-cli goto [対象URL]
sleep 3
playwright-cli screenshot --filename=.screenshots.local/[ファイル名].png
```

**推奨viewportサイズ:**
- 通常のページ: `1920 1080`
- 縦長のページ: `1920 2400` または `1920 3000`
- 特に長いページ: 必要に応じてさらに高さを増やす

### 7. ブラウザを閉じる

```bash
playwright-cli close
```
