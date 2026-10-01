# COLLECTANEA — Design Reference Registry

Status: Active
Updated: 2026-09-30

## Purpose

COLLECTANEAのvisual explorationと実装レビューで使う参照台帳。

参照は完成形をコピーするためではなく、特定の問題に対する優れた解法を抽出するために使う。

各参照について、以下を分ける。

- Borrow: 取り入れたい原理・interaction・情報設計
- Avoid: COLLECTANEAには適さない要素
- Scope: Home / Search / Manual / Reading / Mobile / Motion等
- Evidence: Award / official source / current product
- Checked: 最終確認日

## Core Product References

### Notion

Scope:
- Board / Galleryの情報整理
- Database view切替
- Heading navigation
- 高密度と可読性の両立

Borrow:
- View切替を同じcontent model上で成立させる
- property / tag / sort / filterの明快な構造
- 本文を邪魔しない軽量なheading navigation
- 状態が多くても画面の基準線を崩さない

Avoid:
- COLLECTANEAに不要なediting UIの複製
- 多機能化による操作密度の過剰増加

Evidence: User-selected reference
Checked: 2026-09-30

### Cosense

Scope:
- 高密度の知識探索
- Scan speed
- Link中心の情報接続

Borrow:
- 大量の情報を一画面で見渡せる密度
- titleと関連情報を素早く走査できる構造
- 記事を孤立させない関連導線

Avoid:
- Manualの階層性を弱めること
- Navigationをlink graphだけに依存すること

Evidence: User-selected reference
Checked: 2026-09-30

## Award / Showcase References

### Every Neuron

Recognition:
- FWA of the Day, 2026-09-20

Why relevant:
- 22,691のcellを扱うbrowser explorer
- 大規模データをoverviewとexplorationへ変換している

Borrow:
- Overview + detailの切替
- 密度が高くても現在位置を失わせないexplorer設計
- 技術情報を単なる一覧ではなく探索体験へ変える考え方
- progressive disclosure

Avoid:
- Documentation閲覧に不要な常時3D / GPU負荷
- noveltyを優先したnavigation

Source:
- https://thefwa.com/cases/every-neuron

Checked: 2026-09-30

### Ceramic Beats

Recognition:
- FWA of the Day, 2026-09-22

Why relevant:
- Metropolitan Museumの大規模collectionから144件を選び、grid / sequencerとして再構成

Borrow:
- Collectionを操作可能なsurfaceとして扱う
- Gridに意味を持たせる
- microinteractionが情報理解へ直結する設計
- 同じcontentを複数の見方へ変換する考え方

Avoid:
- Manual閲覧と関係しないsound-first interaction
- content discoveryを演出へ依存させること

Source:
- https://thefwa.com/cases/ceramicbeats

Checked: 2026-09-30

### Google Store

Recognition:
- 2025 Webby People's Voice Winner — Websites and Mobile Sites, Best Practices
- 2025 Webby People's Voice Winner — Best Mobile Visual Design, Function

Borrow:
- 視覚品質とfunctionの両立
- responsiveで情報階層を保つ方法
- card / comparison / filteringの精度
- mobileでのtouch targetと情報密度

Avoid:
- Commerce固有のpromotion hierarchy
- Product image中心の構造

Source:
- https://winners.webbyawards.com/2025/websites-and-mobile-sites/features-design/best-practices/333023/google-store

Checked: 2026-09-30

### Chrome Enterprise

Recognition:
- 2025 Webby Nominee — Websites and Mobile Sites, Best Practices

Borrow:
- Enterprise規模のcontent architecture
- 複数audienceを迷わせないnavigation
- 情報量の多いlanding pageのsection設計
- technical contentとbrand polishの両立

Avoid:
- Marketing conversionを主目的にしたCTA密度
- Documentationよりmarketingを優先する構造

Source:
- https://winners.webbyawards.com/2025/websites-and-mobile-sites/features-design/best-practices/331643/chrome-enterprise

Checked: 2026-09-30

### Docusign — 2026 Best Practices Winner

Recognition:
- 2026 Webby Winner / People's Voice Winner — Websites and Mobile Sites, Best Practices

Use:
- Current Webby best-practice benchmarkとしてwatchlistに置く
- 実画面を確認後、structure / interaction / responsiveの具体的なBorrowを追記する

Source:
- https://winners.webbyawards.com/winners/websites-and-mobile-sites/features-design/best-practices

Checked: 2026-09-30

### Self Aware

Recognition:
- Awwwards Site of the Day
- Awwwards掲載上でMicrointeractionsとして分類

Borrow:
- 小さなinteractionへidentityを持たせる
- pointer intentを先読みするmicrointeraction
- 過剰なpage transitionではなくlocal responseで質感を作る

Avoid:
- Portfolio固有の演出
- Documentationのscan speedを落とすmotion
- interactionのためのinteraction

Source:
- https://www.awwwards.com/sites/self-aware

Checked: 2026-09-30

## Award Criteria References

### The Webby Awards

Use as quality rubric:
- Content
- Structure and Navigation
- Visual Design
- Functionality
- Interactivity
- Innovation
- Overall Experience

Source:
- https://www.webbyawards.com/judging-criteria/

Checked: 2026-09-30

### Awwwards

Use as quality rubric:
- Design
- Usability
- Creativity
- Content
- Semantics / SEO
- Animations / Transitions
- Accessibility
- WPO
- Responsive Design
- Markup / Metadata

Source example:
- https://www.awwwards.com/sites/computerized-forms

Checked: 2026-09-30

### FWA

Use as quality emphasis:
- Creative originality
- Interactive experience
- Technical excellence

Source:
- https://thefwa.com/FWA25/25.html

Checked: 2026-09-30

## Implementation References (repair candidate)

Checked 2026-09-30. Used to close the completion repair packet R1–R9.

### WAI-ARIA APG — Combobox

Borrow:
- Input uses `combobox` with `aria-expanded` / `aria-controls` / `aria-activedescendant`
- Arrow-key selection, Enter to open, Escape to dismiss
- IME composition guard before Enter activation

Avoid:
- Custom key handling that fires during IME composition
- Hiding result type/status on small viewports

Scope: GlobalSearch palette (all pages)

Source:
- https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

Checked: 2026-09-30

### WAI-ARIA APG — Dialog (Modal)

Borrow:
- `dialog` + `aria-modal`, focus moved into the dialog on open
- Focus containment on Tab, focus restoration to the opener on close
- Escape handled anywhere inside the dialog

Avoid:
- Body MutationObserver hacks for modal state
- Screenshot-only open states with no real control path

Scope: GlobalSearch palette

Source:
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

Checked: 2026-09-30

### React hydrateRoot (SSR/hydration)

Borrow:
- Render SSR-safe defaults first; apply localStorage only in effects
- Validate stored values; tolerate disabled/corrupt storage

Avoid:
- Reading storage during the first render (hydration mismatch)

Scope: KnowledgeExplorer preferences, sidebar state

Source:
- https://react.dev/reference/react-dom/client/hydrateRoot

Checked: 2026-09-30

### Docusaurus — Sidebar

Borrow:
- Explicit persisted sidebar state owned in one place (`Root.js`)
- Discoverable reopen control in the reading shell

Avoid:
- Width heuristics and body-wide MutationObserver sync

Scope: Reading shell open/closed centering

Source:
- https://docusaurus.io/docs/sidebar

Checked: 2026-09-30

### Docusaurus — Lifecycle APIs (build-derived catalog)

Borrow:
- Build script scans real Markdown/MDX/docs/blog metadata into `generated-catalog.json`
- Components consume the generated model; new pages appear without component edits

Avoid:
- Hand-maintained UI-only copies of content data and fabricated counts/dates

Scope: Home, Manual tree, Articles DB, search

Source:
- https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis

Checked: 2026-09-30

## Reference Selection Rule

新しい参照は、有名・受賞済みという理由だけで追加しない。

最低1つを満たすこと。

- COLLECTANEAの未解決UI問題に具体的な解法を持つ
- 現在案より明確に優れたinteractionを示す
- Maintainabilityを損なわず独自性を高められる
- Accessibility / responsive / performanceの改善に使える
- 同一contentを複数viewへ展開する良い例である

追加時はBorrow / Avoid / Scopeを必ず書く。

## Ongoing Research Loop

各Visual Explorationまたは大きなUI変更の前に、次を行う。

1. Current unresolved questionsを確認
2. Awwwards / Webby / FWA /優良productから関連例を3–8件収集
3. 表面的なstyleではなくinteractionと構造を分析
4. 採用候補を最大3原理へ絞る
5. requirements / briefへ必要な差分だけ反映
6. visual案で比較
7. 採用結果と不採用理由を本台帳へ戻す

一度の流行や一作例を恒久ルールへ昇格しない。複数回有効だった原理だけをdesign systemへ昇格する。

## Documentation Reading Reference — 2026-10-01

### Cycling '74 Max 8 Legacy Documentation — Basic Tutorial 1

Source:
- https://docs.cycling74.com/legacy/max8/tutorials/basicchapter01

Observed implementation:
- body uses Lato at 16px / 1.5 line-height
- body text is a softened dark gray rather than absolute black
- headings are compact: roughly H1 2em / H2 1.75em / H3 1.5em
- heading hierarchy combines size, weight, luminance and spacing instead of extreme scale jumps
- paragraph/list/block rhythm is mostly built from 1em / 1.5rem steps
- links carry a distinct semantic color in the legacy site
- tutorial content is divided into repeated small sections and closes with related/next navigation

Borrow:
- **Document quietness**: keep product/navigation chrome outside the reading flow as much as possible
- **Navigation high-functionality / Document low-chrome**
- compact heading scale that marks sections without repeatedly resetting the reader's gaze
- stable vertical rhythm and short cognitive sections
- inline links as part of the knowledge graph rather than replacing them with many related-content cards
- end-of-document See Also / Previous / Next navigation
- use luminance / weight / spacing together before making headings dramatically larger

Avoid:
- copying the legacy visual styling or framework literally
- adopting its exact font sizes/spacing as universal tokens
- adding blue purely because the reference uses blue; COLLECTANEA remains monochrome-first until a semantic accent is intentionally chosen
- weakening current keyboard, responsive, search, Heading Rail or content-model behavior to imitate the older site

Scope:
- Manual / Article reading pages
- typography hierarchy
- inline technical cross-linking
- end-of-document navigation
- future semantic link-color exploration

Checked: 2026-10-01

