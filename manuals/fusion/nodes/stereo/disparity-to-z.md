---
title: "Disparity To Z"
description: "左右眼画像の視差チャンネルからZ深度を計算し、被写界深度やフォグなどに利用できる画像へ変換するNode。"
doc_type: node
term_id: "disparity-to-z"
term_short: "Disparity To Zは、視差付きステレオ画像と必要に応じてカメラ情報を受け取り、Z深度チャンネルを計算するNode。"
verification: partial
aliases: ["Disparity To Z", "D2Z"]
concepts: ["image-data"]
nodes: ["Disparity To Z"]
node_family: "stereo"
controls: ["Output Z to RGB", "Refine Z", "HiQ Only", "Strength", "Radius", "Stack Mode", "Swap Eyes", "Foreground Disparity", "Background Disparity", "Foreground Depth", "Background Depth", "Falloff"]
inputs: ["image", "classic-3d"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Disparity To Z

Disparity To Z [D2Z]は、左右のカメラで撮った画像の**視差（同じ被写体が左右の画像でどれだけずれているか）から、カメラに対する奥行き情報を計算する**Nodeです。計算結果を元の画像の**Z深度チャンネル**へ加えます。画像を立体物に変えるNodeではありません。

たとえば、[Disparity](./disparity.md)で人物と背景の視差を調べ、その結果をDisparity To Zへ渡すと、人物と背景で異なるZ値を持つ画像を作れます。後段で被写界深度（DoF）のぼけや距離に応じたフォグを作るときに利用できます。

**DaVinci Resolve Studio／Fusion Studio限定**です。無料版で利用できる前提の手順ではありません。

## 何が変わるのか

視差とZ深度は、似ていても別の情報です。

- **視差**：左眼・右眼の画像で対応する点がどれだけ離れているか。画素の位置差から求めます。
- **Z深度**：カメラから見た前後方向の位置を表す値。Fusionでは画像の補助チャンネルに保持できます。

視差だけでは、被写体までの距離が一意に決まるわけではありません。カメラの焦点距離や左右カメラの間隔なども関係するためです。Disparity To Zは、**接続したステレオカメラを使う方法**と、**手動で近景・遠景の対応を決める方法**を用意しています。

後者のArtistic Modeで得られるZは、実際の撮影距離を測定した値ではなく、エフェクトへ渡すために指定した奥行きです。どちらの方法でも、ZはRGBAとは別の補助チャンネルに書き込めます。

## 入力

| 端子 | データ | 接続するもの |
| --- | --- | --- |
| **Left Input**（オレンジ） | 2D Image | 左眼の視差付き画像。または左右を1枚にまとめた視差付き画像。 |
| **Right Input**（緑） | 2D Image | 右眼の視差付き画像。**Stack Mode: Separate**の場合だけ表示されます。 |
| **Stereo Camera**（マゼンタ） | ステレオCamera 3D | カメラ情報からZを再構成する場合に接続します。Artistic Modeでは必須ではありません。 |

画像入力は、元の色だけでなく**Disparity補助チャンネル**を持つ必要があります。通常のカラー画像を接続するだけでは、左右の対応点をこのNodeが新たに計算するわけではありません。まず[Disparity](./disparity.md)などで視差を用意します。通常の2D画像データの説明は[画像（Image）](../../learn/02-data/image.md)も参照してください。

カメラ入力には、左右眼間隔を持つ1つのStereo Camera 3D、またはCamera 3DのStereo > Right Camera入力で関連付けた左右のCamera 3Dを使えます。カメラを接続するだけで自動的に実写と一致するわけではなく、撮影時のカメラ設定と対応していることが前提です。

## 出力

| 端子 | データ | 内容 |
| --- | --- | --- |
| **Left Output** | 2D Image＋Z深度チャンネル | 左眼画像、または左右をまとめた画像に、計算したZ深度を追加します。 |
| **Right Output** | 2D Image＋Z深度チャンネル | 右眼画像にZ深度を追加します。**Stack Mode: Separate**の場合だけ表示されます。 |

画像の色をZ値で直接塗り替えるのが標準の動作ではありません。色と深度を同じ画像データ内で別々に保持します。Zを色のチャンネルとして確認・加工したい場合は、後述の**Output Z to RGB**を使います。

**Manualの記述上の注意**：21.1 ManualのLeft Output説明には、Stack Modeの場合に「新しいdisparity channel」を持つとあります。一方、このNodeのIntroductionとBasic Node Setupでは「新しいZ channel」を作ると明記されています。両者は整合しないため、Stack Modeでの補助チャンネルの詳細挙動は実機確認が必要です。本記事はZ生成という主要な役割と、Separateでの出力説明を基準にしています。

## Controlsタブ

### Output Z to RGB：Z値をカラー画像として扱う

有効にすると、計算されたZ値を補助チャンネルだけでなくRGBへ複写します。Manualではカラーを32-bit floatにし、概念上は**R=Z、G=Z、B=Z、A=1**で出力すると説明されています。Zを通常の画像処理Nodeで加工したい場合や、値を手早く確認したい場合に使います。

ただし、**Z値はそのまま表示しやすい0～1のグレースケールではありません**。21.1 Manualはカメラから遠いほどZ値が負方向へ大きくなると説明しています。黒く見えたからといってZが計算できていないとは限りません。Viewerで値の範囲を確認するときは、右クリックから **Options > Show Full Color Range** を使います。表示用に明暗を整える処理と、実際のZ値を保持する処理は区別してください。

### Refine Z：カラー画像の輪郭を使って深度を調整する

**Refine Z**のEnableを有効にすると、RGB画像の情報を利用してZの境界を調整します。人物と背景の境目が深度画像で不自然に広がる場合、色の輪郭へ近づけられることがあります。

| 設定 | 役割 |
| --- | --- |
| **HiQ Only** | High Qualityレンダリング時だけRefine Zを処理します。 |
| **Strength** | 深度を滑らかにしつつ、Zの境界をRGBの輪郭へ合わせる強さを調整します。 |
| **Radius** | 深度を滑らかにする処理の半径です。 |

強くかければ必ず正確になるわけではありません。髪の細かな色変化や服の模様まで深度に反映され、実際には同じ距離の部分に不要な凹凸が現れる場合があります。被写界深度やフォグの結果を見ながら、輪郭の改善と模様の混入を比較します。

### Stack Mode／Swap Eyes：左右画像の受け取り方

**Stack Mode**は、左右眼の画像を別々に接続するか、1枚に並べた画像として受け取るかを指定します。**Separate**ではRight InputとRight Outputが表示されます。別々の左右素材を扱う例ではSeparateが分かりやすい選択です。

**Swap Eyes**は左右の割り当てを交換します。左右眼が逆になっている場合に使いますが、視差の解析やカメラの校正を代わりに行う機能ではありません。

## Cameraタブ

### External Mode：実際のステレオカメラ情報を使う

Stereo Camera入力に接続したCamera 3Dの構成から、視差とZの関係を計算します。CGのカメラや撮影時にトラッキングしたステレオカメラがあり、**距離に意味のあるZ値**が必要な場合はこちらを使います。

左右カメラの間隔・焦点距離・位置関係が実際の画像と一致していないと、得られたZにも誤差が生じます。External Modeという名前だけで、入力画像の距離が必ず正しく復元されるわけではありません。

### Artistic Mode：カメラがなくてもZの範囲を作る

撮影カメラの情報がないとき、近景と遠景それぞれの**視差と深度の組**を自分で指定し、間の値を補間します。物理的な距離の正確さより、ぼけやフォグの調整に使えるZ画像を得るための方法です。

| 設定 | 役割 |
| --- | --- |
| **Foreground Disparity (Pick from Left Eye)** | 最も手前にしたい物体の視差。左眼画像から値を選び、Foreground Depthへ対応させます。 |
| **Background Disparity (Pick from Left Eye)** | 最も遠くにしたい物体の視差。左眼の値を使います。Manualは右眼では符号が反転すると説明しています。 |
| **Foreground Depth** | Foreground Disparityへ割り当てる近景の深度。入力欄では正の深度値として指定します。 |
| **Background Depth** | Background Disparityへ割り当てる遠景の深度。 |
| **Falloff** | 近景から遠景までの、視差と深度の対応曲線を選びます。 |

**Falloff: Hyperbolic**は、深度がおおむね視差の逆数に関係する曲線で、Manualが通常の推奨として挙げる方式です。**Linear**は視差に対して深度を線形に変え、近景と遠景の特徴を同じ重みで扱う演出向けの方式です。

Foreground Depthの入力欄は正の値ですが、Manualは生成するZチャンネルの値を負方向として説明しています。**入力する深度の符号と、出力Zの符号を混同しない**ようにしてください。

また、指定したForeground DisparityとBackground Disparityの範囲から外れた視差は**端の値に制限（clamp）**されます。その結果、遠い背景や手前の物体が同じZ値で平らになる場合があります。両端の視差は、実際の素材が持つ範囲を含むように選びます。

## 運用例：人物を背景から分けてぼかす

左右眼を別々に撮影した素材を使う例です。

~~~text
左眼画像 ──→ Global Align 左入力
右眼画像 ──→ Global Align 右入力

Global Align 左出力 ──→ Disparity 左入力
Global Align 右出力 ──→ Disparity 右入力

Disparity 左出力（視差付き） ──→ Disparity To Z 左入力
Disparity 右出力（視差付き） ──→ Disparity To Z 右入力
ステレオCamera 3D（任意） ──→ Disparity To Z Stereo Camera入力

Disparity To Z 左／右出力 ──→ Z深度を使う後段の処理
~~~
図は左右の配線を個別に示しています。Global Align、Disparity、Disparity To Zの**Stack ModeをいずれもSeparate**にし、左右を取り違えずに接続します。

1. 同時刻の左右画像を用意し、[Global Align](./global-align.md)で大きな上下・回転差を調整します。
2. [Disparity](./disparity.md)で視差を計算し、左右画像のDisparity補助チャンネルを確認します。
3. Disparity To Zを追加し、左右の視差付き画像を入力します。
4. 対応するStereo Camera 3DがあるならExternal Modeを使います。なければArtistic Modeで人物の視差と背景の視差を選び、近景・遠景の深度を指定します。
5. 出力のZチャンネルを確認し、必要ならRefine Zを調整します。
6. 生成したZを使う後段の深度ぼけやフォグ処理へ渡し、人物の輪郭や背景との境界に不自然な段差がないか確認します。

これは21.1 Manualに記載された機能を組み合わせた**接続手順の例**です。ここで示した画質・深度値を21.1実機で検証したものではありません。

## 注意点

- **遠距離ほど誤差が大きくなりやすい**：Manualは、遠くのZ値が非常に近い視差値へ押し込まれるため、視差マップの小さな誤差が大きなZ誤差になると説明しています。遠景のZを実測距離として過信しないでください。
- **入力に視差が必要**：RGBだけの画像にStereo Cameraをつないでも、Disparityで行う左右の対応点解析の代わりにはなりません。
- **Artisticは演出用**：近景・遠景の対応を手作業で決められますが、実際のメートル距離を再現した証拠にはなりません。
- **Output Z to RGBは表示・加工方法の変更**：補助チャンネルへの出力と区別し、ZをRGBへ複写した画像を通常のカラー映像として扱わないでください。
- **深度の縁に注意**：Refine Zによって輪郭が改善する場合も、色の模様が深度へ移る場合もあります。

## 関連するNode

- [Disparity](./disparity.md)：左右画像からX/Yの視差補助チャンネルを計算します。
- [Global Align](./global-align.md)：視差解析前に画像全体のずれを整えます。
- [Stereo Align](./stereo-align.md)：視差を利用して左右眼の位置関係をさらに補正します。
- [Z To Disparity](./z-to-disparity.md)：Zから視差へ変換する、逆方向のNodeです。
- [Stereo 3Dノード一覧](./index.md)：ステレオ処理の役割を比較できます。

## バージョンと検証状況

**一次資料**：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』、Chapter 118「Stereo Nodes」、**Disparity To Z [D2Z]、pp.2780–2784**。入力3端子、左右出力、Controlsタブ、Cameraタブ、Studio限定、遠景の深度精度に関する注意はこの資料を参照しています。

**verification: partial**：Inspectorの全初期値・許容範囲、REGID、Stack Modeでの補助チャンネルの実際の保持、カメラ入力の型情報、21.1実機でのレンダリングは未確認です。Manual内の出力チャンネル説明に不整合があるため、実機で確認するまでは断定しません。
