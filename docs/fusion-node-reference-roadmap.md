# Fusion Node Reference 改稿ロードマップ

Updated: 2026-10-03
Status: Active
Scope: Fusion Node Referenceのcoverage拡張とreader-first改稿を、同じ大量生成へ戻さず段階的に統合する。

## Goal

Node名を検索できるだけでなく、初見の読者がページを読んで「何を入れると、何が起き、何を返し、まず何を試せばよいか」を判断できるReferenceにする。

網羅性と説明の深さは別の作業として管理する。

```text
Coverage
  = どのNode / 関連要素が掲載されているか

Depth
  = 各ページがどこまで役割・入力・設定・用途を説明できているか

Runtime verification
  = 現行hostでREGID・端子・Inspector・結果まで確認できているか
```

一つのテンプレートで3つを同時に埋めない。

## Current state

- main: 21.0.4基準カタログを出発点に359ページ。
- PR #11: September 2026版21.1 Reference Manualとの照合で26ページを追加し、385ページへ拡張する候補。
- PR #10: Node Referenceをreader-firstへ変更し、Shape conceptと代表Shape Nodeを改稿。
- integration branch: `docs/fusion-reader-first-211-integration-20261003` で両方を統合し、21.1 Manualの具体Controlまで代表Shapeページへ反映。

## 進め方

### 1. Familyを先に理解できる入口を作る

個別Nodeより前に共通概念が必要なFamilyへ、短いFamily Overviewを用意する。

優先候補:

1. Shape — Concept / Family Overviewを統合候補で追加済み
2. Particle
3. Classic 3D
4. USD
5. Deep
6. Mask
7. Krokodove — PR #11で画像 / Shape / 3D / Regionの案内を追加済み

Family OverviewはConceptの全文コピーではなく、Nodeを選ぶための地図にする。

### 2. 各Familyの代表Nodeを先に完成形へ近づける

一度に全385ページを同じ文章量へ膨らませない。各Familyから、実際によく使うNodeと役割の異なるNodeを選び、21.1 Manualを一次資料としてreader-first形式へ改稿する。

代表Nodeで確認する型:

- Generator / Source
- Processor / Transform
- Combiner / Mixer
- Converter / Renderer
- Controller / Modifier / Region

この段階でテンプレートがFamily固有の事情に耐えるかを見る。

### 3. 21.1 Manualから確認できる情報を先に回収する

Nodeごとに次の順で読む。

1. Node Introduction / 役割
2. Inputs / External Inputs
3. Basic Node Setup
4. Inspectorの主要Control
5. Common Controlsとの境界
6. 図・例が示す接続関係
7. Version / Edition差が明示されているか

ManualにControl名・入力・例がある場合は、`partial`を理由に抽象表現へ戻さない。一方、一行summaryしかないNodeでは存在しないControlを補わない。

### 4. reader-firstへ書き直す

本文では次の質問に答える。

- これは何をするNodeか
- 何をつなぐか
- 何が返るか
- 主要Controlを変えると何が変わるか
- 最小構成は何か
- 実制作では何に使うか
- 似たNodeとは何が違うか
- どこまで確認済みか

`description`、冒頭、`主な用途`へ同じ短文を繰り返さない。

### 5. 用語とFamilyへ戻れる導線を付ける

Shape、Mask、Particle、Deep等の重要な初出は、対応するConceptがある場合に `<Term>` を使う。

hoverだけを前提にせず、本文単体でも最低限意味が分かるようにする。詳しい説明はConceptへ、FamilyのNode選択はFamily Overviewへリンクする。

### 6. 画像は文章の後で追加する

画像は不足している説明を補うものとして追加する。

優先順:

1. Node tile / 端子
2. 最小Graph
3. 主要Inspector
4. 結果 / Before-After

自前の実機captureを基本にする。画像のために全ページへ空placeholderを置かない。

### 7. runtime verificationを別passで行う

Manual整理と実機inventory確認を混ぜない。

実機passで確認するもの:

- visible tool name / REGID
- native / Krokodove / OFX等の所属
- Input / Outputの実型と端子数
- Inspector label / default / range
- Free / Studio差
- 最小Graphの実結果
- version差

確認できた範囲に応じて `verification` を更新する。

## 改稿の優先順

まず使用頻度と基礎転用性が高いFamilyから深くする。

1. Compositing / Merge — reader-first family pass started 2026-10-04; Merge / MultiMerge / Dissolve + Concept / Recipe / Pattern整合を実施
2. Transform / Format — foundation batch started 2026-10-04; Transform / Resize / Scale / Crop + related Concept / Recipe / Diagnosticを改稿
3. Mask — foundation batch started 2026-10-04; Bitmap / Ellipse / Polygon + Mask Concept / Recipe / Diagnosticを改稿
4. Color / Blur — Blur foundationとColor foundationを2026-10-04に分離実施。Blur / Defocus / Directional Blur、Brightness Contrast / Color Corrector / White Balanceをreader-first化
5. Tracking
6. Shape
7. Generator / Text
8. Particle
9. Classic 3D / Materials
10. USD
11. Deep
12. Krokodove / specialized tools

21.1で新規・差分が大きい項目は、この順序とは別にsource coverageとして追加してよい。

## 1ページのDone条件

最低限、次のうち該当するものが読者から見える。

- 平易な役割説明
- Input / Outputの意味
- 主要Controlと結果の関係
- 最小Graph
- 具体的な用途または確認例
- 似たNodeとの選択基準
- Concept / Familyへの導線
- 出典と未確認範囲

Nodeの性質上存在しない項目を空見出しで残す必要はない。

## バッチと検証

改稿はFamilyまたは近い役割の小さなまとまりで進める。

通常のcontent batch:

```text
primary source確認
→ 数ページ改稿
→ link / term / catalog確認
→ production buildまたはfocused check
→ reader flowを代表1ページで確認
```

全ブラウザ状態を含むHeavy Qualityは、Familyごとの文章追加のたびに必須化しない。UI、catalog model、routing等を変えた統合checkpointで使う。

## 避けること

- 385ページを同じテンプレートで一括再生成する
- 一行summaryを3箇所へコピーして「完成」とする
- `partial`を「具体的なことを書かない」の意味にする
- Node名だけからInput / Control / REGIDを推測する
- Manualにないレシピを公式例のように書く
- Concept本文を各Nodeへ丸ごと複製する
- 画像枚数を品質指標にする
- 公式Manual本文や画像を大量転載する

## Sources / owners

- reader-facing policy: `docs/fusion-authoring-contract.md`
- 21.1 coverage / unresolved candidates: `docs/fusion-211-manual-coverage.md`
- current corpus / lookup entry: `manuals/fusion/nodes/index.md`
- primary technical source: DaVinci Resolve 21.1 Reference Manual, September 2026
- current runtime facts: Resolve / Fusion実機を最優先


## Batch history

### 2026-10-04 — Compositing foundation

- Compositing Family Overviewを追加。
- Mergeを21.1 Manual Chapter 94 pp.2211–2219基準で改稿。
- MultiMergeをpp.2220–2223基準で改稿。
- Dissolveをpp.2208–2210基準で改稿。
- Foreground / Background / MaskとBlend / Apply Mode / Operator Conceptを現行Manualへ合わせた。
- 2つのImageを重ねるRecipe、MultiMerge Recipe、Merge関連Patternをreader-firstのNodeページへ整合。

次の候補はTransform / Format。まず代表Nodeと21.1 Manual範囲を確認し、同じ規模の小さいbatchで進める。


### 2026-10-04 — Transform / Format foundation

- Transform / Format Family Overviewを追加。
- TransformをChapter 120 pp.2879–2883基準で改稿し、解像度を変えない配置Nodeとして整理。
- Resizeをpp.2873–2875、Scaleをpp.2876–2878、Cropをpp.2862–2864基準で改稿。
- Center / Pivot / Size / AngleとResolution / Aspect Conceptを21.1 Manualへ合わせた。
- Transform配置Recipeと「端が消える」Diagnosticを現行のEdges / Crop / Resize / Scale / DoD区分へ更新。

Camera Shake / DVE / Letterbox / Planar Transformは同じChapter 120にあるが、このbatchでは基礎4 Nodeと混ぜず後続batchへ分離する。


### 2026-10-04 — Mask foundation

- Mask Family Overviewを追加し、Primitive / Spline / Image-derived / Paint系の選び分けを整理。
- Bitmap MaskをChapter 108 pp.2463–2467基準で改稿。
- Ellipse Maskをpp.2472–2474、Polygon Maskをpp.2480–2484基準で改稿。
- Mask Conceptへsingle-channel、Level、Invert、Paint Modeの基本を反映。
- Mask Pattern、Merge Mask Recipe、「Maskが効かない」Diagnosticを現行Controlへ合わせた。

B-Spline / MultiPoly / Mask Paint / Ranges / Rectangle / Triangle / WandはFamily Overviewから参照できる状態にし、次のMask batchへ分離する。


### 2026-10-04 — Blur foundation

- Blur / Filter Family Overviewを追加。
- BlurをChapter 92 pp.2109–2111基準で改稿。
- Defocusをpp.2112–2113、Directional Blurをpp.2114–2115基準で改稿。
- Blur系で重要なDoD / Clipping Modeの診断導線を更新。
- Blur / Defocus / Directional Blurを「均一にぼかす / lens defocus / 方向・中心を持つblur」で選び分けられるように整理。

Glow / Soft Glow / Sharpen / Unsharp Mask / Vari Blur / Vector Motion BlurはFamily Overviewから参照し、次のBlur batchへ分離する。Color familyは同じ優先段だが、このbatchへ混ぜず別PRにする。


### 2026-10-04 — Color foundation

- Color Family Overviewを追加。
- Brightness ContrastをChapter 93 pp.2150–2153基準で改稿。
- Color Correctorをpp.2157–2167基準で改稿し、4入力、tone Range、Colors / Levels / Histogram / Suppress、Ranges / Optionsを整理。
- White Balanceをpp.2200–2202基準で改稿し、Custom / Temperature、Black / Mid / White、Space / Use Gammaを整理。
- Premultiplication ConceptへChapter 77のPre-Divide / Post-MultiplyとAlpha Divide / Multiplyの確認内容を反映。

Color Curves / Color Gain / Gamut / OCIO等はFamily Overviewから案内し、後続Color batchへ分離する。
