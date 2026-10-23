---
title: Classic 3D scene
description: FusionのClassic 3Dを、2D ImageやUSDとは別のscene domainとして理解し、geometry・camera・light・Renderer 3Dの流れを読む。
doc_type: concept
term_id: classic-3d
term_short: Shape 3DやText 3D、Camera 3D、Light等をMerge 3Dでまとめ、Renderer 3Dで2D Imageへ変換するFusion固有の3D scene domain。
verification: partial
aliases: [Classic 3D, Fusion 3D, 3D scene]
concepts: [data-domain, scene-graph, rendering]
nodes: [Merge 3D, Renderer 3D, Camera 3D, Shape 3D, Image Plane 3D, Text 3D]
tasks: [build-3d-scene, understand-domain, debug]
prerequisites: [image-data, typed-connections]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-23"
---

# Classic 3D scene

FusionのClassic 3Dは、Shape 3D、Text 3D、Image Plane 3D、Camera 3D、Light等を同じ3D scene内で扱うdata domainです。

2D Image、Particle set、USD sceneとは別のdomainで、最終的にRenderer 3Dを使って2D Imageへ変換します。

## 最小構成

最小限ならGeometryとRenderer 3DだけでもImageを作れます。

```text
Shape 3D → Renderer 3D → 2D Image
```

実際にはCameraやLightを含めることが多いため、次の構成が基本です。

```text
Geometry ───┐
Camera 3D ──┼─ Merge 3D → Renderer 3D → 2D Image
Light ──────┘
```

## Geometry

Classic 3D sceneへ置くobjectです。

代表例:

- Shape 3D — Plane / Cube / Sphere / Cylinder等
- Image Plane 3D — 2D Imageをcardとして3Dへ置く
- Text 3D — extrude可能な3D text
- FBX / Alembic Mesh 3D — 外部3D geometry

Geometry自身にもTransformやMaterial設定があります。

## Merge 3D

複数の3D object、camera、light、sceneを1つへまとめます。

2D Mergeと名前は似ていますが、pixelを重ねるNodeではありません。3D scene graphを統合します。

## Camera 3D

3D sceneをどこから見るかを決めます。

Renderer 3Dはscene内cameraまたはdefault perspective cameraから2D Imageを生成します。Camera 3Dは実写cameraに近いFocal Length / Film Gate等を持ち、projectionにも使えます。

## Light

Classic 3DにはAmbient / Directional / Point / Spot / Dome等のLightがあります。

Lightをsceneへ入れただけでは、ViewerやRenderer 3DでLighting / Shadowsが有効になっていない場合があります。

Merge 3DのPass Through Lightsによって、upstreamのLightをdownstream objectへ効かせるかを分けられます。

## Renderer 3D

Classic 3D sceneから2D Imageを作るdomain boundaryです。

```text
Classic 3D scene → Renderer 3D → Image
```

Software / OpenGL rendererを選べ、shadowやDepth of Field、auxiliary layers等の対応が異なります。

<!-- capture-reuse:R09 -->
### 実機の参考例：SceneからImageへ変換する

左はMerge 3Dの操作用ビュー、右はSoftware RendererがCamera 3Dから描いた球の2D Imageです。左右でカメラの役割が異なります。

[![S11の実機撮影：SceneからImageへ変換するの接続](/img/fusion/captures/S11/graph.png)](/img/fusion/captures/S11/graph.png)

[![S11の実機撮影：SceneからImageへ変換するの表示結果](/img/fusion/captures/S11/compare.png)](/img/fusion/captures/S11/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS11の固定例を再掲しています。[撮影条件と確認範囲](/img/fusion/captures/S11/capture.json)で元の設定を確認できます。

## 入力と出力をたどる

Classic 3Dでは、**2D画像を3D空間へ置く段階**と、**3Dシーンを2D画像に描く段階**を分けて考えます。たとえば動画を板に貼る場合、入力された動画がMerge 3Dへ直接流れるわけではありません。

| Node | 主な入力 | 出力 | 次にできること |
| --- | --- | --- | --- |
| [Image Plane 3D](../../nodes/3d/image-plane-3d) | 2D Image（MaterialInput）と、任意のClassic 3Dシーン（SceneInput） | Classic 3Dシーン | 映像や静止画を貼った平面を3D空間へ配置する |
| [Shape 3D](../../nodes/3d/shape-3d) / [Camera 3D](../../nodes/3d/camera-3d) | 形状やカメラの設定 | Classic 3Dシーン | 立体や視点を用意する |
| [Merge 3D](../../nodes/3d/merge-3d) | 複数のSceneInput[#] | Classic 3Dシーン | 立体・カメラ・ライトを同じ空間にまとめる |
| [Renderer 3D](../../nodes/3d/renderer-3d) | SceneInput（Classic 3Dシーン）、任意のEffectMask（2D Image） | 2D Image | 通常のMergeやBlurを使って映像に重ねる |

Renderer 3Dの入力は「完成済みの動画」ではなく、**まだ立体として配置や照明を変えられるシーン**です。Renderer 3Dを通った後は、画面上の画素や補助チャンネルを処理します。元の物体を個別に回転したり、カメラの位置を変えたりするなら、Renderer 3Dより前へ戻ります。

## 例：動画ポスターを3Dの看板として実写に重ねる

看板の映像を傾けるだけでなく、カメラを動かしたときに看板と3D文字の遠近関係も変わる構成です。

~~~text
動画（MediaIn A） → Image Plane 3D ─┐
Text 3D（立体文字）────────────────┤
Camera 3D ───────────────────────┼→ Merge 3D → Renderer 3D ─┐ Foreground
Spot Light ──────────────────────┘                           ├→ Merge（2D）→ MediaOut
実写（MediaIn B）──────────────────────────────────────────────┘ Background
~~~

1. 動画のImage出力をImage Plane 3Dの**MaterialInput**へつなぎます。平面へ画像を貼る入力であり、SceneInputとは別です。
2. Image Plane 3DのTransformで看板を配置します。必要ならText 3Dを手前に置き、Camera 3DとSpot Lightを追加します。
3. それぞれのClassic 3D出力をMerge 3Dへ接続します。ここでは画像の前景・背景を重ねるのではなく、3D空間に物体を集めています。
4. Renderer 3Dの**Camera**で使うカメラを選びます。照明を使う場合は**Enable Lighting**などの描画設定も確認し、3Dシーンを2D Imageにします。
5. Renderer 3Dの画像を通常のMergeの**Foreground**へ、実写を**Background**へ接続します。

この方法では、Camera 3Dを移動すると看板と文字の見える位置関係が変わります。一方、最後のMergeは**描画済みの画像同士**を合成するだけです。実写の中にある机や人物の奥へ看板を隠したい場合は、別途マスクや深度情報などを使って前後関係を処理する必要があります。

## USDとの違い

Fusionには別にUSD専用のu* Nodeがあります。

```text
Classic 3D: Shape 3D → Merge 3D → Renderer 3D
USD:        uShape   → uMerge   → uRenderer
```

名前や目的が似ていても、**Merge 3D / Renderer 3DはClassic 3D、uMerge / uRendererはUSD**を扱います。異なる3Dシーンを直接1本のSceneInputへ混ぜることを前提にしません。

### 両方の3D系統を同じ映像で使う場合

たとえばClassic 3Dで作った立体タイトルと、外部USDファイルで作った車を同じショットに重ねたい場合は、まず**それぞれのシーンを対応するRendererで2D画像にする**方法が明確です。

~~~text
Text 3D ─→ Merge 3D ─→ Renderer 3D ─┐
                                    ├→ Merge（2D）→ 背景映像とのMerge → MediaOut
uLoader ─→ uMerge ───→ uRenderer ───┘
~~~

この構成なら、Classic 3D側では[Camera 3D](../../nodes/3d/camera-3d)、USD側では[uCamera](../../nodes/usd/ucamera)と、それぞれのシーン用のカメラを使えます。ただし2つのレンダリング結果を**2Dで重ねただけでは、両系統の物体間の影・反射・遮蔽（前後の隠れ方）は3Dとして計算されません**。奥行きにまたがる表現には、マスク・深度・コンポジット方法を別途検討します。

3D空間で相互に遮蔽させ、同じ照明を当てたい場合は、最初にどちらのシーン系統で制作するか決め、使用する形状や素材をその形式に合わせます。**Classic 3Dの出力をそのままUSDへ変換する標準ノードが存在する、といった案内は21.1 Manualの参照箇所からは確認できません**。外部形式を使った受け渡しが必要なら、[3Dファイルの受け渡し：FBX・Alembic・USD](./3d-file-interchange)で、対応する読み込みノードと保持できない情報を確認してください。

接続互換性の考え方は[接続できるdata / 接続できないdata](./connection-compatibility)、USDのシーン構造は[USD scene](./usd)で確認できます。

## 関連Node

- [Classic 3Dノード](../../nodes/3d/)
- [Merge 3D](../../nodes/3d/merge-3d)
- [Renderer 3D](../../nodes/3d/renderer-3d)
- [Camera 3D](../../nodes/3d/camera-3d)
- [Shape 3D](../../nodes/3d/shape-3d)
- [Image Plane 3D](../../nodes/3d/image-plane-3d)

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」の**Merge 3D pp.1957–1959**（SceneInput[#]・3Dシーンの統合）、**Renderer 3D pp.1970–1972**（SceneInput / EffectMask・3Dから2Dへの変換・Camera・照明）、Chapter 121「USD Nodes」の**p.2887**（uLoaderからuMerge / uRendererへの経路）・**pp.2911–2912**（uRendererのUSD SceneInputと2D出力）に基づきます。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)から参照できます。

看板の制作例とClassic 3D / USDを画像化してから重ねる例は、Manualの入出力仕様に基づく説明用の構成です。**Classic 3DとUSDの直接変換の有無・変換時のデータ保持、実機での遮蔽・深度合成、Rendererのhost/GPU差、Edition差は未検証**です。
