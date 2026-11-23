---
title: sGridとsJitterのFixedで不規則なドットを作る
description: 円を格子状に複製してからsJitterのFixedで位置だけをばらつかせ、Randomとの違いも確認する。
doc_type: recipe
verification: partial
aliases: [不規則なドット, ドット散布, sJitter Fixed, sGrid配置]
concepts: [shape-domain, data-domain]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sGrid, sJitter, sRender]
tasks: [shape, grid, procedural-graphics, pattern, composition]
prerequisites: [data-domain]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-23"
---

# sGridとsJitterのFixedで不規則なドットを作る

## 作るもの

同じ大きさの円を規則正しく並べ、**円の位置だけを少しずつ変えた静止ドット模様**を作ります。sGridが行数・列数と基本間隔を決め、sJitterが各円に別々の位置のずれを加えます。円の輪郭は変形させません。

今回はsJitterを**Fixed**にして静止した模様を作ります。最後に設定を1つだけ変え、時間とともに位置を変える**Random**との違いを確かめます。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1のFusionページで、Shapeノードを使えるComposition。
- **sEllipse**：塗りつぶしの小さな円を1個作る。
- **sGrid**：同じ円を横・縦へ複製する。
- **sJitter**：複製された円ごとに位置のずれを加える。
- **sRender**：Shapeを通常の2D Imageへ変換し、Viewerに表示する。

数値は操作開始用の**提案値**であり、この組み合わせでの画面・座標・描画結果は実機測定していません。円の大きさと間隔はViewerに合わせて調整します。

## 接続

~~~text
sEllipse ──Shape──> sGrid ──Shape──> sJitter ──Shape──> sRender
                                                                ↓ 2D Image
                                                              Viewer
~~~

sGridとsJitterの間、およびsJitterとsRenderの間はShapeデータの接続です。通常のMergeへ重ねたい場合は**sRenderの後**で画像として合成します。

## 手順

### 1. 円を1個用意する

1. sEllipseを追加し、**Solid**をオンにして塗りつぶしの円を作ります。
2. WidthとHeightを同じ値にします。例えばどちらも**0.08**から始めます。
3. Styleで色を選びます。今回は配置の違いを見るため、色やAlphaは途中で変えません。

### 2. sGridで格子を作る

1. sEllipseのShape出力をsGridの入力へ接続します。
2. sGridの**Grid Cells Xを6、Grid Cells Yを4**にし、6列×4行のドットを用意します。
3. **X Offset / Y Offset**で各円の基本間隔を決めます。まずX・Yともに**0.15程度**から試してください。
4. 一度sGridをsRenderへ接続してViewerに表示し、円が等間隔に並ぶことを確認します。

X/Y Offsetが両方0.0なら、複製した円はすべて同じ位置へ重なります。1個にしか見えない場合は、まずsGrid側のOffsetを確認します。

### 3. sJitterのFixedで位置だけを散らす

1. sGridとsRenderの間に**sJitter**を挿入します。sGridのShape出力をsJitterの**Input1（オレンジ）**へつなぎます。
2. sJitterの**Jitter ModeをFixed**にします。
3. **Shape X Offset**の範囲スライダーを小さく広げます。続いて**Shape Y Offset**も少し広げます。例えば左右・上下に少量のずれが出る設定から始めます。
4. **Shape X/Y Size、Shape Rotate、Point Jitter**は初期値のままにします。まず位置の違いだけを比較するためです。
5. sRenderのViewerで、円の列・行が保たれつつ、個々の中心位置が不揃いになったか確認します。

位置のずれを大きくしすぎると、隣の円が重なったり、規則的な列の形が分からなくなったりします。sGridの基本間隔は保ち、sJitter側のずれ幅を小さく調整してください。

### 4. FixedとRandomを1つの設定だけで比較する

1. Fixedのまま**frame 0とframe 48**を表示して見比べます。キーフレームやModifierを追加していなければ、公式Manual上は静的なばらつきになる設定です。
2. sGridの行数・間隔、sEllipseの大きさ、sJitterの範囲を変えず、**Jitter ModeだけをRandom**へ切り替えます。
3. 同じ2フレームを見比べます。公式Manualでは、Randomは指定範囲内で各値を自動的にアニメーションさせるモードです。
4. 比較後はFixedに戻します。

**Randomに切り替えただけで必ず動くわけではありません。** ずれ幅の範囲スライダーが初期状態のままなら、公式Manualではランダムアニメーションが発生しないと説明されています。

## 期待される結果

| 条件 | 21.1公式Manualに基づく期待 |
| --- | --- |
| sGridのみ | 同じ円が行列状に等間隔で並ぶ |
| sJitter / Fixed、Shape X/Y Offsetを小さく設定 | 円ごとに異なる位置のずれを持つ静止模様になる |
| sJitter / Random、位置のずれ幅を設定 | 位置のずれが時間とともにランダムに変化する |
| Point Jitterまで変更 | 円の配置だけでなく、図形の制御点・輪郭も変形する |
| sRenderへ接続 | Shapeを2D ImageとしてViewerへ表示できる |

実際の位置座標、画面内の円の間隔、frame 0と48の差分量は、この構成では測定していません。

## この構成で動く理由

sGridは**円を増やして整列**させる役割、sJitterは**増えた個々の円を別々にずらす**役割です。sJitterはsGridの行・列を増やす設定ではありません。

位置だけを崩したいときはShape X/Y Offsetを使い、形そのものを崩したいときはPoint Jitterを使います。処理はどちらもShapeの段階で行い、最後にsRenderで画像にします。[Shapeの基礎](../../learn/02-data/shape)と[画像化の境界](../../patterns/data-domain/defer-domain-conversion)も参照してください。

## バリエーション

- **大きさにも不揃いさを付ける**：Shape X/Y Sizeを少し広げます。位置の比較を終えてから追加します。
- **回転差を見せる**：円の代わりに向きの分かる図形を入力し、Shape Rotateを変えます。
- **輪郭を手描き風に崩す**：Point Jitterを少し加えます。円の中心のずれとは別の変化です。
- **映像の上へ重ねる**：sRenderの後ろに通常のMergeを置き、映像を背景、ドットを前景として合成します。

## うまくいかないとき

| 症状 | 最初に確認すること |
| --- | --- |
| 円が1個にしか見えない | sGridのGrid CellsとX/Y Offset。Offsetが0.0なら複製が重なっている |
| 位置がまったく変わらない | sJitterのInput1への接続、Shape X/Y Offsetの範囲が初期値のままではないか |
| 円の輪郭まで崩れる | Point Jitterを初期値へ戻し、Shape X/Y Offsetだけで比較する |
| 静止模様が時間で変わる | Jitter ModeがRandomになっていないか、Fixed側にキーフレーム／Modifierがないか |
| Randomでも変化が見えない | 範囲スライダーに変化量があるかを確認する。Random選択だけでは動かない場合がある |
| Viewerで何も見えない | sJitter→sRenderを接続し、sRender出力をViewerへ表示しているか |

## 関連資料

- [sEllipseのNode Reference](../../nodes/shapes/s-ellipse)
- [sGridのNode Reference](../../nodes/shapes/sgrid)
- [sJitterのNode Reference](../../nodes/shapes/sjitter)
- [sRenderのNode Reference](../../nodes/shapes/s-render)
- [Shapeの基礎](../../learn/02-data/shape)
- [Shapeから2D Imageへ変換する最小例](./basic-shape-render)
- [画像化を最後まで遅らせるパターン](../../patterns/data-domain/defer-domain-conversion)

## 出典と検証範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117「Shape Nodes」pp. 2743–2745（sGridのGrid Cells / Offset、sJitterのInput1 / Fixed / Random / Shape Offset / Size / Rotate / Point Jitter）。円のSolidやサイズは同章sEllipse（pp. 2739–2741）。[公式Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)の該当本文と照合しています。

**既存の実機記録**：[sJitterのNode Reference](../../nodes/shapes/sjitter)には、Resolve Studio 21.1.0.14 / WindowsでsDuplicateの円5個にFixedとY Offsetを適用した静止画の例があります。この資料は**sGridを使った本ページの6列×4行の構成やRandom時間変化の実証ではありません**。

**確認済み**：21.1公式Manualでの各ノードの役割、Input1、Fixed/Randomと各Offsetの意味。担当範囲の新規原稿と参照先リンクの静的確認。

**未検証**：このRecipe設定を使うResolve 21.1実機の描画、frame 0/48のピクセル比較、Randomの時間変化・再現性、Free / Studio差、他OS・GPU差。**verification: partial**を維持します。
