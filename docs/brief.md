# COLLECTANEA — Working Brief

Status: Foundation Verified — awaiting merge decision
Brief Gate: Verified
Updated: 2026-10-01

## Goal

資料単位で探しやすく、Manual全体を把握しやすく、長文を読みやすい技術資料サイトを作る。

見やすさ、独自性、操作品質、実装品質を高い水準で両立し、後から内容・構造・visual directionを変更しやすい基盤にする。

## Source of Truth

- Functional / visual requirements: `docs/requirements.md`
- Quality and review gate: `docs/quality-bar.md`
- Design reference registry: `docs/design-references.md`
- Working Brief: `docs/brief.md`
- Final verification: `docs/review-receipt.md`
- Implementation: GitHub repository
- Publication: GitHub Pages after merge/deploy authority

## Quality Target

Awwwards、The Webby Awards、FWAで評価対象になり得る水準のcraftを継続目標にする。

ただし受賞サイト風の演出自体を目的にせず、次を同時に維持する。

- Award-grade visual craft
- Documentation-grade readability
- Product-grade usability
- Engineering-grade maintainability
- Long-term change resilience

外部賞の受賞・認証や数値スコアは、このBriefの完了条件ではない。

## Implemented foundation

### Content model

- Docusaurusの処理済みcontent/permalinkをcatalog pluginで一元投影
- Home / Manual / Articles / Searchが同じ生成catalogを利用
- page count、更新日、tags、permalinkを実contentから取得
- draft / unlistedを公開catalogから除外
- 普通のMarkdown追加や新material追加をcomponent編集なしで反映
- Searchは本文もindex対象
- temporary test fixturesは公開contentへ残さない

### Home

- 大きな横断検索
- 資料単位のPanel / List表示
- Type / Tag filter
- 最近更新を既定にしたsort
- 名前順 / ページ数sort
- compact monochrome information panels
- persisted view / sort preference

### Global Search / Command Palette

- 全ページ共通の1つのsearch surface
- navbar GUI entry
- optional Ctrl/Cmd + K
- Type / Tag facets
- Japanese / Latin token matching
- result type / material context
- keyboard / mouse / touch
- arrow selection / Enter / Escape
- IME-safe input
- modal focus containment / restoration
- zero-result handling
- 40件を超える結果へのkeyboard access

### Manual Top

- Manual内検索
- multi-level hierarchy tree
- expand / collapse
- direct page navigation
- current materialに限定したrecent updates
- content-driven structure

### Reading Layout

Desktop:

- Left: Hierarchy
- Center: Article
- Right: Heading Rail

Hierarchy:

- explicit persisted state
- discoverable open/close control
- corrupt/disabled storageでも利用可能
- closed時は800px article text columnがviewport中央へ再配置
- verified center drift: 0px at 1440px viewport

Mobile:

- native Docusaurus hierarchy drawer
- article widthを圧迫しない
- compact heading navigation

### Heading Rail

- rendered Markdown headingsから生成
- H1 / H2 / H3 = 32 / 22 / 14px
- inactive / hover / currentをmonochrome luminanceで区別
- currentは2px thicknessも併用
- hover/focusで見出し名を表示
- native anchors
- scroll tracking
- long outline scroll
- mobile heading navigation
- reduced-motion path

### Articles

- 時系列ブログ一覧を主UIにしない
- full-catalog DB view
- search
- tag filter
- Panel / List
- updated-date sort
- blog post URLs / RSS等のDocusaurus機能は維持

## Current visual baseline

### Typography

- UI / Latin: Lexend Variable when available
- Japanese body: Noto Sans JP when available
- robust system fallbacks
- CIはremote font stylesheetを意図的に遮断してfallback可読性も検証

### Color

Current site chrome is monochrome.

Light:
- canvas `#fafafa`
- surface `#ffffff`
- raised `#f0f0f0`
- text `#171717`
- secondary `#505050`
- muted `#626262`

Dark:
- canvas `#0f0f0f`
- surface `#151515`
- raised `#202020`
- text `#efefef`
- secondary `#bcbcbc`
- muted `#aaaaaa`

State hierarchy is primarily luminance / line contrast, not hue.

### Geometry

- thin 1px structural lines
- small radius
- 800px article max width
- 280px hierarchy baseline width
- 44px Heading Rail
- stable hit targets
- no layout-shifting hover
- proximity hover on applicable panels

## Verification

Final accepted implementation candidate before documentation-closeout:

- head: `be30350cbf81cfae91b324e05bd8db56acdb12d6`
- Actions run: `36750386329`
- result: **success**
- real UI: 12 / 12 cases PASS
- content integration: PASS
- console/page errors: 0
- source dirty state after tests: clean

Detailed evidence is in `docs/review-receipt.md`.

## Phases

1. Hearing — COMPLETE
2. Visual Exploration — COMPLETE for current monochrome foundation
3. Implementation Design — COMPLETE
4. Implementation — COMPLETE
5. Verification — COMPLETE

## Non-blocking follow-up directions

These are future refinement candidates, not blockers for the current foundation.

- hierarchy resize option
- future accent-color exploration
- search ranking improvements
- additional award/reference research
- further typography/craft refinements
- richer material-card metadata when real content volume grows
- Fusion technical-content verification against primary sources

Any follow-up that materially changes navigation, content model, centering, search contracts or accessibility returns through `requirements.md` and the quality/review gate.

## Next Action

Current foundation is ready for PR review/merge decision.

Do not merge or publish from this Brief without explicit merge/deploy authority.
