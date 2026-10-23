---
title: Set Canvas Color
description: 2D ImageのDoD外をどの色・Alphaとして扱うか指定し、縮小映像の余白やMask処理後のcanvas値を調整するNode。
doc_type: node
term_id: set-canvas-color
term_short: DoDの外側にあるcanvasの色とAlphaを指定するNode。
verification: partial
aliases: [Set Canvas Color, SCv]
concepts: [image-data, domain-of-definition]
nodes: [Set Canvas Color]
node_family: color
controls: [Color Picker]
inputs: [image, image]
outputs: [image]
tasks: [canvas, domain-of-definition, fill-outside]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Set Canvas Color

Set Canvas Colorは、2D Imageの<Term id="domain-of-definition">Domain of Definition（DoD）</Term>の外側を、どの色とAlphaとして扱うかを指定するNodeです。

例えば、映像をTransformで縮小すると、フレームの中央に映像が残り、その周囲に空きができます。その空きがDoDの外側になっている場合、Set Canvas Colorで透明な黒以外の値を指定できます。

画像そのものを塗り直すNodeではありません。「まだ実際の画素として定義されていない場所を、後続の処理が何色として扱うか」を決めるものです。

## DoD・Raster・Canvasの違い

Fusionの画像には、出力できる画面全体の大きさを表す**Raster（ラスター）**と、画像データが実際に定義されている領域を表す**DoD**があります。

例えば1920×1080のラスターの中央に小さな画像を配置した場合、ラスターは1920×1080のままでも、DoDが中央の画像の範囲だけになることがあります。このときDoDの外側にも「何色として扱うか」というcanvas値があります。

- **Raster内・DoD内**：通常の画像データがある領域。Set Canvas Colorは、この領域の色を補正する目的では使いません。
- **Raster内・DoD外**：画面には収まっているものの、画像データがない領域。Set Canvas Colorの指定が見えることがあります。
- **Raster外**：出力画像の範囲外です。値を指定しても、そのままではフレームに描画されません。

DoD外のcanvas値は、通常は**黒（RGBが0）、Alphaが0**、つまり透明な黒です。ただし、Nodeの処理によって異なる値になることもあります。例えばMaskを反転すると、通常は黒として扱うcanvasが白になる場合があります。

「透明な場所が黒く見える」というViewer表示だけでは、Alphaが0なのか不透明な黒なのかを判断できません。色とAlphaを分けて確認します。

## 入力・出力

### Input（オレンジ：必須）

基準になる2D <Term id="image">Image</Term>を接続します。DoDがラスターより小さい場合に、canvas値を変えた結果を確認しやすくなります。

### Foreground（緑：任意）

別の2D Imageを接続し、そのImageからcanvas colorをサンプリングするための入力です。

これは2枚の画像を重ねるためのForegroundではありません。別画像の内容全体を合成したい場合は、Mergeなどを使います。**Foregroundが接続されている間、Set Canvas ColorのControlsタブは空になります。** 手動でColor Pickerを操作したいときは、この接続を外します。

サンプリング位置・評価方法などの細部は、この2ページのManual記述だけでは確定できないため、ここでは断定しません。

### Output

canvasの色とAlphaの扱いを変更した2D Imageを出力します。入力画像のラスター解像度そのものを変更するNodeではありません。

## Inspectorの設定

### Controlsタブ：Color Picker

Foregroundを接続していない場合に、DoD外のcanvasに使う**ColorとAlpha**を指定します。既定値は黒、Alpha 0です。

Alphaは特に重要です。例えば色を赤にしてもAlphaを0のままにすると、透過合成した結果として赤い余白が見えない場合があります。空きを不透明な色として見せたいなら、ColorとともにAlphaも設定します。

Foregroundが接続されている場合はControlsタブに調整項目が表示されません。これは入力状態による通常の挙動です。

### Settingsタブ

ほかのColor系Nodeと共通のSettingsタブがあります。Set Canvas Color固有の色指定はControlsタブで行います。共通設定の詳細は21.1 Reference ManualのChapter 93「The Common Controls」を参照してください。

## 実際の使い方：縮小した映像の周囲を色で埋める

~~~text
MediaIn1 → Transform1 → Set Canvas Color1 → MediaOut1
~~~

1. MediaIn1をTransform1へ接続し、TransformのSizeを小さくして、画面内に映像の周囲の空きを作ります。
2. Transform1の出力をSet Canvas Color1のオレンジのInputへつなぎます。
3. Set Canvas Color1の緑のForegroundは未接続にします。
4. ControlsタブのColor Pickerで任意の色を選び、必要ならAlphaを1にします。
5. Viewerで周囲の変化を確認します。変わるのは、**ラスター内に存在するDoD外の領域**です。

ポイントは**Transformの後に配置する**ことです。元画像がラスター全体を占めている段階では、色を変える対象のDoD外領域が画面内にない場合があります。Transformで空きを作った後なら、その範囲を確認できます。

色が出ない場合は、まずDoDの外側が本当にラスター内にあるかを確認し、次にAlphaを確認します。

## 別の使い方

### Maskの反転で変わったcanvas値を明示する

DoDの外側は常に透明な黒とは限りません。Manualは、Maskの反転によってcanvasが黒から白に変わる場合を例示しています。

そのような処理の後段でSet Canvas Colorを使うと、DoD外を特定の色やAlphaとして扱うことを明示できます。画面内のMaskそのものの形を描き直す操作とは区別してください。

### 別画像の色を基準にする

緑のForegroundへ別Imageを接続すると、その画像からcanvas colorを取得できます。手入力のColor Pickerとは別の方法で値を与えたい場合に使います。

ForegroundをつないでControlsタブが空になっても異常ではありません。接続先の画像内容やサンプリングの挙動を実際に確認しながら使ってください。

## BackgroundやMergeとの違い

[Background](../generators/background.md)は、指定したサイズを持つ新しい2D Imageを生成するNodeです。背景用の実画像を作り、その上へ素材を重ねるなら、BackgroundとMergeの組み合わせが分かりやすい構成になります。

Set Canvas Colorは**既存ImageのDoD外にある暗黙のcanvas値**を変えます。新しい背景素材を生成するわけではなく、DoD内の画素を塗り替えるわけでもありません。

単に不透明な背景の上へ小さな映像を置きたいならBackground＋Merge、特定のNode処理で生じたDoD外の値を指定したいならSet Canvas Colorを検討します。[Transform](../transform/transform.md)で縮小・移動したImageの後段に置く構成は、公式Manualでも紹介されています。

## 期待どおりに変わらないとき

| 状況 | 確認すること |
| --- | --- |
| Colorを変えても画面が変わらない | ラスター内にDoD外の領域があるか。入力画像がフレーム全体を覆っていないか。 |
| 色を選んだのに透過合成では見えない | Alphaが0のままではないか。RGBとAlphaを別々に確認する。 |
| Controlsタブが空 | 緑のForegroundに別Imageが接続されていないか。 |
| ラスターの外側まで色が出ない | Set Canvas Colorは出力ラスター自体を拡大しない。必要な画面サイズはほかのNodeで管理する。 |
| 画面全体を単色にしたい | Set Canvas ColorではなくBackgroundの利用を検討する。 |

補足として、公式Manualは**ラスター外の黒い領域にマウスポインターを置くと、Fusionウィンドウ左下のステータスバーでRGB canvas colorを確認できる**と説明しています。Viewerに表示されない外側の値を確認するときの手掛かりです。

## 出典・確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**, Chapter 93「Color Nodes」pp.2198–2199：役割、DoDとRasterの関係、Input / Foreground、Controlsタブ、Color Picker、初期の黒・Alpha 0、Transform後の接続例、ステータスバーの記述を確認。
- **対象**：DaVinci Resolve 21.1のFusionページ。Nodeの役割と記載されたUIはManualに基づきます。Foregroundからの正確なサンプリング方法、実機でのパラメータ既定値・Edition差はこの改稿では追加検証していません。
