---
title: dMerge
description: "複数のDeep Imageの奥行きサンプルを統合するNode。複数Foreground入力、2D素材の扱い、合成例と注意点を解説。"
doc_type: node
term_id: d-merge
term_short: 複数のDeep Imageに記録された奥行きごとのサンプルを、Deepデータのまま1つに統合するNode。
verification: partial
aliases: [dMerge, Deep Merge, dMg]
concepts: [deep-image, compositing, depth]
nodes: [dMerge]
node_family: deep
inputs: [deep-image, deep-image]
outputs: [deep-image]
tasks: [deep, composite, merge]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# dMerge

**dMerge [dMg]は、複数のDeep Imageに記録された奥行きごとのサンプルを、1つのDeep Imageへ統合するNodeです。** たとえば、建物と、その前後を流れる煙を別々にレンダリングしたとき、それぞれの奥行き情報を残したまままとめられます。

通常の2D画像は、基本的に1画素に1組の色とAlphaを持ちます。一方、<Term id="deep-image">Deep Image</Term>には、同じ画素で重なっている手前・奥の複数サンプルを記録できます。dMergeは**各画素の奥行きサンプルを統合する**もので、通常の2D Mergeのように画像を平らにして重ねるNodeではありません。

dMergeの出力もDeep Imageです。合成後に[dCrop](./dcrop.md)で奥行き範囲を選んだり、[dColorCorrector](./dcolorcorrector.md)で色補正を続けたりできます。最終的に通常の2D画像が必要になったら、[Deep to Image](./deep-to-image.md)でフラット化します。

## 入力と出力

| 端子 | データ | 何を接続するか |
| --- | --- | --- |
| **Background（オレンジ）** | Deep Image | 統合の基準となるDeep素材。建物のDeep EXRなど。 |
| **Foreground（白）** | Deep Image | 追加したいDeep素材。煙や別レンダーのDeep EXRなど。 |
| **出力** | Deep Image | 追加した素材の奥行きサンプルを統合したデータ。 |

**Foregroundは複数接続できます。** 新しいDeep素材からdMergeへ接続線をドラッグすると、Foreground入力を追加できます。1つのdMergeに2つ以上のForegroundを集められる点は、21.1 Reference Manualに記載されています。

~~~text
建物のDeep EXR ───── Background ┐
煙のDeep EXR ─────── Foreground ├─ dMerge → Deep to Image → 2D画像
追加のDeep EXR ───── Foreground ┘
~~~

Foreground入力は、白黒のEffect Mask入力ではありません。追加する**Deep画像そのもの**を受け取ります。また、端子の名前だけで最終画像の前後関係が決まるわけではありません。各素材に記録された奥行きデータが重要です。

## 通常のMergeと何が違うか

たとえば1画素の位置で、手前に薄い煙、中央に建物、奥にも煙があるとします。2D画像に変換してから重ねた場合、元のDeep画像に含まれていた個々の奥行き層は復元できません。

dMergeはそれぞれの素材に含まれるDeepサンプルを統合するため、**合成した後でも奥行き範囲による選別やDeep用の色補正を行える**のが特徴です。

ただし、異なるカメラや異なる奥行きの基準で出力したレンダーが、dMergeに接続するだけで自動的に位置合わせされるわけではありません。同じ構図に合成する素材では、画面サイズ、カメラ、Z値の前提を先に揃えるか、必要な位置調整を行います。

## 実例：建物、煙、2Dタイトルを合成する

建物と煙は別々のDeep EXR、タイトルは通常の透明付き2D画像として用意した例です。

1. 建物と煙のDeep EXRをLoaderまたはMediaInで読み込みます。通常のRGBAだけではなく、Deepサンプルを含む素材か確認します。
2. 建物を**Background**、煙を**Foreground**に接続します。さらにDeep素材を追加する場合は、Foreground接続を増やします。
3. dMergeの後ろへ**Deep to Image**を置きます。2D画像へ変換してViewerで見れば、前後関係や煙の透け方を確認できます。
4. タイトルをDeep合成の奥行き関係に参加させたいなら、[Image to Deep](./image-to-deep.md)の**Specify Z**などで配置するZを指定し、dMergeの追加Foregroundへ接続します。
5. タイトルを常に完成画の最前面へ置くだけなら、Deep to Imageの後に通常のMergeで重ねる方法もあります。すべての2D素材をDeep化する必要はありません。
6. Deepの合成を**Linear colorspace**で行い、必要な表示・納品用の色変換は後段で行います。

~~~text
建物（Deep EXR） ─────────────────────────┐
                                         ├─ dMerge → Deep to Image → 2D仕上げ
煙（Deep EXR） ───────────────────────────┤
2Dタイトル → Image to Deep（Z指定） ────────┘
~~~

これは21.1 Manualで確認できるNodeの機能を組み合わせた**運用例**です。ここに挙げた個別素材による21.1実機レンダーは未検証です。

## 2D画像を直接入力できるか

21.1 Manualは、**Image to DeepとDeep to Imageを除くDeep合成Nodeが2D画像入力を自動Deep変換できる**と説明しています。したがって、dMergeのすべての2D入力に、必ず明示的なImage to Deepが必要というわけではありません。

ただし、**自動変換された2D素材を奥行きのどこへ置くか**は、dMergeの説明だけでは確定できません。看板やタイトルを手前・奥の特定位置へ配置したい場合は、Image to Deepの**Specify Z / Z Offset**を使う方が、意図が明確になります。

自動Deep変換は、元の2D画像に写っていなかった物体の裏側や、複数の奥行き層を自動生成するものではありません。

## Inspectorと似たNodeの違い

21.1 ManualのdMerge節には、**dMerge固有のControls項目は列挙されていません**。入力とDeepサンプルの統合、各Deep Nodeに共通するSettings tabの説明が中心です。ほかのNodeにあるZ OffsetやCenterを、dMergeにも存在する設定として扱わないでください。

| Node | 役割 | 選ぶ場面 |
| --- | --- | --- |
| **dMerge** | 複数のDeepサンプルを統合する | 別レンダーのDeep素材をまとめる。 |
| [dHoldout](./dholdout.md) | Foregroundの奥行きでBackgroundを遮る | 手前の物体で奥の煙を隠す。 |
| [dCrop](./dcrop.md) | 指定したZ範囲でサンプルを選ぶ | 深度範囲を取り出す。 |
| [dTransform](./dtransform.md) | Deep画像のXY位置とZ値を調整する | 統合前後に位置を合わせる。 |
| [Image to Deep](./image-to-deep.md) | 2D画像へ奥行き情報を与える | 2D素材を指定したZに配置する。 |
| [Deep to Image](./deep-to-image.md) | Deepから2D画像を作る | 通常のMergeやBlurへ渡す。 |

**dHoldoutはdMergeの別名ではありません。** dMergeはサンプルの統合、dHoldoutは別のDeep素材を使った背景の遮蔽に使います。最終画に物体を追加したいのか、物体を遮蔽物として利用したいのかを区別します。

## 期待した結果にならないとき

- **前後関係がおかしい**：各素材のZ値、カメラ、XY位置を確認します。Foregroundに挿しただけで「必ず手前」とは考えません。
- **2Dタイトルが意図したZ位置にない**：自動Deep変換に頼らず、Image to Deepで奥行きを指定して結果を比較します。
- **通常のMergeやBlurにつなげたい**：Deep to Imageを挟みます。2D化した後に元のDeepサンプルを取り出すことはできません。
- **煙の透け方や色が不自然**：Alpha、Linear colorspace、Deep to ImageのVolumetric Compositionを確認します。
- **計算が重い**：21.1 ManualはDeep合成用の**Cache to Disk**を案内しています。Nodeを右クリックして保存先を選び、ディスク容量も確保します。
- **dMergeが見つからない**：21.1 ManualではDeep Image Compositing Toolsetは**Studio Version Only**です。Editionを確認します。

## 実機例：隠れた青をDeepのまま残す

<!-- capture-case:S121 -->

Resolve Studio21.1.0.14／Windows、1920×1080、フレーム0、右Viewer40%で撮影しました。赤と青はそれぞれ不透明な単色の楕円です。外部Deep EXRは使っていません。

[![赤と青をImage to Deepへ渡し、dMergeからdCrop、Deep to Image、MediaOutへつないだ実機Graph](/img/fusion/captures/S121/graph.png)](/img/fusion/captures/S121/graph.png)

2枚のBackgroundをEllipseで切り抜き、Image to DeepのSpecify ZをONにして、赤のZ＝2、青のZ＝5を設定しました。Z Scaleはこのモードでは表示されません。Inspectorの「Z」に対応するスクリプト上の値はOffsetです。

[![赤のImage to DeepでSpecify ZをON、Zを2にした実機Inspector](/img/fusion/captures/S121/red-inspector.png)](/img/fusion/captures/S121/red-inspector.png)

[![青のImage to DeepでSpecify ZをON、Zを5にした実機Inspector](/img/fusion/captures/S121/blue-inspector.png)](/img/fusion/captures/S121/blue-inspector.png)

青をdMergeのBackground、赤をForegroundへ接続します。今回観測した入力IDはBackgroundとForeground1で、どちらもDeepImageでした。Inspectorは共通Settingsを表示しており、ここにZを設定する欄はありません。

[![dMergeの共通Settingsにレイヤーと入力の設定が表示された実機Inspector](/img/fusion/captures/S121/inspector.png)](/img/fusion/captures/S121/inspector.png)

dCropのMinimum／Maximumを両方OFFにし、Deep to ImageのFlip DepthとVolumetric CompositionもOFFにしました。右のMediaOutでは赤が手前に見え、青の重なり部分を覆います。

[![dCropの最小と最大の深度制限を両方OFFにした実機Inspector](/img/fusion/captures/S121/all-inspector.png)](/img/fusion/captures/S121/all-inspector.png)

[![Deep to ImageのFlip DepthとVolumetric CompositionをOFFにした実機Inspector](/img/fusion/captures/S121/flatten-inspector.png)](/img/fusion/captures/S121/flatten-inspector.png)

[![深度範囲を制限しない出力で赤が青の重なりを覆う実機結果](/img/fusion/captures/S121/compare.png)](/img/fusion/captures/S121/compare.png)

次に、入力と接続を変えず、dCropのMinimum／MaximumをONにして1〜3を残すと、赤だけが表示されました。

[![dCropの深度範囲を1から3、範囲反転OFFにした実機Inspector](/img/fusion/captures/S121/near-inspector.png)](/img/fusion/captures/S121/near-inspector.png)

[![深度1から3だけを残すと赤だけが表示される実機結果](/img/fusion/captures/S121/near.png)](/img/fusion/captures/S121/near.png)

同じdCropで4〜6を残すと、青だけが現れます。赤に隠れていた位置も青に戻りました。同じ画面座標のRGBは、全範囲と1〜3で赤、4〜6で青でした。dMergeの段階では奥の情報が残り、2Dへ平面化する前に深度で取り出せることを、この構成で確認しています。最後は深度制限を両方OFFに戻して保存しました。

[![dCropの深度範囲を4から6、範囲反転OFFにした実機Inspector](/img/fusion/captures/S121/far-inspector.png)](/img/fusion/captures/S121/far-inspector.png)

[![深度4から6だけを残すと隠れていた重なり部分も含め青が現れる実機結果](/img/fusion/captures/S121/far.png)](/img/fusion/captures/S121/far.png)

この例は、一定のZを持つ不透明な2枚の入力に限った確認です。外部Deep EXR、半透明・体積の合成、境界値ちょうどの扱い、サンプル数や入力数の上限、Edition差と性能は未確認です。色の数値精度を評価した例ではありません。

[再現用Graph](/img/fusion/captures/S121/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S121/capture.json)

## バージョン・出典・未確認範囲

一次資料はBlackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）、Chapter 95「Deep Image Nodes」です。

- **pp.2246–2247**：dMerge [dMg]、Background（オレンジ）、複数Foreground（白）、Deepサンプルの統合、共通Settings tab。
- **p.2227**：複数の奥行きサンプル、Deep EXR入出力、2D入力の自動Deep変換、Linear colorspace要件、Cache to Disk、Studio限定。
- **pp.2238–2240、2252–2253**：Deep to Imageへの変換とImage to DeepのZ位置指定。

S121でREGID＝dMerge、2入力の接続、奥の不透明サンプルを後段で取り出せることを実機確認しました。複数Foregroundの上限、2D自動変換時のZ配置、半透明サンプルの演算と実素材の結果は未確認です。`verification: partial`を維持します。

関連：[Deep Imageの基本](../../learn/02-data/deep-image.md) / [補助チャンネルとAOV](../../learn/02-data/auxiliary-channels.md)。
