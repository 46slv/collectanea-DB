---
title: Camera Shake
description: 2D画像に位置と回転の揺れを加え、手持ち撮影や機械的な振動を表現するFusion Node。
doc_type: node
term_id: camera-shake
term_short: Camera Shakeは、2D画像に手持ち撮影や機械振動のような揺れを加えるNode。
verification: partial
aliases: [Camera Shake, CSh, CSH]
concepts: [image-data, transform, mask-data]
nodes: [Camera Shake]
node_family: transform
controls: [Deviation X, Deviation Y, Rotation Deviation, Randomness, Overall Strength, Speed, Frequency Method, Filter Method, Window Method]
inputs: [image, mask]
outputs: [image]
tasks: [transform-image, animate, compositing]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-17"
---

# Camera Shake

Camera Shakeは、**画像を左右・上下へ動かしたり回転させたりして、撮影時の揺れを再現する**Nodeです。手で持ったカメラの細かな動きから、一定のリズムで振動する機械のような動きまで、揺れの強さ・速さ・規則性を調整できます。

入力するのは2D画像で、出力も2D画像です。Camera Shakeは画像全体の見え方を変えるもので、カメラの3D Sceneを作成したり、実写映像を解析して手ぶれを除去したりするNodeではありません。

## 入力 / 出力

| 端子 | 受け取るもの | 役割 |
| --- | --- | --- |
| **Input**（オレンジ） | 2D Image | 揺らしたい映像や画像を入力する |
| **Effect Mask**（青） | Mask | Camera Shakeの効果を適用する領域を制限する。接続は任意 |
| **Output** | 2D Image | 揺れを加えた画像を次のNodeへ渡す |

Effect Maskには、PolygonやEllipseなどのMask Nodeで作った領域を接続できます。青いEffect Maskは**Camera Shakeによる画像処理の後に適用される**ため、マスクの形状そのものを揺らす入力ではありません。マスクなしなら画像全体に効果を与えます。ImageとMaskの違いは[Image / Mask / Data](../../learn/02-data/image-mask-data)を参照してください。

最小構成は次のとおりです。

    MediaIn → Camera Shake → MediaOut

元映像に揺れがすでに含まれる場合は、Camera Shakeでさらに動きが加わります。手ぶれ補正とは逆の用途なので、先に狙う動きを決めます。

## Controlsタブ

| Control | 変わるもの | 調整の考え方 |
| --- | --- | --- |
| **Deviation X / Y** | 左右（X）・上下（Y）方向の位置の揺れ幅 | どちらかを小さくすれば、その方向の揺れを抑えられる |
| **Rotation Deviation** | 画像の回転方向の揺れ幅 | 位置の揺れだけでは単調に見える場合に加える |
| **Randomness** | 動きの不規則さ | 大きいほど予測しにくい揺れ、小さいほど規則性のある揺れになる |
| **Overall Strength** | 位置・回転などを含む揺れ全体の振幅 | 個別設定のバランスを保ちながら、効果全体の強さを調整する |
| **Speed** | 揺れの速さ・発生頻度 | 強さはそのままで、細かく速い揺れとゆっくりした揺れを比較できる |
| **Frequency Method** | 揺れの波形 | 滑らかな動きと機械的な動きを切り替える |

21.1マニュアルでは、**Deviation X / Y**と**Rotation Deviation**の許容値をいずれも0.0〜1.0としています。位置のDeviationを1.0にすると、画像の境界内の広い範囲に揺れの位置が生じ得ます。小さい値をそのまま一定のピクセル数へ換算する仕様ではないため、狙った画角に合うかはViewerで調整します。

**Overall Strengthが1.0**なら、ほかのControlで決めた強さがそのまま適用されます。Speedは移動量ではなく、揺れが時間的にどれだけ速く変化するかを決めます。「速いが小さい揺れ」ならSpeedを上げつつDeviationを抑え、「ゆっくり大きく振れる」ならその逆を試します。

### Frequency Method：滑らかさと機械的な振動

選択肢は**Sine / Rectified Sine / Square Wave**の3種類です。

- **Sine**：正弦波に沿って変化する揺れ。滑らかな往復運動の基準に向きます。
- **Rectified Sine**：整流された正弦波の形を使います。Sineと波形が異なるため、同じSpeedでもリズムを比較できます。
- **Square Wave**：矩形波による変化。Sineよりも機械的で急な印象の動きになります。

自然な手持ち風を狙う場合はSineを出発点にRandomnessを調整し、一定の振動や衝撃感を狙う場合はSquare Waveも比較します。いずれも実際のカメラ軌跡を測定した結果ではなく、Node内で生成する動きです。

### Filter Method / Window Method：変形後の画素の補間

画像の位置や角度が変わると、出力先の画素が入力画像の画素とぴったり一致しない場合があります。**Filter Method**は、その間の色を周囲の画素からどう求めるかを選びます。21.1マニュアルにはBox、Linear、Quadratic、Cubic、Catmull-Rom、Gaussian、Mitchell、Lanczos、Sinc、Besselが記載されています。

まず動きと輪郭を確認し、細部がぼやける場合は別のFilterと比較します。シャープな補間は素材によって輪郭のにじみやリンギング（輪郭付近の波打つような模様）を生じる場合があります。**Window Method**はSincまたはBesselを選んだときに現れる追加設定で、Hanning、Hamming、Blackman、Kaiserから窓関数を選びます。通常は揺れ方の調整を先に行い、画質差が見える場面でFilterを詰めます。

## 運用例1：固定カメラの映像に手持ち感を加える

**入力**は固定撮影した1920×1080の映像です。狙う結果は、背景や被写体が一緒に小さく動き、手でカメラを支えているように見える画です。

    固定撮影した映像 → Camera Shake → MediaOut

1. 映像の2D Image出力をCamera ShakeのオレンジInputに接続します。
2. まずDeviation X / YとRotation Deviationを小さくして、Viewerで数秒間の動きを再生します。
3. Speedで揺れの細かさを、Randomnessで不規則さを調整します。動きの方向を残して全体の強さだけ下げたいときはOverall Strengthを使います。
4. 静止画で確認するだけでなく、再生して揺れの周期と被写体の読みやすさを確かめます。
5. フレーム端で画像が足りなくなる場合は、必要に応じて前段の[Transform](./transform)で画像を少し拡大し、端が見切れないか確認します。

最後の拡大は、画角の一部を失う代わりに端の不足を避ける実務上の対処です。拡大量の固定値は決めず、最大の揺れが出る箇所を見ながら調整します。

## 運用例2：画面の一部にだけ揺れを与える

**入力**は一枚の2D Imageと、効果をかけたい位置を示すPolygonなどのMaskです。たとえば監視モニターを含む画像で、モニター付近だけに揺れを見せたい場合に使います。

    元のImage ─────────→ Camera Shake → 後段の合成またはMediaOut
                           ↑ Effect Mask（青）
    Polygon / Ellipse ─────┘

1. 元のImageをCamera ShakeのInputへ接続します。
2. PolygonやEllipseで効果を見せたい画面上の領域を作り、青いEffect Maskへ接続します。
3. Camera Shakeの揺れを調整し、**マスク内で効果が現れ、マスク外には元画像が残るか**をViewerで確認します。
4. 境界が不自然な場合はMaskの輪郭や柔らかさを調整します。

これは**効果を適用する画面上の領域を制限する**構成です。マスクで切り抜いた物体を独立した画像として揺らし、背景と重ねたい場合は、マスクで前景を用意してからCamera Shakeを通し、[Merge](../compositing/merge)で合成する方法も検討してください。Effect Maskだけで被写体を独立したレイヤーへ変換するわけではありません。

## 実機例：同じ静止画の別フレームを比較する

<!-- capture-case:S56 -->

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の非対称チャートをCamera Shakeへ接続しました。左は入力、右は処理後で、両ViewerはColor／40%です。内部REGIDは`CameraShake`でした。

[![静止チャートのLoaderからCameraShake1、MediaOut1へ接続した実機Graph](/img/fusion/captures/S56/graph.png)](/img/fusion/captures/S56/graph.png)

[![Camera ShakeのX0.08、Y0.04、回転0.03、Randomness0.5、Strength1、Speed0.8、正弦波を示すInspector](/img/fusion/captures/S56/inspector.png)](/img/fusion/captures/S56/inspector.png)

[![同じ静止チャートの入力が左、Sineのframe0で位置と傾きが変わった出力が右](/img/fusion/captures/S56/compare.png)](/img/fusion/captures/S56/compare.png)

Xの揺れを0.08、Yを0.04、回転を0.03、Randomnessを0.5、Overall Strengthを1、Speedを0.8、波形をSineに固定しています。上はframe 0、下はframe 24です。入力は静止画のままでも、右のチャートの位置と傾きが変わります。

[![同じSine設定のframe24では右のチャートの位置と傾きがframe0から変わる](/img/fusion/captures/S56/frame24.png)](/img/fusion/captures/S56/frame24.png)

同じframe 24で、Inspectorの波形をGUIからSquare Waveへ切り替えました。日本語UIでは「矩形波」と表示され、Sineとは異なる配置になりました。2枚の静止画で見える差を示すもので、動きの滑らかさや再生性能の比較ではありません。

[![GUIで波形を矩形波に切り替えたCamera ShakeのInspector](/img/fusion/captures/S56/square24-inspector.png)](/img/fusion/captures/S56/square24-inspector.png)

[![同じframe24で矩形波へ切り替えた右Viewerの位置と傾き](/img/fusion/captures/S56/square24.png)](/img/fusion/captures/S56/square24.png)

Overall Strengthを0へ下げると、frame 0で左右に同じチャートが表示されました。個別の揺れ幅を保ちながら、全体の強さを抑える例です。

[![Camera ShakeのOverall Strengthが0を示すInspector](/img/fusion/captures/S56/strength0-inspector.png)](/img/fusion/captures/S56/strength0-inspector.png)

[![Overall Strength0では左右に同じチャートが表示されるframe0の比較](/img/fusion/captures/S56/strength0.png)](/img/fusion/captures/S56/strength0.png)

最後はSine、Strength1、frame 0へ戻して保存しました。Effect Mask、Rectified Sine、Edgesや他Filter、後段の拡大合成、連続再生、性能と書き出しは未確認です。

[再現用Graph](/img/fusion/captures/S56/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S56/capture.json)

## Transform・Shake Modifierとの違い

[Transform](./transform)はCenter、Size、Angleなどを直接指定して配置や動きを作ります。動くタイミングと軌道を正確に決めたいなら、TransformのKeyframeが適しています。一方、Camera Shakeは位置と回転の揺れをまとめて生成し、強さ・速さ・波形から調整するNodeです。21.1マニュアルはCamera Shakeの変形が隣接するTransform系Nodeと連結され、より高品質な処理につながることも説明しています。

**Shake Modifier**は別の仕組みです。こちらは画像を処理するNodeではなく、ほかのNodeのパラメータにランダムな数値変化を与えます。たとえばTransformのCenterなど、特定の値だけに変化を与えたい場合はModifier側を検討します。パラメータをどの仕組みが動かしているかは[Modifier / パラメータの供給元](../../learn/05-time/modifier-parameter-sources)を参照してください。

## 出典と確認範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 120「Transform Nodes」、**pp.2859–2861**。2つの入力、Effect Maskの適用位置、Controlsタブの項目、各Deviationの範囲、Frequency Methodの3種、Filter / Window Methodを確認しました。前述の2つの制作例はManualの仕様に基づく説明です。S56は別の固定例として、静止チャートのframe 0／24、Sine／Square Wave、Strength0／1を実機確認しました。

S56の内部REGIDと上記の固定値・出力表示は確認済みです。全Controlの範囲、Mask、連続再生と性能、Free / StudioのEdition差は未確認のため、verificationはpartialを維持します。
