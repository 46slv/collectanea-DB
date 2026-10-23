---
title: "Change Depth"
description: "2D Imageのcolor channel bit depthを変更し、画質・memory使用量・処理負荷のバランスを調整するNode。"
doc_type: node
term_id: "change-depth"
term_short: "Change Depthは、2D Imageを処理するcolor channel bit depthを変更するNode。"
verification: partial
aliases: ["Change Depth", "CD"]
concepts: ["image-data"]
nodes: ["Change Depth"]
node_family: "time-metadata"
controls: ["Depth", "Dither"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["performance"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Change Depth

Change Depth [CD]は、**2D Imageを処理するcolor channelのbit depthを変更する**Nodeです。時間のremap、metadata、Domain of Definition（DoD）を変更するNodeではありません。

bit depthを上げると後段の計算精度を確保しやすくなりますが、memory使用量や処理負荷も増えます。逆に、十分な精度を確保したあとでbit depthを下げれば、後段の処理を軽くできる場合があります。

## 何をするNodeか

Fusionでは、同じImageでも処理時に使うcolor channelのbit depthによって、保持できる値の精度と必要なmemory量が変わります。

Change Depthは、その処理精度をnode treeの途中で切り替えるために使います。

たとえば32-bit floating-point ImageでColor処理を終えたあと、後段でそこまで高い精度を必要としないなら、16-bit per channelへ変換してmemory使用量とimage-processing timeを抑える構成が取れます。

~~~text
32-bit float Image
      ↓
Color処理
      ↓
Change Depth
      ↓
16-bit処理
      ↓
後段Node
~~~

反対に、元の素材より高いbit depthで後段を処理したい場合にも使えます。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、次の入力が記載されています。

- **Input**（orange）: bit depthを変更する2D Image。
- **Effect Mask**（blue）: NodeのEffect Mask入力。
- **Output**: 指定したbit depthで後段へ渡される2D Image。

ManualのEffect Mask説明にはこのNodeの役割と一致しない`blur`表現が残っているため、このページでは**Effect Mask入力が存在すること**までは確定し、maskがChange Depthの内部処理へどう適用されるかの細部は実機確認前に補いません。

## 主な設定項目

### Depth

出力Imageで使うcolor channelのbit depthを選びます。

`Keep`は入力Imageのdepthを変更せず、そのまま維持します。その他の選択肢は、選んだ値へbit depthを変換します。

21.1 ManualはこのControlの役割を説明していますが、本文中で全選択肢を列挙していません。以下の実機例では、撮影環境のメニューにある5項目と、Keep／int8／int16の出力表示を確認しています。

### Dither

高いbit depthから低いbit depthへ変換するとき、量子化によるbandingなどのartifactを目立ちにくくするために使います。

21.1 Manualでは、down conversion時の選択肢として次が説明されています。

- **Error Diffusion**: 量子化誤差を周囲へ分散し、境界が帯状に見えるのを抑える。
- **Additive Noise**: 微小なnoiseを加え、段階的な変化が目立つのを抑える。

特に高contrastなgradientなど、bit depthを下げたことで階調の段差が見えやすいImageで確認します。

## 実機でDepthとViewerの表示を対応させる

Resolve Studio 21.1.0.14、Windows、日本語UIで、float32の黒白Horizontal Gradientを入力しました。出力フレーム0、両ViewerはColor／40%です。画像の色だけで判断せず、Viewer上部の画像情報も確認します。

[![黒白のHorizontal GradientからChangeDepth1を経由してMediaOut1へ接続した実機Graph](/img/fusion/captures/S48/graph.png)](/img/fusion/captures/S48/graph.png)

[![実機のDepthメニュー。現状維持、int8、int16、float16、float32の5項目](/img/fusion/captures/S48/depth-menu.png)](/img/fusion/captures/S48/depth-menu.png)

[![Depthの現状維持、DitherなしのInspector](/img/fusion/captures/S48/keep-inspector.png)](/img/fusion/captures/S48/keep-inspector.png)

[![Depthの現状維持では、左右の画像ヘッダーがともにfloat32になる](/img/fusion/captures/S48/keep.png)](/img/fusion/captures/S48/keep.png)

[![Change DepthのDepthをint16、Ditherをなしにした実機Inspector](/img/fusion/captures/S48/inspector.png)](/img/fusion/captures/S48/inspector.png)

[![左のGradientは1920×1080 float32、右のChange Depth出力は1920×1080 int16と表示される](/img/fusion/captures/S48/compare.png)](/img/fusion/captures/S48/compare.png)

[![Depthをint8、Ditherをなしへ変更したInspector](/img/fusion/captures/S48/int8-inspector.png)](/img/fusion/captures/S48/int8-inspector.png)

[![入力のfloat32に対し、右Viewerの出力ヘッダーがint8になる](/img/fusion/captures/S48/int8.png)](/img/fusion/captures/S48/int8.png)

「現状維持」では出力もfloat32、int16を選ぶと右の表示がint16、int8ではint8になりました。いずれも1920×1080のままです。この環境のDepthメニューには現状維持・int8・int16・float16・float32がありましたが、float16／float32への明示変換はこの例では試していません。

int8のまま、Ditherを「誤差拡散」「付加ノイズ」へ順に切り替えたInspectorも撮影しました。

[![int8へ変換する設定でDitherの誤差拡散を選択した実機Inspector](/img/fusion/captures/S48/error-inspector.png)](/img/fusion/captures/S48/error-inspector.png)

[![同じint8設定でDitherの付加ノイズを選択した実機Inspector](/img/fusion/captures/S48/noise-inspector.png)](/img/fusion/captures/S48/noise-inspector.png)

ここで確認したのは設定の選択とViewerのbit depth表示です。40%に縮小されたスクリーンショットだけで、Ditherの画質改善や量子化誤差の大きさを判定していません。最後はint16、Ditherなしへ戻しました。runtime REGIDは`ChangeDepth`です。Effect Mask、測色書き出し、memoryや処理時間、Free editionや他OSは未確認です。

[再現用Graph](/img/fusion/captures/S48/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S48/capture.json)

## 主な用途

### floatでColor処理したあと、16-bitへ下げる

21.1 Manualでは、floating-point ImageでColor Correctionを行ったあと、Change Depthで16-bit per channelへdown convertし、image-processing timeとmemoryを抑える例が示されています。

~~~text
Loader / MediaIn
      ↓
Color Correction
      ↓
Change Depth
      ↓
後段処理
~~~

高精度が必要な区間だけfloatで処理し、その後は必要十分なdepthへ戻す、という使い方です。

### node treeの途中から高い精度で処理する

元のImage depthでは後段の計算精度が不足すると判断した場合、Change Depthでより高いdepthへ変換してからEffectやColor処理を続けられます。

~~~text
Input Image
    ↓
Change Depth
    ↓
高精度で行いたい処理
~~~

ただし、bit depthを上げても元素材に存在しない階調情報そのものが復元されるわけではありません。後段計算で発生する値を、より高い精度で保持したい場合に使います。

### down conversion時のbandingを抑える

高bit depthから低bit depthへ変換すると、smooth gradientなどで量子化の段差が見える場合があります。そのときは`Dither`を使い、Error DiffusionまたはAdditive Noiseでartifactがどう変わるか確認します。

## Change Depthを使う前に確認すること

Change Depthは、見た目を直接作るEffectではなく、**後段をどの精度で計算するか**を決めるNodeです。

次の順で考えると判断しやすくなります。

1. その区間で本当に高いprecisionが必要か。
2. 高精度処理を終えたあとも同じdepthを維持する必要があるか。
3. down conversionでgradientや半透明edgeにartifactが出ていないか。
4. artifactが見える場合、Ditherで改善できるか。

単に「軽くしたい」という理由だけで早い段階からbit depthを下げると、その後のColor処理や複数Effectの計算で誤差が目立つ可能性があります。精度を必要とする処理を終えた位置で変更するのが基本です。

## 注意点

- Change Depthが変更する中心的な情報は**color channel bit depth / processing precision**です。retime、metadata、DoD変更用のNodeではありません。
- bit depthを上げても、sourceに存在しないdetailや階調を新しく生成するわけではありません。
- bit depthを下げるとmemoryと処理負荷を抑えられる場合がありますが、量子化artifactが増える可能性があります。
- down conversionでは`Dither`の有無と方式をViewerで比較します。
- 撮影環境のDepthメニューとREGIDは実機例の範囲で確認しました。全内部Parameter ID、edition差、他環境の選択肢は未確認です。

## 関連Node

- [Auto Domain](./auto-domain.md): Image内容からDoDを自動設定し、処理する空間範囲を絞る。
- [Set Domain](./set-domain.md): DoDを手動で設定・調整する。
- [Time / Metadata / Utility Family Overview](./index.md)

Change Depthは**精度**、Auto Domain / Set Domainは**処理する空間範囲**を扱います。どちらもperformanceに関係しますが、変更している情報は別です。

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 111「Miscellaneous Nodes」の`Change Depth [CD]`（pp.2582–2583）を基準にしています。

確認した項目は、color channel bit depthを変更する役割、orange Input、blue Effect Mask、32-bit floating-pointから16-bit per channelへ変換する公式例、`Depth`、`Keep`、`Dither`、`Error Diffusion`、`Additive Noise`です。

float16／float32への明示変換、Ditherの画質、全内部Parameter ID、edition差、Effect Maskの適用挙動は別verification対象として残しているため、`verification: partial`を維持しています。
