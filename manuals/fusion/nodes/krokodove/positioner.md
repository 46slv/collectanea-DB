---
title: Positioner（Krokodove）
description: 元画像と配置先の四隅を対応付けるPositionerの仕組み、接続例、標準Corner Positionerとの違い。
doc_type: node
term_id: positioner
term_short: 元画像の四隅と配置先の対応を指定して、画像を別の四辺形へ変形・配置するKrokodoveツール。
verification: partial
aliases: [Positioner]
concepts: [image-data]
nodes: [Positioner]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-20'
---

# Positioner（Krokodove）

**Positionerは、元画像のどこを、画面のどこへ配置するかを四隅の対応関係で決めるKrokodoveのツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Pixel Tools」に分類され、**SourceとDestinationの制御を持つコーナーピン**として紹介されています。

正面から見た長方形のロゴを、斜めに写った看板へはめ込みたいとします。単純な拡大縮小や回転だけでは、遠い側が狭く見える四辺形に合わせられません。コーナーピンは、元画像の角と配置先の角の対応を使い、画像を四辺形に変形して配置する方法です。

21.1 ManualはKrokodove PositionerにSource / Destinationの制御があると記載していますが、正式なInspector項目名、端子名、角の指定方式までは列挙していません。標準の[Corner Positioner](../warp/corner-positioner)と同じ名前の設定を持つとは限りません。

## SourceとDestinationは何が違う？

コーナーピンを理解するには、写真の中のポスターを置き換える場面が分かりやすい例です。

- **Source（元の領域）**：変形前の画像で、対応を取る出発点。たとえば平らなロゴ画像の四隅。
- **Destination（配置先）**：元画像の対応点を置きたい位置。たとえば斜めに写った看板の四隅。

対応を付けることで、元画像の「左上にあった点は配置先の左上へ」というように、どこをどこへ移すかを決めます。四隅の間の画素も変形されるため、長方形が台形に見えるような配置を作れます。

**元画像の一部だけを配置に使いたい**のか、**元画像全体を別の場所へ合わせたい**のかで、調整したい対象は異なります。ただしKrokodove PositionerでSource側をどこまで変更できるか、数値入力やViewerでの操作方法はManualの短い説明だけでは判断できません。ここでのSource / Destinationの説明は一般的なコーナーピンの考え方であり、固有のUI仕様を示すものではありません。

<!-- capture:S275 -->

## 実機例：四隅の対応を指定する

合成した文字 `POSITION` を `Positioner` に接続し、Destination 1をX 0.25、Y 0.2に設定しました。この静止画では入力より小さく変形した文字が見えます。他のSourceとDestinationの値も接続記録に記載しています。Viewerの線は操作用ガイド、市松模様は透明部分の表示です。アニメーションとAlpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S275/readback.json)に条件を記載しています。

[![文字をPositionerへつなぐノード構成](/img/fusion/captures/S275/graph.png)](/img/fusion/captures/S275/graph.png)

合成文字をPositionerへ渡します。

[![PositionerのSourceとDestination](/img/fusion/captures/S275/controls.png)](/img/fusion/captures/S275/controls.png)

Destination 1はX 0.25、Y 0.2です。

[![入力の文字POSITIONとガイド](/img/fusion/captures/S275/low.png)](/img/fusion/captures/S275/low.png)

入力文字と操作用ガイドを表示しています。

[![小さく変形したPositioner出力](/img/fusion/captures/S275/high.png)](/img/fusion/captures/S275/high.png)

出力は入力より小さく変形して見えます。

[再現用Graph](/img/fusion/captures/S275/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S275/capture.json)

<!-- /capture:S275 -->

## 入力と出力

| 段階 | データ | 内容 |
| --- | --- | --- |
| 入力 | 2D <Term id="image">Image</Term> | 位置や形を合わせたい画像。写真、ロゴ、テキストを合成した画面など。 |
| 処理 | Positioner | Source / Destinationの対応を使うコーナーピン変形。 |
| 出力 | 2D Image | 変形・配置後の画像を、Mergeなどの後段へ渡す。 |

入出力がImageであることは、ManualのImage Pixel Tools分類と既存カタログに基づく**データ種別**の整理です。Frontmatterの `inputs: [image]` は端子が1本だけという意味ではありません。

追加のMask入力、参照画像入力、制御入力があるかどうか、各ポートの色・名称・数は未確認です。背景の撮影映像までPositionerへ直接入力するとは決めず、まず変形したい画像をPositionerに渡し、背景は後段のMergeで合成する構成を検討します。

## 主な用途

### 看板・モニター・印刷物の差し替え

映像に写った長方形の面へ別の絵を合わせる用途です。作成したUIを斜めに写ったディスプレイへ重ねたり、ポスターの内容を差し替えたりできます。ただし角を合わせるだけでは、元映像の明るさ、反射、ぼけ、遮蔽が再現されません。これらは必要に応じて別の処理で補います。

### 動きのある四辺形への配置

カードが傾くモーショングラフィックスで、画像を長方形以外の四辺形へ動かす使い方も考えられます。Krokodove Positionerの角をどの方法でアニメーションできるかは実機未確認です。TrackerやPathとの接続方法を標準Corner Positionerから類推して固定しないでください。

### 元画像と配置先を分けて考える

画像が最初から画面いっぱいに収まっていない場合、元画像のどこを変形対象とするかと、最終的な配置位置を分けて考えると、作業を整理しやすくなります。これはSource / Destinationという概念に基づく考え方であり、実機例ではSource / Destinationの各座標を読み戻しています。

## 制作例：ロゴを斜めの看板に合わせる

以下はコーナーピンの役割を試すための**提案構成**です。公式Manualに掲載されたKrokodove Positionerのノードグラフや設定値の再現ではありません。

```text
Background（ロゴの下地） ─┐
                          ├→ Merge A → Positioner ─┐
Text+（ロゴ文字） ─────────┘                        ├→ Merge B → MediaOut
MediaIn（看板の映像） ───────────────────────────────┘
```

Merge Aは下地と文字を**1枚の画像**にし、Positionerはその結果を変形します。Merge Bでは撮影映像がBackground、変形したロゴがForegroundです。

1. まず動きのない看板画像を用意します。四隅が見える素材が適しています。
2. BackgroundとText+をMerge Aへつなぎ、「TEST」の文字を載せた画像を作ります。四隅に印を入れた格子画像を使うと、変形量を追いやすくなります。
3. Merge Aの出力をPositionerへ接続し、Viewerへ表示します。Source / Destinationに相当する制御をInspectorとViewerで確認して、元画像の角と看板の角の対応を観察します。実機例ではDestination 1などの座標を示しています。
4. Positionerの結果をMerge BのForegroundへ、看板映像をBackgroundへ接続します。配置ずれ、枠のはみ出し、縦横比を確認します。
5. 看板の前を人が横切る場合、その人を前面に戻す別の処理が必要です。コーナーピンが遮蔽を自動判断するとは考えません。
6. 動画へ応用する場合は、背景の動きに角の位置を追従させる方法を別途確認します。Positioner自身のトラッキング対応は未確認です。

同じ格子画像を変形前後で比較すると、どの角がどこへ移るかを把握しやすくなります。Alphaの境界やフレーム外の扱いは、後段のMerge結果でも確認してください。

## 標準ノードとの違い

| ノード | 確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Positioner（Krokodove）** | Source / Destination制御を持つコーナーピン。 | 元画像と配置先の対応を扱うKrokodoveの方法を試す。 |
| [Corner Positioner](../warp/corner-positioner) | 画像の四隅を動かして配置先の四辺形へはめ込む。 | 公式Manualに詳細なInspector説明と作例がある標準ノードを使いたい。 |
| [Perspective Positioner](../warp/perspective-positioner) | 遠近のある領域を正面向きへ展開する（unpin）。 | 斜めの面をいったん平らにして修正したい。 |
| [Planar Tracker](../tracking/planar-tracker) / [Planar Transform](../tracking/planar-transform) | 平面の動きを解析し、合成素材を追従させる。 | 看板や画面が動くショットに対応する。 |
| [Transform](../transform/transform) | 位置、回転、スケールなどを変える。 | 四隅を個別に合わせる必要がない。 |

標準Corner Positionerについては、21.1 Manual（Chapter 123、pp.2963–2964）が**Mapping Type（Bi-Linear / Perspective）、Corners X / Y、Offset X / Y**を説明しています。これらは標準ノードの仕様であり、Krokodove PositionerのInspector仕様ではありません。

標準ノードにはPlanar Trackerで解析した動きをPlanar Transform経由で適用する公式作例があります。確実に資料化された追従手順が必要なら、まず標準Corner Positionerの手順を参照してください。

## 注意点・未確認の仕様

- **端子・Inspector**：実機例ではSource / Destinationの各座標を読み戻した。正式なポート名、他の指定方法、既定値、値域は未確認。
- **変形方式**：射影変換か別の補間方式か、設定で選べるかは未確認。標準Corner Positionerと同じ方式とは限らない。
- **画質・範囲**：出力解像度、DoD、画面外の画素、Alphaやpremultiplicationの処理、細い線の画質は未確認。
- **アニメーションと製品差**：角のアニメーション方法、Trackerとの直結可否、Resolve Free / Studio / Fusion Studioでの差、内部REGIDは未確認。
- **合成**：被写体による遮蔽、照明、反射、レンズ歪みの一致はコーナーピンだけでは完成しない。

## バージョンと出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436「Image Pixel Tools / Positioner」**。Source / Destination制御を持つコーナーピンであることを確認。
- **比較資料**：同Manual、Chapter 123「Warp Nodes」、**pp.2963–2964「Corner Positioner」**、**pp.2982–2983「Perspective Positioner」**。これらの端子・Inspectorや作例は標準ノードの仕様。
- [Blackmagic Design サポート](https://www.blackmagicdesign.com/jp/support/)：公式資料の入口。

看板・ロゴの作例とSource / Destinationの説明図式は、確認済みの役割を理解するための制作案です。実機例は静止画の一条件に限られ、端子の詳細、別条件の動作、製品差は未確認のため、`verification: partial` を維持しています。[Krokodoveファミリー概要](./)と[Imageの基礎](../../learn/02-data/image)も参照してください。
