---
title: "Ambient Light"
description: "Classic 3Dシーン全体に方向を持たない均一な基礎照明を加えるライト。接続、Intensity、影との関係を説明する。"
doc_type: node
term_id: "ambient-light"
term_short: "Ambient Lightは、Classic 3Dシーン全体に方向のない基礎照明を加えるライト。自分では影を作らない。"
verification: partial
aliases: ["Ambient Light", "3AL"]
concepts: ["classic-3d", "lighting"]
nodes: ["Ambient Light"]
node_family: "materials-lights"
controls: ["Enabled", "Color", "Intensity", "Transform"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["shade-3d", "ambient-light"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Ambient Light

**Ambient Lightは、3Dシーン全体を方向に関係なく照らす、<Term id="classic-3d">Classic 3D</Term>のライト**です。窓や電球のような光源位置を持たず、物体の暗い面にも基礎的な明るさを加えます。

このライト自体は影を作りません。方向性のあるライトで明暗を付けたシーンへ足すと、暗い面が持ち上がる一方、強すぎると立体感が弱くなります。最初からAmbient Lightだけで自然な陰影を作るより、Directional LightやSpot Lightなどと組み合わせる使い方が適しています。

## 入力・出力と最小構成

| 接続 | データ | 役割 |
| --- | --- | --- |
| **SceneInput（オレンジ・任意）** | Classic 3Dシーンまたは3Dジオメトリ | 上流シーンを受け取る。接続時はAmbient LightのTransformが入力したシーンにも作用する |
| **出力** | Classic 3Dシーン | ライトを含むデータをMerge 3Dなどへ渡す |

```text
Shape 3D（物体） ──────┐
Ambient Light ─────────┼─→ Merge 3D ─→ Renderer 3D ─→ MediaOut
Camera 3D ─────────────┘
```

Ambient Lightと物体を**Merge 3Dへ別々に接続する**と、照明とオブジェクトを独立して扱えます。ライト単独をViewerに表示しても完成画像は出ません。Merge 3Dへ物体とカメラをまとめ、Renderer 3Dで2D画像に変換して確認します。

## Inspectorで調整するもの

| 設定 | 役割 | 操作の目安 |
| --- | --- | --- |
| **Enabled** | ライトの有効・無効を切り替える。Inspectorの名前左側の赤いスイッチと同じ役割 | ON/OFFを比較し、実際に寄与しているかを確かめる |
| **Color** | 光の色を指定する | 暗部全体を暖色・寒色へ寄せる |
| **Intensity** | 光の強さを指定する | 主照明の方向感を失わない程度に少しずつ上げる |

21.1 Manualでは、Intensityの**0.2は20%の光**と説明されています。完全に白いテクスチャをAmbient Lightの0.2だけで照らす例の出力値は`(0.2, 0.2, 0.2)`です。ただし、これはManualに示された条件下の説明であり、あらゆる材質・色管理・Viewer表示で同じ見た目になるという保証ではありません。

### Transformは照射方向の設定ではない

Viewerにライトを示す表示があっても、Ambient Light自体には意味のある位置や回転がありません。位置表示を移動するのは、ほかの3Dオブジェクトの操作を邪魔しないようにする目的です。**Ambient Lightの表示を回転させても、特定方向からの照射にはなりません。**

ただし、**SceneInputにシーンを入力していると、Transformはその上流シーンにも作用します**。ライトの表示を片付けたいだけなのに物体まで動く場合は、SceneInputとの配線を確認してください。

## 制作例：商品CGの暗い面を明るくする

1. Shape 3Dなどの物体、Camera 3D、Directional Lightなどの主照明をMerge 3Dへ接続します。
2. Renderer 3Dで主照明だけの明暗を確認します。
3. Ambient Lightを同じMerge 3Dへ**独立した入力**として接続します。
4. Colorを決め、Intensityを低い状態から少しずつ調整します。
5. EnabledのON/OFFを比較し、暗い面は見やすくなったか、主照明による輪郭や陰影が消えすぎていないかを確認します。

目的は**新しい影を作ることではなく、基礎的な明るさを足すこと**です。床に落ちる影や照射方向の表現が必要なら、別のライトを使います。

## 関連ライトとの違い

| ノード | 照明の特徴 | 主な用途 |
| --- | --- | --- |
| **Ambient Light** | 方向を持たない均一な光。影を作らない | 暗部を補う基礎照明 |
| [Directional Light](./directional-light) | 一定方向からの平行光 | 日光のような照明 |
| [Point Light](./point-light) | 1点から全方向へ広がる | 電球のような照明 |
| [Spot Light](./spot-light) | 1点から決まった方向の円錐状の光 | 局所的な照明や影 |
| [DomeLight](./dome-light) | HDR / SDR画像を環境光に使う | 画像に基づく環境照明 |

Ambient LightにはDome Textureの画像入力はありません。周囲のHDR画像を使って照らしたい場合はDomeLightを選びます。USD系のuDome Lightともデータ形式が異なり、Classic 3DのMerge 3DとUSDのuMergeをそのまま互換として扱いません。

## 問題が起きたとき

| 症状 | 確認 |
| --- | --- |
| ライトを追加しても画像が表示されない | 物体・カメラとともにMerge 3Dへ入力し、Renderer 3Dまで接続しているか |
| 明るさが変わらない | Enabled、Intensity、Color、ほかの照明や材質の状態 |
| 全体が平坦になった | Ambient LightのIntensityを下げ、方向のあるライトとの比率を見直す |
| ライトを動かしても光の向きが変わらない | Ambient Lightには照射方向がない。Directional / Spot Lightを検討する |
| Transformを変更したら物体まで動いた | SceneInputへ3Dシーンをつないでいないか |
| 影ができない | Ambient Light自体は影を生成しない。影を扱える別のライトを使用する |

## 出典・確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』**（2026年9月）、Chapter 89「3D Light Nodes」**pp.2027–2029**。方向・位置のない照明、任意のSceneInput、Merge 3Dへの接続、Enabled / Color / Intensityを確認。Chapter 84「3D Compositing Basics」**p.1842**で、Ambient Lightが影を作らず暗部を明るくすることを確認しました。公式資料：[Blackmagic Design Support](https://www.blackmagicdesign.com/support)。

**略号の訂正：** 旧記事の`3AM`ではなく、21.1 Manualの表記は`Ambient Light [3AL]`です。制作例はManualの仕様を組み合わせた手順案です。21.1実機でのREGID、正確な既定値・可動範囲、Rendererごとの差、Edition差は未確認のため、`verification: partial`を維持します。
