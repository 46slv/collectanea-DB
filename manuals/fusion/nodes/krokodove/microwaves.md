---
title: Microwaves
description: 画面内の一点から放射状に伸びる明るい筋を作るKrokodoveの画像エフェクト。Glowとの違いと確認手順を解説。
doc_type: node
term_id: microwaves
term_short: 一点から外側へ広がる光の筋を作り、光線全体の形も変えられるKrokodoveの画像ツール。
verification: partial
aliases: [Microwaves]
concepts: [image-data]
nodes: [Microwaves]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Microwaves

Microwavesは、**一点を中心として外側へ放射状に伸びる明るい筋**を作る、Krokodoveの画像エフェクトです。舞台照明や強い逆光を思わせる光線を、グラフィックとして表現したいときに候補になります。

DaVinci Resolve 21.1 Reference Manualでは、中心点から放射するハイライトを生成し、光のビームを模した見た目と、その**全体的な形を変えるためのコントロール**を備えるツールとして説明されています。光を実際に3D空間へ照射して、物体の表面や影を計算するライトではありません。

## 何が起きるのか

「放射状」とは、車輪のスポークのように、ある一点を起点として複数の方向へ線が伸びる並び方です。Microwavesでは、この線を明るいハイライトとして扱い、光が中心から外へ広がっているように見せます。

たとえば、画面中央の発光するロゴの後ろに、中心から外側へ向かう光の筋を加える演出が考えられます。ただし、光線が何本できるか、実際にどの角度へ伸びるか、元画像の明るさに反応するかは、Manualの短い説明だけでは確定できません。

Manualにある「shape」の語は、**光の筋を含む効果全体の形**を指す説明です。Fusionの<Term id="shape-data">Shapeデータ</Term>を入出力するという意味には読み替えません。MicrowavesはManualで「Image Tools」に分類されています。

<!-- capture:S258 -->

## 実機例：文字から光の筋を広げる

合成した `Text+` の文字を `Microwaves` に渡し、Brightnessを0.01、Lengthを0.5に設定しました。

この例では文字付近から明るい筋が広がって見えます。Viewerには市松模様と操作用オーバーレイが表示されています。他の形状やAlpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S258/readback.json)に条件を記載しています。

[![文字画像をKrokodove Microwavesへつなぐ構成](/img/fusion/captures/S258/graph.png)](/img/fusion/captures/S258/graph.png)

文字画像をMicrowavesへ渡します。

[![MicrowavesのInspector](/img/fusion/captures/S258/controls.png)](/img/fusion/captures/S258/controls.png)

Brightnessを0.01、Lengthを0.5に設定しています。

[![処理前の文字](/img/fusion/captures/S258/low.png)](/img/fusion/captures/S258/low.png)

処理前の文字です。

[![Microwavesで光の筋が広がった文字](/img/fusion/captures/S258/high.png)](/img/fusion/captures/S258/high.png)

処理後は文字付近から明るい筋が見えます。

[再現用Graph](/img/fusion/captures/S258/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S258/capture.json)

<!-- /capture:S258 -->

## 入力・出力

| 段階 | 扱うもの | 読み方 |
| --- | --- | --- |
| 入力 | 2D画像（Image） | COLLECTANEAの既存カタログでは画像入力として分類。画像と光線の関係は実機で確認する。 |
| 処理 | 放射状のハイライト | 中心点から伸びる光の筋を作り、効果全体の形を調整する。 |
| 出力 | 処理後の2D画像 | 後段の画像処理や合成へつなぐことを想定する。 |

ここでいう<Term id="image">Image</Term>は画素で表された画像です。**21.1 Manualの該当表には、正式な入力端子名・端子数・Alpha処理・Effect Maskの有無が書かれていません。** 上記は既存カタログのデータ分類と、Manualに記載された効果の役割を分けて示したものです。正確な接続仕様は21.1実機での確認が必要です。

## 主な用途

- **タイトルやロゴの強調**：文字やマークの背後に、一点から広がる光線のようなグラフィックを加える。
- **照明を思わせる演出**：ステージ上のライトや、強い光源の方向を感じさせる明るい筋を作る。
- **モーショングラフィックスのアクセント**：単なる円形の光のにじみではなく、中心から外へ向かう方向性を持った装飾を試す。

これらは公式の機能説明に基づく**制作上の使用案**です。具体的なプリセット、光線の本数、中心点の指定方法、アニメーション可能なパラメータまでは保証しません。

## 制作例：ロゴの背後に放射状の光を置く

まず単純な画像で効果を確認し、後からロゴとの合成に使う構成です。

```text
光線の確認用画像（MediaInなど） → Microwaves ──→ Merge（Foreground）→ MediaOut
                                               ↑
背景画像またはBackground ────────────────────→ Merge（Background）
```

1. 中心の分かりやすい画像を用意し、Microwavesの前後を別々のViewerで比較します。元画像が必要か、何を基準に光線が作られるかを最初に見ます。
2. Inspectorで効果の形を変える項目を確認し、中心付近と画面端で光の筋がどう変わるかを観察します。**この項目の正式名称や数値範囲はManualの該当表だけでは確認できません。**
3. [Merge](../compositing/merge)で別の背景と重ねます。背景が隠れる場合はMicrowavesの出力Alphaも確認し、光線だけを分離できるか、別の合成方法が必要かを判断します。
4. タイトルを重ねたい場合は、光線・タイトル・背景を別々にViewerで確認してから合成します。光線の位置や強さを時間とともに動かせるかは、実際のInspectorで確認します。

この図は**接続の検討例**であり、Microwavesの正式な端子配置や特定の合成結果を示すものではありません。入力画像との関係、透明部分の扱い、利用できるコントロールは、実機での結果を優先してください。

## Glowとの違い

| ツール | 主な役割 | 選ぶときの目安 |
| --- | --- | --- |
| **Microwaves** | 一点から放射する光の筋を生成する | 光が外側へ伸びる**方向や形**を見せたいとき |
| [Glow](../blur-filter/glow) | 画像の明るい部分をにじませ、周囲に光が広がる見た目を作る | 文字やライトの**周辺を柔らかく発光**させたいとき |
| [Merge](../compositing/merge) | 複数の2D画像を重ね合わせる | 光線を背景やロゴと**別レイヤーとして合成**するとき |

MicrowavesとGlowはどちらも光の演出に使えますが、同じ処理ではありません。Glowは入力画像をもとにした光のにじみが中心で、Microwavesの公式説明は**中心点から放射するハイライトの生成**に重点があります。

## 出典・バージョン・確認範囲

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 105「Krokodove Nodes」、p.2434（Image Tools／Microwaves）。
- **資料で確認できること**：Krokodoveへの収録、Image Toolsへの分類、中心点から放射するハイライト、ビーム状の効果、全体形状を変更するコントロールの存在。
- **追加検証が必要なこと**：実機例ではBrightnessとLengthを使った一条件の光筋を確認しました。端子の全構成、他の設定の初期値・範囲、AlphaとMask、アニメーション、Edition差は未確認です。

`verification: partial`は、この未確認範囲を示します。Krokodoveの他の画像・Shape・3D・Regionツールは[Family Overview](./)を参照してください。
