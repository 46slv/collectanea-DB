---
title: "Softclip 3D"
description: "カメラに近づきすぎた3Dオブジェクトを距離に応じて徐々に透明にし、視点が通過するときの急な消失を和らげるNode。"
doc_type: node
term_id: "softclip-3d"
term_short: "Softclip 3Dは、カメラのすぐ近くにある3Dオブジェクトを徐々に透明にし、急な消失を目立たなくするNode。"
verification: partial
aliases: ["Softclip 3D", "SoftClip", "3SC"]
concepts: ["classic-3d"]
nodes: ["Softclip 3D"]
node_family: "3d"
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "render-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Softclip 3D

Softclip 3D [3SC]は、<Term id="classic-3d">Classic 3D scene</Term>をカメラから見たとき、**カメラに近すぎる部分を距離に応じて徐々に透明にする**Nodeです。

たとえばカメラが3Dの粒子群の中を進むと、手前の粒子が視点に接近し、画面から突然消えたように見えることがあります。Softclip 3Dは近距離の不透明度を下げ、その切り替わりを目立ちにくくします。Blackmagic Designの21.1 Reference Manualでも、**カメラが通過する粒子**を代表例に挙げています。

ここでの「Clip」は、ColorページのSoft Clip（ハイライトやシャドウの階調を圧縮する機能）とは別物です。Softclip 3Dが扱うのは画素の明るさではなく、**カメラとの距離に応じた透明度**です。3Dオブジェクトの形状や位置自体を変更する説明は、公式資料にはありません。

<!-- capture:S188 -->

## 実機例：近距離の透明度を比べる

`Cube 3D` と `Camera 3D` を `Merge 3D` でまとめ、出力を分岐します。一方だけ `SoftClip` を通して、それぞれ `Renderer 3D` で画像化しました。

不透明距離を4、透明距離を1に設定しています。左は処理前、右は透明度が変化した結果です。市松模様はViewerの透明表示です。この例では粒子やカメラの移動を扱っていません。[接続と設定の記録](/img/fusion/captures/S188/readback.json)に条件を記載しています。

[![CubeとCameraをまとめSoftClipを通した結果と元を画像化する構成](/img/fusion/captures/S188/graph.png)](/img/fusion/captures/S188/graph.png)

シーンを分岐し、片方にSoftClipを適用します。

[![不透明距離と透明距離を示すSoftClipのInspector](/img/fusion/captures/S188/controls.png)](/img/fusion/captures/S188/controls.png)

不透明距離を4、透明距離を1に設定します。

[![処理前と透明度が変化した立方体の比較](/img/fusion/captures/S188/comparison.png)](/img/fusion/captures/S188/comparison.png)

左は処理前、右はSoftClip適用後です。

[再現用Graph](/img/fusion/captures/S188/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S188/capture.json)

<!-- /capture:S188 -->

## 入力と出力

- **入力：Classic 3D scene**。Geometry、Camera、Lightなどを含む3Dシーンを受け取る種類のNodeとして分類されています。複数の要素を扱う場合は[Merge 3D](./merge-3d.md)で先にまとめます。
- **出力：Classic 3D scene**。近距離の透明度に関する処理を加えたシーンを後段へ渡し、[Renderer 3D](./renderer-3d.md)で2D画像に変換します。

実機例では `SceneInput` に3Dシーンを接続して確認しました。端子の全数は未確認です。

## 接続と使い方

カメラを含む3Dシーンを組んだ後、Renderer 3Dより前に置く構成を検討します。

```text
3D Geometry ─┐
Camera 3D ───┼─ Merge 3D → Softclip 3D → Renderer 3D → 2D Image
Light ───────┘
```

上の実機例ではCubeとCameraをまとめたシーンでこの接続を確認しました。粒子やLightを含む構成は未確認です。

### 具体例：カメラが3Dの粒子群を通り抜ける

煙や塵のような粒子を3D空間に置き、その中をカメラが前進する場面を考えます。カメラに向かってくる粒子が不自然な大きさで画面を覆ったり、視点を通過する瞬間に急に消えたりするのを抑えたい場面です。

1. 粒子を3Dシーンとして出力できる構成を用意し、カメラとともにMerge 3Dへまとめます。
2. Merge 3Dの後にSoftclip 3Dを置き、Renderer 3Dへ接続します。
3. カメラが粒子へ近づき、その位置を通過する区間をViewerで確認します。
4. Softclip 3Dを有効・無効にして、近距離の粒子が消える過程を比較します。実機で距離に関する設定が確認できた場合のみ、画面の意図に合わせて調整します。

粒子が遠い位置で見えなくなる問題や、シーン全体の霧の濃さを変える用途には、このNodeの説明をそのまま当てはめません。近距離の急な消失が問題かどうかを切り分けて使います。

## Fog 3Dやほかの処理との違い

- **Softclip 3D**：カメラの**ごく近く**で、距離に応じて不透明度を下げ、視点がオブジェクトを通過するときの切り替わりを和らげます。
- **[Fog 3D](./fog-3d.md)**：カメラからの距離を使い、遠方の物体の見え方を霧の色へ近づけます。大気による霞みを作る別の目的です。
- **[Camera 3D](./camera-3d.md)**：視点・画角・投影方法を決めます。Softclip 3Dのように、近距離のピクセルの不透明度を調整する役割ではありません。
- **ColorページのSoft Clip**：色信号のハイライト／シャドウを扱うグレーディング機能で、3Dシーンの距離処理ではありません。

人物や物体の接写など、カメラのすぐ手前でも形を見せたい場面では、近距離を透明にする効果は目的に合わない場合があります。必要なときだけ使い、画面で確認してください。

## 確認ポイントと未確認の設定

- **期待した変化が見えない**：カメラが物体へ十分近づく区間を確認し、Nodeを通さないレンダリングと比較します。入力と出力がClassic 3D sceneの経路に入っているかも確認します。
- **意図した近景まで薄くなる**：その近景を見せる必要がある場合は、Softclip 3Dを使わない経路との違いを比較します。
- **何を調整すればよいか分からない**：21.1 Reference Manualの確認箇所にはSoftClipのInspectorコントロール一覧がないため、実機例では不透明距離と透明距離を確認しました。全設定の初期値・数値範囲は確認していません。

[Classic 3D sceneの基礎](../../learn/02-data/classic-3d.md)と[3D NodeのFamily Overview](./index.md)を併せて読むと、Renderer 3Dの前後で扱うデータの違いを確認できます。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 84「3D Compositing Basics」、**p.1865「Fog 3D and Soft Clipping」**。ここでは「SoftClip nodeがカメラ視点からの距離を使ってピクセルの不透明度を変える」「カメラが通過する物体、とくに粒子の急な消失を和らげる」ことを確認しました。

ページ名と略号の**Softclip 3D [3SC]**、およびClassic 3Dの入出力分類はCOLLECTANEA既存catalog（legacy-primary）に基づきます。Manual本文は「SoftClip node」と表記しており、実機例で内部REGID `SoftClip` と `SceneInput`、不透明距離・透明距離を確認しました。Inspectorの全設定・初期値・範囲・Edition差は未確認です。このため`verification: partial`を維持します。
