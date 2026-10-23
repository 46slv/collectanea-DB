---
title: Image / Mask / Dataを分ける
description: Fusionの画像・マスク・パラメータ値を、何を渡し、何を変えるかから区別してNode Graphを読む。
doc_type: concept
term_id: image-mask-data
term_short: 画像そのもの、効果をかける領域、Nodeを制御する値を区別してGraphを読む考え方。
verification: partial
aliases: [Image, Mask, Data, データ型]
concepts: [image-data, mask-data, parameter-data]
nodes: [Merge, Background, Transform]
tasks: [connect-nodes, mask, automate, debug]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-17"
---

# Image / Mask / Dataを分ける

FusionのNode Graphでは、線でつながった情報がすべて「画像」になるわけではありません。**画像そのものを渡す接続**、**処理する場所を指定する接続**、**Nodeの動作を決める値**を区別すると、同じMaskを使っても画像が切り抜かれたり、色補正の範囲だけが変わったりする理由が分かります。

ここでは最初にImage・Mask・パラメータの3つを説明します。Shape・Particle・3Dなど、それ以外のデータについても最後に整理します。

## まず何が流れているかを見る

| 種類 | 中身 | 何のために使うか | 具体例 |
| --- | --- | --- | --- |
| <Term id="image">Image</Term> | RGBの色、Alphaの透明度、画像サイズなどを持つ2D画像 | 映像を加工・合成して次のNodeへ渡す | MediaIn → Blur、Background → Merge |
| <Term id="mask">Mask</Term> | 位置ごとに白・黒・灰色の値を持つ単一チャンネルの画像 | 効果を適用する領域、または透明度を作る領域を指定する | Ellipse Mask → BlurのEffect Mask |
| パラメータ（Parameter） | 数値、座標、文字列、選択値などの制御情報 | Nodeが画像をどう加工するかを決める | Blurのぼかし量、TransformのCenter、MergeのBlend |

この表は「Fusionで扱うデータは全部で3種類」という意味ではありません。まず通常の画像処理を読むために分ける3つの役割です。

### Imageは1本の線で複数の情報を運ぶ

たとえばMediaInからBlurへの接続は、RGBを3本、Alphaを1本に分けてつなぐ必要がありません。**1本のImage接続に複数チャンネルを載せられます**。画像にZ-Depthなどの補助チャンネルがあれば、それも同じ接続で扱う場合があります。ただし、後段のNodeがすべてのチャンネルを必ず保持・処理するわけではありません。

Image内部のAlphaは、その画像の不透明度を表します。Alphaが0なら透明、1なら不透明、間の値なら半透明です。RGBにどのような値が入っていても、Alphaは別に確認できます。

詳しくは[画像（Image）](./image.md)と[Alpha](../04-compositing/alpha.md)を参照してください。

### Maskは「どこを対象にするか」の情報

Ellipse Maskで円を描いたとき、円の内側は通常白（1）、外側は黒（0）、柔らかい境界は灰色（0と1の間）になります。これは赤・青などの色を持った円の画像ではなく、**場所ごとに処理量を指定できる単一チャンネルのデータ**です。

ただし、Maskは常に「効果をかける範囲」だけに使われるわけではありません。接続先がEffect Maskなら効果の範囲を制限し、Matte ControlのGarbage Matteなどなら画像の透明度を作る・変更する処理に使えます。Maskというデータの種類と、接続先での役割は分けて考えます。

[マスク（Mask）](./mask.md)と[AlphaとMaskを分けて診断する](../07-debugging/alpha-vs-mask.md)に詳しい説明があります。

### パラメータは画像そのものではなく、処理の設定値

Transformへ入るImageと、そのTransformのCenterは違う情報です。Imageには画素の色などが入っています。一方、Centerは「どこへ配置するか」を示す座標値で、Sizeは拡大・縮小の設定値です。

パラメータはInspectorで直接設定するほか、Keyframe、Expression、Modifierなどから値が供給されることもあります。**値がアニメーションしていても、画像を渡すImage接続そのものがパラメータ値に置き換わるわけではありません**。パラメータは数値だけとは限らず、座標、文字列、選択肢など種類が異なります。

詳しくは[パラメータ / Data](./parameter-data.md)を参照してください。

## 実例1：Mergeでは3種類が同時に登場する

青い背景の上に、赤い円が見える合成を作ります。

```text
Background A（青、Alpha 1） ───→ Merge［Background：オレンジ］ ──→ MediaOut
                                   ↑ Foreground：緑
Background B（赤、Alpha 1） ──────┘
                                   ↑ Effect Mask：青
Ellipse Mask ──────────────────────┘
```

1. Background Aを青、Background Bを赤にし、どちらもAlphaを1にします。
2. AをMergeのBackground入力、BをForeground入力へつなぎます。この段階では、不透明な赤い前景が青い背景を覆います。
3. Ellipse Maskを作り、Mergeの**Effect Mask**入力へつなぎます。結果は円の内側で赤が合成され、外側には青が残ります。
4. MergeのBlendを変えると、合成自体の強さが変わります。Ellipseの位置や大きさを変えると、合成される場所が変わります。

ここでの役割は明確です。**AとBは色を持ったImage、Ellipseは合成範囲を指定するMask、Blendは合成量を決めるパラメータ**です。EllipseをMergeのForegroundに入れて「赤い円の画像」にしているわけではありません。

円形に切り抜かれた前景Imageそのものが必要な場合は、別の構成になります。たとえば赤いBackground BのEffect MaskにEllipse Maskを使い、BのRGBA ImageのAlphaを円形にしたうえで、通常のMergeのForegroundへ渡せます。この2つは似た見た目でも、**Mergeの合成結果を制限する**方法と、**前景Image自身に透明領域を作る**方法の違いがあります。

関連：[Merge](../../nodes/compositing/merge.md) ／ [Mergeの適用範囲をMaskで限定する](../../recipes/masking/limit-merge-with-mask.md)

## 実例2：BlurのMaskは画像を切り抜く操作ではない

```text
MediaIn ──→ Blur ──→ MediaOut
              ↑ Effect Mask：青
          Ellipse Mask
```

人物の顔だけをぼかす場合、MediaInからBlurへ送るのは映像（Image）、Ellipse Maskから送るのは顔の周辺だけを処理する範囲（Mask）です。Blurのぼかし量はBlur自身のパラメータで指定します。

Maskの外側には、原則として元の画像が残ります。**Maskをつないだからといって、顔の外側のAlphaが0になって背景が透けるとは限りません**。「一部分だけぼかす」と「人物を切り抜く」は目的も処理も違います。

この違いを確かめるには、Blurの直後のImageをViewerへ表示し、Ellipseの接続を一度外して比較します。さらにViewerでAlphaチャンネルを表示し、ぼかしの範囲が変わってもAlphaが変わっていないか確認します。

関連：[Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask.md)

## 実例3：画像とパラメータを別々に変える

```text
MediaIn ──→ Transform ──→ MediaOut

TransformのCenter：配置する位置
TransformのSize：画像の拡大率
```

1. MediaInの接続は変更せず、TransformのCenterを動かします。渡される画像の種類は変わらず、配置位置だけが変化します。
2. CenterにKeyframeやExpressionが設定されていれば、それが値の供給元になります。「値を手で変えたのに戻る」場合は、この供給元を調べます。
3. 次にTransformの入力Imageを別素材へ差し替えます。今度はパラメータを動かさず、処理する画像の中身だけが変わります。

「Imageの接続が違う」のか「パラメータの値・供給元が違う」のかを分けると、問題を探す範囲を狭められます。

## 見た目だけで型を決めない

**Viewerで白黒に見えるものがすべてMaskとは限りません**。ImageのAlphaチャンネルを単独表示しても白黒に見えますし、画像の明暗からMaskを作るBitmap Maskもあります。両者が似て見えることと、同じデータを同じ用途へ渡せることは別です。

Node Editorで入力端子にカーソルを置くと、その端子の名前を確認できます。Nodeの本体へ線を落とすと自動的に入力先が選ばれますが、Mask Nodeからつなぐ場合は既定のMask入力が優先されることもあります。意図しない結果になったら、**線の色だけで判断せず、実際につながっている入力名**を確認してください。

また、1つのNodeの出力を分岐させても、片方だけ自動的にAlpha、もう片方だけRGBを渡す構造にはなりません。必要なチャンネルを選び直すには、それを扱うNodeを使います。

## 実例4：白黒画像の明るさをEffect Maskとして使う

円やPolygonを描かなくても、**別の画像の明暗を処理範囲へ利用**できます。たとえば夜景の明るい看板だけ色を強めたいときは、元映像と、看板が白・周囲が黒になった輝度マップを別々に用意します。

```text
MediaIn A（色補正する夜景） ──→ Color Corrector ──→ MediaOut
                                     ↑ Effect Mask
MediaIn B（白黒の輝度マップ） ─────────┘
```

1. **A**はColor CorrectorのImage入力へ、**B**はEffect Mask入力へ接続します。Bは前景として重なる画像ではなく、補正をかける範囲を指定するための画像です。
2. Color Corrector側の**Common Settings**で、Maskに使う画像チャンネルとして**Luminance**を選びます。Bの白い部分は補正が強く、黒い部分は元の映像が残り、灰色の部分では補正が部分的に適用されます。
3. Color Correctorで彩度などを変え、Bの接続を外した場合と比較します。看板以外まで変わるときは、Bのチャンネル選択と白黒の値を確認します。

ここでは、**通常の2D ImageをEffect Maskへ直接接続**しています。これはMask Nodeが出す単一チャンネルのMaskとは異なる経路ですが、FusionのEffect Mask入力では利用できます。**Bitmap Maskが必須というわけではありません**。

一方、マップの明るさを閾値で切り分けたり、輪郭を調整したり、別のMaskと合成したいなら、`MediaIn B → Bitmap Mask［Channel: Luminance］→ Color Corrector［Effect Mask］`という経路を選べます。Bに不透明な黒が描かれている場合、**Alphaを選ぶと黒い部分も不透明として扱われ得る**ため、Luminanceとの違いに注意してください。Effect Mask以外のGarbage MatteやPre-Maskなどの専用入力ではBitmap Maskが必要な場合もあります。

関連：[Maskの基本](./mask.md) ／ [Bitmap Mask](../../nodes/masks/bitmap-mask.md) ／ [接続互換性](./connection-compatibility.md)

## Shapeなど、3つ以外のデータもある

通常の2D Image / Mask / パラメータ以外にも、Fusionは図形や粒子、3Dシーンなどの専用データを扱います。

| データ領域 | 何を保持するか | 通常の2D Imageへ渡す例 |
| --- | --- | --- |
| <Term id="shape-data">Shape</Term> | 円・四角・パスなどをピクセル化する前の図形情報 | `sEllipse → sRender → Merge` |
| Particle | 個々の粒子の位置や速度、寿命など | `pEmitter → pRender`（2D出力設定時） |
| Classic 3D | カメラ・ライト・物体などで構成する3Dシーン | `Merge 3D → Renderer 3D` |
| USD | USD形式で扱うシーン情報 | `uMerge → uRenderer` |
| Deep Image | 同じ画素位置に複数の深度サンプルを持てる画像データ | `dMerge → Deep to Image` |

たとえば`sEllipse`は円のShapeを作りますが、**Ellipse Maskとは別の種類のNode**です。`sEllipse`のまま通常のBlurやMergeへ送ろうとするのではなく、まず`sRender`で2D Imageへ描画します。`pRender`は出力モードによって2D / 3Dが異なるので、「Renderと名が付くNodeは必ず2Dになる」とも考えません。

[シェイプ（Shape）](./shape.md) ／ [接続できるdata / 接続できないdata](./connection-compatibility.md) ／ [特殊domainのまま処理する](../../patterns/data-domain/defer-domain-conversion.md)

## 症状別：どこを確認するか

| 症状 | まず確認すること |
| --- | --- |
| 画像をつないだのに何も表示されない | Image入力とEffect Mask入力を取り違えていないか。上流Nodeの出力をViewerで確認する |
| Maskで囲った外側が透明にならない | Effect Maskで効果の範囲だけを制限していないか。Image Alphaを作る処理が必要か |
| 赤い円を描きたいのに白黒の円しか出ない | Ellipse Maskを使っていないか。色を持つImageとMaskを分ける |
| Blurの効き方と範囲を別々に変えたい | Blur側のぼかし量と、接続したMaskの形・値を別々に調整する |
| Transformが勝手に動く・数値が戻る | CenterなどにKeyframe、Expression、Modifier等が付いていないか |
| Shapeが通常のMergeへ接続できない | sRenderなどで2D Imageに変換したか |
| RGBの見た目は正しいのに合成が不自然 | ViewerでAlphaを確認し、必要ならStraight / Premultipliedの扱いを調べる |

最初からすべてのNodeを確認する必要はありません。**問題のNodeで「Imageの中身」「Maskの値と接続先」「パラメータの値」を1つずつ固定・変更して比べる**のが基本です。

## 出典・バージョン・検証範囲

- Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 77「Understanding Image Channels」pp.1665–1668：RGB / Alpha / Single-Channel Mask / Auxiliary Channel、1本の接続が複数チャンネルを運ぶこと、Mask入力とImage入力の違い。
- 同Chapter 66「Working in the Node Editor」pp.1394–1397：入出力端子、入力名の確認、本体への自動接続、Mask Nodeの既定の接続先。
- 同Chapter 79「Rotoscoping with Masks」pp.1725–1726：Maskが単一チャンネルの画像であること、Mask Nodeの用途。
- 同Chapter 94「Merge Nodes」：MergeのBackground / Foreground、Alphaによる合成とEffect Maskの挙動。
- 同Chapter 108「Bitmap Mask」p.2463：2D ImageをEffect Maskへ直接使う場合のチャンネル選択、Bitmap Maskで追加できる操作、Garbage Matte等の例外。
- Shape・Particle・3D・USD・Deepの個別出力については、同21.1 Manualの各Node Referenceと[接続互換性](./connection-compatibility.md)の出典を参照してください。

ここで説明したのは、Graphの読み方と代表的な接続例です。**全Nodeの入出力型、Inspectorの初期値・数値範囲、21.1の実機動作とEdition差を網羅的に検証したものではありません**。そのため`verification: partial`を維持します。
