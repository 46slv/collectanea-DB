---
title: sText
description: 文字をShapeとして生成し、Shape系ノードで変形・複製・結合してから画像化するテキスト生成ノード。
doc_type: node
term_id: stext
term_short: 文字を2D ImageではなくShapeとして生成するノード。
verification: partial
aliases: [sText, sTxt]
concepts: [shape-data, vector-shape, rasterization]
nodes: [sText]
node_family: shapes
outputs: [shape]
tasks: [build-shape, text, motion-graphics]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-11'
---

# sText

sTextは、文字を<Term id="shape-data">Shape</Term>として生成するノードです。文字の内容や配置、見た目を決めた後、ほかのShapeと結合したり、同じ文字を複製したりできます。最後に[sRender](./s-render)で通常の2D Imageへ変換します。

Blackmagic Designの21.1 Reference Manualは、sTextを**Text+のShape版**と説明しています。複数の文字スタイル、立体的な回転・配置、複数のShading（塗りや輪郭などの重ね合わせ）を扱える点は共通ですが、**sTextはグラデーション色をサポートしません**。

## 入力と出力

sTextは**文字そのものを生成する**ノードなので、上流からShapeを受け取らなくても使えます。sTransformやsMergeのような既存Shapeの加工・結合ノードとは役割が異なります。

出力は**Shape**です。このまま[sTransform](./stransform)などのShape系ノードへ渡せますが、通常のMergeやBlurへ直接つないで画像として合成することはできません。

~~~text
sText → sRender → Merge（Foreground）→ MediaOut
                    ↑
                MediaIn（Background）
~~~

ここでのShapeは、完成したピクセル画像ではなく、後段のShape系処理が受け取る図形データです。詳しくは[シェイプ（Shape）の基礎](../../learn/02-data/shape)を参照してください。

**端子についての確認範囲**：21.1 ManualのsText個別節には、sTransformのような外部入力端子一覧がありません。この記事では別のShapeを接続する必須入力はないものとして説明しますが、追加の任意端子の名称・数、Text+のEffect Mask入力がそのまま存在するかどうかは実機未確認のため断定しません。

## 文字を設定する

21.1 ManualではsText固有の説明は短く、Inspectorの多くの項目は[Text+](../generators/text-plus)とほぼ共通であると案内されています。以下はText+の公式説明を手掛かりに、sTextで設定を探す順番と、それぞれの役割を整理したものです。**Text+にある全項目がsTextで同じ名称・条件で表示されることまで個別に検証したものではありません。**

### 文字内容・書体・間隔

まず文字を入力し、書体と大きさを決めます。Text+の**Styled Text**は文字列、**Font**は書体、**Size**は文字の大きさ、**Tracking**は文字間、**Line Spacing**は行間を担当します。Fontを変えてからTrackingとLine Spacingを調整すると、見た目の変化を切り分けやすくなります。

Text+のSizeは一般的なワープロのポイント数ではなく、画像幅を基準とする相対的な大きさです。sTextでも数値をポイント数と読み替えず、最終的なsRenderの結果を見ながら調整してください。

縦書きや右から左へ読む文字を扱う場合、Text+側には**Direction**と**Line Direction**があります。前者は文字の書字方向、後者は行の進行方向を調整します。sTextでの個別の表示条件や日本語フォントごとの挙動は、使用する環境で確認が必要です。

### 配置と回転

Text+の**Layout**には、基準点を中心に置くPoint、矩形内に配置するFrame、円周に並べるCircle、指定したパスに沿わせるPathがあります。これは「文字列をどこに並べるか」を決める設定です。

一方、**Transform**は、文字・単語・行それぞれの移動、回転、拡大縮小などを調整する領域です。Layoutが文章全体の配置、Transformが構成要素の変形という違いがあります。

sText自体の立体的な変形は、3D空間へ立体文字のジオメトリを出力することとは別です。後段でClassic 3DのSceneを扱う必要があるなら、Text 3Dなど別のノード群を選びます。

### 塗り・輪郭・透明度

Text+の**Shading**では複数のElement（見た目の層）を重ね、Text Fill（文字の塗り）、Text Outline（文字の輪郭）、Border Fill（文字の周囲の帯）、Border Outline（帯の輪郭）などを組み合わせます。Opacityは各Elementの透明度を調整する考え方です。

sTextも複数スタイルと複数Shading層に対応すると明記されています。ただし、**Text+のGradient色をそのままsTextで使うことはできません**。グラデーションを使った文字が必要ならText+のImage出力で作るか、sRender後にImage系処理を加える構成を検討します。後者で文字の内側だけを正確にグラデーション化するには、別途Maskや合成の設計が必要です。

## 具体的な使い方

### 1. 映像に載せるタイトルをShapeで作る

~~~text
sText → sTransform → sRender ──→ Merge（Foreground）→ MediaOut
                                  ↑
                           MediaIn（Background）
~~~

sTextでタイトル文字を作り、sTransformで文字全体の位置や回転を動かします。sRenderで初めて2D Imageにした結果を、MergeのForegroundとして背景映像へ重ねます。

単純なタイトルを作るだけならText+よりノード数が増えます。**後段でShape系の変形・複製を使いたいとき**にsTextを選ぶのが分かりやすい判断基準です。

### 2. 文字と図形を一緒に移動させる

~~~text
sRectangle ─┐
            ├→ sMerge → sTransform → sRender → Merge
sText ──────┘
~~~

背景になる長方形をsRectangle、タイトルをsTextで作ります。[sMerge](./smerge)で二つのShapeをまとめ、その後ろにsTransformを置くと、文字と長方形を同じ変形処理に通せます。

長方形だけを動かしたい場合はsMergeより前のsRectangle側にsTransformを入れます。逆に、まとめてからsTransformへ送れば、複数要素を一組として移動・回転できます。構成は21.1 ManualのShape結合・階層変形に沿っていますが、**このタイトルカードの完成画は実機未検証**です。

### 3. 同じ文字を繰り返して背景模様にする

~~~text
sText → sDuplicate → sRender → Merge
~~~

短い文字列をsTextで作り、[sDuplicate](./sduplicate)でコピーを増やして、各コピーの位置や回転に差を付けます。画面全体へ小さな単語を散らす背景や、繰り返すロゴ風のモーションに利用できます。

sDuplicateは**Shapeを受け取ってコピーする**ノードです。sTextをImage化してから使う通常のImage処理とは入力データの種類が異なります。完成した模様を動画と合成する地点でsRenderを置きます。実際の配置間隔と文字同士の重なりはViewerで調整してください。

## Text+・Text 3Dとの使い分け

| ノード | 出力 | 選ぶ理由 |
| --- | --- | --- |
| [Text+](../generators/text-plus) | 2D Image | 文字を直接映像に重ねる。Text+のModifierやGradient色を使う |
| **sText** | Shape | sMerge・sDuplicate・sTransformなどのShape系ノードと組み合わせる |
| Text 3D | Classic 3D Scene | 立体文字を3D Scene内に置き、押し出しやベベルを使う |

**Text+のFollowerやCharacter Level StylingがsTextで完全に同じように使えるか**は、このsText節だけでは確認できません。文字単位のModifierが必要なら、まず[Text+の説明](../generators/text-plus)を参照し、sTextを使う場合は21.1実機で利用可能な操作を確認してください。

## 関連ノードと注意点

- [sRender](./s-render)：Shapeを2D Imageにする。通常のMergeへの接続前に使います。
- [sMerge](./smerge)：sTextと別のShapeをまとめます。通常のImage Mergeとはデータ領域が異なります。
- [sTransform](./stransform)：sTextが出したShapeを追加で移動・回転・拡大縮小します。
- [sDuplicate](./sduplicate)：文字のShapeを繰り返します。
- [sChangeStyle](./schangestyle)：Shapeの色とAlphaを後段で上書きする候補です。複数色の文字装飾を保持したいときは一括上書きの位置に注意します。

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**、Chapter 117「Shape Nodes」p.2765のsText節で、Text+のShape版であること、複数スタイル・3D変形・Shading層への対応、**Gradient色は非対応**であることを確認しました。Text+の用語と各設定の役割はChapter 103「Generator Nodes」pp.2381–2394を参照しています。

入力端子の完全な一覧、sText固有のInspector項目・既定値・設定範囲、Modifierの対応範囲、Edition差、実機での描画結果、内部REGIDは未確認です。このためverification: partialを維持します。Manualの略号sTxtを内部REGIDとして扱いません。
