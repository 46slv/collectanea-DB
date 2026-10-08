---
title: "Rays"
description: "画像内の文字や明るい部分を手がかりに、指定した中心から放射状の光条を伸ばすFusion Node。入力、調整手順、合成例を解説。"
doc_type: node
term_id: "rays"
term_short: "Raysは、入力画像の形や明るい部分をもとに、指定した中心から放射する光の筋を作る2D Effect Node。"
verification: partial
aliases: ["Rays", "CIR"]
concepts: ["image-data", "alpha", "blur"]
nodes: ["Rays"]
node_family: "effects-film"
controls: ["Center X", "Center Y", "Blend", "Decay", "Weight", "Exposure", "Threshold"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["rays", "light-rays", "stylize"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Rays

Rays [CIR]は、**文字や図形を通るように、指定した中心点から放射状に光の筋（光条）を伸ばす**2D Effect Nodeです。光るタイトルの背後から筋を広げたり、明るい窓の方向から差し込む光を強調したりできます。

画像を中心点に向かって拡大・縮小する方向へぼかす「ズームブラー」に近い処理ですが、入力画像の形や明るさを使って光条を作る点が特徴です。光の伸びる方向は**Centerと画像内の発生源の位置関係**で変わります。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualで確認できる入力は2つです。

- **Input（オレンジ）**：加工する2D <Term id="image">Image</Term>。文字や図形など、光条のもとになる画像を接続します。Manualは、とくにAlphaチャンネルを含む画像を推奨しています。
- **Effect Mask（青、任意）**：効果を最終的に表示する範囲を制限する<Term id="mask">Mask</Term>。光条の生成後に適用されるため、マスクからはみ出した筋も表示段階で切り取られます。

出力は光条を適用した2D Imageです。MediaOutへ送るほか、Mergeでほかの映像と重ねられます。Effect Maskは光条の**発生源を選別する入力**ではなく、生成後の**表示範囲を制限する入力**です。マスクの外まで光を伸ばしたい場合は、この違いに注意します。

## 主な設定項目（Controls）

- **Center X / Y**：光条の放射中心。Viewerの十字型コントロールでも位置を指定できます。中心を文字のすぐ後ろに置く場合と画面外へずらす場合では、筋が伸びる方向が変わります。
- **Decay**：光条の長さ。短くすると発生源の周辺に収まり、長くすると画面内へ大きく伸びます。
- **Weight**：伸びた光条が距離に応じてどのように弱まるかを調整します。Decayが長さ、Weightが減衰の仕方を担当します。
- **Exposure**：光条の明るさを調整します。
- **Threshold**：光条を発生させる明るさの条件。背景の薄い明部まで筋になってしまう場合は、ここを調整して発生源を絞ります。
- **Blend**：元画像を光条の処理結果へどの程度混ぜるかを調整します。**Exposureは光条の強さ、Blendは元画像との混ざり方**を扱い、同じ調整ではありません。

まずCenterで方向を決め、DecayとWeightで伸び方を整え、Thresholdで不要な発生源を抑え、最後にExposureとBlendで見た目を合わせると調整しやすくなります。

## 最小構成：文字から光条を伸ばす

透明背景に白い文字を出すText+をRaysへ接続します。RaysはAlphaを含む素材と相性がよいため、単純な文字から始めると変化を確認しやすくなります。

~~~text
Text+ → Rays → MediaOut
~~~

1. Text+で短い文字を作り、RaysのInputへ接続します。
2. Centerを文字の背後や少し外側へ移動し、筋が伸びる方向を確認します。
3. Decayで光条を伸ばし、Weightで先端まで残る明るさを調整します。
4. Exposureで筋を見やすくし、Blendで元の文字がどの程度残るかを調整します。
5. 文字以外の場所からも筋が発生する場合は、Thresholdを見直します。

重要なのは、**どの形から光条が発生し、Centerとの位置関係によってどちらへ伸びるか**を見ることです。先に明るさだけを上げると、発生源と方向を判断しにくくなります。

## 運用例：実写に「窓から差し込む光」を足す

暗い室内の窓を光の発生源にして、室内へ放射状の筋を伸ばしたい場合の構成例です。

1. 元映像をMediaInから読み込み、別の枝で窓の明るい部分を抽出・加工して、窓だけが残る2D Imageを作ります。発生源の切り分けはRaysのEffect Maskではなく、**Raysへ入れる画像そのもの**に行います。
2. その窓画像をRaysのInputへ接続します。
3. Centerを窓の付近に合わせ、光が室内へ伸びる方向になるよう位置を調整します。
4. Decay・Weight・Exposureで筋の長さと明るさを整え、Thresholdで弱い部分からの過剰な発生を抑えます。
5. 元の実写映像をMergeのBackgroundへ、Raysの出力をForegroundへ接続します。素材のAlphaと合成結果をViewerで確かめながら調整します。

~~~text
窓だけを残した2D Image → Rays ─→ Merge（Foreground）→ MediaOut
元の室内映像（MediaIn） ─────────→ Merge（Background）
~~~

これはManualで確認できるRaysの機能を利用した**合成案**です。現実の光が空間内で散乱する様子を3D計算するわけではないため、人物が光の前を横切る場合は、別途マスクや合成処理で前後関係を調整する必要があります。

## 使い分けと注意点

- **[Highlight](./highlight.md)**：画像内の明るい点をそれぞれ中心に、星形の筋を付けます。Raysは**指定したCenterと画像内の形**の位置関係から放射状の筋を作るため、文字全体の後ろに広がる光などに向きます。
- **[Hot Spot](./hot-spot.md)**：指定位置の発光やレンズ内反射、遮蔽物による光の見え隠れを作ります。RaysにはHot Spotのレンズ反射要素やOcclusion入力はありません。
- **Effect Mask**：処理後の光条を切り取ります。発生源だけを限定して筋を広い範囲へ残したい場合は、Raysへ接続する元画像を先に分けます。
- **Alphaと明るさ**：ManualはAlphaを含む文字・図形を適した素材として挙げ、Thresholdを光条が生じる明るさの条件として説明しています。すべての素材で同じ光条が生じるとは限りません。

## 関連する考え方

- [画像（Image）の基礎](../../learn/02-data/image.md)：2D ImageとAlphaチャンネル。
- [マスク（Mask）の基礎](../../learn/02-data/mask.md)：Effect Maskの表示範囲。
- [Effect / Filmノード一覧](./index.md)：ほかの光やフィルム効果との使い分け。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 97「Effect Nodes」、**Rays [CIR]（pp.2293–2294）**を一次資料としています。2入力、Alpha付き素材の推奨、Center X/Y、Blend、Decay、Weight、Exposure、Thresholdを確認しました。

窓の例はManualで確認できる機能を組み合わせた運用案です。21.1実機での描画、各パラメータの初期値・数値範囲、内部REGID、edition差は未確認のため、verificationはpartialとしています。
