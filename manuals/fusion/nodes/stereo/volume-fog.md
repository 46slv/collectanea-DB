---
title: "Volume Fog"
description: "World Position Passを持つ画像へ、3D空間内の位置・密度・照明を指定した霧を合成するFusion Node。"
doc_type: node
term_id: "volume-fog"
term_short: "各画素の3D位置情報を使い、空間内に配置した霧を2D画像へ合成するPosition Node。"
verification: partial
aliases: ["Volume Fog", "VLF"]
concepts: ["image-data"]
nodes: ["Volume Fog"]
node_family: "stereo"
controls: ["Shape", "Size", "Soft Edge", "Samples", "Z Slices", "First Slice Time", "Fog Only", "Do Lighting", "Do In-Scattering"]
inputs: ["image", "mask", "classic-3d"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-10"
---

# Volume Fog

**Volume Fog [VLF]**は、画像の各画素が3D空間のどこにあるかを示す **World Position Pass（WPP）** を使い、その空間に置いた霧を画像へ重ねるNodeです。たとえば、CGの地面付近だけに霧を広げ、奥にある物体ほど霧に包まれるような表現を作れます。

見た目は2D画像へのエフェクトですが、単に画面全体を半透明の白で覆う処理ではありません。カメラから見える画素の3D位置を手がかりに、設定した霧の領域を通る光の経路を複数回調べ、濃さや色を計算します（レイマーチング）。空間内の霧を3Dレンダラーで再描画する代わりに、**既存の2Dレンダーへ後から霧を追加できる**のが特徴です。

公式『DaVinci Resolve 21.1 Reference Manual』では、Volume Fogは **Chapter 115「Position Nodes」** に属します。このサイトでは既存リンクを維持するためStereo 3Dフォルダーに置いていますが、**左右眼の視差を計算するStereo Nodeではありません**。

## 使う前に：World Position Passとは

普通の画像は画素の色を持ちます。WPPはそれに加え、「この画素に映っている面は、3D空間のX・Y・Zのどの位置にあるか」という座標を記録したデータです。霧の位置・大きさを3D空間で決められるのは、画像側にも対応する座標があるためです。

- **必要なデータ**：元の画像と、各画素のXYZ位置。CGレンダーならWorld Position Passを有効にして出力します。
- **座標系**：21.1 Manualが要求するのは**World Space**の位置情報です。Eye SpaceやObject Spaceの値をそのまま混ぜないでください。
- **精度**：座標には負の値や1を大きく超える数値も現れます。Manualは**32-bit float**での保持を求めています。表示用に0～1へ丸めた位置画像では正しい処理になりません。
- **WPPがない場合**：Z深度と一致する3Dカメラがあれば、[Z to World Pos](./z-to-world.md)で位置情報を作れる場合があります。ただし通常のカラー映像だけから、正しいWPPを自動で推定するNodeではありません。

WPPは「奥行きだけを示すZ深度」とも「左右眼の差を示すDisparity」とも異なります。**画像に3D位置が含まれていない状態でVolume Fogをつないでも、空間に沿った霧は正しく配置できません。**

## 入力と出力

21.1 Manual（p.2705）で確認できる入力は次の4種類です。

| 入力端子 | 接続するデータ | 役割 |
| --- | --- | --- |
| **Image**（オレンジ） | WPPのXYZ Positionチャンネルを含む2D画像 | 霧を重ねる元画像。座標値を参照して霧の奥行きや遮蔽を計算します。 |
| **Fog Image**（緑） | 2D画像（Fast Noiseなど） | 霧の内部で濃さや色がどう変わるかを与えます。時間の異なる画像を奥行き方向のスライスとして利用できます。 |
| **Effect Mask**（青） | Polygonなどのマスク | 霧の処理を画面内の指定領域へ制限します。3D空間での霧の形を決めるShapeとは別です。 |
| **Scene Input**（マゼンタ） | Camera 3Dを含む3Dシーン | 霧を見るカメラの位置を合わせ、シーンにあるライトで霧を照明するための情報を渡します。 |

**出力**は、霧の効果が加わった**2D Image**です。通常は元画像へ霧が合成されます。**Fog Only**をオンにすると元画像を表示せず、生成した霧を黒背景上へ出力し、別のMergeやColor Correctorで利用できます。

Scene Inputは常に必須というわけではありません。Manualによると、カメラを接続しない状態やカメラ位置を(0, 0, 0)とした状態でも出力できます。ただし元画像をレンダリングしたカメラと揃えるほど、霧の見え方・位置の精度が向上します。**Lightタブの実際の照明計算には、CameraとLightを含む3Dシーンが必要**です。

## Inspectorの主な設定

### Shape：霧をどこに置くか

**Shape**では霧の領域を球形または直方体として配置します。画面上のマスク形状ではなく、3D空間内で霧が存在する範囲です。

- **Pick**：Viewerの3Dシーン、またはXYZ情報を持つ画像から位置を取得し、霧の中心を決めます。
- **X / Y / Z Offset**：霧の中心を3軸方向へ動かします。アニメーションや他のControlとの接続も可能です。
- **Rotation Pick / X / Y / Z Rotation**：霧の向きを選択・回転します。Rotation PickはXYZ Normal Passなど、向きを表すデータを利用できます。
- **X / Y / Z Scale**：3軸ごとの広がりを変えます。**Size**は全体の大きさです。
- **Soft Edge**：境界から内側へ霧を徐々に薄くし、形の輪郭が急に見えるのを抑えます。

床付近に薄い霧を敷くなら、直方体を選び、Y方向のScaleを小さくして高さを抑えます。霧が空間内のどこに置かれるかはWPPと一致する座標で判断します。

### Color：霧の描写と合成

- **Adaptive Samples / Dither**：複数回の評価結果を混ぜる際の設定です。Ditherは層の境目が目立つ場合にノイズを使ってなじませます。
- **Samples**：霧の内部を何回評価するかです。増やすと内部の細部を拾いやすくなりますが、レンダリング時間も長くなります。
- **Z Slices**：Fog Imageとして渡した画像列を奥行き方向に何枚使うかです。単なるブラー半径ではありません。
- **First Slice Time**：Fog Imageの画像列を読み始めるGlobal Range上のフレームです。**Z Slices**を増やす場合は、素材とGlobal In/Outの有効範囲に注意します。
- **Color**：霧の色。Fog Imageで指定した色にも乗算されます。
- **Gain**：霧の強さ。上げるほど強く見え、透けにくくなります。
- **Subtractive/Additive**：霧を元画像へ足す方向と暗くする方向を調整します。
- **Fog Only**：霧だけを黒背景に出力します。別の合成やマスク処理に使いたいときに有効です。

ManualはFog Imageの出発点として**256×256ピクセルのFast Noise**を挙げています。たとえば256枚のZ Slicesと組み合わせると256×256×256の体積に相当し、フルカラー32-bit floatでは最大約256 MBのデータ量になる例が示されています。これは作業開始時の参考値であり、すべての素材に必要な推奨固定値ではありません。

### Noise：霧の内部のムラ

Noiseタブでは、外部Fog Imageとは別に霧の模様を調整します。

**Detail**は細かい模様の重なり、**Gain**は明るい部分の強さ、**Brightness**は模様全体の明るさを変えます。**Translation**と**Noise Rotation**はノイズ模様の位置・向きです。**Seethe**をアニメーションすると、煙が流れるようにノイズの状態が変化します。

**Discontinuous**は滑らかな変化の代わりに不連続な境界を作り、**Inverted**は模様の明暗を反転します。DiscontinuousとInvertedを併用すると、霧の塊の出方を大きく変えられます。

### Camera：どこから霧を見るか

**Camera**はScene Inputに複数のカメラが含まれる場合に使用するカメラを選びます。**Translation Pick**と**X / Y / Z Offset**では、カメラ位置をViewerから取得したり手動指定したりできます。

カメラが合っていないと、霧の内部をどこからどこまで通過したかという計算がずれます。単に霧の色が違うように見えるだけでなく、奥行きに対する霧のかかり方も不自然になります。

### Light：霧の照明と散乱

Lightタブの照明機能を使うには、実際のLightを含む3DシーンをScene Inputへ接続します。

| 設定 | 何が変わるか |
| --- | --- |
| **Do Lighting** | シーンのライトを使った照明計算を有効にします。CPU処理では時間がかかる場合があります。 |
| **Do In-Scattering** | 霧の内部で光が散乱する計算を切り替えます。Lightingとは別の設定です。 |
| **Light Samples** | 照明の計算精度とレンダリング負荷を調整します。 |
| **Density** | 霧の見た目の濃さを変えます。ManualではScatteringと区別して、光が伝わる間にTransmission色を帯びる効果を説明しています。 |
| **Scattering** | 光が霧の内部から散乱して出ていく割合を変えます。大きくすると霧が濃く見えることがあります。 |
| **Asymmetry** | 散乱の方向性。0なら方向によらず均等、正なら前方、負なら後方へ散乱しやすくなります。 |
| **Transmission** | 霧を通過する光の色を指定します。乗算なので、光源に含まれない色を新たに作る設定ではありません。 |
| **Reflection** | 霧から散乱して出る光の強さ・色を調整します。Fog Imageの色と乗算されます。 |
| **Emission** | 霧自身が光を発するような成分を計算に加えます。 |

まず**Do Lightingをオフ**にして霧の範囲と濃さを決め、それからLightingとIn-Scatteringを順に有効にすると、形と照明のどちらが結果に影響しているかを判断しやすくなります。

### Settings：Position Node共通項目

**Blend**は元画像と処理結果を混ぜます。0.0では通常元画像をそのまま返し、処理を省略します。**Process When Blend Is 0.0**を有効にすると、Blendが0.0でもNodeが評価されます。そのほかRGBAチャンネル選択やEffect Mask反転、Object ID / Material IDによる対象制限などは、ManualのPosition Nodes共通Settings（pp.2719–2720）に説明があります。

## 運用例：CGの地面付近に霧を追加する

CGのレンダリング結果と、**同じカメラ・同じ座標系のWPP**を利用する例です。

~~~text
CGの3Dシーン（Camera 3D + Light + Geometry）
    ├─→ Renderer 3D（World Positionを有効） ──→ Volume Fog / Image（オレンジ）
    └──────────────────────────────────────────→ Volume Fog / Scene Input（マゼンタ）

Fast Noise ────────────────────────────────────→ Volume Fog / Fog Image（緑）
任意のPolygon ─────────────────────────────────→ Volume Fog / Effect Mask（青）

Volume Fog / 2D出力 ──→ MediaOut または後段の合成
~~~

1. **Renderer 3D**でWorld Positionを出力するよう設定します。既存のCGレンダーから読み込む場合も、対応するXYZ Positionチャンネルが保持されているか確認します。
2. 元レンダーをImageに、レンダリングしたCamera 3Dを含むシーンをScene Inputに接続します。照明計算を使うなら、同じシーンにLightも含めます。
3. Shapeで地面を覆う直方体を作り、SizeとScaleで高さを薄くします。PickまたはOffsetで、WPPの座標に合わせて配置します。
4. Fog Imageに低解像度のFast Noiseを接続します。必要に応じてZ SlicesとFirst Slice Timeで奥行き方向の模様を作り、NoiseやGainで濃淡を調整します。
5. Fog Onlyで霧だけを確認した後、通常出力へ戻します。最後にLighting / In-Scatteringを調整し、ライトの位置による見え方の違いを確認します。

これは21.1 Manualに記載された**Renderer 3D＋3Dシーン＋Fast Noise**の基本構成をもとに、運用手順へ組み直したものです。実機での出力確認済み手順という意味ではありません。

## よくある問題と注意点

**霧が画面の関係ない場所にも出る**：WPPを持たない背景は位置が(0, 0, 0)になっている場合があります。その値が霧の中にあると、本来何もない背景にも霧が現れます。Manualは、遠方の座標値を持たせる**背景を覆う球体や箱**をCGシーンへ追加する対処を紹介しています。

**霧が位置に追従しない**：WPPのWorld Space、カメラの位置、レンダリング時の座標系、32-bit floatの保持を確認します。Z深度だけ、あるいはDisparityだけをImageへ渡しても、WPPがあることにはなりません。

**処理が重い**：Samples、Z Slices、Fog Imageの解像度、Light Samplesを一度に上げず、それぞれの効果を確認します。特に照明・散乱の計算は負荷が増えます。

**霧だけ別に補正したい**：Fog Onlyで生成した画像を後段で合成するか、Color Correctorのマスクとして使います。元画像に直接焼き込むより、後段での調整を分離できます。

## 関連Nodeと使い分け

- [Z to World Pos](./z-to-world.md)：Z深度と対応するカメラからWPPを作ります。Volume Fogへ必要な位置情報がない場合の前段候補です。
- [Volume Mask](./volume-mask.md)：WPPを使い、空間に配置した領域から**マスク**を生成します。霧の見た目を直接合成するVolume Fogとは出力目的が異なります。
- [Disparity To Z](./disparity-to-z.md)：左右画像の視差からZ深度を計算します。これだけでWorld Position Passになるわけではありません。
- [画像（Image）](../../learn/02-data/image.md)：RGB・Alpha・補助チャンネルを持つ2D画像の概念。
- [Stereo 3Dノード一覧](./index.md)：現状のサイト内での分類。公式ManualのPosition Nodes分類とは異なります。

## バージョンと出典

**一次資料**：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』、**Chapter 115「Position Nodes」pp.2705–2712（Volume Fog [VLF]）**、pp.2717–2720（WPP Concept／Position Nodes共通Settings）。

**verification: partial**：4入力の種類、主要Inspector Control、Fog ImageとZ Slices、WPPのWorld Space要件、カメラ・照明の役割は21.1 Manual本文で確認しています。記載したControlの実機表示、REGID、既定値・設定範囲、Free/Studioのedition差、レンダリング結果はこの更新では未検証です。
