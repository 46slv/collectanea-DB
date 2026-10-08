---
title: "Replace Material 3D"
description: "Classic 3D scene内のgeometryへ割り当てられたMaterialを、別Materialまたは2D Image由来の材質へ置き換えるNode。"
doc_type: node
term_id: "replace-material-3d"
term_short: "Replace Material 3Dは、Classic 3D geometryのMaterialを差し替え、Object ID・Material ID・RGBA channelで適用範囲を絞れるNode。"
verification: partial
aliases: ["Replace Material 3D", "3Rpl"]
concepts: ["classic-3d"]
nodes: ["Replace Material 3D"]
node_family: "3d"
controls: ["Enable", "Replace Mode", "Limit by Object ID", "Limit by Material ID"]
inputs: ["classic-3d", "material", "image"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Replace Material 3D

Replace Material 3D [3Rpl]は、<Term id="classic-3d">Classic 3D scene</Term>に含まれるgeometryのMaterialを、別のMaterialへ差し替えるNodeです。

SceneInputに3D sceneまたは3D textを入れ、MaterialInputへ新しい3D Materialか2D Imageを接続します。Materialだけを変更するため、入力sceneに含まれるCameraとLightはそのまま後段へ渡されます。

Text 3Dは一般的なMaterial inputを持たないため、Text 3Dのbuilt-in materialを別のshaderへ置き換えたいときにも使います。

## 役割

Replace Material 3Dが変更するのは**geometryへ割り当てられたMaterial**です。geometryの形やCamera、Lightを作り直すNodeではありません。

scene全体のMaterialを一括で置き換えるだけでなく、Object IDやMaterial IDで対象を限定したり、RGBA channelごとに元Materialを残す・置き換える・混ぜるといった指定もできます。

## 入力

### SceneInput

オレンジ色の入力です。

Materialを置き換えたい3D scene、3D object、または3D textを接続します。入力sceneにCameraやLightが含まれていても、それらはMaterial置換の対象にならず、そのまま出力へ渡されます。

### MaterialInput

緑色の入力です。次のどちらかを接続できます。

- **3D Material**: 接続したMaterialをreplacementとして使います。この場合、Replace Material 3D内蔵のbasic materialは無効になります。
- **2D Image**: Imageを内蔵basic materialのdiffuse texture mapとして使います。

2D Imageを接続した場合は、Imageそのものを3D sceneへ合成するのではありません。Imageの画素を材質のdiffuse textureとして利用します。

## 出力

出力はMaterial置換後のClassic 3D sceneです。

Replace Material 3Dを通した後もdata domainはClassic 3Dのままなので、必要に応じてMerge 3DでCamera・Light・他のgeometryとまとめ、Renderer 3Dで2D Imageへ変換します。

~~~text
3D Source → Replace Material 3D → Merge 3D → Renderer 3D → Image
                 ↑
             Material
~~~

## 主な設定項目

### Enable

Material replacementだけを有効・無効にします。

Inspector左上の赤いtool switchとは役割が異なります。赤いswitchはNode自体を無効にしますが、EnableはReplace Material 3DのMaterial置換処理だけを切り替えます。Settings tabのscript等、Nodeの他の処理はEnableとは別に扱われます。

### Replace Mode

RGBA channelごとに、入力Materialをどう適用するか選べます。

- **Keep**: 元Materialの該当channelを残します。
- **Replace**: replacement Materialの該当channelへ置き換えます。
- **Blend**: 元Materialとreplacement Materialを混ぜます。
- **Multiply**: 両方の該当channelを乗算します。

たとえばRedだけをReplaceにし、他channelをKeepにすれば、Material全体を一律に置き換えずchannel単位で処理を分けられます。

### Limit by Object ID / Material ID

置換対象をIDで限定できます。

**Limit by Object ID**または**Limit by Material ID**を有効にすると、対象IDを指定するsliderが表示されます。指定条件に一致しないobjectは元のMaterialを保持します。

両方を同時に有効にした場合は、**Object IDとMaterial IDの両方へ一致した対象だけ**が置換されます。

## 主な用途

### Text 3Dへ別Materialを適用する

Text 3Dはbuilt-in materialを持ちますが、一般的なMaterial inputはありません。別のMaterial shaderを使いたい場合は、Text 3Dの後段へReplace Material 3Dを置きます。

~~~text
Text 3D ───────→ Replace Material 3D → Merge 3D → Renderer 3D
                       ↑
                 3D Material
~~~

21.1 Manualでは、Text 3Dのdefault materialをchrome shaderへ置き換える例が示されています。

### sceneの一部だけ材質を差し替える

複数objectを含むsceneでも、Object IDやMaterial IDを使えば対象を限定できます。

たとえば同じscene内の一部objectだけ別Materialへ変更し、他のobjectは元Materialのまま残す構成にできます。Object IDとMaterial IDを同時に使う場合は両条件へ一致した対象だけが処理されます。

### 2D Imageをdiffuse textureとして使う

MaterialInputへ2D Imageを直接接続すると、そのImageをReplace Material 3D内蔵basic materialのdiffuse texture mapとして利用できます。

高度なshader networkが不要で、まず画像を材質の表面色として使いたい場合に使えます。

## 運用例

Text 3Dへ別Materialを割り当てる場合は、まずText 3D単体をRenderer 3Dで確認し、その後Replace Material 3Dを間へ追加すると、Material差し替えによる変化だけを確認できます。

~~~text
Text 3D → Replace Material 3D → Renderer 3D
                ↑
             Material
~~~

複数objectがあるsceneでID制限を使う場合は、最初に制限なしでMaterial置換が成立することを確認し、その後Limit by Object IDまたはLimit by Material IDを有効にすると、Material自体の問題と対象選択の問題を分けて確認できます。

## 挙動と注意点

- Replace Material 3DはgeometryのMaterialを変更します。geometryの形やTransformを変更するNodeではありません。
- CameraとLightは入力sceneからそのまま通過します。
- MaterialInputへ2D Imageを接続した場合、そのImageはbuilt-in materialのdiffuse textureとして扱われます。
- 3D MaterialをMaterialInputへ接続すると、Node内蔵のbasic materialは無効になります。
- Object IDとMaterial IDの制限を両方使うと、両方の条件へ一致する対象だけが置換されます。
- EnableはMaterial replacement部分のswitchであり、Node全体を無効にする赤いtool switchとは別です。

## 関連する考え方

- [Classic 3D scene](../../learn/02-data/classic-3d.md)

## 関連Node

- [Text 3D](./text-3d.md): 一般的なMaterial inputを持たない3D textへ別Materialを適用するときにReplace Material 3Dを後段へ置きます。
- [OpenPBR](../materials-lights/openpbr.md): replacementとして使える3D Materialを組み立てるNodeです。
- [Merge 3D](./merge-3d.md): Material置換後のgeometryをCamera・Light・他objectと同じsceneへまとめます。
- [Renderer 3D](./renderer-3d.md): Classic 3D sceneを2D Imageへ変換します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 88「3D Nodes」のReplace Material 3D [3Rpl]（pp.1979–1980）を基準にしています。

確認した項目は、SceneInput / MaterialInput、2D Imageと3D MaterialをMaterialInputへ接続した場合の違い、Camera / Lightのpass-through、Enable、RGBA channel別のReplace Mode、Object ID / Material IDによる制限、Text 3Dへの適用例です。

runtime REGID、現在のEffects Library表示、IDのdefault / range、Edition差、実機render結果は別verification対象として残しているため、verification: partialを維持しています。
