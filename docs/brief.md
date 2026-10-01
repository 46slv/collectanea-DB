# COLLECTANEA — Working Brief

Status: Content Architecture — structure before mass authoring
Brief Gate: Content Architecture
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

## Visual Acceptance Feedback — 2026-10-01

User-observed issues on the local production preview:

1. **Single-destination cards were not fully clickable**
   - Symptom: clicking the card background did nothing; only the title link navigated.
   - Required behavior: the entire material/article card is one hit target when it represents one destination.
   - Implementation direction: stable full-surface link overlay, visible card-level focus, no moving hit target.

2. **Hierarchy close control had weak spatial ownership**
   - Symptom: the close control appeared on the Article side and was difficult to associate with the left Hierarchy.
   - Required behavior: close control lives inside the Hierarchy itself.
   - Reopen behavior: when collapsed, a compact control remains at the former left boundary without changing article centering.
   - Mobile keeps native drawer behavior rather than duplicating desktop controls.

3. **Reading-page visual principle**
   - Adopt the Cycling '74 Max documentation reference as a structural reading reference.
   - Principle: **Navigation high-functionality / Document low-chrome**.
   - Article content should be visually quieter than navigation/search surfaces.
   - Prefer compact heading hierarchy, stable vertical rhythm, inline knowledge links and end-of-document related/next navigation over repeated in-body UI cards.

Canonical details are in `docs/requirements.md §16` and `docs/design-references.md`.

## Current repair scope

Active bounded repair:

- full-card hit targets on Home and Articles
- close Hierarchy control inside the sidebar
- reopen control at the left boundary
- regression assertions for both behaviors
- specification/reference update for document quietness

The wider typography/inline-link/See Also refinements are now design requirements but are not all forced into this bounded interaction repair. They should be evaluated visually after the current preview update, to avoid changing reading typography before user acceptance.

## Development / Verification Workflow

COLLECTANEAでは、実装と検証の境界を次のように扱う。

- 実装途中で、build不能・主要導線未成立・明確な破損がある間はtask branchを使ってよい。
- **最低限buildでき、ユーザーが実際に触って検証できる段階に入ったらmainへ統合する。**
- Visual Acceptance、実ブラウザ確認、細かなUI調整、記事追加、軽い修正は原則main上で継続する。
- mainへ入れた後に問題が見つかった場合は、main上で小さく修正し、ローカルpreviewで確認してからpushする。
- 大規模refactor、routing/content modelの大変更、dependencyの大更新、破壊的変更だけはtask branch / PRへ戻す。
- Heavy Quality workflowはmanual-onlyとし、日常の検証で自動実行しない。
- mainへのsite-impacting pushはPages deployを起動する。短時間の連続pushでは古いdeployをcancel-in-progressで収束させる。

このrepoでは「main = 完成済みだけを置く場所」ではなく、**検証可能な統合状態の正本**として扱う。検証開始後のsource of truthをmainへ集約し、branchとpreviewの二重状態を長引かせない。

## Fusion Mass-Authoring Architecture

Before writing large volumes of prose, the manual structure is fixed around two separate user modes:

```
Learn / understand
  → Start Here
  → Learn
  → Patterns

Work / look up
  → Node Reference
  → Recipes
  → Troubleshooting
  → Index
```

The key transfer path is:

```
Concept → Invariant → Transfer → Pattern → Node
```

Canonical architecture documents:

- `docs/fusion-content-architecture.md`
- `docs/fusion-index-architecture.md`
- `docs/fusion-authoring-contract.md`

The existing published files are seed content and will be migrated incrementally. Do not create a large empty public tree before real pages exist.

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

1. Review the proposed Fusion hierarchy and index model.
2. Select the first core Learn units to instantiate.
3. Migrate existing `concepts.md`, `expressions.md`, Node pages, Recipes and Troubleshooting into their canonical owners without duplicating prose.
4. Exercise the metadata vocabulary on a representative sample before automating index generation.
5. Once the structure is accepted, scale authoring aggressively using `docs/fusion-authoring-contract.md`.
