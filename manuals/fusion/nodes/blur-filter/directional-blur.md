---
title: Directional Blur
description: Fusionで直線・放射・ズーム方向に画像を流すブラー。LinearとCenteredの違い、Effect Mask、DoD、具体的な合成方法を解説。
doc_type: node
term_id: directional-blur
term_short: Directional Blurは、指定方向や中心を基準に2D画像を流して見せるブラー。
verification: partial
aliases: [Directional Blur, DrBl]
concepts: [image-data, filtering, mask-data, domain-of-definition]
nodes: [Directional Blur]
node_family: blur-filter
controls: [Type, Center, Length, Angle, Glow, Clipping Mode, Blend]
inputs: [image, mask]
outputs: [image]
tasks: [filter-image, motion-blur, radial-blur, light-rays]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Directional Blur

Directional Blurは、2D <Term id="image">Image</Term>を**一定方向や中心から流したようにぼかす**Fusionノードです。横に流れる背景、光源から伸びる筋、ズーム中の残像などを作れます。

一般的な[Blur](./blur)と異なり、ぼけの方向や中心を指定できるのが特徴です。ただし映像内の物体の動きを自動解析するものではありません。複数の物体が別々の方向に動くショットでは、素材を分けるか[Vector Motion Blur](./vector-motion-blur)などと使い分けます。

## 入力と出力

| 接続 | 役割 |
| --- | --- |
| **Input（オレンジ）** | ぼかす2D画像。MediaIn、Text+、Loaderや合成済み画像を接続します。 |
| **Effect Mask（青）** | 任意。Polygon、Ellipse、Bitmapなどのマスクを接続し、効果を見せる範囲を指定します。 |
| **Output** | 方向性のあるぼかしを加えた2D画像。MergeやMediaOutへ接続できます。 |

~~~text
MediaIn ──→ Directional Blur ──→ MediaOut
                    ↑
               Effect Mask（任意）
~~~

21.1マニュアルによれば、Effect Maskは**ぼかし計算の後に適用**されます。マスク外の画素を計算前に切り落とす入力ではありません。人物を守りながら背景だけ流したい場合、マスクを接続するだけでは人物の輪郭周辺のぼけ方が期待と違うことがあります。人物と背景を別レイヤーにして合成する方法も検討してください。

マスクの基本は[マスク（Mask）](../../learn/02-data/mask)を参照してください。

## Type：4種類の流れ方

Inspectorの**Type**でブラーの形を切り替えます。

| Type | どのように変わるか | 主な用途 |
| --- | --- | --- |
| **Linear** | 指定角度に沿った一直線のぼかし | 横方向へ流れる風景、スピード感 |
| **Centered** | Linearに似るが、元の像の両側へ均等にぼかしを分配 | 文字や図形を中心に残したストリーク |
| **Radial** | 指定した中心から外側へ放射する流れ | 放射状の強調、中心へ視線を集める演出 |
| **Zoom** | ズーム撮影時の拡大・縮小方向へ引き伸ばすような流れ | ズームストリーク、光の伸び |

**LinearとCenteredの差**を確認するには、透明背景に置いた小さな白い文字を入力し、AngleとLengthを固定したままTypeだけ切り替えます。Centeredは文字の両側にぼかしを分配するので、元の文字を基準にした表現に向きます。Linearは一方向へ流した印象を作りたい場合に使います。

**RadialとZoomはどちらも中心位置を持ちます**が、マニュアルではRadialを「中心から外へ放射する歪み」、Zoomを「低速シャッターでズーム撮影したようなスケール方向の筋」と区別しています。計算式が同じとは断定できません。光源を一つ置いてTypeを切り替え、見た目を比較してください。

## Inspectorの主な設定

### Center X / Y

**RadialとZoomに作用**する座標です。Viewer上の十字ハンドルでも移動できます。例えば右上のランプから筋を伸ばすなら、Centerを画面中央ではなくランプに合わせます。

LinearとCenteredでは、ぼかす方向を調整するのは主にAngleです。Centerに同じ意味を期待しないでください。

### Length

ブラーの長さ・強さを決めます。0付近では流れが小さく、値を大きくすると筋が目立ちます。**負の値ではAngleの示す方向と反対側**へ流れます。21.1マニュアルには、スライダー上限を超える値を数値欄へ直接入力できることも記載されています。

Lengthを大きくしたときは、ぼかしの印象だけでなく、フレーム端や透明領域で筋が切れていないかも確認します。

### Angle

**Linear / Centeredでは直線ブラーの方向**を指定します。一方、**Radial / Zoomでは回転を伴うような変化**になります。21.1マニュアルは、同じ場所を見ながらカメラを回すような効果と説明し、Lengthが0以外なら渦巻き状の見え方になる場合があるとしています。

放射状の筋だけを調整するつもりでAngleを変更すると、意図しない渦が出ることがあります。まずLengthを小さくした状態で効果を確かめます。

### Glow

方向性のあるブラーにGlowを加え、長い露光時間で光が強く写るような見た目を補助します。Type・Angle・Lengthで筋の形を決めてからGlowを追加すると、**筋の長さ**と**明るさの演出**を分けて調整できます。

発光領域の抽出や光の合成を細かく制御したい場合は、[Glow](./glow)や[Soft Glow](./soft-glow)も候補です。

### Clipping ModeとDoD

DoD（<Term id="domain-of-definition">Domain of Definition</Term>）は、フレーム内で画像データが有効とされる範囲です。ブラーは周辺の画素を参照するため、上流のDoDが狭いと境界付近の見た目に影響します。

| モード | 21.1マニュアルでの扱い |
| --- | --- |
| **Frame（既定）** | フレーム全体をDoDとして扱い、上流DoD外を黒／透明とします。 |
| **Domain** | 上流のDoDを尊重します。大きなブラーでは境界で効果が切れることがあります。 |
| **None** | 元画像をDoDでクリップしません。必要な参照画素がDoD外なら黒／透明として扱います。 |

透明なタイトルや小さな図形を長く流した際に、筋が途中で切れたら、LengthだけでなくClipping Modeと上流DoDを確認します。詳しくは[Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)を参照してください。

### Settingsタブの共通項目

**Blend**は処理後の画像と元画像を混ぜる共通設定です。Lengthで筋の長さを決め、Blendで最終的にどの程度見せるかを調整できます。

Directional Blurは**RGBAの全チャンネルに作用**します。Alphaを含む透明素材に適用すると、後段でMergeした際の透明な輪郭にも影響します。元の文字や輪郭を確実に残す場合は、ブラーの有無を別レイヤーで合成する方が調整しやすくなります。

## 具体的な制作例

### 1. 車窓の背景を横方向へ流す

**入力**は横方向へ移動する風景の映像、**出力**はその背景が一定方向へ引き伸ばされた映像です。

1. `MediaIn → Directional Blur → MediaOut`と接続します。
2. Typeを**Linear**にし、Lengthを小さく上げます。
3. Angleを映像の移動方向に合わせます。反対に流れる場合はLengthの符号を比較します。
4. 情報が読めなくなるほど流れたら、LengthやSettingsのBlendを調整します。
5. 人物を鮮明に残す必要があれば人物を切り出し、ブラーをかけた背景の上へMergeで重ねます。

~~~text
背景のMediaIn ──→ Directional Blur ──→ Merge（Background）
人物の切り出し ─────────────────────→ Merge（Foreground）──→ MediaOut
~~~

この方法は「背景を流して見せる」演出です。フレーム間の実際の移動量に応じた物理的なモーションブラーを自動計算するものではありません。

### 2. 透明なタイトルからストリークを伸ばす

**入力**はText+で作った透明背景のタイトル、**出力**は文字の左右へ残像が伸びた合成素材です。

1. `Text+ → Directional Blur → Merge（Foreground）`とつなぎ、MergeのBackgroundへ背景映像を入れます。
2. Typeを**Centered**に、Angleを横方向へ合わせ、Lengthを上げます。
3. 文字の読みやすさを残すなら、ブラーを通さないText+を分岐し、ストリークの上へさらにMergeします。
4. 筋が端で切れる場合はClipping ModeとDoDを確認します。

~~~text
Text+ ──┬──→ Directional Blur ──→ Merge（ストリーク）
        └─────────────────────→ Merge（鮮明な文字を前面）
~~~

こうすると文字の可読性とブラーの長さを別々に調整できます。単にLengthを弱くするよりも目的が明確です。

### 3. ランプから光が伸びるようなズーム表現

**入力**は一つの明るい光源が入った2D画像、**出力**はその光源を中心として周囲へ筋が伸びた画像です。

1. Typeを**Zoom**に切り替えます。
2. Center X / Yを光源の位置に合わせます。
3. Lengthを小さく設定し、筋がどちらへ伸びるか確認します。
4. Radialへ切り替えて放射の見た目を比較します。
5. 必要な場合だけGlowを加えます。

光源が複数ある画像でも、Directional Blurが光源を検出して個別のCenterを作ることはありません。光源ごとに違う中心が必要なら、画像を分離し、それぞれに別のノードを適用します。

### 4. 編集点に合わせて一瞬だけ加速させる

Lengthにキーフレームを打ち、`0 → 任意の値 → 0`と変化させます。普段は鮮明な映像が、短時間だけ方向性のある残像を持って元に戻る演出です。

光学的なシャッター角度やフレームごとの動きを解析しているわけではないため、動体ごとの正確なブラーが必要なら[Vector Motion Blur](./vector-motion-blur)を検討します。

## 症状別の確認

| 症状 | 確認する項目 |
| --- | --- |
| 変化がほとんどない | Lengthが0に近い、またはEffect Maskが黒くなっていないか。 |
| 意図と逆方向へ流れる | Linear / CenteredのAngleとLengthの符号を確認。 |
| ズームの起点がずれる | Radial / ZoomのCenter X / YとViewerの十字ハンドルを確認。 |
| 渦巻き状になってしまう | Radial / ZoomのAngleとLengthの組み合わせを確認。 |
| 動いていない部分まで流れる | 一律のブラーなので、前景・背景の分離やEffect Maskを検討。 |
| 透明な文字の筋が切れる | Clipping Mode、上流DoD、Alphaを確認。 |
| マスク境界が不自然 | Effect Maskは処理後に作用する。必要なら別レイヤー合成に変更。 |

## 近いノードとの違い

- [Blur](./blur)：方向性のない基本的なぼかし。
- [Defocus](./defocus)：ピント外れやボケ形状を重視するぼかし。
- [Glow](./glow) / [Soft Glow](./soft-glow)：明るい部分の光のにじみを重視する効果。
- [Vector Motion Blur](./vector-motion-blur)：モーションベクトルを利用し、画素ごとに異なる方向・量のブラーを作る効果。

## 出典と確認範囲

**DaVinci Resolve 21.1 Reference Manual**（Blackmagic Design、September 2026）、Chapter 92「Blur Nodes」、pp.2114–2115で、入力2種類、RGBA、Type、Center、Length、Angle、Glow、Clipping Modeを確認しました。SettingsタブのBlendは同章のCommon Controlsに属します。

制作例はマニュアルに記載された機能を組み合わせた説明例です。内部REGID、各Typeの厳密なkernel、GPU性能、Edition差は今回実機検証していないため、`verification: partial`としています。
