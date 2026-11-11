---
title: "Corner Positioner"
description: "Imageの4隅をViewer上で動かし、看板・画面・紙面などの平面へ画像をはめ込む4点コーナーピンNode。"
doc_type: node
term_id: "corner-positioner"
term_short: "Corner Positionerは、Imageの4隅を動かして別の四辺形へはめ込む4点コーナーピンNode。"
verification: partial
aliases: ["Corner Positioner", "CPn"]
concepts: ["image-data"]
nodes: ["Corner Positioner"]
node_family: "warp"
controls: ["Mapping Type", "Corners X", "Corners Y", "Offset X", "Offset Y"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["warp-image", "screen-replace"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-23"
---

# Corner Positioner

Corner Positionerは、入力Imageの4隅をViewer上で動かし、別の四辺形へはめ込むNodeです。看板、モニター、ポスターのような平面へ別のImageを配置するときに使います。

元のImageを遠近の付いた平面へ**はめ込む（corner pinする）**方向のNodeです。すでに遠近が付いている領域を正面向きへ展開したい場合は、[Perspective Positioner](./perspective-positioner)を使います。

## 入力と出力

### Input

オレンジ色のInputへ、変形したい2D Imageを接続します。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Corner Positionerの結果を必要な領域だけに限定できます。21.1 Manualでは、Effect MaskはNodeの処理後に適用されると説明されています。

### Output

4点の位置とMapping Typeに従って変形された2D Imageを出力します。

## 主な設定項目

### Mapping Type

4隅の間をどの方法で変形するかを選びます。

- **Bi-Linear** — 2D上でそのまま四辺形へ変形する
- **Perspective** — 4隅のoffsetを基に、遠近を考慮してImageを四辺形へ割り当てる

遠近の付いた看板や画面へImageを合わせる場合は、Perspectiveの方が目的に合います。

### Bi-LinearとPerspectiveを同じ4点で比べる

**Bi-Linear**は4隅の位置を基準に画像内部を2Dで補間します。**Perspective**は四辺形を遠近のある平面として扱うため、実写の看板・モニターなどを置き換えるときの基本候補です。21.1マニュアルでは、Bi-Linearを2Dの変形、Perspectiveを3Dの遠近投影として区別しています。

違いを確かめるには、格子線と文字を載せた長方形の画像をInputへ接続し、Corner Positionerの4点を**右側が狭い台形**に配置します。4点を動かさずにMapping Typeだけを切り替え、文字の幅、内部の格子線、奥へ向かう並び方を比較します。角の位置が一致しても、四辺形の**内部**の変形結果は同じとは限りません。

Bi-Linearを使う理由がある場合は、過去のFusionプロジェクトの見た目を維持する場合や、遠近投影ではなく2D的な引き伸ばしを意図している場合です。モニター画面の差し替えで不自然に見えるときは、四隅を何度も微調整する前にMapping Typeを確認します。

### Corners X / Y

4つのcorner pointの位置を指定します。Viewer上で直接ドラッグでき、PathやTrackerなどのmodifierへ接続してanimationすることもできます。

### Offset X / Y

各cornerの位置を少しだけ補正します。Trackerのpattern位置と、実際にImageを合わせたい角が一致していない場合の微調整に使えます。

<!-- capture:S297 -->

## 実機例：同じ4点でマッピングを比べる

2行の文字を `Corner Positioner` に入力し、右側が狭い四辺形に4点を固定します。Mapping Typeをバイリニアと遠近に切り替えると、四辺形内の文字の形と位置が変わります。

左は入力、右は出力です。赤線はViewerの編集ガイドです。撮影後はバイリニアへ戻しました。[接続と設定の記録](/img/fusion/captures/S297/readback.json)に4点を記載しています。

[![Text+をCorner PositionerとMediaOutにつないだ構成](/img/fusion/captures/S297/graph.png)](/img/fusion/captures/S297/graph.png)

文字画像をCorner Positionerへ入力します。

[![Corner Positionerのバイリニアと4点座標](/img/fusion/captures/S297/controls.png)](/img/fusion/captures/S297/controls.png)

4点を固定しマッピングを切り替えます。

[![バイリニアを選択した入力と変形出力](/img/fusion/captures/S297/bilinear.png)](/img/fusion/captures/S297/bilinear.png)

バイリニアでの出力です。

[![遠近を選択した入力と変形出力](/img/fusion/captures/S297/perspective.png)](/img/fusion/captures/S297/perspective.png)

同じ4点で遠近に切り替えた出力です。[撮影時のInspector](/img/fusion/captures/S297/perspective-source.png)で選択を確認できます。

[再現用Graph](/img/fusion/captures/S297/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S297/capture.json)

<!-- /capture:S297 -->

## 主な用途

- 看板やポスターの面へ別のgraphicをはめ込む
- モニターや端末画面へUI・映像を配置する
- 4点をanimationして、四辺形の形が変わるwarpを作る
- tracking済みの平面へreplacement Imageを追従させる

## 最小構成：静止したポスターを置き換える

~~~text
差し替え画像 → Corner Positioner → Merge（Foreground）→ 出力
撮影画像 ────────────────────────→ Merge（Background）
~~~

1. 撮影画像をMergeのBackgroundへ、差し替えるポスター画像をCorner PositionerのInputへ入れます。
2. Corner Positionerの出力をMergeのForegroundへ接続し、Viewerで撮影画像と重ねて表示します。
3. Mapping TypeをPerspectiveにし、差し替え画像の4隅を撮影画像内のポスターの4隅に合わせます。まず大まかに置き、拡大表示して角のずれを直します。
4. 四隅だけでなく、ポスター内部の直線や文字の傾きも確認します。角が合っていても見え方が不自然なら、Mapping Typeと元画像の縦横比を見直します。

この構成は**静止した平面**の例です。撮影中にポスターの位置や遠近が変わる場合は、4点をフレームごとに動かすか、次のPlanar Trackerを使った構成へ進みます。

## 動く平面への配置：Planar Trackerと組み合わせる

Corner Positionerは指定した4点へ素材を変形しますが、**撮影映像の動きは解析しません**。動く看板へロゴを貼る場合は、[Planar Tracker](../tracking/planar-tracker)で背景の看板を解析し、作成した[Planar Transform](../tracking/planar-transform)にその動きを適用させます。Corner Positionerで行うのは、**基準フレームでの四隅の形合わせ**です。

~~~text
看板映像 → Planar Tracker（Trackで解析 → Create Planar Transform）
                 ※解析結果をPlanar Transformへ渡す。画像を結線する意味ではない

ロゴ画像 → Corner Positioner → Planar Transform → Merge（Foreground）─┐
看板映像 ─────────────────────────────── Merge（Background）─┴→ MediaOut
~~~

1. 看板が大きく写り、手前の遮蔽物が少ないフレームを選びます。看板映像をPlanar TrackerのBackgroundへ入力し、看板上の模様を囲んでそのフレームをReferenceに設定します。**追跡するPatternと、ロゴを貼る四隅は別の範囲**です。
2. 必要区間を前後へTrackし、Steadyモードで看板面が止まって見えるか確認します。追跡が滑る場合は、先にPattern、遮蔽物、Motion Type、レンズ歪みを見直します。
3. Planar TrackerのTrackモードで**Create Planar Transform**を押します。これで解析した平面の変形を適用するノードが作成されます。Planar TrackerとPlanar Transformをワイヤーで直接つなぐ必要はありません。
4. 参照フレームに戻り、透明背景のロゴ画像をCorner PositionerのInputへ入れます。**Mapping TypeをPerspective**にして四隅を看板の貼り付け位置へ合わせ、その出力をPlanar TransformのImage Inputへ渡します。
5. Planar Transformの出力を[Merge](../compositing/merge)のForegroundへ、元の看板映像をBackgroundへ接続します。フレームを動かし、看板の向きや遠近が変わってもロゴが滑らないか確認します。

**位置が最初からずれる**場合は、Corner Positionerの4点を合わせたフレームとPlanar TransformのReference Timeが一致しているか確かめます。**途中からずれる**場合は、元のPlanar Trackerで追跡した面とフレーム範囲、特に斜めから写ったフレームの精度を確認します。基準フレームでの形合わせと、その後の追従精度は分けて調整します。

看板の元の文字を消す処理や、看板の手前を通る人物をロゴより前に合成する処理は別に必要です。Corner Positionerの**Effect Maskは変形処理の範囲を制限する入力**で、Planar Trackerの**Occlusion Maskは追跡計算から手前の物体を除外する入力**です。どちらも人物を自動で手前に切り抜いて合成する機能ではありません。

Planar Transformの作成後は、追跡結果の再解析が不要ならPlanar TrackerをGraphから外す構成も可能です。追跡精度を調整する予定があるなら、解析用ブランチとして残しておくと作業を続けやすくなります。

## うまく合わないときの確認

| 症状 | 切り分け方 |
| --- | --- |
| 4つの角は合うが、画面内の文字や格子が不自然に変形する | Mapping TypeをPerspectiveにし、同じ4点でBi-Linearとの差を確認します。四隅を直す前に変形方法を選びます。 |
| 画像が裏返ったように見える、または一部が極端に伸びる | 4隅の対応が交差していないか、隣り合う角を取り違えていないか確認します。まず長方形へ戻してから1点ずつ配置し直します。 |
| 差し替え画像が表示されない | Corner PositionerのInput、MergeのForeground/Background、差し替え素材のAlpha、Effect Maskが全黒でないかを順に確認します。 |
| 最初は合うのに、再生すると看板から滑る | Corner Positionerは動きを解析しません。Planar Transformを使っている場合は追跡精度とReference Timeを先に確認します。 |
| 看板の手前を通る人物にもロゴが重なる | 4点変形では前後関係を自動で判定しません。人物を切り分けるマスクと、Mergeの重ねる順序を別途調整します。 |
| 角は合うのに、実写の端に沿うとずれる | レンズ歪みや平面そのものの曲がりを確認します。強いレンズ歪みがある場合は補正してから追跡・はめ込みを行う方法も検討します。 |

## Perspective Positionerとの違い

- **Corner Positioner** — 平らなsource Imageを、遠近の付いた四辺形へはめ込む
- **Perspective Positioner** — 遠近の付いた四辺形を指定し、その領域を正面向きへ展開する

平面を一度正面向きにしてPaintし、元の遠近へ戻す場合は、Perspective Positioner → Paint → Corner Positionerという往復構成を使えます。

## 関連Node

- [Perspective Positioner](./perspective-positioner)
- [Planar Tracker](../tracking/planar-tracker)
- [Planar Transform](../tracking/planar-transform)
- [Grid Warp](./grid-warp)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 123 pp.2963–2964で、Input / Effect Mask、Basic Node Setup、Mapping Type、Corners X / Y、Offset X / Yを確認しました。動く看板への追従手順はChapter 82 pp.1810–1813およびChapter 119 pp.2820–2825のPlanar Tracker / Planar Transformの説明に基づきます。

全既定値・数値範囲、内部REGID、実機performanceは未確認です。
