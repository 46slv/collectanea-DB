---
title: sDuplicateで右下へ小さくなる円の列を作る
description: sEllipseをsDuplicateで複製し、位置のずれと段階的な縮小を組み合わせて円が遠ざかるような連続模様を作る。
doc_type: recipe
verification: partial
aliases: [小さくなる円の列, sDuplicate 段階的縮小, 連続ドット]
concepts: [shape-data, normalized-coordinates, rasterization]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sDuplicate, sRender]
tasks: [shape, procedural-graphics, repetition, layout]
prerequisites: [shape-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sDuplicateで右下へ小さくなる円の列を作る

## 作るもの

左上寄りから右下へ進むほど円が小さくなる、7個の連続ドットを作ります。**sDuplicateのX/Y Offsetで隣の円との移動距離を決め、X/Y Sizeで次の円の大きさを直前の円に対する倍率として指定**します。

同じ大きさの円を格子に並べるsGridではなく、コピーごとに大きさを段階的に変えることが目的です。以下の数値は制作開始用の提案であり、Resolve 21.1実機で同じ配置をレンダリング・計測した値ではありません。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1のFusion Composition。最初は静止した図形で確認します。
- **sEllipse**：塗りつぶし円を1個生成するShapeノード。画像入力は不要です。
- **sDuplicate**：必須のオレンジ色Input1にShapeを受け取り、複製と段階的な位置・サイズ変更を行います。
- **sRender**：Shape出力を通常の2D Imageへ変換し、Viewerへ表示します。

## 接続

```text
sEllipse（元の円） ──Shape──> sDuplicate（複製・縮小） ──Shape──> sRender
                                                                      │ 2D Image
                                                                      ▼
                                                                    Viewer
```

sDuplicateの出力はShapeです。通常のImageのMergeへ重ねる場合は、**sRenderの後**で画像として合成します。

## 手順

### 1. 元の円を作る

1. sEllipseを追加し、**Solidをオン**にして塗りつぶし円にします。
2. **Width = 0.12 / Height = 0.12**を開始値にします。両者を等しくすると円になります。
3. **X Offset = -0.35 / Y Offset = 0.18**を開始値とし、円を左上寄りへ置きます。これらはピクセル数ではなく正規化座標です。
4. Styleで確認しやすい色を選びます。サイズの変化を観察する間、色とAlphaは固定します。

### 2. sDuplicateを接続して7個にする

1. sEllipseのShape出力を、sDuplicateの**Input1**へ接続します。
2. sDuplicateのControlsタブで**Copies = 6**、**Copy Probability = 1**を開始値にします。
3. **X Offset = 0.11 / Y Offset = -0.045**を設定します。各コピーは直前のコピーから右方向・下方向へ進む配置を想定します。
4. まず**X Size = 1.0 / Y Size = 1.0**として、元の円と追加6個の大きさが揃う状態をsRenderのViewerで確認します。

**Copiesは元Shapeを含まない数**です。Copies = 6なら、元の円1個とコピー6個で合計7個になります。Offsetが0なら同じ位置に重なり、1個のように見える場合があります。

### 3. 右へ進むほど縮小する

1. ほかの値は固定したまま、**X Size = 0.82 / Y Size = 0.82**へ変更します。
2. Viewerで、コピーごとに小さくなる並びになるか確認します。
3. 最後の円が小さすぎる場合は、倍率を1.0へ近づけます。円同士が重なる場合は元の円の大きさ、またはX/Y Offsetを調整します。
4. Jitterの設定は今回の比較対象にしません。位置やサイズにばらつきが加わっているときは、まずその変化を取り除き、Controlsによる規則的な変化だけを比べてください。

## 期待される結果と確認ポイント

| 条件 | 21.1公式Manualから予測できること |
| --- | --- |
| Copies 6、Copy Probability 1 | 元の円に6個のコピーが加わる |
| X/Y Offsetが0 | コピー同士が同じ位置に重なることがある |
| X/Y Sizeが両方1.0 | 元と同じ大きさのコピーが連なる |
| X/Y Sizeが両方0.82 | 次のコピーは直前のコピーの0.82倍の幅・高さになる |
| sRenderへ接続 | Shapeが2D Imageに変換されViewerへ表示できる |

位置・円の実際の直径・輪郭の描画品質・透明度のピクセル値は今回の実機では測定していません。

## この構成で動く理由

sDuplicateは単に同じ図形を複数個置くのではなく、**直前のコピーを基準に移動量とサイズ倍率を重ねていく**ノードです。X/Y Offsetは複製ごとの移動量、X/Y Sizeは前のコピーに対する次のコピーのサイズ倍率なので、同じ値を使い続けても円の大きさが段階的に変わります。

正規化座標の意味は[位置を正規化値で扱う](../../learn/03-space/normalized-coordinates)、Shapeと画像の違いは[Shapeの基礎](../../learn/02-data/shape)、画像化の境界は[最後に画像へ変換するパターン](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## バリエーション

- **小さくならない列**：X/Y Sizeを1.0へ戻します。移動量と倍率の役割を独立して比較できます。
- **左右に伸びた楕円列**：X SizeとY Sizeを異なる倍率にし、幅と高さの変化率を分けます。
- **向きも変える反復模様**：元の円を向きが分かる星などのShapeへ替え、RotationとAxis Modeを少数のCopiesで比較します。回転軸の違いは別途実機確認してください。
- **不規則な模様**：[sGridとsJitterでドットを散らすレシピ](./scatter-dots-with-sjitter-fixed)では、コピー間の段階的縮小ではなく格子配置からのばらつきを扱います。

## うまくいかないとき

- **円が1個に見える**：Copies、Copy Probability、X/Y Offsetを順に確認します。Offsetが0なら重なります。
- **右側の円が小さくなりすぎる**：X/Y Sizeが1.0より小さい場合、各コピーでさらに縮小します。倍率を1.0へ近づけます。
- **円の並びが期待と違う**：sEllipseの初期位置と、sDuplicateの各コピーのOffset、Jitterの追加変化を分けて確認します。
- **Viewerが空白になる**：sDuplicateのShape出力をsRenderへ接続し、sRenderをViewerで表示しているか確認します。
- **通常のImageノードにつなげない**：sRenderより前はShapeデータです。[最小Shape描画レシピ](./basic-shape-render)で境界を確認します。

## 関連資料

- [sDuplicateのNode Reference](../../nodes/shapes/sduplicate)
- [sEllipseのNode Reference](../../nodes/shapes/s-ellipse)
- [sRenderのNode Reference](../../nodes/shapes/s-render)
- [Shapeの基礎](../../learn/02-data/shape)
- [正規化座標](../../learn/03-space/normalized-coordinates)
- [画像化を最後まで遅らせるパターン](../../patterns/data-domain/defer-domain-conversion)
- [基本のShape描画](./basic-shape-render)

## 出典と検証範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）Chapter 117「Shape Nodes」、**pp.2735–2738（sDuplicate）およびpp.2739–2740（sEllipse）**。Input1、Copies、Copy Probability、X/Y Offset、X/Y Size、ShapeとsRenderの接続、sEllipseのSolid・位置・サイズを今回直接照合しました。[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

**静的確認**：今回の新規1記事、引用Controlの名称と意味、関連リンクの参照先、担当範囲。コピー数・倍率の結果はManualに基づく予測です。

**未検証（NOT_RUN）**：ここに記載した各数値によるResolve 21.1実機の描画・ピクセル位置・Alpha、Free / Studio差、他OS・GPU差、および保存・再読込。実機再現済みと記載せず、`verification: partial`を維持します。
