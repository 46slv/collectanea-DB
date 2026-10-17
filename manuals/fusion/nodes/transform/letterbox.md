---
title: Letterbox
description: 異なる縦横比の2D Imageを指定解像度へ変換し、黒帯を追加するか画面を切り出すかを選ぶNode。
doc_type: node
term_id: letterbox
term_short: Letterboxは、画像の縦横比と出力寸法を合わせ、余白または切り出しによってフレームへ収めるNode。
verification: partial
aliases: [Letterbox, LBX, レターボックス]
concepts: [image-data, resolution, transform]
nodes: [Letterbox]
node_family: transform
controls: [Width, Height, Auto Resolution, Pixel Aspect X, Pixel Aspect Y, Center X, Center Y, Mode, Filter Method, Window Method]
inputs: [image]
outputs: [image]
tasks: [transform-image, resize, resolution, format, aspect-ratio]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-17"
---

# Letterbox

Letterboxは、**入力映像を別の縦横比・解像度のフレームへ収める**Nodeです。画面全体を残して上下や左右に帯を追加する方法と、フレームいっぱいに拡大してはみ出す部分を切り取る方法を切り替えられます。

たとえば横長のシネマスコープ映像を16:9のHDフレームへ変換するとき、映像を横いっぱいに表示して上下へ黒帯を入れるか、縦いっぱいに拡大して左右を切り取るかを選択できます。単に画面へ黒い四角形を重ねるNodeではなく、**出力ImageのWidth / Heightそのものを変更する**処理です。

## 入力 / 出力

| 接続 | 内容 |
| --- | --- |
| Input（オレンジ） | 縦横比・解像度を変換したい2D Image。MediaIn、MergeなどのImage出力を接続する。 |
| Output | 指定したWidth / HeightとPixel Aspectに変換された2D Image。Modeに応じて帯の追加または切り出しが行われる。 |

```text
MediaIn → Letterbox → MediaOut
```

合成済み映像を最後に別の納品解像度へ整える場合は、`Merge → Letterbox → MediaOut`の順にします。Letterbox出力を別のMergeのBackgroundへ接続すれば、その出力寸法がMergeのフレーム寸法の基準になります。

## 主な設定

### Width / Height — 出力解像度

最終的に出力するImageの幅と高さを**ピクセル数**で指定します。たとえば`1920 / 1080`なら出力は1920×1080です。WidthまたはHeightの数値欄を右クリックし、`Select Frame Format`から既定のフォーマットを選ぶこともできます。

### Auto Resolution — タイムラインなどへ自動で合わせる

オンにすると、Width / Heightの基準が次の設定になります。

- **DaVinci Resolve内のFusion**: タイムラインの解像度。
- **Fusion Studio**: PreferencesにあるFrame Format設定。

出力解像度を固定したい場合は、Auto ResolutionをオフにしてWidth / Heightを指定します。これは[Transform](./transform)にあるReference SizeのAuto Resolutionとは違い、**画像の出力解像度を変える**設定です。

### Mode — 黒帯を残すか、画面を切り出すか

- **Letterbox/Envelope**: 入力の縦横比を考慮して**指定した幅**へ合わせ、上下・左右に必要な帯を設けます。横長の映像を16:9の枠へ全体表示したい場合に使います。
- **Pan-and-Scan**: 入力の縦横比を考慮して**指定した高さ**へ合わせます。変換後の画像が指定幅より広い場合、左右が切り取られます。見せたい部分を横へ追いかける場合はCenterで位置を調整します。

どちらのModeでも出力Width / Heightは指定値になります。**Center X / Yが画像配置に効くのはPan-and-Scanだけ**であり、Letterbox/EnvelopeではCenterを変えても画は動きません。

### Pixel Aspect X / Y

出力Imageのピクセルの縦横比を指定します。ピクセル数の縦横比（たとえば1920:1080）と、1ピクセル自体の形は別の値です。正方形ピクセルの通常のHD/UHD映像では、特殊なフォーマットへ合わせる理由がなければ変更する必要はありません。

### Filter Method / Window Method

サイズ変換で生じる新しい画素をどう補間するかを選びます。`Box`、`Linear`、`Quadratic`、`Cubic`、`Catmull-Rom`、`Gaussian`、`Mitchell`、`Lanczos`、`Sinc`、`Bessel`などが用意されています。

細かい文字や線の輪郭ではシャープさを確認し、実写ではノイズと細部の自然さを見ます。`Sinc`などは輪郭付近にringing（明暗の縁取り）が見えることがあります。`Sinc`または`Bessel`を選ぶと、窓関数を指定する`Window Method`（Hanning / Hamming / Blackman / Kaiser）が使用できます。

## 運用例1：横長映像をHDへ収め、上下に帯を入れる

2048×858の映像を1920×1080の納品用Imageへ変換する例です。

```text
MediaIn（2048×858） → Letterbox（1920×1080） → MediaOut
```

1. Letterboxを追加し、Widthを`1920`、Heightを`1080`に設定します。必要ならAuto Resolutionをオフにします。
2. Modeを`Letterbox/Envelope`にします。
3. Viewerで映像全体が横幅に収まり、上下に帯が追加されることを確認します。
4. 映像の上下端に欠落がないか、帯が意図した位置にあるか確認します。

正方形ピクセルを前提にすれば、入力幅2048を1920へ縮める倍率は`1920 / 2048 = 0.9375`です。映像の高さは約804pxとなるため、1080pxのフレーム内に上下それぞれ約138pxの余白が生まれます。**この値は配置を理解するための計算例**です。実際の端数処理やPixel Aspectが違う場合はViewerで確かめます。

## 運用例2：同じ素材を画面いっぱいにし、左右を切り出す

前の2048×858を、16:9の枠を余白なしで埋める例です。

1. Width / Heightは`1920 / 1080`のまま、Modeを`Pan-and-Scan`へ切り替えます。
2. 画像は高さ1080pxへ合うように拡大されます。元画像を引き伸ばすのではなく、元の縦横比を維持したまま左右がフレーム外へ出ます。
3. Center X / Yで見せたい部分を調整します。人物が画面の端へ動く素材なら、Centerのアニメーションで追うこともできます。
4. Viewerで左右の切れ方と、重要な被写体が画面内に残るか確認します。

同じ正方形ピクセルの前提なら、倍率`1080 / 858 ≒ 1.259`となり、変換後の入力映像は幅約2578pxです。1920pxの枠では約658pxぶんが左右合計で画面外になります。映像全体を保持したい場合はPan-and-ScanでなくLetterbox/Envelopeを選びます。

## Resize / Crop / Transformとの違い

- [Resize](./resize): 指定したWidth / Heightへ画像全体を再サンプリングします。縦横比の扱いはKeep Frame Aspectなどの設定で調整します。
- [Crop](./crop): 入力画像から指定領域を切り出す、またはキャンバス寸法を変えます。帯を追加して別アスペクトのフレームへ適合させる処理とは目的が異なります。
- [Transform](./transform): 同じ解像度のImageの中で位置・サイズ・角度を変更します。出力Width / Height自体は変えません。
- **Letterbox**: 別の出力解像度へ変更しながら、全体表示（帯あり）と画面充填（切り出しあり）を選びます。

黒帯がすでに映像に焼き込まれている素材では、Letterboxを追加しても帯が自動除去されるわけではありません。素材に黒帯が含まれるか、透明な余白なのか、画像の一部として描かれているかを先に確認してください。

## 注意点

Letterboxは出力の物理解像度を変えるため、21.1 Manualは**解像度Controlのアニメーションを推奨していません**。パンして見せる目的ではModeをPan-and-ScanにしたうえでCenterを動かします。合成途中の画像幅・高さを変える場合は、後段にあるMergeのBackgroundサイズや正規化座標へも影響する点に注意します。

`Auto Resolution`による設定と、手動指定したWidth / Heightを混同しないでください。実機での具体的なFilterの描画結果、RGB/Alphaの帯色変更方法、内部REGID、Edition別制約は今回の資料だけでは確認できていません。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 120「Transform Nodes」、pp.2868–2870。入出力、Width / Height、Auto Resolution、Pixel Aspect X / Y、Center、Mode、Filter Method、Window Method、解像度変更とアニメーション注意点を確認しました。上記のピクセル数は公式記述をもとに計算した説明例であり、実機検証ではありません。このため`verification: partial`としています。
