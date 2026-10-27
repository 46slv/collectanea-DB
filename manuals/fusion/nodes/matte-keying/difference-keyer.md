---
title: Difference Keyer
description: 人物入り映像と背景だけの映像を比較してアルファを作る。撮影条件のずれとマット調整の限界も解説する。
doc_type: node
term_id: difference-keyer
term_short: "Difference Keyerは、人物入り映像と背景だけの画像との差を使ってマットを作るノード。"
verification: partial
aliases: [Difference Keyer, DFK]
concepts: [image-data, alpha, premultiplication]
nodes: [Difference Keyer]
node_family: matte-keying
controls: [Threshold, Filter, Num Passes, Blur, Clipping Mode, Contract/Expand, Gamma, Invert, Post-Multiply Image]
inputs: [image, image, mask, mask, mask]
outputs: [image]
tasks: [create-matte, difference-key, clean-plate]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-27"
---

# Difference Keyer

Difference Keyerは、**被写体が写っている映像と、同じ場所を被写体なしで撮った背景画像の差**を調べ、被写体を残すためのアルファ（透明度）を作るノードです。背景と変わらない画素を透明に、違いの大きい画素を不透明に近づけます。

ブルー・グリーンスクリーンを使わない撮影でも試せます。ただし、背景の模様や照明、カメラ位置が少し変わっただけでも差として検出されるため、**最終的な切り抜きより、後段で整えるための粗いマットを作る用途**が中心です。

## 役割と出力

入力するのは比較用の**2枚の2D Image**です。Difference Keyerは画素の色を単独で判定せず、背景だけの画像との差をThresholdで透明度へ変換します。出力は生成されたアルファを含む2D Imageで、後段の[Matte Control](./matte-control)で整えたり、[Merge](../compositing/merge)で別背景へ合成したりできます。

マットの白は不透明、黒は透明、灰色は半透明です。**マットが白黒に見えることと、髪や輪郭が自然に合成できることは別**なので、最後は実際の合成背景上でも確認します。

## 入力

| 入力 | 接続するもの | 役割 |
| --- | --- | --- |
| **Background（オレンジ）** | 被写体がいない背景の2D Image | 差を測る基準になる画像。 |
| **Foreground（緑）** | 被写体が写った2D Image | 背景との違いから残す領域を判定する画像。 |
| **Garbage Matte（灰色）** | Mask | 指定した領域を透明にし、不要な物体を除外する。 |
| **Solid Matte（白）** | Mask | 指定した領域を不透明にし、必要な部分を保護する。 |
| **Effect Mask（青、任意）** | Mask | このノードの処理結果を適用する範囲を限定する。 |

**BackgroundとForegroundを逆にしない**ことが出発点です。また、Garbage Matteは「マスク内を透明にする」入力で、Effect Maskは「処理結果を適用する領域を指定する」入力です。領域を絞る目的でも働きが異なります。

公式21.1 Manualには「four inputs」と記した直後に、この5種類の入力が列挙されています。ここでは各入力の記述に従い、実機で表示される正確な端子数は未確認とします。

## 主な設定項目

### Threshold：どの程度の差を残すか

**Threshold**は2つのハンドルで差の下限と上限を指定します。

- **下限より小さい差**：黒（透明）。
- **上限より大きい差**：白（不透明）。
- **下限と上限の間**：灰色（半透明）。

壁の細かい模様がまだ白っぽく残る場合は、背景に生じた小さな差がマットに入っていないか確認します。Thresholdで細かな差を除けても、**背景全体の位置ずれを修正する機能ではありません**。必要な被写体まで黒くなる場合は、先に2枚の位置・明るさを点検します。

### FilterとBlur：マットの境界を整える

**Blur**を0にすると硬い境界になり、増やすとマットが柔らかくなります。**Filter**では、ぼかしの計算法を選びます。

| Filter | 主な特徴 |
| --- | --- |
| **Box** | 速いが品質は控えめ。少量のぼかし向け。 |
| **Bartlett** | 速度と品質の中間。Pyramidフィルターとも呼ばれる。 |
| **Multi-box** | Num Passesで反復回数を指定。1回でBox、2回でBartlettに相当し、4回以上ではGaussianに近い品質を比較的軽く得やすい。 |
| **Gaussian** | 滑らかな結果を得やすい一方、ほかの方式より遅く、浮動小数点画像ではごくわずかなリンギングが出る場合がある。 |

ぼかし過ぎると背景が被写体側へにじむため、マットをAlpha表示で確認してから合成結果を見比べます。

### Clipping Mode：画像の端をどう扱うか

上流画像のDoD（データがある領域）がフレーム全体より狭い場合、BlurがDoDの外側をどう参照するかで端の結果が変わります。

- **Frame**：フレーム全体を処理領域にし、上流DoDの外側を黒／透明として扱う。Manual記載の既定値。
- **Domain**：上流のDoDを尊重する。大きなBlurで境界が切れる場合がある。
- **None**：元画像のクリッピングを行わず、必要な画像領域のうち上流DoD外を黒／透明として扱う。

フレーム端や切り抜き境界に不自然な直線が出るときは、Blur量だけでなくClipping Modeと上流のDoDを確認します。

### Contract/ExpandとGamma：半透明部分を調整する

**Contract/Expand**は正の値でマットを広げ、負の値で縮めます。ただし、**作用するのは半透明の領域だけ**です。完全に硬い白黒境界には効かないため、必要ならBlurで半透明の境界を作ってから調整します。

**Gamma**は灰色のマットを調整します。値を上げると不透明側へ、下げると透明側へ近づき、完全な白や黒は変わりません。

**Invert**は生成したマットの白と黒を反転します。Solid MatteとGarbage Matteにも、接続したマスクを合成する前に反転する設定があります。どの段階を反転しているかを区別します。

### Post-Multiply Image：合成前のRGBとアルファ

**Post-Multiply Image**は、生成したアルファをRGBへ乗算する設定です。21.1 Manualでは既定で有効になっています。

無効にした画像はプリマルチプライ済みとして扱えないため、後段のMerge方式にも注意が必要です。Manualは無効時に、Mergeの**AdditiveではなくSubtractive**を使うよう説明しています。通常の合成では既定値を保ち、変更するときだけ[プリマルチプライの説明](../../learn/04-compositing/premultiplication)とMerge設定をあわせて確認します。

## 最小構成

固定カメラで撮った2枚を比較する、最小のノード構成です。

    背景のみの映像 ─────→ Difference Keyer（Background）
                              │
    人物入りの映像 ─────→ Difference Keyer（Foreground）
                              │
                              ↓
                         Matte Control → Merge（Foreground） → MediaOut
    合成先の背景 ─────────────────────→ Merge（Background）

Matte Controlは追加の調整が不要なら省けます。B-SplineなどのマスクをEffect Maskへつないで処理範囲を絞ったり、不要な領域をGarbage Matteへ渡したりする構成も取れます。

## 運用例：固定カメラの人物を別背景へ合成する

壁の前で話す人物を、同じ画角で撮った空の壁と比較する例です。

1. **背景画像を用意する**：人物のいない壁を撮り、カメラの位置・画角・ピント・照明が人物入りの映像とできるだけ一致しているか確認します。背景の撮影条件のずれがマットに出るためです。
2. **2枚を別入力へ接続する**：空の壁をBackground、人物入りの映像をForegroundへつなぎ、Difference Keyerの出力をViewerで確認します。
3. **Thresholdを調整する**：人物の胴体が白、壁が黒に近づくよう下限と上限を動かします。髪の毛や服の縁は、硬い白黒だけにしようとせず灰色の残り方も見ます。
4. **不要な場所を限定する**：壁の外側や画面端に差が出る場合は、B-Splineなどで範囲を指定します。Garbage Matteを使うなら**消したい領域がマスク内**になるよう作ります。Effect Maskなら適用したい範囲を指定します。
5. **マットを仕上げる**：Blurで輪郭を少し柔らかくし、必要な場合だけContract/ExpandとGammaを調整します。残したい服の部分が欠ける場合はSolid Matteで保護します。
6. **合成背景上で確認する**：Matte ControlとMergeを通して別背景へ重ね、輪郭の二重像、壁の模様の残り、RGBとアルファの境界を見ます。

この手順はManualにあるDifference Keyerの機能とB-Splineを使う例から組み立てた**構成案**です。特定の素材で実際に成功した検証結果ではありません。

## 背景参照のずれを切り分ける最小比較

Difference Keyerで背景まで白く残るときは、Thresholdを強くする前に、比較する2枚が同じ位置の画素を表しているか確かめます。閾値で小さな色差を消せても、カメラの動きや照明変化そのものは補正できません。

### 1. 同じ背景画像を両入力に接続する

まず人物のいない背景画像を分岐し、**同じフレーム**をBackgroundとForegroundの両方に接続します。Garbage Matte、Solid Matte、Effect Maskはいったん外し、Invertも無効にして、ViewerをAlpha表示へ切り替えます。

    背景だけのImage ─┬→ Difference Keyer（Background）
                      └→ Difference Keyer（Foreground）
                                      ↓
                                 Alpha表示

両入力の画素が一致するなら差は理論上ゼロで、Alphaはほぼ黒になるはずです。ここで白い部分が残る場合は、被写体を含む撮影素材の問題と決めつけず、入力の接続、参照フレーム、上流のTransformやColor処理、ThresholdとInvertの状態を調べます。この結果は手順上の予測であり、21.1実機での出力測定ではありません。

### 2. Foregroundだけ人物入り映像へ戻す

次に、Backgroundを固定したままForegroundだけ人物入り素材へ戻します。人物だけでなく空の壁も灰色や白になるなら、人物の輪郭処理より先に2枚の画角・位置・照明・時間の一致を見直します。

例えば固定カメラの廊下でも、背景だけを撮ったときに点灯していた照明が人物撮影時に消えていれば、壁そのものが「差」として検出されます。Thresholdを広げると壁を消せる場合もありますが、人物の暗い服まで失うなら、背景参照の撮り直しや補正を検討する方が適切です。

### 3. 参照が合ってからマットを調整する

背景の残りと人物の欠けを分けて確認した後で、Threshold、Blur、Solid / Garbage Matteを順に調整し、最後にMergeした画像を見ます。同じ背景画像を両入力へつなぐ試験は**入力と設定を切り分けるための基準**であり、実際の人物入り映像のキーイング品質を保証しません。

この比較手順は、21.1 Manual Chapter 109で説明された「2枚のImageの差からマットを作る」働きと既存のControlから組み立てた確認案です。フレーム差・照明変化を含む実写比較、具体的なAlpha値、性能は未検証です。

## うまく抜けないとき

| 症状 | 確認すること |
| --- | --- |
| 壁や床の模様まで白く残る | 2枚のカメラ位置・画角・照明が合っているか。Thresholdだけで位置ずれは直せない。 |
| 人物の一部まで透明になる | BackgroundとForegroundの接続、Threshold、Solid Matteを確認する。 |
| 周囲の不要物も残る | Garbage Matteで不要な領域を透明にするか、Effect Maskで処理範囲を限定する。 |
| 髪や細い輪郭が硬い | 少量のBlurで半透明境界を作り、GammaやContract/Expandを調整する。 |
| Blurで端が切れる | Clipping Modeと上流DoDを確認する。 |
| 合成後の縁の明るさが不自然 | Post-Multiply ImageとMergeの合成方式を確認する。 |

Difference Keyerの背景比較は、煙・透明物・反射・動く影・カメラ移動などで差が背景そのものにも生じると不安定になります。21.1 Manualも、レンガ壁の前の煙を背景画像との差だけで綺麗に切り出す難しさを例示しています。こうした素材では、Difference Keyerを**補助マットの作成**に使い、別手法と組み合わせます。

## 似たノードとの選び分け

- [Chroma Keyer](./chroma-keyer)：**選んだ色域**を透明にしたいとき。空の背景画像は不要です。
- [Luma Keyer](./luma-keyer)：**明るさや特定の色チャンネル**からアルファを作りたいとき。
- [Delta Keyer](./delta-keyer)：ブルー・グリーンスクリーンを専用のキーイング処理で抜きたいとき。
- [Clean Plate](./clean-plate)：スクリーン色のむらを補う**Delta Keyer向けの参照画像**を作りたいとき。Difference Keyerへ必要な「被写体なしの背景撮影」と同じ工程ではありません。
- [Matte Control](./matte-control)：作成済みマットをほかの画像のアルファへ合成したり、境界を追加調整したいとき。

## バージョンと検証状況

出典：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 109「Matte Nodes」、**pp.2527–2530**。背景比較の目的と制約、各入力の用途、Threshold、Filter、Blur、Clipping Mode、Contract/Expand、Gamma、Invert、Post-Multiply ImageについてManual本文と照合しました。公式資料の公開元は[Blackmagic Designサポート](https://www.blackmagicdesign.com/support)です。

背景撮影から合成までの具体的な手順は説明用の構成案です。Resolve/Fusion 21.1実機での端子数・内部REGID・既定値の全数値・レンダー結果・処理性能・Free/Studio差は確認していないため、`verification: partial`を維持します。
