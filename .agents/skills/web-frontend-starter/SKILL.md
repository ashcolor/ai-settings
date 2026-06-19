---
name: web-frontend-starter
description: 新規 Web フロントエンド（React + Vite）プロジェクトを始めるときの技術スタック・ディレクトリ構成・命名規約を定めた規約集。「新しくフロントエンドを作る」「Web アプリを新規に始める」「React プロジェクトのひな形」「ディレクトリ構成どうする」などと言われた時に使用。slot-tools の構成を踏襲する。
---

# web-frontend-starter

新規 Web フロントエンドを始めるときの 標準構成 を定めたドキュメント。
`slot-tools`（React + Vite の個人ツール集）の構成を正典として、使用ライブラリ・ディレクトリ構成・命名規約を明文化したもの。

新規プロジェクトを立ち上げるときは、この規約に沿って構築する。特別な理由がない限りここから外れない。逸脱する場合は理由を添えること。

## 技術スタック（標準）

バージョンは固定しない。プロジェクト作成時に `pnpm create` / `pnpm add` で各パッケージの最新を入れる。

| 区分 | 採用 | 補足 |
| --- | --- | --- |
| パッケージマネージャ | pnpm | npm/yarn は使わない |
| ビルドツール | Vite（`@vitejs/plugin-react`） | |
| 言語 | TypeScript（`strict: true`） | |
| UI ライブラリ | React（`react` / `react-dom`） | |
| ルーティング | react-router（`BrowserRouter`） | `react-router-dom` ではなく `react-router` から import |
| CSS | Tailwind CSS v4（`@tailwindcss/vite`） | PostCSS 設定は不要。`@import "tailwindcss"` を CSS 側に書く |
| コンポーネント | daisyUI（Tailwind プラグイン） | `@plugin "daisyui"` で読み込み |
| アイコン | `@iconify/react` | `<Icon icon="..." />` |
| PWA | vite-plugin-pwa（必要時） | `registerType: "autoUpdate"` |
| Lint | oxlint（`oxc`/`typescript`/`unicorn`/`react` プラグイン） | 高速。唯一のリンタ |
| Format | oxfmt | |

`module: "ESNext"` / `"type": "module"` の ESM 構成。`moduleResolution: "bundler"`、`verbatimModuleSyntax: true`、`jsx: "react-jsx"`。

### package.json scripts（標準形）

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "fmt": "oxfmt",
    "fmt:check": "oxfmt --check"
  }
}
```

## ディレクトリ構成（features ベース）

機能ごとに `src/features/<機能名>/` へ縦に閉じる。横断的に共有するものだけ `src` 直下のディレクトリに置く。

```
src/
  main.tsx              # エントリ。createRoot + BrowserRouter で AppShell をマウントするだけ
  AppShell.tsx          # <Routes> 定義。SEO メタ更新などアプリ全体の制御
  index.css             # @import "tailwindcss" / daisyUI テーマ / @theme カスタム変数
  types.ts              # アプリ横断の型
  layouts/
    AppLayout.tsx       # Header / Dock などの外枠。children を受け取る
  components/            # 機能をまたいで使う共通コンポーネント（Header, Dock, 汎用 Input 等）
  constants/            # 共有定数。index.ts で再 export、機能別に分割（memo.ts 等）も可
  utils/                # 共通ユーティリティ + 汎用 hooks（useLocalStorage, clamp 等）
  features/
    <機能名>/           # 1機能 = 1ディレクトリ。kebab-case
      route.tsx         # その機能のルートコンポーネント（ページ本体）。AppShell から import
      components/       # その機能専用のコンポーネント（ダイアログ, ツールバー等）
      hooks/            # その機能専用の hooks（useXxxEditor 等）
      constants.ts      # その機能専用の定数
```

### 配置のルール

- まず features 内に置く。 1つの機能でしか使わないコンポーネント・hook・定数は、その feature ディレクトリに閉じる。
- 2つ以上の機能で使い始めたら昇格する。 共通化のタイミングで `src/components` / `src/utils` / `src/constants` に引き上げる。最初から共通に置かない。
- 共通 hooks は専用ディレクトリを作らず `src/utils/` に置く（`useLocalStorage.ts` 等）。
- `main.tsx` は最小限。ルーティングや状態は持たせず `AppShell` に委譲する。
- レイアウト（Header/Dock 等の外枠）は `layouts/` に分離し、`children` を受ける形にする。

## 命名規約

- ディレクトリ: kebab-case（`machine-database`, `operator-info`）
- コンポーネントファイル: PascalCase（`Header.tsx`, `ConfigDialog.tsx`）。ファイル名 = export するコンポーネント名
- hooks ファイル: camelCase + `use` 始まり（`useMemoEditor.ts`, `useLocalStorage.ts`）
- ユーティリティ/定数ファイル: camelCase（`calculate.ts`, `clamp.ts`）
- 機能のルート: 各 feature の `route.tsx`。export 名は機能名の PascalCase（`export function Memo()`）
- export は named export を基本にする（default export は避ける）

## 新しい feature を追加する手順

1. `src/features/<機能名>/route.tsx` を作り、`export function <PascalName>()` でページ本体を書く。
2. 専用パーツが要れば `components/`・`hooks/`・`constants.ts` を同ディレクトリに足す。
3. `AppShell.tsx` で `import { <PascalName> } from "./features/<機能名>/route"` し、`<Route path="/<path>" element={<PascalName />} />` を追加する。
4. ナビゲーション（Header/Dock や Home のツール一覧）に該当機能のエントリを足す。

## 新規プロジェクト立ち上げ（手動手順の目安）

このスキルは規約の参照用。実際の scaffold は以下を手動 / AI 補助で行う。

```bash
pnpm create vite@latest <project> -- --template react-ts
cd <project>
pnpm add react-router @tailwindcss/vite daisyui @iconify/react
pnpm add -D oxlint oxfmt
# vite.config.ts に react() と tailwindcss() プラグインを追加
# index.css に @import "tailwindcss"; と @plugin "daisyui"; を記述
# src を上記ディレクトリ構成に整える（main.tsx / AppShell.tsx / layouts / features ...）
```

PWA（vite-plugin-pwa）は 必要になった時点で追加する。最初から全部入れない。
