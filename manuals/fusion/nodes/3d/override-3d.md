---
title: "Override 3D"
description: "入力されたClassic 3Dシーン内のオブジェクトの描画属性を一括で上書きするNode。"
doc_type: node
term_id: "override-3d"
term_short: "Override 3Dは、複数の3Dオブジェクトの表示・照明・Matte・ID等の設定をまとめて変更するNode。"
verification: partial
aliases: ["Override 3D", "3Ov"]
concepts: ["classic-3d"]
nodes: ["Override 3D"]
node_family: "3d"
controls: ["Do [Option]", "Affected by Lights"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "render-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Override 3D

Override 3D [3Ov]は、<Term id="classic-3d">Classic 3D scene</Term>に含まれる複数のオブジェクトに、**同じ描画設定を一括で適用する**Nodeです。形や材質が異なるオブジェクトでも、まとめてワイヤーフレーム表示に切り替えたり、照明の影響を受けない描画用のシーンを作ったりできます。

変更するのは**Override 3Dへ入力されたシーン内のオブジェクト**です。後段で新しく追加したオブジェクトまで自動的に変更するわけではありません。また、Materialそのものの差し替えは[Replace Material 3D](./replace-material-3d.md)が担当します。

## 入力と出力

- **SceneInput（オレンジ）**：変更したいClassic 3Dシーンを受け取ります。[Merge 3D](./merge-3d.md)の出力や、3Dシーンを作るNodeの出力を接続します。
- **出力（Classic 3D scene）**：指定した描画属性を上書きした3Dシーンを返します。必要に応じて[Renderer 3D](./renderer-3d.md)で2D画像へ変換します。

Override 3Dは、形状を作り直したり、2D画像を直接出力したりするNodeではありません。

```text
Shape 3D ───┐
Text 3D ────┼─ Merge 3D → Override 3D → Renderer 3D → Image
Camera 3D ──┤
Light ──────┘
```

通常の描画と上書き後の描画を両方残す場合は、Merge 3Dの出力を分岐し、片方だけにOverride 3Dを置きます。

## Inspectorでの指定方法

Controlsタブでは、上書きしたい項目の **`Do [Option]`** チェックボックスを先に有効にします。その項目の値を指定するコントロールが表示され、入力シーン内のオブジェクトが持つ元の値より、ここで指定した値が優先されます。**チェックを入れていない項目は上書きしません。**

上書きの対象になるのは、Wireframe（面を線で表示する設定）、Visibility（表示・非表示）、Lighting（照明の影響）、Matte（別の描画を隠す扱い）、ID（オブジェクトを識別する番号）などの**オブジェクト固有の描画属性**です。

Manualでは個別の選択肢の説明をImage Plane 3D、Cube 3D、Shape 3D等のgeometry生成Nodeの節へ委ねています。ここでは確認できたカテゴリと`Do [Option]`の仕組みだけを示し、全Control名・初期値・数値範囲を推測して補いません。

## 主な用途と具体例

### 複数の形状をまとめてワイヤーフレームにする

複数のShape 3DやText 3DをMerge 3Dへ入れ、その出力をOverride 3Dへ接続します。ControlsタブでWireframeに対応する上書きを有効にし、線表示になるよう指定すると、オブジェクトを一つずつ編集しなくてもシーン全体の形状を確認できます。

完成映像と比較したければ、Merge 3Dの出力を通常表示用のRenderer 3Dと、Override 3Dを通した確認用のRenderer 3Dへ分岐します。ワイヤーフレームの最終的な見え方はRendererの設定・実装にも依存するため、Viewerだけでなく出力も確認してください。

### 照明の影響を除いたFalloffパスを作る

DaVinci Resolve 21.1のManualに示された例では、**Override 3DとReplace Material 3Dを組み合わせて**シーンの別パスを作ります。Merge 3Dからシーンを分岐し、Override 3Dで各オブジェクトの`Affected by Lights`を無効にした後、Replace Material 3DでFalloffシェーダーを割り当てます。

```text
                 ┌──────────────────────────────→ Renderer 3D（通常の画）
Merge 3D ────────┤
                 └→ Override 3D → Replace Material 3D → Renderer 3D（Falloffパス）
                                        ↑
                                   Falloff Material
```

ここでいう「パス」は、後段の合成や調整のために分けて出力する画像です。形状とカメラは同じシーンから受け取り、片方の経路だけ照明への反応とMaterialを変更します。**Override 3Dは描画属性、Replace Material 3Dは材質**を担当する、という違いが分かる構成です。

### Text 3Dや3D Particleの属性を変更する

Manualは、3D Particleシステムや[Text 3D](./text-3d.md)について、Wireframe・Visibility・Lighting・Matte・IDの設定にOverride 3Dを使うことを明記しています。

たとえば複数のText 3DをMerge 3DでまとめてからOverride 3Dを通せば、それぞれのText 3Dを開き直さずに共通の表示属性を指定できます。ただし、**文字の形状やMaterialまで同時に置換する操作ではありません。**

## 使い分けと確認ポイント

- **Override 3D**：入力済みのオブジェクトの表示・照明・Matte・ID等をまとめて変更します。
- **[Replace Material 3D](./replace-material-3d.md)**：Materialを別の材質に差し替えます。必要ならOverride 3Dと直列に接続します。
- **[Transform 3D](./transform-3d.md)**：位置・回転・拡大縮小といった3D空間での変換を追加します。
- **[Merge 3D](./merge-3d.md)**：複数のオブジェクトやCamera・Lightを一つの3Dシーンへまとめます。

期待した変更が一部にしか適用されない場合は、対象オブジェクトが**Override 3Dの前段に含まれているか**を確認します。全く変化しない場合は、該当する`Do [Option]`が有効か、そこで指定した値が意図どおりかを確認してください。

[Classic 3Dの基礎](../../learn/02-data/classic-3d.md)／[Classic 3Dノード一覧](./index.md)も参照してください。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」、**Override 3D [3Ov]（pp.1959–1960）**に基づきます。SceneInput、`Do [Option]`による一括上書き、Wireframe・Visibility・Lighting・Matte・IDの用途、3D Particle／Text 3Dでの使用、Replace Material 3DとのFalloffパスを確認しています。

内部REGID、Controlsタブ全項目の正式名称・初期値・範囲、21.1実機におけるRenderer／Edition差は未検証です。確認できない仕様を補わず、`verification: partial`を維持します。
