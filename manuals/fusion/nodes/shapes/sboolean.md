---
title: "sBoolean"
description: "2つのShapeの重なりをIntersection・Union・Subtract・Xorで演算し、切り抜きや共通領域を作るノード。"
doc_type: node
term_id: "sboolean"
term_short: "2つのShapeから、重なりを残す・重なりを除くなどの新しい領域を作るノード。"
verification: partial
aliases: ["sBoolean"]
concepts: ["shape-data"]
nodes: ["sBoolean"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Operation", "Style Mode", "Color", "Allow Combining"]
tasks: ["build-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-11"
---

# sBoolean

sBooleanは、2つの<Term id="shape-data">Shape</Term>が重なった部分を計算し、共通部分だけを残したり、一方から他方をくり抜いたりするノードです。円と四角形をそのまま重ねるのではなく、**図形が占める領域そのものを組み替える**ときに使います。

Shapeはまだピクセル画像ではありません。後段で[sRender](./s-render)を使うと通常の2D Imageに変換でき、映像へ合成できます。Shapeというデータの扱いは[シェイプ（Shape）の基本](../../learn/02-data/shape)を参照してください。

## 入力と出力

- **Input1（オレンジ、必須）**：1つ目のShapeを受け取ります。`Subtract`では、ここへ接続した図形が**残す側**です。
- **Input2（緑、任意）**：2つ目のShapeを受け取ります。`Subtract`では、こちらの図形が重なる部分をInput1から取り除きます。

Input2はManual上、任意入力です。ただし、2つの図形の重なりを計算したい場合は両方を接続します。Input2を接続しないときの各Operationの結果は、ここでは規定しません。

出力は演算後の**Shape**です。後ろへ別のShape系ノードをつなげることも、sRenderで画像に変えることもできます。

```text
sStar ────→ Input1 ┐
                   ├→ sBoolean → sRender → 2D Image
sEllipse ─→ Input2 ┘
```

通常の`Merge`や`Glow`などのImage系ノードへ移る場合は、間にsRenderを置きます。

## Operation：4つの演算

Inspectorの**Controlsタブ > Operation**で、残す領域を選択します。Input1の領域を「A」、Input2の領域を「B」と考えます。

| Operation | 残す範囲 | 具体的な目的 |
| --- | --- | --- |
| **Intersection** | AとBが重なる部分だけ | 円と四角形の共通部分を取り出す |
| **Union** | AかBのどちらかに含まれる部分 | 2図形の領域をまとめて残す |
| **Subtract** | AからBに重なる部分を除く | 大きな円に小さな円で穴を開ける |
| **Xor** | AかBの片方にだけ含まれる部分 | 2図形の重なりだけを抜く |

**Subtractだけは入力順を入れ替えると結果が変わります**。たとえば大きい円をInput1、小さい円をInput2にすれば中央がくり抜かれますが、その逆では残る部分が異なります。

マニュアルでは、Intersection・Union・XorではどちらのShapeをどちらの入力へつなぐかは重要ではないと説明されています。これは**領域の演算**についての話です。上流の異なる色を保持するという意味ではありません。

図形が離れている場合、Intersectionには共通領域がありません。SubtractではInput1から取り除く部分がなく、Xorでは両方の図形の領域が残ります。これらは各Operationの定義から分かる挙動です。

## Inspector：Style Mode・Color・Allow Combining

### Style Mode：Replace

Controlsタブの**Style Mode**は、21.1 Manualに記載された選択肢が**Replace**だけです。入力元の2つのShapeに別々の色やAlphaが設定されていても、sBooleanのStyleタブで指定したものに置き換わります。

赤い円と青い四角形をUnionにしても、赤・青の2色を保った合成にはなりません。色を分けたまま2図形を重ねたいだけなら、[sMerge](./smerge)が適しています。

### Color：演算結果の色

**Styleタブ > Color**には、色スウォッチ・スポイト・RGBAのスライダーや数値欄があります。R/G/Bが色、Alphaが透明度です。ここで指定するのは、**演算後に残った領域全体**の色です。

Subtractで取り除いた領域にInput2側の色が塗られるわけではありません。そこは出力Shapeから除外されています。

### Allow Combining：半透明Shapeの重なり

**Styleタブ > Allow Combining**は、後段で図形を複製し、**同じShapeのコピー同士が重なる場合**のAlphaの扱いを決めます。

- **有効**：重なった場所でも設定したAlpha値を維持します。
- **無効**：重なった場所でAlphaが累積し、より不透明になる場合があります。

ManualではAlphaが0.5の図形を使い、DuplicateやGridを通して重ねた場合の違いを示しています。重要なのは、**sBooleanでは入力元の個々のAllow Combining設定が無視され、sBoolean側の設定が使われる**ことです。Operationの切り抜き方法を変える設定ではありません。

## 具体的な運用例

### 大小2つの円からリングを作る

2個の[sEllipse](./s-ellipse)を用意し、同じ中心で大きさを変えます。大きい円をInput1、小さい円をInput2に接続し、Operationを**Subtract**にします。

```text
sEllipse（大） → Input1 ┐
                       ├→ sBoolean（Subtract）→ sRender
sEllipse（小） → Input2 ┘
```

Input2の小さい円が重なる中央だけ除かれ、輪の形になります。外径を変えるときは大きな円、穴の径を変えるときは小さな円を調整します。円形ゲージやHUD風の装飾などに応用できます。

これは単に線幅を指定して輪郭を描くのではなく、**2つの塗り領域の差**から図形を作る方法です。

### 四角形と円の共通領域だけを使う

[sRectangle](./srectangle)とsEllipseを部分的に重ね、Operationを**Intersection**にします。

```text
sRectangle → Input1 ┐
                    ├→ sBoolean（Intersection）→ sRender
sEllipse ──→ Input2 ┘
```

残るのは、長方形の内側でもあり、円の内側でもある部分だけです。図形の位置を動かせば、切り出される弧状の形も変わります。円全体を長方形の前面に見せるだけなら、IntersectionではなくsMergeで重ねます。

### リングを行列に複製する

リングを作ったsBooleanの出力を[sGrid](./sgrid)へ渡します。

```text
sEllipse（大） ─┐
                ├→ sBoolean（Subtract）→ sGrid → sRender → Merge
sEllipse（小） ─┘        ↑               ↑                  ↑
                     色とAlpha       行数・列数・間隔    背景と合成
```

sGridのGrid Cellsで行数と列数、Offsetで間隔を決めます。リングが少し重なるように並べてAlphaを0.5程度にすると、sBooleanのAllow Combiningを切り替えた際の違いも確認できます。

**リングの形はsBoolean、数と配置はsGrid、画像への変換はsRender**が担当します。穴の大きさを変更するときは内側のsEllipseに戻り、配置だけを変えるときはsGridを調整します。

以上は21.1 Manualで確認された接続・演算仕様から構成した例で、21.1実機での描画結果は未検証です。

## sMerge・通常のMergeとの使い分け

- **[sBoolean](./sboolean)**：2つのShapeが占める領域を演算し、共通部分や差分などを残します。出力はShapeです。
- **[sMerge](./smerge)**：複数のShapeを入力順に重ね、一つのShapeデータへまとめます。重なった部分をくり抜く目的ではありません。
- **通常のMerge**：sRenderなどで画像化された2D Image同士を合成します。

ManualではUnionはsMergeの結果に似るとされています。ただし、図形ごとの色と重なり順を扱いたいのか、1つの領域として加工したいのかで選択が異なります。

## うまくいかないとき

- **Subtractで逆の部分が残る**：Input1が残す側、Input2が取り除く側かを確認します。
- **結果が表示されない**：sRenderまで接続しているか、Intersectionなら2図形が重なっているかを確認します。
- **入力元の色が消えた**：Style ModeはReplaceです。出力の色はsBooleanのStyleタブで指定します。
- **複製した形の重なりだけ濃い**：sBooleanのAllow Combiningを確認します。上流の個々のShape側よりも、このノードの設定が優先されます。

関連する入口は[Shapeノード一覧](./index.md)です。変形には[sTransform](./stransform)、コピーごとに変化を与える場合は[sDuplicate](./sduplicate)を参照してください。

## バージョンと確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、pp.2729–2732**を参照しました。Input1・Input2、Operationの4種類、Style ModeのReplace、Color、Allow Combiningと、その上流設定に対する優先関係をManualで確認しています。

内部REGID、各パラメータの初期値・設定範囲、Edition差、21.1実機での描画結果は未確認です。制作例は確認済み仕様に基づく構成案であり、実機検証済みではないため、`verification: partial`を維持しています。
