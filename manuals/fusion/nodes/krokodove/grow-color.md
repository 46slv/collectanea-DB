---
title: Grow Color
description: 画像端の色を透明領域へ引き伸ばすKrokodoveの2D画像処理ツール。
doc_type: node
term_id: grow-color
term_short: 画像の端にある色を透明な領域へ伸ばすKrokodoveの画像処理ツール。
verification: partial
aliases: [Grow Color]
concepts: [image-data]
nodes: [Grow Color]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Grow Color

Grow Colorは、**画像の端にある色を、透明な部分へ引き伸ばす**Krokodoveの画像処理ツールです。

たとえば、透明な背景に赤いロゴがある画像を考えます。ロゴの外側には絵柄のない透明な部分があります。Grow Colorは、端にある色をその透明部分へ延長するためのツールです。**ロゴ全体を拡大したり、ロゴの登場をアニメーションさせたりするものではありません。**

ここでいう「色を伸ばす」は、境界付近の色を周囲へ広げるという意味です。21.1 Manualの説明だけでは、透明度（Alpha）まで変更するか、どこまで色を広げるか、色の延長方向をどう決めるかまでは分かりません。

## 入力・出力

| 段階 | 内容 |
| --- | --- |
| 入力 | 透明部分を含むロゴ・写真・グラフィックなどの2D画像。 |
| 処理 | 画像端の色を、透明な部分へ引き伸ばす。 |
| 出力 | 処理結果の2D画像。後段の合成や画像処理に渡す。 |

Imageという入出力分類は既存のNode catalogに基づきます。[Imageの基本](../../learn/02-data/image)も参照してください。21.1 Manualの該当表には**正式なポート名・ポート数・Effect Maskの有無**は書かれていないため、ここでは断定しません。

## 主な用途

- **透過ロゴの輪郭まわり**：透明な余白に向かって、ロゴの端の色を延長する。
- **後段の画像処理の準備**：ぼかしや拡大縮小などの前後で、境界付近の色の見え方を比較する。周辺の色が変わる可能性はありますが、縁の不自然さが必ず改善するという保証はありません。
- **RGBとAlphaの違いの確認**：透明な場所に色データが存在しても、合成後にその色が見えるとは限りません。Viewerでは色と透明度を分けて確認します。

上記は公式資料にある「透明部分へ端の色を引き伸ばす」という機能から考えた用途です。特定の演算方式・処理距離・透明度の挙動については実機確認が必要です。

## 透過ロゴで試す

    透過ロゴ（MediaIn） → Grow Color ──→ Merge（前景） → MediaOut
                                            ↑
    背景画像（MediaIn / Background） ────────┘

1. 背景が透明なロゴを用意し、Grow Colorの前後をViewerに表示して比べます。
2. 可能ならViewerのRGB表示とAlpha表示を切り替え、色が広がる範囲と透明度の変化を別々に確認します。
3. 結果を[Merge](../compositing/merge)の前景につなぎ、背景の上での見え方を確認します。透明領域にあるRGBの変化は、合成結果からは読み取れないことがあります。
4. 必要ならGrow Colorの前後でぼかし・拡大縮小などを試し、輪郭付近がどう変化するか比べます。

この接続図は画像の流れの**構成例**です。Grow Color固有のポート配置やInspector設定を示していません。正確な操作項目は対象バージョンのInspectorで確認してください。

## 似たツールとの違い

| ツール | 働き | 選ぶ基準 |
| --- | --- | --- |
| **Grow Color** | 端の色を透明部分へ延長する | 透明な余白に色を伸ばしたい |
| [Grow](./grow) | 1つ以上の起点から画像を現したり消したりする | 表示・消失の始まる位置を指定したい |
| [Extend](./extend) | 端の画素を水平方向または垂直方向へ繰り返す | 端の模様を一定方向へ繰り返したい |
| [Fragments](./fragments) | 画像を断片に分け、Rangeで表示を変える | 断片ごとの出現・消失を扱いたい |

特に**Grow ColorとGrowは別の処理**です。Grow Colorは色の延長、Growは画像が現れる・消える効果を扱います。Grow Colorを使えば画像の外形やAlphaが必ず拡大する、とも断定できません。Krokodoveの分類は[Family Overview](./)を参照してください。

## バージョン・出典・未確認事項

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2434、Image Tools「Grow Color」。画像の端の色を引き伸ばし、透明部分を埋めると説明されています。

**確認済み**：KrokodoveのImage Toolであり、画像端の色を透明部分へ伸ばす用途であること。入出力のImage分類はCOLLECTANEAの既存catalogに基づきます。

**未確認**：21.1の正確な入出力端子、Inspectorの項目名・初期値・値域、RGB / Alphaの更新方式、処理距離と方向、キーフレーム対応、Edition差、REGID、実機レンダリング結果。これらのためverificationはpartialのままです。
