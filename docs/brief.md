# COLLECTANEA — Working Brief

Status: Hearing
Brief Gate: Hearing
Updated: 2026-09-30

## Goal

資料単位で探しやすく、Manual全体を把握しやすく、長文を読みやすい技術資料サイトへ再設計する。

## Source of Truth

- Requirements: `docs/requirements.md`
- Brief: `docs/brief.md`
- Implementation: GitHub repository
- Publish: GitHub Pages

## Current Decisions

### Information / Navigation

- Home: 横断検索 + Command Palette + 資料Panel/List
- Sort: 最近更新を既定、変更可能
- Tags: software / DaVinci / Blender / manual / article等の多軸分類
- Manual: 専用トップ + 全階層一覧 + Manual内検索
- Reading: 左Hierarchy / 中央Article / 右Heading Rail
- Hierarchy CLOSED: Article + Heading Railをviewport中央へ再センタリング
- Articles: 時系列ブログではなくDB型
- Mobile: Hierarchyはoverlay

### Heading Rail

- Markdown headingから自動生成
- H1 / H2 / H3を線長で表現
- 通常時は線のみ
- hoverで見出し名
- clickで該当anchorへ移動
- scroll位置をactive表示
- active / hoverは輝度差を主要表現として使う

### Visual Direction — Provisional

Visual Explorationの初期baseline。比較後に確定する。

Typography:
- UI / Navigation / Meta / Latin: Lexend Variable
- Japanese body: Noto Sans JP
- Code: system monospace stack
- body: 15–16px
- Japanese line-height: 1.75–1.9

Color:
- neutral / silver / cool gray
- Dark-firstでデザイン
- Light themeも対応
- Hueより輝度差で階層を作る
- Accentは低彩度・小面積
- OS preferenceを初期theme候補とする

Geometry:
- 1px thin-line中心
- panel radius 0–4px
- heavy rounded card / strong shadowは避ける
- spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- Article provisional max-width: 800px
- Left Hierarchy provisional width: 280px
- Heading Rail provisional width: 44–56px

Interaction:
- fluid / proximity hover
- hit targetとlayoutは動かさない
- brightness / border contrastを主に変化
- focus-visible必須
- reduced-motion対応

詳細token・palette・metadata要件は `docs/requirements.md` を正本とする。

## Open Questions

Visual Explorationで決める。

- Home Panelの具体的なサイズと情報密度
- Command Paletteのフィルタ配置
- Manualトップの全階層表示方法
- Hierarchy resizeを入れるか
- Heading Railの最終線長・輝度段階
- Mobile Heading Railの形
- Article max-width 800px前後の最終値
- Dark / Lightの初期mode
- 検索ranking
- Lexend + Noto Sans JPの実画面での相性

## Phases

1. Hearing — ACTIVE
2. Visual Exploration — NEXT
3. Implementation Design — PENDING
4. Implementation — PENDING
5. Verification — PENDING

## Next Action

Hearingをもう少し続ける。

その後、以下を同じ要件・token候補でvisual explorationする。

1. Home
2. Manual Top
3. Article / Reading Layout

Visual Explorationでは、特に以下を比較する。

- Panel密度
- Font pairing
- Dark paletteの明度階層
- Heading Railの線長と輝度
- Hierarchy / Article / Railの横幅バランス

実装はvisual direction確定後に開始する。
