---
title: "Stereo Mix"
description: "左眼・右眼で異なる画像や3D Materialを使うための材質Node。入力、Swap、Stereo Rendererとの接続を解説。"
doc_type: node
term_id: "stereo-mix"
term_short: "Stereo Mixは、左眼・右眼用に別々の画像や材質を割り当て、1つのステレオ対応3D Materialとして出力するNode。"
verification: partial
aliases: ["Stereo Mix", "3SMM"]
concepts: ["classic-3d"]
nodes: ["Stereo Mix"]
node_family: "materials-lights"
controls: ["Swap", "Material ID"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Stereo Mix

Stereo Mix [3SMM]は、**左眼で見るときと右眼で見るときで、3Dオブジェクトの材質を変える**ためのNodeです。左眼用と右眼用に別々の2D画像または3D Materialを接続し、ステレオ描画に使う**1つの3D Material**を出力します。

たとえば同じ3Dの板に対し、左眼には画像A、右眼には画像Bを表示する材質を作れます。「Stereo」は左右の視点を指し、音声のステレオミックスとは関係ありません。

このNodeは**左右の完成映像を重ねる2D合成Nodeでも、左右のカメラ位置を作るNodeでもありません**。3D空間の物体に割り当てる材質を決める段階で使います。<Term id="classic-3d">Classic 3D scene</Term>やMaterialの区別が分かりにくい場合は、まず[Classic 3D sceneの解説](../../learn/02-data/classic-3d.md)を参照してください。

## 入力と出力

| 端子 | 受け取るもの | 役割 |
| --- | --- | --- |
| **LeftMaterial**（オレンジ） | 2D Image または 3D Material | 左眼で描画するときの表面材質 |
| **RightMaterial**（緑） | 2D Image または 3D Material | 右眼で描画するときの表面材質 |
| **出力** | 3D Material | 左右眼の材質指定を保持し、3D ObjectのMaterial入力へ渡す |

**2つの入力は両方とも必須**です。片方だけを接続して、もう片方を自動補完するNodeではありません。

2D Imageを入力すると、その画像は基本Materialの**diffuse texture map**（物体の表面色を決める画像）として扱われます。画像を立体シーンへそのまま追加するのではなく、既存の形状に貼るための材質へ変換するという意味です。

**出力は常に3D Material**です。左右にそれぞれ画像を接続しても、この段階で2枚の完成画像や3D sceneが出力されるわけではありません。

## 基本的な使い方：左右眼で異なる画像を表示する

左眼用の画像Aと右眼用の画像Bを、同じ3Dの板に割り当てる例です。

~~~text
画像A ── LeftMaterial ─┐
                       ├─ Stereo Mix ── [Material] Shape 3D ─┐
画像B ─ RightMaterial ─┘                                      │
                                                              ├─ Merge 3D ─ Renderer 3D ─ 2D Image
Camera 3D（Stereo設定）────────────────────────────────────────┘
~~~

1. 画像Aを**LeftMaterial**、画像Bを**RightMaterial**へ接続します。
2. Stereo Mixの出力を[Shape 3D](../3d/shape-3d.md)の**Material**入力へ接続し、ShapeをPlaneなどの板状の形状にします。
3. [Camera 3D](../3d/camera-3d.md)で必要なステレオ設定を行い、ShapeとCameraを[Merge 3D](../3d/merge-3d.md)へ接続します。
4. [Renderer 3D](../3d/renderer-3d.md)でCameraを指定し、**Eye: Left**で画像A、**Eye: Right**で画像Bを使った描画を確認します。
5. 左右をまとめて出力する必要がある場合は、Renderer 3D側の**Eye: Stacked / Layers**など、目的に合う出力形式を選びます。

ここで左右に違いが出るのは**物体の材質**です。立体視に必要な左右カメラの視差はCamera 3D側で設定します。Stereo Mixを置いただけで、通常の1枚の画像から奥行きのある立体映像が自動生成されるわけではありません。

2D Imageの代わりに、Blinnなどで作った**別々の3D Material**を左右へ接続することもできます。たとえば左右で同じ形状を表示しつつ、一方はつやのある材質、もう一方はつやの少ない材質にする使い方です。

## Inspectorの設定

### Swap

**Swap**は、左右の材質入力の割り当てを入れ替えるスイッチです。

- オフ：LeftMaterialは左眼、RightMaterialは右眼で使います。
- オン：左眼と右眼に使う材質を交換します。

入力画像や前段のNodeを配線し直さず、左右を取り違えた場合や意図的に逆転させたい場合に使えます。**カメラの左右位置や3D形状そのものを交換する設定ではありません。**

### Material ID

**Material ID**は、このMaterialに数値の識別子を割り当てる設定です。[Renderer 3D](../3d/renderer-3d.md)で対応する出力を有効にした場合に、**MatID auxiliary channel**へ記録できます。

Material IDは左右の材質を混ぜる比率でも、左右眼を選ぶスイッチでもありません。また、Stereo MixでIDを指定しただけで、最終画像にMatIDが必ず出るわけではありません。

### Settings

Settingsタブは他の3D Nodeにも共通する設定です。Stereo Mix固有の主要操作は上記の**Swap**と**Material ID**で、未確認の初期値や数値範囲はここでは断定しません。

## よくある使い方

### ステレオ素材の左右を確認する

左右眼のテスト画像に「L」「R」など異なる表示を用意し、Stereo Mixへ入力します。Renderer 3DのEyeを切り替え、意図した側に正しい画像が出ているかを確認します。左右が逆なら**Swap**を試します。

これはStereo Mixの配線と材質割り当てを確認する方法です。映像全体のカメラ視差や立体視の快適さまで保証する検査ではありません。

### 左右で異なる表面の見え方を作る

左眼側にBlinn、右眼側に別の表面設定を持つMaterialを接続します。同じ3D Objectへ適用して、左右の出力にどのような違いが出るかを確認します。画像を切り替える例とは異なり、材質の色・反射などを眼ごとに変える構成です。

通常の立体CGでは左右で異なる光沢を付ける必要はありません。**左右別の画像・材質が本当に必要な場面**で使い、単にステレオ視差を作りたいだけならCamera 3DとRenderer 3Dを中心に組みます。

## 間違えやすいNodeとの違い

- **[Material Merge 3D](./material-merge-3d.md)** — 2つの材質をBlendで混ぜて1つの材質にします。Stereo MixはBlend率を調整して重ねるのではなく、**左眼／右眼へ材質を振り分けます**。
- **[Merge 3D](../3d/merge-3d.md)** — Shape、Camera、Lightなどを同じ3Dシーンにまとめます。Stereo Mixの出力をScene入力へ直接つなぐものではありません。
- **[Anaglyph](../stereo/anaglyph.md)** — 左右眼の2D画像を、赤／シアンなどで確認できる表示へ合成するStereo系Nodeです。Stereo Mixは**レンダリング前の3D Material**を扱うため、同じ用途ではありません。
- **[Camera 3D](../3d/camera-3d.md) / [Renderer 3D](../3d/renderer-3d.md)** — 左右の視点を定義し、どちらの眼の結果を画像として出すかを制御します。Stereo Mixはその物体に使う材質を指定する役割です。

## うまく表示されないとき

- **片眼しか確認できない**：Renderer 3DのEyeがMonoになっていないか確認し、Left / Rightへ切り替えます。
- **左右の材質が逆**：LeftMaterial / RightMaterialの配線を確認し、必要ならSwapを使います。
- **Stereo Mixから2D Mergeにつなげない**：出力は画像ではなくMaterialです。Shape 3DなどのMaterial入力を経由し、Renderer 3Dで画像化します。
- **画像を2枚入力しても立体感がない**：Stereo Mixは視差を生成しません。Camera 3DのStereo設定とRenderer 3DのEye設定を確認します。
- **Material IDが画像へ出ない**：Renderer 3DでMatIDの補助チャンネル出力が有効か確認します。

## 関連する記事

- [3D Material / Lightノード](./index.md) — 表面材質と照明の違い。
- [Classic 3D scene](../../learn/02-data/classic-3d.md) — Material、Geometry、Camera、Rendererの順序。
- [Renderer 3D](../3d/renderer-3d.md) — Eye / Stereo出力と補助チャンネル。

## 出典と確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』**（2026年9月版）、Chapter 90「3D Material Nodes」、**Stereo Mix [3SMM]（pp.2074–2075）**に基づいています。2つの必須入力、各入力が受け取る2D Image / 3D Material、常にMaterialを出力する仕様、Swap、Material IDを確認しました。左右眼の描画操作は同Manual Chapter 88「Camera 3D」「Renderer 3D」と照合しています。

実機での表示結果、内部REGID、Inspector各項目の初期値・数値範囲、Edition差までは確認していないため、**verification: partial**を維持します。
