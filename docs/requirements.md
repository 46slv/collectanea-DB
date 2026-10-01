# COLLECTANEA — 要件

Status: Visual Acceptance repair in progress
Updated: 2026-10-01

## 1. 目的

COLLECTANEAは、技術マニュアル、技術記事、リファレンス、調査記録を公開・検索・閲覧するための技術資料サイトとする。

実装基盤はDocusaurus / Markdown・MDX / GitHub / GitHub Pagesを維持する。

## 2. 情報構造

主要コンテンツは「資料単位」で扱う。

例:
- DaVinci Resolve / Fusion
- Blender
- After Effects
- Git
- Cavalry

資料とは別に、多軸タグを持つ。

例:
- software
- DaVinci
- Blender
- manual
- article
- reference
- research

同一資料・ページは複数タグへ所属できる。

## 3. Home

### 3.1 検索

ホーム上部に大きな検索欄を置く。

検索はCommand Palette型とし、入力中に候補を表示する。

検索対象:
- 資料
- Manual page
- Article
- Reference
- Research
- Node / topic
- Tag

検索結果には種類と所属を表示する。

例:
- NODE — Merge — Fusion > Nodes > Compositing
- ARTICLE — Expressionで位置を同期する — DaVinci / Fusion

フィルタ:
- All
- Manual
- Article
- Reference
- Research
- software
- DaVinci
- Blender
- その他タグ

GUIから常に利用可能にする。Ctrl/Cmd + Kは補助ショートカットとして許可するが、必須操作にしない。

### 3.2 資料パネル

検索の下に、資料単位のPanel Viewを表示する。

デフォルト並び順は「最近更新」。

ユーザーが並び順を変更できる。

候補:
- 最近更新
- 新規追加
- 名前順
- 資料量

表示方式は切替可能にする。

- Panel
- List

パネルは画像前提にしない。NotionのBoard / Galleryの情報整理感を参照し、文字情報だけでも成立させる。

各パネルに最低限表示する情報:
- 資料名
- 概要
- タグ
- 更新日
- 必要に応じてページ数 / Node数 / Article数など

## 4. Manualトップ

各Manualには専用トップを持つ。

目的:
- Manual全体の構造を一画面で把握できる
- 目的の章・ページへ短距離で移動できる

最低要件:
- Manual名
- Manual内検索
- 主要カテゴリ
- 全階層Tree
- 各章 / ページへのリンク
- 必要に応じて最近更新

カードだけで階層を隠さず、全階層を一覧できるUIを優先する。

## 5. 本文ページ

デスクトップの基本構造:

1. 左: Hierarchy
2. 中央: Article
3. 右: Heading Rail

### 5.1 左Hierarchy

- Manual / 資料内の階層Tree
- 開閉可能
- 現在ページを明示
- Tree内検索またはフィルタを持てる
- 開閉状態はページ遷移で保持する

### 5.2 左Hierarchyを閉じた場合

単にsidebar幅を0にするだけではなく、本文レイアウトを再計算する。

Hierarchy CLOSED時:
- 本文はviewport基準で中央へ再センタリングする
- 左側だけ空いた非対称レイアウトにしない
- Article + Heading Railを1つの読書レイアウトとして扱う

### 5.3 本文

- Markdown / MDX前提
- 読みやすい最大幅を持つ
- 長文でも中央の読書位置を維持する

## 6. Heading Rail / 右目次

Notionの見出しナビゲーション表現を参考に、通常時は文字ではなく横線だけを表示する。

Markdown見出しレベルに応じて線長を変える。

- H1: 最長
- H2: 中
- H3: 短

例:

```
━━━━━━━  H1
━━━━━    H2
━━━      H3
━━━      H3
━━━━━    H2
```

挙動:
- Markdown見出しから自動生成
- hoverで見出し名を表示
- clickで該当anchorへ移動
- scrollに追従して現在見ている見出しをactive表示
- active状態は輝度差を明確に使う
- hover時も輝度変化を使う
- 必要に応じて太さ・長さ・opacityも併用
- 通常時は本文を邪魔しない細いrail
- touchではtap等で利用可能にする
- reduced-motionを尊重する

「輝度」は主要な状態表現として扱い、inactive / hover / activeの差が明確に知覚できること。

## 7. Articles

時系列ブログを主UIにしない。

技術記事DBとして扱う。

最低要件:
- 検索
- タグフィルタ
- Panel / List切替
- 最近更新を基本並び順とする
- 並び替え可能
- 記事ごとに所属資料 / タグ / 更新日を表示

## 8. モバイル

- 左Hierarchyはoverlay / drawerとして表示
- 本文幅をHierarchyの開閉で圧迫しない
- Heading Railはdesktopと同じ常時占有を強制しない
- hover依存にしない

## 9. Interaction / Visual

- 高密度
- Cosense寄りの一覧性
- NotionのBoard / Gallery / heading navigationを参考にする
- 大きな空白中心のHeroは避ける
- 装飾より情報構造を優先
- ポエム的・抽象的なコピーを置かない
- 細線・neutral・高密度を基本とする
- pointer-capable要素はfluid / proximity hoverを基本とする
- hoverでhit targetやlayoutを動かさない
- focus-visibleを必ず持つ
- reduced-motion対応

## 10. Contribution

- GitHub Issueで誤り・古い情報・不足を報告できる
- Pull Requestで修正できる
- 各ページから編集導線を持つ
- 公式資料を大量転載せず、独自説明と出典を分離する

## 11. Acceptance

最低限、以下が実際に操作できればUI要件の第一段階Doneとする。

1. Homeに横断検索と資料Panel Viewがある
2. 検索結果を種類 / タグで絞れる
3. 資料一覧を最近更新基準で表示し、並び順を変更できる
4. Panel / Listを切り替えられる
5. Manualトップで全階層を一覧できる
6. 本文ページでHierarchy / Article / Heading Railが成立する
7. Hierarchyを閉じると本文がviewport中央へ再センタリングされる
8. Heading RailがH1/H2/H3を線長で表現する
9. Heading Rail hoverで見出し名が表示される
10. Heading Rail clickで該当見出しへ移動できる
11. scroll位置に応じてactive見出しの輝度が変化する
12. MobileでHierarchyがoverlayとして使える
13. Markdown / MDXから階層・見出しナビゲーションを生成できる

## 12. Design System — Current Baseline

この節は現在実装・検証済みのUI foundation baselineを示す。
将来のdesign iterationで変更できるが、materialな変更は同じAcceptanceを再検証する。

### 12.1 Typography

役割を3系統に分ける。

#### UI / Navigation / Meta / Latin

UI / Latin baseline: **Lexend Variable**（利用可能な場合）

用途:
- Navigation
- Command Palette
- Tag
- Button
- Panel metadata
- 数字
- 短い英字見出し

仮採用weight:
- 400 Regular
- 500 Medium
- 600 SemiBold

極端なLight / Blackは基本使用しない。

#### Japanese body / long-form text

Japanese body baseline: **Noto Sans JP**（利用可能な場合）

用途:
- Manual本文
- Article本文
- 日本語見出し
- 長文説明

仮採用weight:
- 本文 400
- 小見出し 500
- 大見出し 600

UIでLexendを指定し、日本語glyphはNoto Sans JPへfallbackする構成を許可する。

#### Code / Expression / technical value

初期実装ではOS標準monospace stackを使う。

`ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace`

専用Mono fontの追加は将来の任意改善とする。

#### Typography sizing

- Body: 15–16px
- Small / Meta: 11–13px
- Navigation / controls: 13–14px
- H1: 34–44px
- H2: 24–30px
- H3: 18–22px
- Code: 13–14px

本文行間:
- Japanese body: 1.75–1.9
- compact UI: 1.3–1.5

本文は長時間読む用途を優先し、小サイズへ詰めすぎない。

### 12.2 Color System

基本方針:
- site chromeはmonochrome
- Hueより輝度差で階層を作る
- semantic colorは必要なcontent/statusだけに限定する
- Dark / Light双方で情報階層を維持する
- 状態表現を色だけに依存させない

#### Light baseline

- Canvas: `#fafafa`
- Surface: `#ffffff`
- Raised: `#f0f0f0`
- Hover: `#e8e8e8`
- Text Primary: `#171717`
- Text Secondary: `#505050`
- Text Muted: `#626262`
- Line: `#d8d8d8`
- Control Line: `#858585`
- Focus: `#171717`

#### Dark baseline

- Canvas: `#0f0f0f`
- Surface: `#151515`
- Raised: `#202020`
- Hover: `#303030`
- Text Primary: `#efefef`
- Text Secondary: `#bcbcbc`
- Text Muted: `#aaaaaa`
- Line: `#363636`
- Control Line: `#888888`
- Focus: `#eeeeee`

Final CI measured primary / secondary / muted readable-text pairs above 4.5:1 against tested canvas / surface / raised combinations in both themes.

### 12.3 Luminance / State Hierarchy

輝度差はCOLLECTANEAの主要interaction languageとする。

最低でも以下を視覚的に区別する。

- inactive
- hover / proximity
- selected
- active / current location
- keyboard focus
- disabled

特にHeading Railは輝度差を最優先する。

Heading Rail current states:
- inactive: grayscale rail-idle token
- hover: brighter grayscale rail-hover token
- active: text-level grayscale rail-current token
- activeは2px thicknessを併用する

activeは輝度だけでなく、必要に応じて1px → 2px程度の線幅差を併用する。

### 12.4 Heading Rail Geometry

Current baseline:
- H1: 32px
- H2: 22px
- H3: 14px
- H4: 9px
- inactive line: 1px
- active line: 2px
- rail width: 44px

hover時の見出し名はrailの左側へ展開し、本文を押し動かさない。
ラベルはoverlayとして出し、hit target自体は安定させる。

### 12.5 Spacing

基本spacing scale:

- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64px

用途:
- control内部: 4–8
- 同一group: 8–12
- section間: 16–24
- major section: 32–48

高密度を優先するが、本文の段落間隔までUI密度へ合わせて詰めない。

### 12.6 Lines / Radius / Surface

- 基本stroke: 1px
- Active / focus: 1–2px
- Panel radius: 0–4px
- Control radius: 2–6px
- PillはTag等、意味のある場合だけ
- heavy rounded cardsは使わない
- box-shadowは常用しない
- elevationは主に背景輝度差と線で表現する

### 12.7 Layout Dimensions

Desktop:

- Left Hierarchy baseline: 280px
- Article max-width: 800px
- Heading Rail: 44px
- hierarchy resizeは将来の任意改善
- Article + Heading Railを1つのcentered reading unitとして扱う

Hierarchy CLOSED:
- reading unit全体をviewport中央へ移動
- article left edgeを単に広げるだけにはしない

Home:
- content max-width: 1280–1480px
- panel gap: 8–12px
- desktop panel columns: 3–4を基本にresponsive調整
- Search height: 44–52px

### 12.8 Panel View

Notion Gallery / Boardの整理感を参照するが、画像slotは必須にしない。

Panelは以下を優先順で表示する。

1. 資料名
2. 1–2行の説明
3. Tag
4. 更新日
5. 件数情報

Panel全体をclick targetにしてよいが、内部のTag等に独立actionを持たせる場合はevent競合を避ける。

hover:
- background luminanceを少し上げる
- line contrastを上げる
- pointer近傍のproximity responseを許可
- card自体を大きく移動させない

### 12.9 Search / Command Palette

- Desktop max-width: 約720–840px
- Home searchとCommand Paletteは同じ検索indexを使う
- input中に結果を即時更新
- keyboard上下選択 + Enter
- Escで閉じる
- mouse / touchでも完全操作可能

結果表示:
- type
- title
- hierarchy / material
- tags
- 必要に応じてmatching excerpt

### 12.10 Theme Default

- Dark / Light双方をサポートする
- Docusaurus color modeでOS preferenceを尊重する
- user selectionはDocusaurus側のtheme stateに従う
- 両themeの主要text contrastはCIで検証する

## 13. Content Metadata Requirements

検索・Panel・List・並び替えを成立させるため、各資料に最低限以下のmetadataを持つ。

### Material

- id
- title
- summary
- kind
- product / domain
- tags[]
- updated
- status
- order optional

kind例:
- manual
- reference
- research collection

### Page / Article

- title
- material
- type
- tags[]
- updated
- description / excerpt
- section / hierarchy
- status

status候補:
- active
- draft
- deprecated

検索indexとPanel表示は同じmetadataを正本として利用し、UI専用の重複データを別管理しない。

metadata projectionはDocusaurus lifecycleを使う `plugins/catalog/index.cjs` を正本経路とし、処理済みcontent/permalinkから `@collectanea/catalog-data` と `@collectanea/search-index` を生成する。ページ件数は実Markdown/MDXページ数のみを数え、見出しanchorは数えない。著者コンテンツのない資料 (Blender / After Effects / Cavalry / Git 等) は `planned` として明示し、偽の日付・件数・リンクを付与しない。新規Markdownはcomponent dataの変更なしに検索・Panel・Manual tree・Articlesへ反映されること。見出し断片 (`#...`) への手書きリンクは収録しない。

Fusionの技術解説は、一次資料で検証できるまで Draft / unverified の作業草稿として明示する。UI検証用のfixture項目を公開カタログに混ぜない。

## 14. Design Acceptance Additions

既存Acceptanceに加え、以下を満たす。

1. UI / body / codeのfont roleが一貫している
2. Dark / Light双方でprimary / secondary / muted / line階層が維持される
3. 通常本文はAA相当の可読性を目標にする
4. inactive / hover / activeが色相だけでなく輝度差で判別できる
5. Heading Railのactive位置が一目で分かる
6. thin-line表現が実寸で消えない
7. Panel / List / Command Paletteで同じtag・metadataが利用される
8. Hierarchy CLOSED時のArticle centerがviewport基準で崩れない



## 15. Foundation Verification Record

Current accepted implementation baseline:

- implementation head: `be30350cbf81cfae91b324e05bd8db56acdb12d6`
- GitHub Actions run: `36750386329`
- build: PASS
- browser UI checks: 12 / 12 PASS
- content integration: PASS
- console/page errors: 0
- hierarchy-closed article center drift: 0px at 1440px viewport
- temporary integration fixtures: removed
- post-test tracked source changes: 0

Detailed evidence and non-blocking notes are in `docs/review-receipt.md`.


## 16. Visual Acceptance Additions — 2026-10-01

### 16.1 Single-destination cards

資料カード・記事カードなど、カード全体が1つの遷移先を表す場合:

- カード面全体をclick / tap targetにする
- タイトル文字だけを唯一の遷移hit targetにしない
- keyboard focusでもカード単位の遷移先が明確であること
- hover / focusはカード境界・背景輝度で返し、target自体を移動させない
- 内部に別actionが必要になった場合のみ、nested interactive領域を明示的に再設計する

### 16.2 Hierarchy ownership

左Hierarchyの表示・非表示controlは、対象との空間的所有関係を明確にする。

Hierarchy OPEN時:

- 「閉じる」controlは左Hierarchy領域の内部に置く
- Article側toolbarへHierarchy controlを置かない
- icon自体を押せるtoggleとして扱う
- sidebar境界付近で、何を閉じるcontrolか即座に分かる位置を優先する

Hierarchy CLOSED時:

- 再度開くcontrolは左端 / 元Hierarchy境界に隣接して置く
- Articleの読書中心をずらさない
- Mobileはnative drawer/navigationを優先し、desktop用controlを重複表示しない

### 16.3 Document Quietness

Article / Manual本文では **Navigationは高機能、Documentは静か** を基本原則とする。

本文領域:

- 読書に不要なcard / badge / toolbar / controlを常時侵入させない
- 見出しを過度に巨大化せず、sizeだけでなくweight・輝度・前後余白で階層化する
- sectionを認知しやすい小さな単位へ分ける
- paragraph / list / figure / codeのvertical rhythmを少数のspacing ruleへ集約する
- 本文はnavigation UIより視覚的に静かなsurfaceとする
- 状態表示が必要な場合も、読書開始位置を過剰に押し下げない

Navigation / knowledge linking:

- 本文中の重要用語は、適切なReference / Node / Conceptへinline linkできる構造を優先する
- 記事末尾には必要に応じて See Also / Previous / Next を置く
- 関連情報を大量の本文内cardへ置き換えず、inline linkと末尾navigationを優先する
- colorを将来導入する場合、装飾色ではなくlink等の意味を持つ役割から検討する

この原則はCycling '74 Max documentationの読書構造をreferenceとして採用するが、同サイトの見た目やtokenをそのまま複製する要求ではない。

### 16.4 Additional acceptance

既存Acceptanceに加え:

1. Panel viewのsingle-destination cardは余白部分をclickしても遷移する
2. Article cardもカード全体で遷移できる
3. Hierarchy OPEN時のclose controlは `.theme-doc-sidebar-container` 内に存在する
4. Hierarchy CLOSED時のreopen controlは左端に残り、Article centerを変えない
5. Desktop Article本文にHierarchy操作toolbarを置かない
6. Document本文はnavigation UIより視覚的に静かな状態を維持する
