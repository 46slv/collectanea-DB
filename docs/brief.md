# COLLECTANEA — Working Brief

Status: Visual Exploration
Brief Gate: Visual Exploration
Updated: 2026-09-30

## Goal

資料単位で探しやすく、Manual全体を把握しやすく、長文を読みやすい技術資料サイトへ再設計する。

見やすさ、独自性、操作品質、実装品質を高い水準で両立し、後から内容・構造・visual directionを変更しやすい基盤にする。

## Source of Truth

- Functional / visual requirements: `docs/requirements.md`
- Quality and review gate: `docs/quality-bar.md`
- Design reference registry: `docs/design-references.md`
- Working Brief: `docs/brief.md`
- Implementation: GitHub repository
- Publish: GitHub Pages

## Quality Target

Awwwards、The Webby Awards、FWAで評価対象になり得る水準のcraftを目標にする。

ただし、受賞サイト風の過剰演出は目的にしない。

同時に満たすもの:

- Award-grade visual craft
- Documentation-grade readability
- Product-grade usability
- Engineering-grade maintainability
- Long-term change resilience

内部quality gate、採点軸、反復review、maintainability条件は `docs/quality-bar.md` を正本とする。

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
- 初期Visual Explorationはmonochrome中心
- Dark-firstでデザイン
- Light themeも対応
- Hueより輝度差で階層を作る
- Accentは必要性が確認できた後に小面積で追加
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

## Reference Research

Visual案や大きなUI変更の前に、未解決問題へ対応する外部referenceを調査する。

- Awwwards
- The Webby Awards
- FWA
- 実用性の高いDocumentation / Knowledge / Database product

有名・受賞済みという理由だけで採用しない。

各referenceについて次を明記する。

- Borrow
- Avoid
- Scope
- Evidence
- Checked date

初期referenceと継続調査手順は `docs/design-references.md` を正本とする。

## Open Questions

Visual Explorationで決める。

- Home Panelの具体的なサイズと情報密度
- Type / Domain filterの配置
- Command Paletteのfilter placement
- Manualトップの全階層表示方法
- Hierarchy resizeを入れるか
- Hierarchy CLOSED時のcentered reading layout
- Heading Railの最終線長・輝度段階
- Heading Rail hover labelの展開位置
- Mobile Heading Railの形
- Article max-width 800px前後の最終値
- Dark / Lightの初期mode
- 検索ranking
- Lexend + Noto Sans JPの実画面での相性

## Phases

1. Hearing — COMPLETE
2. Visual Exploration — ACTIVE
3. Implementation Design — PENDING
4. Implementation — PENDING
5. Verification — PENDING

## Visual Exploration Loop

各iterationで以下を行う。

1. Requirements / Quality Bar / Referencesをfresh-read
2. 比較するscreenと変更軸を固定
3. visualを作成
4. 同じ条件でself-review
5. P0 / P1 / P2を分類
6. 上位1–3点を修正
7. 前案と比較
8. Quality Gateまで反復

構造問題をmicro polishで隠さない。必要ならrequirementsへ戻る。

## Current Review Findings

現行monochrome concept boardのP0/P1相当修正:

1. HomeのType filterとDomain filterを分離
2. Manual Topで最上位カテゴリだけでなく実際の階層Treeを表示
3. Heading RailのH1 / H2 / H3線長差を強化
4. Heading Railのinactive / hover / active輝度差を強化
5. Hierarchy CLOSED状態をvisual化
6. Mobile Article / Hierarchy / Heading navigation状態をvisual化
7. Command Paletteのselected rowを背景・indicator・type hierarchyで強化

## Next Action

第2稿は、次のscreen / stateを同じデザイン言語で作る。

1. Home — Type / Domain filter分離、Panel / List control
2. Command Palette — filter chips、selected result、keyboard state
3. Manual Top — 2–3階層のfull tree
4. Article — Hierarchy OPEN
5. Article — Hierarchy CLOSED / viewport centered
6. Heading Rail — inactive / hover / active state
7. Mobile Home
8. Mobile Article
9. Mobile Hierarchy overlay

第2稿を `docs/quality-bar.md` の8軸で採点し、Quality Gate未達なら上位問題を修正して再作成する。

実装はvisual directionとcomponent directionがQuality Gateを満たした後に開始する。
