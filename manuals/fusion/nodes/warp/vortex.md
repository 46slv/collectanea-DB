---
title: Vortex
description: Fusionの画像を渦状に変形するVortexについて、入力とEffect Mask、Center・Size・Angle・Powerの違い、文字アニメーションでの使い方を解説。
doc_type: node
term_id: vortex
term_short: Vortexは、2D画像の一部を指定した中心の周囲へ巻き込み、渦状に変形するFusionノード。
verification: partial
aliases: [Vortex, Vtx]
concepts: [image-data]
nodes: [Vortex]
node_family: warp
controls: [Center, Size, Angle, Power]
inputs: [image, mask]
outputs: [image]
tasks: [warp-image]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Vortex

**Vortexは、2D画像の一部を渦巻きのように回転・変形させるノード**です。たとえば文字の中心だけを巻き込む、背景の一点をねじる、渦の中心を画面内で動かすといった表現に使えます。効果をかける場所と範囲は`Center`と`Size`、巻き込み方は`Angle`と`Power`で調整します。

Vortexが扱うのは通常の**2D Image**です。3DモデルやShapeデータを入力するノードではありません。画像上のどこから画素を参照するかを変えて見た目を歪ませる処理なので、入力画像に存在しない文字や物体を生成するわけではありません。

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | 2D Image | 渦状に変形する元の映像・文字・画像。必須。 |
| **Effect Mask（青）** | Mask | 渦の処理結果を画面のどこへ適用するか指定する。任意。 |
| **出力** | 2D Image | 変形結果を通常のMergeや別の画像処理ノードへ渡す。 |

最小構成は`MediaIn → Vortex → MediaOut`です。MediaInの人物や背景にVortexを追加すると、指定した中心の周りだけが渦状に歪みます。渦の中心が映像の端に寄りすぎると、変形に必要な画像が境界の外へ及ぶ場合があります。

**Effect Maskは渦の強さを決める入力ではありません。** 21.1のマニュアルは、マスクがノードの処理後に適用されると説明しています。たとえば[Ellipse Mask](../masks/ellipse-mask)を接続すると、渦状に処理された結果を円の内側だけに見せられます。マスクを使わずに`Size`で影響範囲を絞る方法とは区別してください。マスクの境界が目立つ場合は、その形や柔らかさも確認します。

## Inspector：4つの設定の使い分け

| 設定 | 変わるもの | 操作するときの見方 |
| --- | --- | --- |
| **Center X / Y** | 渦の中心位置 | 人物の目や文字の中央など、巻き込みたい場所へ移動する。 |
| **Size** | 渦が作用する画像内の範囲 | 小さな部分だけをねじるか、広い範囲を巻き込むか決める。 |
| **Angle** | 渦の回転量 | 値を上げるほど巻き込みが強くなる。Viewerの回転ハンドルからも操作できる。 |
| **Power** | 巻き込みの集中度 | 値を上げると渦が小さく、密にまとまる。Sizeと同じ調整ではない。 |

マニュアルに記載された`Center X / Y`の既定値は**0.5 / 0.5**で、画面の中央を指します。`Size`はViewer上の円周をドラッグしても調整できます。まずCenterとSizeで対象範囲を定め、その後Angleを動かすと、どの設定が変形に作用しているか判断しやすくなります。

`Power`は`Angle`を単純に強めるつまみではありません。強い巻き込みでも広く見せたいならSize、局所へ集めたいならPowerというように、影響範囲と集中度を分けて比較します。AngleやPowerの厳密な数値範囲・既定値は、この資料では確認していません。

<!-- capture:S160 -->

## 実機例：文字の中央を渦状に変形する

生成した文字画像を `Vortex1` のInputへ接続し、Vortex、Center X/Yをそれぞれ0.5、Sizeを0.5、Angleを180、Powerを1.0に設定しました。frame 0では中央付近の文字が渦状に巻き込まれます。

これは静止した生成画像での固定例です。他の設定値や動く被写体は比較していません。[接続と設定の記録](/img/fusion/captures/S160/readback.json)に条件を記載しています。

[![文字画像をVortexに通してMediaOutへ接続したノード構成](/img/fusion/captures/S160/graph.png)](/img/fusion/captures/S160/graph.png)

文字画像をVortexのInputへ接続し、出力をMediaOutへ渡します。

[![Vortexの中心0.5と0.5、サイズ0.5、角度180、強度1.0のInspector](/img/fusion/captures/S160/controls.png)](/img/fusion/captures/S160/controls.png)

Vortex、Center X/Y 0.5、Size 0.5、Angle 180、Power 1.0です。

[![Vortexの中心と範囲のガイドを表示した入力と出力](/img/fusion/captures/S160/center-guide.png)](/img/fusion/captures/S160/center-guide.png)

Vortexを選ぶと、Viewerに中心と円形のガイドが重なります。

[![元の文字と中央を渦状に変形した文字を並べた比較](/img/fusion/captures/S160/comparison.png)](/img/fusion/captures/S160/comparison.png)

左は入力、右はVortexの出力です。中央付近の文字が大きく曲がっています。

[再現用Graph](/img/fusion/captures/S160/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S160/capture.json)

<!-- /capture:S160 -->

## 制作例：文字を一度渦に巻き込み、元の形へ戻す

文字を渦状に変形させてから通常のタイトルへ戻す、短いモーショングラフィックスの例です。

```text
Text+ → Set Domain → Vortex ──→ Merge［Foreground］→ MediaOut
MediaIn（背景） ───────────────→ Merge［Background］
```

1. [Text+](../generators/text-plus)でタイトルを作ります。通常の文字画像は、透明な部分を含む境界が文字の周囲に狭く設定されることがあります。
2. Vortexの手前に[Set Domain](../time-metadata/set-domain)を置き、画像の有効範囲を広げます。**渦で文字が元の範囲より外側へ移動すると切り取られることがある**ためです。この接続は21.1マニュアルのVortexの基本例にも使われています。
3. VortexのCenterを文字付近に合わせ、Sizeで巻き込む範囲を決めます。AngleとPowerを動かして、文字がどの程度読めなくなるか確認します。
4. 冒頭では巻き込まれた状態になるようAngleなどにキーフレームを付け、数フレーム後にAngleを弱めて文字が読める状態へ戻します。**自動的に元へ戻る効果ではない**ため、タイムライン上で値を設定します。
5. Vortexの2D画像を通常のMergeのForegroundへ、背景をBackgroundへ接続します。背景が動いていても、タイトルを先に変形してから合成できます。

渦が文字を見切らせる場合は、先にSet Domainと画像の境界を確認します。Angleを弱めるだけでは、元画像の境界で切り取られた範囲の問題は解消しません。

### 画面の一部だけを歪ませたい場合

たとえば実写の人物の周囲だけが渦巻くように見せたい場合は、映像をInputへ、必要な形のMaskをEffect Maskへつなぎます。Centerは人物の位置へ合わせ、Sizeで渦の範囲を設定します。Maskの形状とVortexのCenterは別々に動くため、人物が移動するショットでは両方が対象を追っているか確認してください。

マスクを接続すると、**渦を計算する中心がマスクの中心へ自動で移動するわけではありません**。画面上でズレる場合はMaskだけでなくCenterの位置も確認します。

## Dent・Drip・Displaceとの違い

| ノード | 画像の変わり方 | 選ぶ理由 |
| --- | --- | --- |
| **Vortex** | 中心の周りへ渦状に巻き込む | タイトルをねじる、局所的な回転歪みを作る。 |
| [Dent](./dent) | 中心付近を膨らませたり凹ませたりする | 渦ではなく、レンズ状の局所変形を作る。 |
| [Drip](./drip) | 指定形状の波紋を作る | 波が広がる・周期的に動く変形を作る。 |
| [Displace](./displace) | 別画像の値を使って変位させる | 自作したノイズや模様に合わせて変形を制御する。 |

Vortexは外部の変位マップを用意せず、Center・Size・Angle・Powerで渦を調整する方法です。渦以外の不規則な歪みを作りたい場合は、変位用画像を指定できるDisplaceも比較します。

## 思ったように見えないとき

| 症状 | 確認すること |
| --- | --- |
| 渦の位置がずれている | Center X / Yが巻き込みたい場所にあるか。Maskだけ移動していないか。 |
| 渦が広すぎる／狭すぎる | Sizeで作用範囲、Powerで集中度を別々に調整する。 |
| 文字が途中で切れる | Text+とVortexの間にSet Domainがあり、十分な範囲を確保できているか。 |
| Maskを付けても渦の中心が変わらない | Effect Maskは処理後の適用範囲を決めるもの。VortexのCenterを変更する。 |
| 画像全体を巻き込まず一部分だけ変えたい | Sizeを絞るか、Effect Maskで適用範囲を限定する。両者の結果を比較する。 |
| 動かしても渦が変化しない | Center・Size・Angle・Powerに意図したキーフレームが付いているか。 |

## 関連ノード

- [Set Domain](../time-metadata/set-domain)：文字や画像の有効範囲を広げ、渦による境界の切り取りを避ける。
- [Ellipse Mask](../masks/ellipse-mask)：Vortexの結果を適用する範囲を指定する。
- [Dent](./dent)：中心の周囲を膨張・収縮させる変形。
- [Drip](./drip)：波紋を使った変形。
- [Displace](./displace)：別画像の値で歪ませる変形。

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 123「Warp Nodes」、**Vortex [Vtx] pp.2986–2987**。画像入力、Effect Maskが処理後に適用されること、Text+ → Set Domain → Vortexの例、Center（既定値0.5/0.5）・Size・Angle・Powerの役割を照合しました。配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

制作例と症状別の確認順序は、公式仕様を組み合わせた操作案です。**上記固定例以外のResolve/Fusion 21.1での描画、Angle・Powerなどの全初期値と可動範囲、Mask境界の具体的な合成挙動、Edition差は未確認**です。`verification: partial`を維持しています。