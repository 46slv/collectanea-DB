---
title: pImage Emitter
description: 画像のピクセルを粒子の発生位置と色に変換するノード。入力、透明部分の除外、時間変化、3D配置を解説する。
doc_type: node
term_id: pimageemitter
term_short: 2D画像のピクセル位置・色を使い、格子状に粒子を生成する。
verification: partial
aliases: [pImage Emitter, pImageEmitter, pIE]
concepts: [particle-data, image-data, alpha, depth]
nodes: [pImage Emitter]
node_family: particles
controls: [X Density, Y Density, Alpha Threshold, Lock Particle Color to Initial Frame, Create Particles Every Frame, Pivot XYZ, Use Z Channel for Particle Z]
inputs: [image, region]
outputs: [particle]
tasks: [particles, image-to-particles, pixel-particles]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pImage Emitter

pImage Emitterは、2D <Term id="image">Image</Term>の各ピクセルを、格子状に発生する<Term id="particle-data">Particle</Term>（粒子）の位置と色に利用するノードです。通常の[pEmitter](./p-emitter)が指定した領域に粒子を発生させるのに対し、pImage Emitterでは**元画像のピクセル配置が出発点**になります。ロゴを粒子へ分解する表現や、動画を粒子の格子で表示する表現に向きます。

Particleは画像ではなく、位置・速度・色・寿命などを保持するデータです。基本は[パーティクル（Particle）](../../learn/02-data/particle)を参照してください。

## 入力と出力

**オレンジ色の主入力には2D Imageを接続します。** 多くのParticleノードでは同じ色の入力がParticle setを受け取りますが、pImage Emitterは例外です。21.1 Reference Manualは入力を次のように区別しています。

- **Input（主画像）**：粒子化したい2D画像。各ピクセルの位置と色を、粒子が発生する位置・色に使います。MediaInやBackgroundなどを接続します。
- **Style Bitmap Input（粒子の見た目用画像）**：StyleをBitmapにする場合に、粒子自体の画像として使う別の2D画像入力。主画像の「どこに粒子を置くか」という情報とは別です。画像は大量に複製されるため、Manualは256×256ピクセル程度の小さな正方形を例示しています。
- **Region（任意）**：RegionタブでBitmapまたはMeshを選ぶと、粒子を発生させる範囲を指定する2D画像または3D Mesh入力が現れます。既定のAllなら外部Regionは必要ありません。

たとえば、ロゴのピクセル位置に小さな丸を並べるなら、**主入力へロゴ画像**、必要に応じて**Style Bitmap Inputへ小さな丸画像**を渡します。どこから発生させるかと、一粒をどう表示するかを混同しないでください。

**出力はParticle set**です。[pDirectionalForce](./pdirectionalforce)や[pTurbulence](./pturbulence)で動きを加え、[pRender](./p-render)で2D Imageまたは3D側の出力へ変換します。

~~~text
MediaIn（元画像） → pImage Emitter → pRender（2D） → Merge
                     粒子を生成       画像に変換     映像に合成

別の小さな画像 → Style Bitmap Input（Bitmap Styleの場合）
~~~

pRenderの出力は既定で3Dです。通常のMergeへ接続して映像に合成したい場合、pRenderを2D出力へ切り替えます。

## 主な設定

### X Density / Y Density：粒子をどの密度で作るか

横方向と縦方向のピクセルに対するサンプル密度です。21.1 Manualでは**1.0を各軸で1ピクセルにつき1サンプル**と説明しています。小さくすると粗い点描、大きくすると同じピクセルから複数粒子が生成されます。高解像度画像で密度を増やすと、粒子数と計算負荷が増えるため、まず密度を下げて確認します。

### Alpha Threshold：透明なピクセルを除く

元画像のAlpha（不透明度）がしきい値未満のピクセルを、発生対象から外します。

**既定の0.0では、完全透明のピクセルからも粒子が生成されます。** 表示されなくても負荷の原因になるため、透過ロゴの広い余白などでは重要です。Manualは完全透明のピクセルを除く目安として**1/255（約0.004）**を挙げています。

値を大きくすると半透明の輪郭まで除外されます。輪郭を残したい場合は小さな値から調整します。黒いRGBピクセルでもAlphaが不透明なら除外されないため、元画像側でAlphaを用意してください。

### Lock Particle Color to Initial Frame：生まれた時の色を保持する

有効なら、粒子は発生したフレームの色を保持します。無効なら、元画像が動画のように時間変化すると、粒子の色も入力画像の色へ更新されます。これは**既存の粒子の色**に関する設定で、新しい粒子を毎フレーム発生させる設定とは異なります。

### Create Particles Every Frame：初回だけ作るか、毎フレーム追加するか

無効の場合、初回に**1組の粒子**を生成します。生成後にEmitterの初速・角度などをアニメーションしても、すでに生まれた粒子の初期状態は書き換わりません。

有効にすると、**毎フレーム新しい粒子群を追加**します。動画から連続的に粒子を放出できますが、粒子数が増えるためDensityとLifespan（寿命）の調整が必要です。

- **動画を同じ粒子の格子で再生**：Create Particles Every Frameは無効、Lock Particle Color to Initial Frameも無効にします。
- **動画から粒子を次々に発生**：Create Particles Every Frameを有効にします。色だけ更新する場合にこの設定は不要です。

### X / Y / Z Pivot：格子の位置

発生する格子の配置を調整します。Manualによると、粒子はPivotを中心とする**一定サイズのXY平面**に並びます。Densityはサンプルの密度を変えますが、格子全体の大きさを変えるものではありません。

3D空間で格子全体を拡大縮小する場合、Manualは**pRenderの後段にTransform 3Dを置く**方法を案内しています。その場合はpRenderを3D出力にします。

### Use Z Channel for Particle Z：画像の奥行きを使う

元画像にZ深度チャンネルがあれば、その値を粒子の初期Z位置に使えます。XY平面に並ぶだけの粒子に奥行きの差を持たせ、3Dカメラで確認する用途に向きます。

普通のRGB画像から正しい奥行きを自動推定する機能ではありません。Zチャンネルを含む素材が必要で、深度の解釈や表示結果は実機で確認してください。

## 具体的な運用例

### 透過ロゴを粒子へ変えて散らす

透明背景のロゴ画像をMediaInから入力します。Alpha Thresholdを0より少し上げ、ロゴ外側の透明な部分から見えない粒子が発生するのを抑えます。X/Y Densityで粒子の間隔を決め、後段にForceを追加して粒を動かします。

~~~text
MediaIn（透過ロゴ）
  → pImage Emitter（Alpha Threshold / Density）
  → pDirectionalForce または pTurbulence
  → pRender（2D）
  → Merge（背景映像と合成）
~~~

最初はForceを接続しない状態でロゴの形が粒子化されているか確認し、次にForceを加えると、発生位置と動きの問題を分けて調整できます。

### 動画を粒子のモザイクとして表示する

動画を主入力に接続し、X/Y Densityで粒子の粗さを決めます。**Create Particles Every Frameは無効**、**Lock Particle Color to Initial Frameも無効**にします。

初回に生まれた格子上の粒子が、動画のフレームに合わせて色を更新します。毎フレーム粒子を増やす必要はありません。粒子自体を小さな画像として表示したい場合はStyle Bitmap Inputを併用します。

### Z深度付き画像から3Dの粒子群を作る

Zチャンネルを含む2D Imageを主入力に接続し、Use Z Channel for Particle Zを有効にします。pRenderを3D出力へ切り替えれば、粒子を3Dシーン側へ渡せます。格子の位置や大きさを変更したい場合はTransform 3Dを後段へ置きます。

~~~text
Zチャンネル付き2D画像
  → pImage Emitter（Use Z Channel for Particle Z）
  → pRender（3D）
  → Transform 3D（必要に応じて）
  → Renderer 3D
  → 2D Image
~~~

通常の2D画像を接続しただけで立体にはなりません。Z情報があること、pRenderの出力モード、Renderer 3Dまでの接続を順に確認してください。実機レンダリングの結果は本記事で未確認です。

## よくある問題と確認順

**透過画像なのに重い**：Alpha Thresholdが既定の0.0になっていないか確認します。透明ピクセルも粒子になるため、しきい値、入力画像の解像度、Densityを順に調整します。

**動画なのに粒子の色が変わらない**：Lock Particle Color to Initial Frameを確認します。色だけを更新する場合、Create Particles Every Frameを有効にする必要はありません。

**Emitterの値をアニメーションしても既存の粒子が変わらない**：VelocityなどのEmitter設定は基本的に発生時の初期状態です。既存粒子の動きを変えたい場合は後段のForceやBehaviorを使います。

**通常のMergeへ直接つながらない**：出力がParticle setだからです。[pRender](./p-render)で2D Imageへ変換してからMergeへ渡します。

## 関連ノードと使い分け

- [pEmitter](./p-emitter)：指定したRegionへ粒子を発生させ、数・寿命・初速などを組み立てる基本Emitterです。
- **pImage Emitter**：画像ピクセルの位置・色を、粒子の規則的な格子の発生に使います。
- [pDirectionalForce](./pdirectionalforce)／[pTurbulence](./pturbulence)：粒子を発生させた後、その動きを変えます。
- [pRender](./p-render)：Particle setを2D Imageまたは3D側の出力へ変換します。

Lifespan、Velocity、Style、Region、Setsなどの共通設定は[pEmitter](./p-emitter)、ほかのParticleノードは[Particleノード一覧](./index.md)を参照してください。

## バージョンと確認範囲

**出典**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 114「Particle Nodes」、**pp.2672–2674**。主画像・Style Bitmap Input・Regionの各入力、X/Y Density、Alpha Threshold、Lock Particle Color to Initial Frame、Create Particles Every Frame、Pivot、Zチャンネル利用、透明ピクセルの計算負荷を確認しました。共通設定は同章のpEmitter、2D/3D出力はpRenderの節に基づきます。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)。

ロゴ分解、動画モザイク、Z深度配置はManualで確認した仕様を組み合わせた制作例です。21.1実機の最終表示、内部REGID、端子の詳細表示、全Controlの初期値・範囲、Edition差は未検証のため、verificationはpartialのままとしています。
