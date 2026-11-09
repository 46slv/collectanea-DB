---
title: sPrimitiveCreate
description: 十字・多角形・長方形・星形などの基本図形をShapeとして生成するKrokodoveノード。
doc_type: node
term_id: sprimitive-create
term_short: 十字・多角形・長方形・星形など、画像化前の基本Shapeを作るツール。
verification: partial
aliases: [sPrimitiveCreate, sPrimitive Create]
concepts: [shape-data]
nodes: [sPrimitiveCreate]
node_family: krokodove
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# sPrimitiveCreate

**sPrimitiveCreate**は、十字・多角形・長方形・星形など、モーショングラフィックスで使う基本的な図形を作るKrokodoveのShape生成ノードです。輪郭を一から描かず、あらかじめ用意された種類の図形を出発点にできます。

ここで作るのは、まだピクセルで描かれていない<Term id="shape-data">Shape</Term>です。輪郭などの図形情報を持ったまま後段で加工でき、最終的に[sRender](../shapes/s-render)で通常の2D画像にします。「画像を切り抜くMask」や「3D空間に置く立体モデル」を直接作るノードではありません。

## 何を作れるか

DaVinci Resolve 21.1 Reference Manualが例示している形は、次の4種類です。

| 図形 | どのような形か | 使い道の例 |
| --- | --- | --- |
| Cross（十字） | 縦横に交差する形 | マーカー、アイコンの原型 |
| Polygon（多角形） | 複数の直線で囲まれた形 | 幾何学模様、タイトルの背景 |
| Rectangle（長方形） | 四辺を持つ四角形 | ラベル、帯、枠の原型 |
| Star（星形） | 外側に先端が突き出した形 | バッジ、アクセント |

これは**Manualに掲載された例**であり、利用できる形の全種類を保証する一覧ではありません。図形選択の全種類や、頂点数、縦横比、線幅、角の形状などの可変範囲は確認できていません。

<!-- capture:S283 -->

## 実機例：星形を画像化する

`sPrimitive Create` を `sRender` に接続し、TypeをStar、Stepsを4に設定しました。この静止画では四つの先端を持つ星形が見えます。Viewerの緑線は操作用ガイド、市松模様は透明部分の表示です。ほかの形やAlpha値、アニメーションは未検証です。[接続と設定の記録](/img/fusion/captures/S283/readback.json)に条件を記載しています。

[![sPrimitive CreateをsRenderへつなぐ構成](/img/fusion/captures/S283/graph.png)](/img/fusion/captures/S283/graph.png)

Shapeを画像化します。

[![sPrimitive CreateのInspector](/img/fusion/captures/S283/controls.png)](/img/fusion/captures/S283/controls.png)

TypeはStar、Stepsは4です。

[![四つの先端を持つ星形と操作用ガイド](/img/fusion/captures/S283/result.png)](/img/fusion/captures/S283/result.png)

星形と緑の操作用ガイドが見えます。

[再現用Graph](/img/fusion/captures/S283/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S283/capture.json)

<!-- /capture:S283 -->


## 入力と出力

**入力：** 既存の輪郭を変形するのではなく、新しい図形を作る「Shape Create Tools」に分類されています。基本図形を作り始めるのに上流のShapeが必要だとはManualに書かれていません。一方、外部入力端子の有無・数・正式名称までは確認できていません。

**出力：** 生成した図形をShapeとして後段のShape系ノードへ渡す用途です。Shapeは通常の2D Imageとはデータの種類が異なるため、[Merge](../compositing/merge)やGlowなど画像系ノードへ使う前に、通常はsRenderで画像化します。

最小構成の考え方は次のとおりです。

```text
sPrimitiveCreate（基本図形を作る）
    → sRender（Shapeを2D画像にする）
    → Mergeなど（映像や背景と合成する）
```

sRenderには画像のWidth / Heightなどを設定する機能があります。**図形の形を決める工程**と、**画像として何ピクセルで描くかを決める工程**は分かれています。詳細は[Shapeの基礎](../../learn/02-data/shape)と[sRender](../shapes/s-render)を参照してください。

## 具体的な使い方

### 例1：タイトルの背後に星形のアクセントを置く

1. sPrimitiveCreateで星形を作る構成を用意します。上の実機例ではType Star、Steps 4を使用しました。
2. 色や輪郭線を整える場合は、[sRestyle](./srestyle)を後段に置く構成が候補です。sRestyleはShapeの塗り・輪郭の見た目を上書きするツールです。
3. sRenderで画像化し、タイトルや背景映像へMergeで重ねます。
4. Viewerで星形の輪郭と合成結果を確認します。

```text
sPrimitiveCreate → sRestyle → sRender → Merge
     図形を作る     見た目を調整   画像へ変換   映像と合成
```

この接続列は各ノードの**資料上の役割から組み立てた制作例**で、Krokodove 21.1での配線・描画結果を実機確認したレシピではありません。sPrimitiveCreateの出力が期待どおり後段へつながるか、まず短いFlowで確認してください。

### 例2：角張った図形を基にロゴのパーツを作る

長方形や多角形を基にして、角の印象を変えたい場合は、[sRound](./sround)を続ける方法が考えられます。sRoundは**辺を保ちながら角を曲線にする**役割です。たとえば四角形の角を少し丸めたラベルを考えると、「四角形の生成」と「角の加工」を別々のノードで管理する意図が分かります。

```text
sPrimitiveCreate → sRound → sRender
    基本図形         角を加工    2D画像へ
```

図形によっては角の数や形状が異なります。どの角がどの程度変わるか、線分が短い場合にどうなるかは、実際にViewerで確認する必要があります。

## 似たノードとどう選ぶか

- [sRectangle](../shapes/srectangle)や[sStar](../shapes/sstar)は標準のShape生成ノードで、それぞれ四角形・星形を主に扱います。特定の形を作るだけなら、まず標準ノードでも足りるか比較できます。sPrimitiveCreateはManual上、複数種類の基本図形を生成するKrokodoveの項目です。設定項目が標準ノードと同等、あるいは多いとは確認していません。
- [sSpiral Create](./sspiral-create)は巻いた曲線を作ります。十字・多角形・長方形・星形のような基本図形と、渦巻き状に続く曲線とで使い分けます。
- [sRound](./sround)は**作られたShapeの角を加工**します。sPrimitiveCreateのように図形を最初から作るノードではありません。
- [sRestyle](./srestyle)は**形の塗り・輪郭線の見た目を変える**ノードです。図形の種類を作り分ける機能として説明するのは不正確です。

## うまく表示されないとき

図形を生成しただけで通常の画像ノードに結果が現れない場合は、まず**ShapeをsRenderで画像に変換しているか**を確認します。Shapeが画像と異なるデータ型であることは、Fusionの標準Shape系でも共通です。

次に、sPrimitiveCreate・途中のShape加工・sRenderの順にFlowを短くし、どこで期待と違うかを切り分けます。Krokodove特有の他の端子や図形ごとの詳細な制御方法は未確認なので、「この設定を変えれば必ず直る」とは断定しません。

## バージョン・出典・確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437。ここで確認できるのは、名称 `sPrimitiveCreate`、Shape Create Toolsという分類、cross・polygon・rectangle・starを含む基本図形の生成という役割です。

ShapeをsRenderで2D画像化する一般的な流れは、同ManualのChapter 117「Shape Nodes」（pp.2759–2761）と[Shapeの基礎](../../learn/02-data/shape)を参照しています。本文の接続例は、その一般原理から構成した**運用案**です。

**未確認：** 正式な入力端子・入力数、今回示した項目以外のInspectorの意味・初期値、図形を切り替えたときの挙動、別条件での実機動作、Free / Studioでの提供差、内部REGID。公式資料の記述と実機検証を区別するため、`verification: partial`を維持します。
