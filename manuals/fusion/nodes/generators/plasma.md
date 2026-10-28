---
title: "Plasma"
description: "4つの円形パターンからプラズマ状の2D画像を作るFusion Generator。CirclesとColorの調整、Effect Mask、合成例を解説。"
doc_type: node
term_id: "plasma"
term_short: "Plasmaは、4つの円形パターンを組み合わせ、色の位相も変えられる2D Image Generator。"
verification: partial
aliases: ["Plasma", "PLAS"]
concepts: ["image-data", "effect-mask", "procedural-texture"]
nodes: ["Plasma"]
node_family: "generators"
controls: ["Scale", "Operation", "Circle Type", "Circle Center", "Circle Scale", "Phase", "R/G/B/A Phases"]
inputs: ["mask"]
outputs: ["image"]
tasks: ["generate-image", "procedural-texture", "motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Plasma

**Plasma [PLAS]は、4つの円形パターンを組み合わせ、プラズマ状の模様を2D Imageとして作るGenerator**です。撮影済みの画像を変形するNodeではなく、背景素材を最初から生成します。円の位置・大きさ・重なり方で模様を作り、Color tabで色の位相を変えられます。

[Fast Noise](./fast-noise)と同じく、生成画像を背景として見せるほか、別の処理に渡す模様としても使えます。21.1 Reference Manualは、ShadowやDeformの変形用パターン、モーショングラフィックスやSF風の模様を用途に挙げています。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Effect Mask**（青、任意） | Mask | 生成したPlasma画像が現れる範囲を制限する。 |
| **出力** | 2D Image | 円形パターンから生成した画像を、Mergeなどの後段Nodeへ渡す。 |

Manualが記載する**入力はEffect Maskの1つ**です。Plasma自体が画像を作るため、撮影素材や別のImageを受け取る通常のImage入力はありません。

Effect MaskにはEllipseやPolygonなどのMaskを接続できます。楕円形のMaskを渡せば、プラズマ模様全体が楕円の内側だけに現れます。模様を形作る4つの円を調整する機能と、最終出力をMaskで切り抜く機能は別です。

~~~text
Plasma ─────────→ Merge (Background) ─→ MediaOut
Text+ ──────────→ Merge (Foreground)

Ellipse Mask ───→ Plasma (Effect Mask)    ※必要な場合だけ接続
~~~

この構成ではPlasmaが背景、Text+が文字です。Plasmaに「Source → Plasma」のように映像を入力する必要はありません。

## Circles tab：模様の形を決める

Plasmaの模様は4つの円形パターンから作られます。**Circles tab**では全体の大きさと各円の関係を調整します。

| Inspector項目 | 作用 |
| --- | --- |
| **Scale** | 生成される模様全体の大きさを調整する。 |
| **Operation** | 4つの円が重なるとき、どのような数学的関係で模様を作るかを指定する。 |
| **Circle Type** | パターンに使う円の種類を選択する。 |
| **Circle Center** | 円の中心位置を調整する。 |
| **Circle Scale** | パターンに使う円の大きさを調整する。 |

**ScaleとCircle Scaleは同じ役割ではありません。** 前者は生成パターン全体の大きさ、後者は模様を構成する円の大きさを調整します。全体の密度をScaleで決め、円の重なりが望む場所に出るようCircle CenterとCircle Scaleを動かすと、調整の意図を追いやすくなります。

Operationは色を重ねる通常のMergeではなく、**4つの円の交差・重なりを模様へ反映する方法**です。Manualにはこの項目の役割が記されていますが、すべての選択肢・演算式まではここで検証していません。特定の結果を期待する場合はViewerで比較してください。

## Color tab：色を時間変化させる

| Inspector項目 | 作用 |
| --- | --- |
| **Phase** | 画像全体の色の位相を変える。アニメーションさせると色が循環する。 |
| **R/G/B/A Phases** | Red、Green、Blue、Alphaそれぞれの位相を個別に変える。 |

Phaseをアニメーションさせると、円の位置を移動しなくても色が変化します。Manualはこの変化を、サイケデリックな色の循環として紹介しています。**模様の配置を調整するCircle Centerと、色の変化を調整するPhaseを区別**すると、位置と色を別々に演出できます。

AはAlpha（透明度）のチャンネルです。A Phaseも変化させる場合は、後段で合成した際に透け方がどう変わるかを、背景映像を含めて確認します。

## Image / Settings tab

PlasmaにはGenerator共通の**Image**と**Settings** tabもあります。Image tabのフレームサイズやPixel Aspectなど、画像の生成条件は[Generator Family Overview](./)および[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)で説明しています。

Plasma固有のCircles / Color項目と、複数のGeneratorで共通するImage / Settings項目を混同しないようにしてください。

<!-- capture:S152 -->

## 実機例：模様のScale・Phaseと表示範囲

`Plasma1` をMergeのBackground、白い `PLASMA` 文字をForegroundへ接続します。別の `PlasmaMasked` にはEllipseをEffect Maskとしてつなぎ、マスクなしの出力と比較します。両方のPlasmaはマスク比較時に同じCircle・Scale・Phaseの設定です。

frame 0で全体のScaleを `1.0 → 0.5`、次にScaleを戻してPhaseを `0 → 0.25` に変えます。表示を比較した後、Phaseも元に戻してマスクの有無を確認します。[接続と設定の記録](/img/fusion/captures/S152/readback.json)に値を記録しています。市松模様はViewerの透明部分を示します。

WindowsのResolve Studio 21.1.0.14、1920×1080で確認した静止frameの例です。Phaseのキーフレーム、時間による色の循環や他のOperationはこの例では検証していません。

[![PlasmaとTextをMergeする枝とEllipseをEffect Maskに接続する別枝](/img/fusion/captures/S152/graph.png)](/img/fusion/captures/S152/graph.png)

上はPlasmaに文字を重ねる枝、下は別のPlasmaにEllipseをEffect Maskとして渡す比較枝です。

[![PlasmaのScale 1とCircle 1から4の設定を示すInspector](/img/fusion/captures/S152/circles-controls.png)](/img/fusion/captures/S152/circles-controls.png)

サークルタブのScaleは1.0で、4つのCircleの設定が表示されています。

[![Scale 1のPlasmaと、白い文字を重ねた結果](/img/fusion/captures/S152/scale-one.png)](/img/fusion/captures/S152/scale-one.png)

Scale 1.0。左はPlasma、右は白い文字を重ねたMediaOutです。

[![PlasmaのScaleを0.5にしたInspector](/img/fusion/captures/S152/scale-controls.png)](/img/fusion/captures/S152/scale-controls.png)

同じframeでScaleを0.5に変更します。

[![Scale 0.5で模様が細かくなったPlasmaと文字合成](/img/fusion/captures/S152/scale-half.png)](/img/fusion/captures/S152/scale-half.png)

Scale 0.5では、同じ表示範囲により細かい模様が現れます。

[![PlasmaのColorタブでPhaseを0.25にしたInspector](/img/fusion/captures/S152/phase-controls.png)](/img/fusion/captures/S152/phase-controls.png)

Scaleを1.0へ戻し、ColorタブのPhaseを0.25に変更します。

[![Phase 0.25に変更したPlasmaと文字合成](/img/fusion/captures/S152/phase-quarter.png)](/img/fusion/captures/S152/phase-quarter.png)

同じframeでPhaseを変えた表示です。Scale 1.0・Phase 0の画像と色の配置を比較できます。

[![左はマスクなしのPlasma、右はEllipseで中央だけを表示した別のPlasma](/img/fusion/captures/S152/effect-mask.png)](/img/fusion/captures/S152/effect-mask.png)

左はマスクなし、右は同じ設定の別のPlasmaへEllipseを接続した出力です。楕円の外は透明です。

[再現用Graph](/img/fusion/captures/S152/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S152/capture.json)

<!-- /capture:S152 -->

## 制作例

### 1. タイトルの動く背景を作る

1. **Plasma**を追加し、Circles tabのScaleを変えて、タイトルの背後に置きたい模様の大きさを決めます。
2. Circle Center / Circle Scale / Operationで円同士の関係を変え、文字の周囲にどの程度の模様が出るか確認します。
3. Color tabのPhaseに時間変化を付け、文字は静止させたまま背景の色が移り変わるようにします。
4. Plasmaを[Merge](../compositing/merge)のBackground、[Text+](./text-plus)をForegroundに接続します。
5. 文字が模様に埋もれる場合は、文字のShadingやPlasma側の構図を調整します。

PlasmaをMergeのForegroundに接続して映像へ重ねることもできますが、その場合は**透明度を含む生成結果**が重なります。不透明なまま全面に載せると、背後の映像は見えなくなることがあります。

### 2. ロゴの形の中だけを色変化させる

1. ロゴのシルエットからMaskを作ります。Polygonで手描きする場合も、別画像からMaskを作る場合も、最終的にMaskデータを用意します。
2. そのMaskをPlasmaの青いEffect Mask入力に接続します。
3. Circles tabで模様を調整し、Phaseのアニメーションで色を変えます。
4. 背景映像をMergeのBackground、Mask付きPlasmaをForegroundに接続します。

ここではロゴの輪郭をPlasmaが計算するのではありません。**Maskが表示領域を決め、Plasmaがその内側の色模様を生成**します。輪郭と色変化の担当を分ける構成です。

### 3. 変形や影のためのパターンとして使う

ManualはPlasmaの模様を**Shadow / Deformの変形パターン**として使えると説明しています。Plasmaで円が重なる模様を作り、それを後段の処理が参照する画像素材として用意します。模様を変えると、参照先へ渡るパターンも変わります。

ただし、Shadow / Deformの**どの端子へ渡すか、どのチャンネルを参照するかは接続先Nodeの仕様に依存**します。PlasmaのEffect Mask入力を「変形画像の入力」と取り違えず、接続先側の入力説明を確認してください。

## Fast Noiseとの使い分け

- **Plasma**：4つの円の重なり方を設計し、Phaseで色の循環を作る。円の関係を使った抽象背景に向く。
- **[Fast Noise](./fast-noise)**：Perlin Noiseの細かさ、明暗、スケールやSeetheを調整する。雲、霧、不規則な有機模様などに向く。

どちらも既存映像の入力を必要としないGeneratorです。PlasmaにFast NoiseのSeetheと同等のControlがあるとは扱いません。

## 関連ページ

- [Generatorノード](./)
- [Fast Noise](./fast-noise)
- [Text+](./text-plus)
- [Merge](../compositing/merge)
- [マスク（Mask）](../../learn/02-data/mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』**（September 2026）、**Chapter 103「Generator Nodes」、pp.2379–2380、Plasma [PLAS]**。4つの円形パターン、唯一のEffect Mask入力、Circles / Color各Controlと、その作用を確認しています。

本記事の合成構成はManualの説明を実制作向けに展開した例です。WindowsのResolve Studio 21.1.0.14ではruntime REGID `Plasma`、ScaleとPhaseの静止比較、Effect Maskと合成例を確認しました。Phaseのアニメーション、Controlの全default値・数値range・Operationの全選択肢、edition差は未検証のため、frontmatterのverification: partialを維持しています。
