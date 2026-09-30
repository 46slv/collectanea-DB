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

- Home: 横断検索 + Command Palette + 資料Panel/List
- Sort: 最近更新を既定、変更可能
- Manual: 専用トップ + 全階層一覧
- Reading: 左Hierarchy / 中央Article / 右Heading Rail
- Hierarchy CLOSED: Articleをviewport中央へ再センタリング
- Heading Rail: H1/H2/H3を線長で表現、hoverで名称、clickで移動、activeは輝度強調
- Articles: DB型
- Mobile: Hierarchyはoverlay
- Visual: 高密度、細線、neutral、抽象コピーを避ける

## Open Questions

- Panel密度
- Command Paletteのフィルタ配置
- Manualトップの全階層表示
- Hierarchy幅 / resize
- Heading Railの線長・輝度段階
- Mobile Heading Rail
- Article最大幅
- dark/light初期設定
- 検索ranking

## Phases

1. Hearing — ACTIVE
2. Visual Exploration — NEXT
3. Implementation Design — PENDING
4. Implementation — PENDING
5. Verification — PENDING

## Next Action

Hearingを続け、Home / Manual Top / Article Pageのvisual explorationへ進む。
