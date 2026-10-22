---
title: "sJitter"
description: "Shapeの配列や輪郭に位置・大きさ・回転・制御点のばらつきを加え、規則的な図形を崩すNode。"
doc_type: node
term_id: "sjitter"
term_short: "Shapeの位置・大きさ・回転や輪郭の制御点へランダムな変化を加えるNode。"
verification: partial
aliases: ["sJitter"]
concepts: ["shape-data"]
nodes: ["sJitter"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Jitter Mode", "Shape X and Y Offset", "Shape X and Y Size", "Shape Rotate", "Point Jitter"]
tasks: ["build-shape", "procedural-graphics", "repeat-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# sJitter

sJitterは、並んだ図形の**位置や大きさ、回転を図形ごとに少しずつ変える**Nodeです。たとえば、きれいに整列したドットを不揃いにして、手作業で散らしたような背景を作れます。図形を構成する点そのものを動かし、輪郭をゆがませることもできます。

ここで扱う<Term id="shape-data">Shape</Term>は、円や四角の形をピクセル画像に変える前の図形データです。sJitterの処理後もShapeのままなので、最後に[sRender](./s-render)で画像化します。

## 役割

[sGrid](./sgrid)は同じ図形を行と列に並べ、[sDuplicate](./sduplicate)はコピーを繰り返して増やします。sJitterは、それらの**規則正しい並びに不規則な差を加える**役割です。

動かせる対象は、図形全体の位置・拡大縮小・回転と、輪郭を形作る制御点です。前者は図形の配置を崩し、後者は図形そのものの形を崩します。単一の図形にも使えます。

## 入力と出力

- **Input1（オレンジ・必須）**：別のShape Nodeの出力を受け取ります。sGridやsDuplicateから図形の配列を渡すほか、単一のShapeも入力できます。
- **出力（Shape）**：設定に従って位置や形を変えたShapeを返します。別のShape Nodeで加工を続けるか、sRenderに接続します。

```text
sEllipse → sGrid → sJitter → sRender → 2D Image
           行列化   ばらつき    画像化
```

sJitterの出力を、通常のMergeやBlurへ画像として直接渡す構成ではありません。画像処理へ進む位置にsRenderを置きます。

## 主なInspector項目

DaVinci Resolve 21.1 Reference ManualのControlsタブで確認できる内容です。数値の初期値や設定範囲はここでは断定しません。

| 項目 | 変えるもの | 見た目の変化 |
| --- | --- | --- |
| **Jitter Mode** | ばらつきを固定するか、時間とともに自動で変えるか | 静止した不揃いな配置／動き続ける不規則な変化 |
| **Shape X and Y Offset** | 各図形の横・縦方向の位置 | 整列した円がそれぞれ別方向にずれる |
| **Shape X and Y Size** | 各図形の横・縦の大きさ | 大小や縦横比に差が生まれる |
| **Shape Rotate** | 各図形の回転 | 四角形や星形の向きがそろわなくなる |
| **Point Jitter（X / Y）** | 輪郭を構成する制御点の位置 | 円や多角形の輪郭が不揃いになる |

### Jitter Mode：FixedとRandom

- **Fixed**：各図形に与えたばらつきが、そのままでは自動的に動きません。Manualでは既定の選択肢です。キーフレームやModifierを使えば、必要な項目を後からアニメーションできます。
- **Random**：設定した範囲の中で、各パラメータを時間とともに自動でランダム変化させます。すべての範囲が初期状態のままだと、Randomに切り替えただけではランダムアニメーションは生まれません。

**静止画や固定レイアウト**ならFixed、**揺れ続ける図形**ならRandomを出発点にすると違いを判断しやすくなります。Randomは「一度ランダムに配置するだけ」という意味ではありません。

### Shape X / Y Offset：図形をずらす

各図形の元の位置からの横・縦方向の移動量にばらつきを持たせます。ひとつの数値で配列全体を同じ方向へ移すのとは違い、**図形ごとに異なるずれ**が加わります。

### Shape X / Y Size：大きさを変える

配列の各図形を横方向・縦方向へランダムに拡大縮小します。Manualでは範囲の左側が縮小、右側が拡大を担当すると説明されています。XとYを分けて変えると、円が横長・縦長になるなどの違いも観察できます。

### Shape Rotate：向きを変える

図形ごとの回転を変えます。円では回転の違いが分かりにくいため、最初は[sRectangle](./srectangle)や[sStar](./sstar)で確認すると変化を見分けやすくなります。

### Point Jitter：輪郭をゆがませる

X / YのPoint Jitterは、ベクター図形の輪郭を作る**制御点**を動かします。図形を丸ごと左右へ移動するOffsetとは異なり、円の周囲が不規則になったり、線の形が揺れたりします。画像をピクセル単位で乱す処理ではありません。

## 制作例1：規則正しすぎないドット背景

1. [sEllipse](./s-ellipse)で小さな円を作ります。
2. sGridで横8列・縦6行に複製し、Offsetで円同士が重ならないように並べます。
3. sJitterのJitter Modeを**Fixed**にし、まずShape X / Y Offsetだけに小さなばらつきを加えます。
4. 次にShape X / Y Sizeを少し変えて、同じ大きさの円ばかりにならないようにします。
5. sRenderで画像化し、位置だけを変えた場合と、大きさも変えた場合を比較します。

```text
sEllipse → sGrid（8×6）→ sJitter（Fixed）→ sRender
```

最初からすべての変化を大きくすると、どの設定で模様が崩れたか分かりにくくなります。位置、次に大きさという順に増やします。

## 制作例2：輪郭が揺れる図形

1. 単一のsEllipseをsJitterへ接続し、後段にsRenderを置きます。
2. Shape X / Y OffsetやSizeの変化は一度抑え、**Point Jitter**だけを増やして輪郭の変化を見ます。
3. Jitter ModeをFixedから**Random**へ切り替え、再生しながら輪郭の動きを確認します。
4. Point Jitterの範囲を戻し、アニメーションが小さくなるか比較します。

この例は、図形の位置が動くことと、**輪郭そのものが変形すること**を区別するための確認手順です。実機での見た目や動きの速度を保証するものではありません。

## 制作例3：手描き風の四角形パターン

1. sRectangleをsGridまたはsDuplicateで複製します。
2. sJitterのFixedで位置と回転の差を追加します。
3. 必要ならPoint Jitterを少し足して、四角形の辺を不揃いにします。
4. sRenderで画像化し、整然とした配列との違いを見比べます。

四角形は角や辺の向きが見えるため、回転と輪郭のゆがみを円より確認しやすい素材です。

## 似たNodeとの違い

- [sGrid](./sgrid)：**複製数と行列の間隔**を決めます。不規則さを加えるには、後段にsJitterを置けます。
- [sDuplicate](./sduplicate)：コピーごとの位置・大きさ・回転の累積変化に加え、Jitter設定も持ちます。sJitterは**独立した後処理Node**なので、既存のsGrid配列や単独Shapeにも使え、輪郭の制御点も変えられます。
- [sTransform](./stransform)：Shapeの配置や変形を指定します。複数図形のランダムな差を作る用途ではsJitterが直接的です。
- [sRender](./s-render)：Shapeを2D Imageに変えるNodeです。sJitter自身は画像化しません。

## うまくいかないとき

- **Randomにしても動かない**：Jitter Modeだけでなく、動かしたい項目の範囲も変えたか確認します。Manualではすべて初期範囲のままだと自動アニメーションは発生しません。
- **図形が全部同じ方向へ動く想定だった**：Shape X / Y Offsetは配列の要素ごとにランダムな差を付けます。配列全体を同じ量だけ移動したい場合はsTransformとの役割を分けます。
- **Point Jitterを変えても何が違うか分からない**：円など輪郭を確認しやすいShapeを単独で使い、OffsetやSizeの差をいったん抑えて比較します。
- **通常の画像として表示できない**：sJitterの後段にsRenderがあるか確認します。

## バージョンと検証状況

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2744–2745**。Input1（オレンジ・必須）、sGrid / sDuplicate配列への適用、Jitter ModeのFixed / Random、Shape X / Y Offset、Shape X / Y Size、Shape Rotate、Point Jitterを確認しました。

ManualのBasic Node Setupには後段の出力元を`sExpand`とする記述がありますが、前後のsJitterの説明と図に照らし、この記事ではsJitterからShapeが出力される構成として記載しています。実機の端子表示、全項目の初期値・数値範囲、アニメーションの具体的な時間変化、Free / Studio差は未検証です。`verification: partial`を維持しています。
