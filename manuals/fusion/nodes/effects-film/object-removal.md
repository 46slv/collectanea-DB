---
title: Object Removal
description: マスクで指定した不要物を前後のフレームから補完するFusionノード。4入力、Scene Analysis、Clean Plate、失敗時の調整を解説。
doc_type: node
term_id: object-removal
term_short: 動画内の不要物をマスクで指定し、周囲のフレームなどを解析して背景で埋めるStudio向けノード。
verification: partial
aliases: [Object Removal, ORm]
concepts: [image-data, mask-data]
nodes: [Object Removal]
node_family: effects-film
controls: [Show Mask Overlay, Scene Analysis, Assume No Motion, Scene Mode, Analysis Boundary, Show Scene Mask Overlay, Search Range, Blend Mode, Clean Plate Source, Build Clean Plate, Show Clean Plate]
inputs: [image, image, mask, mask]
outputs: [image]
tasks: [object-removal, cleanup]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-09"
---

# Object Removal

Object Removal [ORm]は、映像に映り込んだ不要な人物や物体を指定し、周囲の画像や前後のフレームから背景を補って取り除くノードです。除去したい場所を<Term id="mask">Mask</Term>で囲み、**Scene Analysis**を実行して補完結果を作ります。

たとえば、固定カメラの前を自転車が横切る映像では、自転車が通過する前後のフレームに道路の模様が残っています。Object Removalはそうした情報を利用して、指定した部分を背景で埋めようとします。DaVinci Neural Engineを用いる機能で、**DaVinci Resolve Studio向け**です。

## 役割と出力

入力した2D <Term id="image">Image</Term>のうち、除去対象として指定した領域を解析し、補完した**2D画像**を出力します。MediaOutへそのまま接続でき、必要なら後段のMergeやColor Correctorで仕上げられます。

背景を確実に復元できるとは限りません。対象物が大きい、隠れている背景が前後のどのフレームにもない、対象が他の物体と重なるなどの条件では、補完が破綻することがあります。公式マニュアルは、比較的小さな移動物体と時間的に安定した背景を適した条件として挙げています。

## 入力

21.1 Reference Manualに記載されている入力は4種類です。**除去対象を指定するMask**と、**処理結果の表示範囲を制限するEffect Mask**は別の端子です。

| 入力 | つなぐもの | 役割 |
| --- | --- | --- |
| **Input**（主画像） | 処理対象の2D映像 | 不要物が写っている元の画像です。 |
| **Clean Plate**（マゼンタ） | 不要物が写っていない2D画像 | 自分で用意した背景画像を、外部クリーンプレートとして使う場合に接続します。 |
| **Mask**（緑） | Polygonなどのマスク | **消したい物体の位置と形**を指定します。撮影中に動く対象なら、時間に合わせて追従させます。 |
| **Effect Mask**（青、任意） | 効果を表示したい範囲のマスク | Object Removalの処理後に適用され、補完結果をどこへ反映するか制限します。 |

Clean Plateは**Clean Plate SourceをExternalにした場合**に使用する補助画像です。Maskだけで自動解析する通常の構成では、Clean Plateを接続する必要はありません。

特に混同しやすいのが2種類のマスクです。緑の**Mask**は「何を消すか」を伝えます。青の**Effect Mask**は「処理後の結果をどこに出すか」を制限します。Effect Maskだけを接続しても、除去対象の指定とは同じ役割になりません。

## 主な設定項目

### 対象の表示と解析（Controls / Analysis）

- **Show Mask Overlay**：実際に使う除去用マスクを赤い重ね表示で確認します。対象の端がマスクからはみ出していないか調べるときに使います。
- **Scene Analysis**：指定した条件でクリップを解析し、除去結果を作成します。**Analysis欄の設定を変えたら、再度押して解析し直します。**
- **Assume No Motion**：カメラを固定し、背景が動かず対象物だけが動くショットに使います。背景の動きを推定する必要が減るため、公式マニュアルは解析を大幅に単純化できるとしています。
- **Scene Mode**：除去範囲の周辺をどのように解析するか選びます。
  - **Background**：対象領域を除いた画面全体を解析します。
  - **Boundary**：対象領域の境界付近を中心に解析します。
  - **Object**：窓に貼ったステッカーのように、除去対象が背景と一緒に動く状況を想定した方式です。
- **Analysis Boundary**：解析に使う対象の境界領域の大きさを調整します。
- **Show Scene Mask Overlay**：解析に関連するシーンマスクを表示し、指定領域の背後を確認するときに使います。

Scene Modeの名前だけで結果の良し悪しは決まりません。対象と背景がどう動くかを見て方式を選び、解析後のフレームを通して比較します。

### 補完結果の調整（Render）

- **Search Range**：現在のフレームから前後何フレームまで補完元を探すか指定します。たとえば20なら、前後20フレームずつの範囲を探索します。大きいほど必ず良い結果になるわけではないため、問題が解消する範囲で小さめに保つのが基本です。
- **Blend Mode**：埋めた領域と周囲の画像のなじませ方を選びます。標準の**Linear**は単純な複製に近い方式です。**Adaptive Blend**はつなぎ目を改善する場合がありますが、境界の色や明るさが異なる素材では逆に不自然になることもあります。

検索範囲を変えるのは、あるフレームだけ灰色の縁が出たり、参照できる背景が不足したりする場合の調整候補です。境界だけが浮くときはBlend Modeも比較します。

### 背景画像を指定する（Clean Plate）

**クリーンプレート（Clean Plate）**は、除去対象が存在しない状態の背景画像です。撮影現場で人物を退かせて撮った背景や、別工程で作った背景画像などが該当します。

- **Clean Plate Source — Gray Image**：有効な背景画像を供給しない状態です。
- **Clean Plate Source — Internal**：ノードが背景を推定してクリーンプレートを組み立てます。埋められたフレームの情報も利用します。
- **Clean Plate Source — External**：外部で作った背景画像を**Clean Plate入力**へつないで使います。
- **Build Clean Plate**：選択したClean Plate Sourceに基づいて背景画像を構築します。
- **Show Clean Plate**：マスクの内側に使われるクリーンプレートを確認します。

**Scene Analysis**と**Build Clean Plate**は別の操作です。前者は映像の除去解析、後者は設定したソースからの背景画像の構築を担当します。背景画像を変更したときは、表示・解析結果を確認し、必要な工程を更新します。

## 主な用途

- **固定カメラの前を通る人や自転車を消す**：移動する対象をマスクで追い、対象がいない前後のフレームに写った路面や壁を使って背景を補います。
- **移動撮影中のレンズ汚れや窓のステッカーを消す**：画面上のほぼ同じ場所に残る汚れを指定し、カメラ移動によって変化する背景を解析します。Scene ModeのObjectが判断材料になります。
- **小さな不要物の除去を試す**：画面の端に映った小物やマーカーなど、対象が小さく、周囲の背景が他のフレームに見えている素材から試します。

反射、水面、複雑な視差、別の人物による遮蔽などで補完が合わない場合は、無理に検索範囲を増やし続けず、外部Clean PlateやPaintによる修正を検討します。

## 最小構成：固定カメラの人物を消す

```text
MediaIn ─────────────→ Object Removal ─→ MediaOut
Polygon（人物の形） ─→ Mask（緑）
```

1. MediaInの映像をObject Removalの**Input**へ接続します。
2. Polygonで消したい人物を囲み、緑の**Mask**入力へ接続します。人物の手足や影も消す必要がある場合は、その範囲まで確認します。
3. 人物が動く間、Polygonが常に対象を覆うようキーフレームまたはトラッキングで追従させます。マスクを無闇に大きくすると、補完が必要な領域も広くなります。
4. カメラを完全に固定して撮影した素材なら**Assume No Motion**を有効にします。
5. **Scene Analysis**を押します。解析後、対象の通過前・通過中・通過後を連続して再生し、境界と背景の連続性を確認します。
6. 一部だけ灰色の縁が出る場合は**Search Range**や**Blend Mode**を比較し、解析条件を変更した場合は再度**Scene Analysis**を実行します。

マスクの追従がずれていると、除去したい人物の一部が残ることがあります。まずマスクの位置を確認し、それから補完設定を調整します。

## 運用例：外部Clean Plateで背景を補う

元映像の中に背景が十分映っておらず、別撮りした空の背景画像を持っている場合の構成です。

```text
MediaIn（元映像） ──────────→ Object Removal ─→ MediaOut
Polygon（不要物） ──────────→ Mask（緑）
Background Plate（空の背景） → Clean Plate（マゼンタ）
```

1. 元映像をInputへ、不要物を囲んだPolygonをMaskへつなぎます。
2. 対象物がいない状態の背景画像を、マゼンタの**Clean Plate**入力へつなぎます。
3. **Clean Plate Source**を**External**にし、**Build Clean Plate**で背景を構築します。
4. **Show Clean Plate**で背景の位置を確認し、必要に応じて**Scene Analysis**を行います。
5. 補完部分の色・明るさ・位置が周囲と合うか、時間を通して確認します。

これは公式マニュアルが説明するExternal入力とClean Plate設定を組み合わせた**構成例**です。別撮りの背景と元映像の画角、照明、カメラの動きが一致しない場合は、プレート側の調整も必要です。

## うまくいかないとき

| 症状 | 最初に確認すること |
| --- | --- |
| 物体の一部が残る | 緑のMaskが対象物を全フレームで覆っているか。マスクの追従が外れていないか。 |
| 灰色の縁が出る | Search Rangeを変え、前後のフレームから適切な背景を参照できるか。 |
| 塗った境界だけ色がずれる | LinearとAdaptive Blendを比較する。外部Clean Plateなら色や位置も確認する。 |
| 解析後に設定を変えたが結果が変わらない | Analysisの設定変更後、Scene Analysisを再実行したか。 |
| 背景の形が不自然になる | 対象が大きすぎないか、別の物体との重なりがないか、隠れた背景が他のフレームに存在するか。 |

## 関連する考え方・ノード

- [Imageの基礎](../../learn/02-data/image.md) — 入力と出力の2D画像の扱い。
- [Maskの基礎](../../learn/02-data/mask.md) — マスクによる対象指定と効果範囲の違い。
- [Polygon Mask](../masks/polygon-mask.md) — 除去対象を手動で囲むマスク。
- [Tracker](../tracking/tracker.md) / [Planar Tracker](../tracking/planar-tracker.md) — 動く対象へマスクを追従させる際の関連ノード。具体的な接続方法は追跡方式により異なります。
- [Clean Plate](../matte-keying/clean-plate.md) — キーイング向けに背景情報を扱う別ノード。Object Removalの同名入力やClean Plate Sourceとは区別します。
- [Paint](../paint/paint.md) — 自動補完が合わない領域を、人が元画像や別画像を参照して修正する選択肢。

## バージョン・出典と検証状況

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 97「Effect Nodes」、**Object Removal [ORm]、pp.2288–2291**を参照。4つの入力、Scene Analysis、3種類のScene Mode、Search Range、2つのBlend Mode、Clean Plate Sourceの3種類、Build / Show Clean Plateを確認しました。

Studioでの提供はBlackmagic Designの[DaVinci Resolve Studio公式ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/studio)でも確認できます。なお同社のColorページにも「object removal plug-in」の説明がありますが、**このページはFusionのObject Removalノード**について説明しています。

Manualに基づく設定名と、機能を組み合わせた上記の手順は区別しています。21.1実機でのレンダリング、端子の内部識別子、数値範囲や全プリセットの挙動、他のeditionでのノード表示状態は確認していないため、`verification: partial` としています。
