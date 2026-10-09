---
title: "Grain"
description: "旧来の粒状ノイズを2D Imageに加えるNode。古いFusionコンポジションの互換性と、Power・Spreadによる粒状感の調整を説明。"
doc_type: node
term_id: "grain"
term_short: "Grainは、2D Imageへフィルム風の粒状ノイズを加える旧来のNode。"
verification: partial
aliases: ["Grain", "Grn"]
concepts: ["image-data", "mask-data", "alpha"]
nodes: ["Grain"]
node_family: "effects-film"
controls: ["Power", "RGB Difference", "Grain Softness", "Grain Size", "Grain Spacing", "Aspect Ratio", "Alpha-Multiply", "Spread", "In", "Out"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["stylize-image", "restore-grain"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Grain

Grainは、入力した2D <Term id="image">Image</Term>に細かな粒状ノイズを加え、フィルムで撮影した映像に近い質感を作るNodeです。映像の明るさを直接変えるのではなく、画面内の画素に粒状の変化を加えます。

これは旧来の粒子生成方式です。DaVinci Resolve 21.1のマニュアルでは、古いコンポジションを読み込み・描画できるように残されていると説明されており、新規制作では通常、より現代的な[Film Grain](./film-grain)の使用が勧められています。

## 役割

Grainは2D Imageを受け取り、粒状ノイズを加えた2D Imageを返します。ノイズを消すNodeではありません。合成前に粒状感を減らした素材へ、合成が終わってから再び粒子を加える用途があります。

たとえば実写映像にCGの看板を合成するとき、実写にだけ細かな粒子があり、CGだけが滑らかだと、看板が別の素材に見えることがあります。画面を合成してからGrainを適用すると、看板を含む最終画像に粒状感を与えられます。ただし、新しく組む処理では[Film Grain](./film-grain)を優先します。

## 入力

### Input

オレンジ色の入力です。粒子を加えたい2D Imageを接続します。通常は素材そのもの、または合成後の画像です。

### Effect Mask

青色の任意入力です。<Term id="mask">Mask</Term>をつなぐと、粒子を加える範囲を指定できます。たとえば画面の一部にだけ粒状感を加えたい場合に使います。マニュアルでは、Effect MaskはNodeの画像処理後に適用されると説明されています。粒子の模様を別の画像から読み込む入力ではありません。

## 出力

粒子を加えた2D Imageを出力します。そのまま次の画像処理Nodeへ接続でき、最終段ではMediaOut（DaVinci Resolve）やSaver（Fusion Studio）へ送れます。

## 主な設定項目

### Controlsタブ：粒子の見た目

- **Power**：粒子効果の強さです。大きくすると粒子がより目立ちます。まずこの値で効果の全体量を合わせます。
- **RGB Difference**：Red・Green・Blueそれぞれの粒子の強さを調整します。色チャンネル間の差を作りたいときに使います。
- **Grain Softness**：粒子の輪郭の柔らかさです。小さくすると粒子がくっきりし、上げるとぼやけた見え方になります。
- **Grain Size**：粒子そのものの大きさです。上げるほど粒が大きくなります。
- **Grain Spacing**：粒子どうしの間隔です。上げると粒子が離れて見え、単位面積あたりの粒子は疎になります。Grain Sizeとは別の調整です。
- **Aspect Ratio**：粒子の縦横比を変えます。アナモフィック撮影など、粒子が一方向へ伸びたような見た目を合わせる際に使います。
- **Alpha-Multiply**：画像のAlphaを使って粒子処理の結果を制限します。透明部分へ不要な粒子が残るときに確認します。Alphaや透明度のある画像の扱いは、単にPowerを下げる場合とは異なります。

### Spreadタブ：明るさによる粒子量の違い

Spreadでは、入力画像の暗部・中間調・明部にどれだけ粒子を加えるかを、Red・Green・Blue別の曲線で調整します。粒子の形そのものを編集する画面ではなく、**どの明るさの画素で粒子を強く出すか**を決める画面です。

**RGB Checkboxes**で各チャンネルの曲線を有効にします。曲線上の点は**In / Out**の数値でも編集できます。Inは入力側の階調位置、Outはその位置での粒子の適用量を調整するための値です。

既定の均一な曲線では画面全体に粒子がほぼ均等に加わります。実写の粒子を合わせる際は、中間調で強く、暗部や明部で弱くなる山形（bell-shaped）の曲線を試すと、明るさに応じて粒子の出方を変えられます。マニュアルは例として、Red・Green・Blueの曲線を同一にせず、Blueを強め、Greenを控えめにする方向も示しています。

## 主な用途

古いFusionコンポジションを開き、従来のGrain設定を維持して再描画する場合に使います。この目的では既存のGrainを無理にFilm Grainへ置き換える必要はありません。

また、合成済みの2D Imageに粒子を再付加したり、Spreadの曲線で特定の明るさにだけ粒子を強く出したりできます。ただし、質感の精度や新規制作での選択肢を重視するなら、現行のFilm Grainを先に検討してください。

## 最小構成

    MediaIn → Grain → MediaOut
                  ↑
              Effect Mask（任意）

1. GrainのInputへ画像を接続し、出力をMediaOutへつなぎます。
2. Viewerで画像を拡大して、Powerを少しずつ上げ、粒子が認識できる状態にします。
3. 粒が大きすぎるならGrain Size、密集しすぎるならGrain Spacingを調整します。
4. 粒子が硬く見える場合はGrain Softnessを調整します。
5. 暗部・中間調・明部で粒子量を変えたいときだけ、Spreadタブの曲線を編集します。

ここで指定した具体的な数値はありません。粒の見え方は素材、解像度、画面を確認する倍率によって変わるためです。

## 運用例：合成した看板の粒状感を合わせる

実写映像にCGの看板を載せる場面を考えます。合成前の素材はキー処理や色調整のために粒子を減らしてあるものとします。

    実写映像 ───────────┐
                         Merge → Grain → MediaOut
    CGの看板 ───────────┘

1. 実写とCGをMergeで合成します。
2. Mergeの後ろにGrainを置き、完成画面全体へ粒子を加えます。
3. Powerで全体の強さ、SizeとSpacingで粒子の形と密度を合わせます。
4. 明るい看板と暗い背景で粒子の出方を変えたい場合はSpreadの曲線を調整します。
5. 画面を再生し、静止画1枚だけでなく時間方向でも粒子が不自然に目立たないか確認します。

これは旧Grainでの構成例です。21.1で新しく制作するなら、同じ接続位置へFilm Grainを置くのが基本です。

## 挙動と注意点

- **Grain SizeとGrain Spacingは別物**です。Sizeは各粒の大きさ、Spacingは粒子どうしの間隔を変えます。
- **PowerとSpreadも別物**です。Powerは全体の効果量、Spreadは画素の明るさや色チャンネルごとの適用量を調整します。
- **Effect Maskは範囲指定**です。粒子の入力画像やノイズ素材を追加する端子ではありません。
- **Alpha-Multiplyは透過処理に関する設定**です。これだけで背景との合成結果やキー処理が完成するわけではありません。
- マニュアルで説明されている機能と、現在の実機での既定値・設定範囲・処理負荷・Edition差は区別してください。後者はこの記事では確認していません。

## 似たNode・関連Node

- [Film Grain](./film-grain) — 現行の粒子生成。新規の合成・質感合わせでは通常こちらを選びます。
- [Remove Noise](./remove-noise) — 合成前に不要な粒子やノイズを減らすNodeです。Grainとは逆の目的です。
- [Merge](../compositing/merge) — 実写とCGなどを合成するNodeです。合成後の出力にGrainを接続できます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 98、pp.2317–2320に基づき、Grainの旧式Nodeとしての位置づけ、Input / Effect Mask、ControlsタブのPower・RGB Difference・Grain Softness・Grain Size・Grain Spacing・Aspect Ratio・Alpha-Multiply、SpreadタブのRGB曲線・In / Out、MediaOut / Saverへの接続例を確認しました。

Inspectorの既定値・正確な数値範囲、現在の実機における端子REGID、Editionごとの差、描画結果の実測は未確認のため、verificationはpartialです。
