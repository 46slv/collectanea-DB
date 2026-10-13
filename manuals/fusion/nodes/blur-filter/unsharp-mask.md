---
title: Unsharp Mask
description: blurとの差分からedge detailを抽出し、Size・Gain・Thresholdで低contrast領域を除外しながらselective sharpeningするNode。
doc_type: node
term_id: unsharp-mask
verification: partial
aliases: [Unsharp Mask, USM]
concepts: [image-data, filtering]
nodes: [Unsharp Mask]
node_family: blur-filter
controls: [Color Channels, Lock X/Y, Size, Gain, Threshold]
inputs: [image, mask]
outputs: [image]
tasks: [sharpen, enhance-detail, low-contrast-detail]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# Unsharp Mask

Unsharp Maskは、入力画像とそれをぼかした画像を比較し、差の大きい輪郭を強調する2D画像処理ノードです。Sizeで検出範囲、Gainで強調量、Thresholdで低コントラスト領域の除外を別々に調整します。

名前に「Mask」とありますが、マスク画像を出力するノードではありません。元画像の輪郭を選択的に強調する手法の名前です。失われた映像情報を復元する処理ではなく、既存の明暗差を見やすくする処理です。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| Input（橙） | 2D Image | 強調する元画像。MediaInやLoader、前段の画像処理ノードを接続します。 |
| Effect Mask（青・任意） | Mask | EllipseやPolygonなどで、効果をかける領域を制限します。 |
| 出力 | 2D Image | 処理済み画像。後段の画像処理ノード、Merge、MediaOutへ接続できます。 |

Effect MaskはUnsharp Maskの処理**後**に適用範囲を制限します。Maskを入力しても、ノードがMask生成器に変わるわけではありません。基本は[マスク（Mask）](../../learn/02-data/mask)を参照してください。

## Size

輪郭を検出するために作る、ぼかし画像のフィルターサイズを調整します。大きくすると元画像との差として検出される部分が増えやすくなります。

細い文字や髪を扱うときに上げ過ぎると、輪郭の周りに不自然な明暗の縁が見えることがあります。固定の推奨値やピクセル換算は本マニュアルでは確定できないため、素材を100%表示して確認します。

## Gain

検出した輪郭をどれだけ強くするかを決めます。値を上げると輪郭のコントラストが増しますが、元画像のノイズや圧縮の境界まで強調される場合があります。SizeとGainは別々に比較してください。

## Threshold

元画像とぼかし画像の差が小さい、低コントラストの領域を強調対象から外します。値を上げるほど暗部ノイズや肌の微細な質感などに効果がかかりにくくなりますが、必要な薄い輪郭も弱まることがあります。これは専用のノイズ除去処理ではありません。

## Color Channels / Lock X/Y

ControlsタブのColor Channelsでは、輪郭検出・強調を行うR・G・B・Aチャンネルを選びます。初期状態では4チャンネルが対象です。外したチャンネルは処理そのものをスキップします。Settings側の共通RGBAコントロールは**処理後**に結果を選ぶため、働く段階が異なります。色の輪郭だけを調整するなら、Aチャンネルを強調する必要があるか確認します。

Lock X/Yがオンなら水平・垂直の調整を連動させ、オフなら軸ごとに設定できます。通常は連動状態から始め、水平と垂直で異なる状態の素材を扱う場合に分けます。

## 制作での使い方

### 少し甘い映像を整える

```text
MediaIn → Unsharp Mask → MediaOut
```

髪・衣装・建物などの輪郭を見ながらSizeを決め、Gainで強さを調整します。次に空や暗部のノイズまで目立っていないか確かめ、必要に応じてThresholdを上げます。最終的には100%表示で元画像と切り替え、輪郭の両側に白黒の縁ができていないか確認します。

### 目元だけに効果をかける

```text
MediaIn ───→ Unsharp Mask → MediaOut
                    ↑
                 Ellipse
```

人物の映像を橙色のInputへ、目元を囲むEllipseを青色のEffect Maskへ接続します。マスクの境界を滑らかにすれば、頬や背景の質感を過度に強調せず、目元だけに効果を適用できます。ここでは画像を切り抜くのではなく、**指定範囲だけ処理済みの画像を使う**点が重要です。

### 合成素材の輪郭を整える

ロゴやキー抜き素材では、RGBの輪郭とAlphaの境界を区別します。輪郭を鮮明にすることとマットの幅を変えることは別の操作です。後者が目的なら、[Erode Dilate](./erode-dilate)を先に検討します。Alphaまで強調する必要があるかを判断し、必ず背景へ合成した結果も確認します。

## Sharpenとの違い

- [Sharpen](./sharpen) — convolution filterとAmountを中心に、画像のディテールを比較的少ない項目で強調します。
- **Unsharp Mask** — Size・Gain・Thresholdを分け、どの広さの輪郭をどの程度強調するか、弱い差を除くかを調整できます。

軽い輪郭補正ならSharpenで十分なこともあります。Unsharp Maskの方が常に高品質という意味ではありません。

## 意図どおりにならないとき

| 症状 | 確認点 |
| --- | --- |
| 輪郭の周りに明暗の縁が見える | SizeやGainを下げ、100%表示で元画像と比較します。 |
| ノイズや肌の質感が目立つ | Gainを弱め、Thresholdを上げたときに必要な細部まで消えないか確認します。 |
| 効果が見えない | ControlsのColor Channels、Gain、Effect Maskの位置・範囲、出力の接続を確認します。 |
| 合成したときの縁が変わる | Aチャンネルの処理とマット調整を分けて確認します。 |
| 軸ごとに見た目が違う | Lock X/Yのオン・オフと水平・垂直の設定を確認します。 |

## 関連項目

- [Blur / Filterカテゴリ](./index)：ぼかしと輪郭強調の選び分け。
- [Sharpen](./sharpen)：単純なconvolution sharpen。
- [Erode Dilate](./erode-dilate)：マットや形状を縮小・拡張する。
- [マスク（Mask）](../../learn/02-data/mask)：Effect Maskの役割。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月、Chapter 92「Blur Nodes」、pp.2124–2126）で、処理概念、Input / Effect Mask、ControlsタブのColor Channels・Lock X/Y・Size・Gain・Threshold、共通コントロールとの処理順序の違いを確認しています。数値のデフォルト・範囲、Free / Studio差、実機の処理速度は未確認です。
