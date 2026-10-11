---
title: Auto Gain
description: 入力Imageの最暗部と最明部を指定Rangeへ自動remapし、低contrast素材のtonal rangeを広げるNode。
doc_type: node
term_id: auto-gain
term_short: 最暗部と最明部を基準にImage全体の値域を自動で伸縮するColor Node。
verification: partial
aliases: [Auto Gain, AG]
concepts: [image-data, tonal-range]
nodes: [Auto Gain]
node_family: color
controls: [Do Z, Range]
inputs: [image, mask]
outputs: [image]
tasks: [color-correct, normalize-range]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Auto Gain

Auto Gainは、入力した2D <Term id="image">Image</Term>の最暗部と最明部を調べ、指定したLow / Highへ収まるように中間値も含めて自動で伸縮するNodeです。

低contrastの素材を一度見やすい値域へ広げたいときや、float画像の値域を確認したいときに使えます。

## 入力と出力

オレンジのInputへ2D Image、青のEffect Maskへ任意のMaskを接続します。出力は補正後の2D Imageです。

```text
Image → Auto Gain → Color / Merge
          ↑
         Mask
```

## Range

LowとHighが、remap後のblack point / white pointを決めます。

入力の最暗値はLowへ、最明値はHighへ移り、その間の値は同じ比率で再配置されます。

## Do Z

Z / Depth channelにもAuto Gainを適用します。

異なるZ passの値域を合わせたい場合や、floatのZ値を見やすい範囲へ一時的にremapしたい場合に使います。

## 運用例

0.2〜0.8程度にしか値がないgradientを0〜1へ広げると、暗部から明部までの差が大きくなります。

一方、shot内で非常に明るいobjectが出入りすると、そのframeごとに最暗・最明値が変わり、画面全体のbrightnessが跳ねることがあります。連続shotのlookを固定する用途では、この自動追従を前提に使います。

## 似たNodeとの違い

- **Auto Gain** — frame内の実値を見て自動でrangeを伸縮
- **Brightness Contrast** — Gain / Lift / Gamma等を手動で固定
- **Color Corrector** — tone range別の総合補正

## 数値で見るRangeの動作

Rangeの**Low**と**High**は、入力のどの明るさを選択するかではなく、**出力側の最暗値と最明値**を指定します。Auto Gainは入力画像の暗い値をLowへ、明るい値をHighへ合わせ、間の値も均等に伸縮します。

例えばDaVinci Resolve 21.1の公式マニュアルでは、RGB 0.2〜0.8のグラデーションに**Low = 0.0、High = 0.5**を指定する例が掲載されています。

| 入力の灰色値 | 出力の灰色値 |
| ---: | ---: |
| 0.2（最暗部） | 0.0 |
| 0.5（中間） | 0.25 |
| 0.8（最明部） | 0.5 |

中間の0.5→0.25は、均等に値域を伸縮する説明から計算した値です。灰色の値を一次変換するものとして考えると、次の関係になります。

~~~text
出力値 = Low + (入力値 - 入力最小値) / (入力最大値 - 入力最小値)
              × (High - Low)
~~~

これは**値域の動きを説明するための式**です。内部でRGBチャンネルをどのように解析するか、入力の最小値と最大値が同じ場合にどう処理するかまでは、公式マニュアルの当該節だけでは確定できません。

## 実際に確認する手順

### 例1：グラデーションで動作を確かめる

1. Backgroundで、左端が暗い灰色（RGB 0.2）、右端が明るい灰色（RGB 0.8）の水平グラデーションを作ります。
2. Backgroundの後ろにAuto Gainを接続します。
3. RangeのLowを0.0、Highを0.5に設定します。
4. Viewerで入力と出力を比較します。最暗部は0.0、最明部は0.5になり、中間の明るさも同じ割合で再配置されます。
5. Highを1.0に変更すると、同じ入力の明暗がさらに広い値域へ引き伸ばされます。

単純なグラデーションなら、出力の変化が素材の内容によるものか、Rangeの設定によるものかを切り分けて確認できます。

### 例2：動く映像での意図しない明るさ変化を調べる

暗い背景に明るい物体があるショットを想定します。明るい物体が画面から消えると、それまで暗かった背景の一部が、残った画像の中での「最も明るい部分」になります。Auto Gainはその新しい最明値をHighへ合わせるため、**背景全体が突然明るくなる**場合があります。

1. MediaIn → Auto Gainの順に接続します。
2. 明るい物体が映っているフレームと、画面から出たフレームを比較します。
3. Auto Gainの有効・無効を切り替え、背景部分の明るさの変化を確認します。
4. 明るさを一定に保ちたい場合は、固定したパラメータで補正するNodeへ切り替えることを検討します。

Auto Gainはフレームごとに入力の値域を参照するため、**同じ画素値でも、そのフレームの最暗値・最明値が変われば出力値が変わり得ます**。キーフレームを設定していなくても発生する変化です。

## Effect Maskの注意点

Effect Maskは、処理した結果を画像のどこへ適用するかを制限します。公式マニュアルは、**MaskがNodeの処理後に適用される**と説明しています。

そのため、青い入力へMaskをつないだからといって「Mask内の画素だけから最暗値・最明値を計測する」機能だとは考えないでください。領域を指定して基準値を分析したい場合は、Maskの有無で計算対象そのものが変わると仮定せず、実際の出力を確認してください。

## Do Zを使うときの注意

Z（Depth）チャンネルは、画像の色ではなく奥行きの値を持つ情報です。Do Zを有効にすると、その値域にもAuto Gainを適用できます。

これはZパス同士の値域を合わせたり、floatの奥行きデータの分布を確認したりする用途に使えます。ただし、変換後のZ値は**もとの奥行きの数値そのものではありません**。

公式マニュアルでは、近い物体や遠い物体がフレームに出入りすると、Do Zの自動調整によって残っている物体のZ値も前後へ変わり得ると注意されています。後続の奥行き合成で正確な距離や時間的に安定した深度が必要な場合、安易にそのまま使わないでください。

## 他の機能との使い分け

- [Brightness Contrast](./brightness-contrast.md)：Brightness、Gain、Contrast、Gammaなどを固定の値で調整したい場合。
- [Color Corrector](./color-corrector.md)：色と明るさをまとめて、複数の設定項目から補正したい場合。
- [Color Curves](./color-curves.md)：明暗の変換をカーブの形で自分で設計したい場合。
- **ViewerのView Normalized Image**：float画像の値域を*表示上だけで*確認したい場合。公式マニュアルでも、単にfloat画像を見やすくする目的なら、通常はこちらが適するとされています。

Auto Gainでは実際のImageの値が変わります。HDR/float素材を扱う合成で、データが持つ元の明るさや距離を保持したい場合は、プレビュー用の正規化と素材そのものの補正を区別してください。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 93 pp.2149–2150で、Input / Effect Mask、Do Z、Range、時間変化時の注意を確認しました。実機default値、RGB各チャンネルの最小・最大値の具体的算出方法、特殊値に対する処理、performanceは未確認です。
