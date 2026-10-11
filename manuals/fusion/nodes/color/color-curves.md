---
title: Color Curves
description: FusionのColor CurvesでRGBなどの入力値を曲線で変換する方法。チャンネル編集、Eyedropper、Reference Match、Alphaの注意点を解説。
doc_type: node
term_id: color-curves
term_short: RGBなどの画素値をSplineの曲線に従って変換し、明るさや色の偏りを調整するColor Node。
verification: partial
aliases: [Color Curves, CCv]
concepts: [image-data, color-adjustment, premultiplication]
nodes: [Color Curves]
node_family: color
controls: [Mode, Color Space, Color Channels, Spline Window, In, Out, Eyedropper, Match Reference, Sample Reference, Number of Samples, Match Rectangle, Pre-Divide/Post-Multiply]
inputs: [image, mask, image, mask]
outputs: [image]
tasks: [color-curves, tone-curve, match-reference]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Color Curves

**Color Curves（CCv）は、画像の画素値を曲線に沿って別の値へ変換するFusionノードです。** たとえば「暗い青だけ少し弱める」「中間の明るさを持ち上げる」「参考画像へ色の分布を近づける」といった補正に使います。

曲線は**入力値（In）と出力値（Out）の対応表**です。R・G・Bなどの成分ごとに曲線を編集できるため、画像全体を一律に明るくするよりも、どの値域をどの程度変えるかを細かく指定できます。ここでいうLUTは、画素の入力値に対応する出力値を参照する仕組みであり、必ずしも外部のLUTファイルを読み込む操作を意味しません。

## 入力・出力

```text
MediaIn / Loader ──→ Color Curves ──→ 次のColor Node / Merge / MediaOut
                           ↑   ↑   ↑
                      Effect 参照  Match
                       Mask   Image Mask
```

| 端子 | 接続するもの | 役割 |
| --- | --- | --- |
| **Input（オレンジ・必須）** | 補正したい2D画像 | 曲線を適用する元画像。 |
| **Effect Mask（青・任意）** | Polygon、Rectangleなどのマスク | 補正を**画面のどこに適用するか**制限する。 |
| **Reference Image（緑・任意）** | 色を合わせたい別の2D画像 | Reference Matchで参照する画像。 |
| **Match Mask（白・任意）** | マスク画像 | Reference Matchで**どの部分を比較するか**指定する。 |
| **Output** | 後段の2D画像ノード | 補正結果の2D画像を渡す。 |

**Effect MaskとMatch Maskは別の役割です。** Effect Maskは補正結果を適用する領域を制限し、Match Maskは参照合わせに使う領域を指定します。Reference Matchを使わない通常の曲線補正では、Inputだけを接続すれば動作します。

Effect Maskはノードの処理結果に対して適用されます。マスクを接続しただけで画像のAlpha値そのものを書き換えるわけではありません。詳しくは[マスクの考え方](../../learn/02-data/mask)を参照してください。

## Spline Window：入力値を出力値へ変える

**Spline（スプライン）**は、制御点をつないで作る滑らかな曲線です。Color CurvesのSpline Windowは、横軸が**入力値**、縦軸が**出力値**です。

- **斜め45度の直線**：0を0へ、0.5を0.5へ、1を1へ渡す。値を変えない。
- **中間点を上へ動かす**：その付近の入力値を大きい出力値へ変換する。中間調を明るくできる。
- **中間点を下へ動かす**：その付近の入力値を小さい出力値へ変換する。中間調を暗くできる。
- **複数の点を使う**：暗部だけ下げ、明部を元の値に保つ、といった変換を作れる。

たとえば、あるチャンネルの入力値が**0.50**の位置へ点を置き、出力を**0.60**に変更すると、そのチャンネルの0.50付近の値が明るくなる方向へ変換されます。実際のほかの入力値への影響は、前後の点と曲線の形で決まります。この0.50→0.60は操作の仕組みを示す数値例で、プリセット値ではありません。

制御点を正確に配置したいときは、点を選択して**In / Out**に数値を入力します。曲線はFusionの**Spline Editor**でも編集できます。入力値が**1.0を超える**、または**0.0未満**の画像も扱えるため、HDRや計算途中の画像を「曲線は0～1しか扱えない」と決めつけないでください。ただし、後段のノードや出力先が同じ範囲を保持するかは別途確認が必要です。

## Color Space：何の成分を曲線で動かすか

Controlsタブの**Color Space**で、曲線を編集するときに使う色成分の組み合わせを切り替えます。

| Color Space | 曲線で扱う成分 | 使いどころ |
| --- | --- | --- |
| **RGB**（初期状態） | Red / Green / Blue | 明るさやRGBの色かぶりをチャンネル別に調整する。 |
| **YUV** | Y / U / V | 明るさに対応するYと、色の差分に対応するU・Vを分けて調整する。 |
| **HLS** | Hue / Luminance / Saturation | 色相、明るさ、鮮やかさを別の成分として編集する。 |
| **YIQ** | Y / I / Q | 旧来のNTSC系の表現に基づく成分で編集する。 |
| **CMY** | Cyan / Magenta / Yellow | RGBとは異なるCMY成分から補正する。マニュアルでは非線形方式とされる。 |

これは**Color Curves内部でどの成分に曲線を適用するか**という設定です。納品用の色域やガンマを別規格に変換したい場合は、[Color Space Transform](./color-space-transform)などの役割と混同しないでください。

### Color Channels：曲線の編集対象を選ぶ

**Color Channels（RGBA）**のチェックボックスは、どの曲線を**編集可能にするか**を決めます。チェックを外しても、そのチャンネルに以前作った補正が無効化されるスイッチではありません。

たとえばBlueだけを変更するなら、ほかの曲線の編集チェックを外してから点を動かします。Color SpaceをYUVへ変えると、表示名もY / U / Vへ変わります。複数のチェックを入れた状態では、複数曲線の点を意図せず一緒に動かさないよう注意してください。

## Eyedropper（Pick）：画面の値から点を作る

EyedropperはViewerで選んだ画素値に対応する位置へ、曲線の制御点を作る機能です。

1. 編集したいチャンネルだけをColor Channelsで有効にします。
2. **Eyedropper（Pick）**でViewer上の対象画素を選びます。
3. 有効な曲線に作られた点を上下へ動かし、Viewerで補正結果を見ます。
4. 必要なら**In / Out**で数値を調整します。

Pickで追加された点は三角形で表示され、初期状態では**横方向に動かせません**。これは元の画素値に対応する入力位置を保持し、出力値だけを調整するためです。通常の制御点として動かしたいときは、右クリックメニューの**Locked Pick Points**を解除します。

**例：グレーであるべき壁の色かぶりを取る。** RGBの曲線を使い、元は無彩色のはずの画素をPickします。作成されたR・G・Bの点を同じOut値へ近づけると、その画素のRGB差を小さくできます。マニュアルにはOutを**0.5**へ合わせる例がありますが、実際の補正では必要な明るさも考え、周囲の階調が不自然に変わらないか確認します。これは自動ホワイトバランスではなく、選んだ画素を手掛かりに曲線を手動編集する方法です。

## Mode：静止した曲線とアニメーション

- **No Animation（初期状態）**：ショット内で同じ曲線を使います。
- **Animated**：時間に応じて曲線を変化させます。各チャンネルの変化をSplineで管理できます。
- **Dissolve**：旧方式との互換性のために残っています。21.1マニュアルでは実質的に廃止されたモードと説明されており、新しい作業では通常選びません。

時間によって光源が変わる場合などはAnimatedを使えますが、特定フレームだけでなく前後も確認してください。固定の曲線で十分ならNo Animationの方が管理しやすくなります。

## Reference：別の画像に色の分布を近づける

Reference機能では、別のショットや画像を見本として使い、色の対応を作成できます。曲線を手作業で合わせる方法とは異なり、サンプル値から補正曲線を生成します。

| Control | 役割 |
| --- | --- |
| **Match Reference** | Reference Image（緑）へ接続した画像を基準に、曲線へ制御点を追加する。 |
| **Sample Reference** | 背景画像の**中央の走査線**（横一列の画素）をサンプルし、曲線を作る。画像全域を一様に解析する操作ではない。 |
| **Number of Samples** | Match / Sample時に使用する制御点の数を決める。 |
| **Show Match Rectangle** | Match Referenceで用いる矩形をViewerに表示する。Sample Referenceには適用されない。 |
| **Match Center（X / Y）** | Match Rectangleの中心を移動する。 |
| **Match Width / Match Height** | Match Rectangleの横幅・縦幅を設定する。 |

**Match Mask（白）**を接続すると、矩形より柔軟な形でMatchの対象領域を指定できます。マニュアルの記述では、Show Match Rectangleが影響するのは**Match Reference**だけで、**Sample Referenceは中央走査線**からサンプルします。この2つは同じ「画像全体の自動一致」ボタンではありません。

### 運用例：別カメラのショットを参考画像へ寄せる

1. 補正するショットをColor Curvesの**Input**へ、色を参考にするショットを**Reference Image**へ接続します。
2. Viewerで補正対象と参考画像を見比べます。背景など、両方に存在する比較しやすい部分を選びます。
3. **Show Match Rectangle**を使い、Match Center / Width / Heightで参照する範囲を調整します。複雑な形で指定したい場合はMatch Maskを接続します。
4. **Number of Samples**を設定し、**Match Reference**を実行します。
5. 生成された曲線を確認し、不自然な色変化があれば制御点を修正します。マスクで特定領域だけ補正を見せたい場合は、別途Effect Maskを使います。

この機能は参照画像の色の分布へ近づける補助です。被写体、照明、露出が異なる画像を、物理的に同じ照明条件へ復元する機能ではありません。結果をViewerで比較して仕上げます。

## Alphaを含む素材の注意点

合成用CGやキーイング素材には、RGBにAlpha値を掛けた**premultiplied画像**があります。そのままRGBのカーブ補正をすると、透明度の低い縁で色が不自然になることがあります。

**Pre-Divide/Post-Multiply**を有効にすると、補正前にRGBをAlphaで割り、曲線を適用した後に再びAlphaを掛けます。これはpremultiplied素材を色補正するときのための処理であり、どんな画像でも必ず有効にする設定ではありません。画像のAlpha形式と補正前後を確認してください。仕組みは[プリマルチプライ](../../learn/04-compositing/premultiplication)を参照してください。

## ほかのノードとの使い分け

- [Hue Curves](./hue-curves)：横軸が**色相**。青や赤など、似た色の画素を狙って彩度や色を変える場合に使います。
- [Color Gain](./color-gain)：Lift / Gamma / Gainや、暗部・中間部・明部の色バランスを調整する場合に使います。
- [Color Corrector](./color-corrector)：複数の色補正、Levels、Histogram Matchをまとめて扱いたい場合に使います。
- [White Balance](./white-balance)：基準色や色温度の調整が中心の場合に使います。

## うまく補正できないとき

| 状況 | 確認すること |
| --- | --- |
| 目的以外のチャンネルも変わる | Color Channelsの**編集チェック**を絞ったか。チェックオフは既存の補正の無効化ではない。 |
| Pickした点を左右に動かせない | **Locked Pick Points**を解除するか、Outだけを変更する。 |
| 参考画像との一致が不自然 | Reference Imageの接続、Match Rectangle / Mask、Number of Samplesを見直す。 |
| Sample Referenceで矩形を動かしても変わらない | Sample Referenceは中央走査線を使う。矩形はMatch Reference用。 |
| 半透明部分の縁が不自然 | Alpha形式とPre-Divide/Post-Multiplyを確認する。 |
| HDRの明部が想定と違う | 曲線は0～1の範囲外も扱う。該当値域のSplineと後段処理を確認する。 |

## 出典と確認範囲

**Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（2026年9月版）、Chapter 93「Color Nodes」、**pp.2168–2171「Color Curves [CCv]」**を一次資料として確認しました。入力端子、Color Space、Color Channels、SplineとIn/Out、Pick、Mode、Referenceの各Control、Pre-Divide/Post-Multiply、0～1の範囲外の扱いを参照しています。

0.50→0.60の例、グレーの壁、カメラ間の色合わせは、マニュアルで確認できる機能を組み合わせた説明用の運用例です。内部REGID、曲線補間の厳密な演算式、全パラメータの初期値・範囲、実機の表示結果、Edition差までは確認していないため、`verification: partial`を維持しています。
