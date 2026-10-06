---
title: Transform後にImageの端が消える
description: frame外への移動、Edges、Crop / Resize / Scaleによる解像度変更、DoD clippingを分けて確認する。
doc_type: diagnostic
verification: partial
aliases: [端が切れる, image clipped, cropped after transform]
concepts: [domain-of-definition, resolution, coordinate-space]
nodes: [Transform, Resize, Scale, Crop]
tasks: [debug, transform, resolution]
symptoms: [edge-cut-off, clipped-after-transform]
prerequisites: [domain-of-definition]
level: intermediate
product_scope: fusion
updated: "2026-10-04"
---

# Transform後にImageの端が消える

## まず確認すること

端が消えたときは、最初に「Transformでframe外へ移動しただけ」なのか、「途中でImageの解像度や有効領域が変わった」のかを分けます。

1. TransformのCenterを0.5 / 0.5へ戻すとImage全体が見えるか。
2. TransformのEdgesはCanvas / Wrap / Duplicate / Mirrorのどれか。
3. Transform前後のWidth / Heightは同じか。
4. upstream / downstreamにCrop、Resize、Scaleがあるか。
5. CropのClipping ModeやDoDを変更しているNodeがあるか。
6. 最初に端が消えるNodeはどこか。

## 原因を切り分ける

```text
source
  ↓
Transform
  ↓
Crop / Resize / Scale?
  ↓
Effect
  ↓
output
```

各Node直後をViewerへ出して、最後に正常だった地点と最初に変わった地点を特定します。

## 主な原因

### frame外へ移動した

Transformは出力解像度を変えません。CenterでImageをframe外へ移動すると見えなくなりますが、それだけではWidth / Heightが変わったわけではありません。

Centerを中央へ戻して復帰するなら、まず位置の問題です。

### EdgesがCanvasになっている

Transformで元Imageの外側が露出すると、Edges = CanvasではCanvas Colorが表示されます。

繰り返し画像ならWrap、端を延長したい場合はDuplicate、反射させたい場合はMirrorが使えます。ただし、見た目を埋めるためだけにEdgesを変えず、必要な境界処理を選びます。

### Cropでpixel自体を切り出した

CropはMaskと違い、出力Width / Heightを変更します。

Cropで範囲外になったpixelは、後段Transformで位置を戻すだけでは元のキャンバス構成へ戻りません。

### Resize / Scaleで解像度が変わった

Resizeはピクセル寸法、Scaleは倍率でImage解像度を変更します。

その後に同じCenter値を使っても、正規化位置と実pixel距離の関係が変わる場合があります。

### DoD / Clipping Modeが関係している

CropにはFrame / Domain / NoneのClipping Modeがあります。

Blur等がupstream DoD外のpixelを必要とする構成では、Clipping Modeによって「端が切れた」ように見える場合があります。

## 修正方法

1. Transformだけの構成まで一度単純化する。
2. Centerを0.5 / 0.5、Sizeを基準状態へ戻してImage全体を確認する。
3. Edgesを確認する。
4. Crop / Resize / Scaleを1つずつ戻し、Width / Heightが変わる地点を確認する。
5. DoD問題が疑われる場合だけClipping Modeや関連NodeのDomain設定を確認する。

原因が分かる前にTransform SizeやCrop Sizeを同時に調整すると、位置問題と解像度問題を混同しやすくなります。

## なぜ起きるか

Transform、Resize、Scale、Cropは同じTransformカテゴリにありますが、責任が違います。

- Transform: 解像度を維持して配置を変える
- Resize: 指定Width / Heightへ解像度を変える
- Scale: 倍率で解像度を変える
- Crop: 切り出して新しいキャンバス寸法へ変える

この違いを先に確認すると、「移動したのか」「pixelが失われたのか」を分離できます。

## 関連する考え方

- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)
- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)
- [Scale](../../nodes/transform/scale)
- [Crop](../../nodes/transform/crop)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120でTransformのEdgesと解像度非変更、Crop / Resize / Scaleの解像度変更、CropのClipping Modeを確認しました。

実際のDoDはupstream Nodeや素材で変わるため、特定のGraphでの結果は実機確認が必要です。
