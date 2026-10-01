---
title: Transform後にImageの端が消える
description: position問題とclipping / DoD / resolution問題を分離して診断する。
doc_type: diagnostic
verification: partial
aliases: [端が切れる, image clipped, cropped after transform]
concepts: [domain-of-definition, resolution, coordinate-space]
nodes: [Transform, Resize]
tasks: [debug, transform, resolution]
symptoms: [edge-cut-off, clipped-after-transform]
prerequisites: [domain-of-definition]
level: intermediate
product_scope: fusion
---

# Transform後にImageの端が消える

## Fast Checks

1. Imageは単にframe外へ移動しているだけか。
2. Transform前のImage extent / resolutionは何か。
3. 途中にCrop / Resize等があるか。
4. Transform後に戻してもpixelが復活しないか。
5. 問題が起きる最初のNodeはどこか。

## Isolate

```text
source
  ↓
Transform A
  ↓
possible clip / resize stage
  ↓
Transform B
  ↓
output
```

Transform Aの直後、次のNodeの直後、Transform Bの直後をそれぞれViewerで確認します。

## Likely Causes

### 画面外へ移動しただけ

pixel dataが残っていれば後段で戻せる可能性があります。

### 途中でpixelが失われた

Crop / clipping / domain behavior等で有効pixelが失われると、後段Transformだけでは戻せません。

### Resolution自体が変わった

Resizeやformat changeが入っている場合、positionだけでなくimage extentも変わっています。

### Node固有のdomain behavior

同じTransform系でもclipping / domain optionが異なる場合があります。

## Fix

1. Last Good / First Badを特定する。
2. position変更とresolution変更を分離する。
3. pixelが失われるNodeを特定する。
4. 必要ならそのNodeのdomain / clipping設定をcurrent Referenceで確認する。

## Why

「見えない」「切れた」は同じ見た目でも、position・DoD・resolutionのどこでdataを失ったかが異なります。

→ [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)

## Version / Exception Notes

exact clipping / DoD controlはNode・version依存です。Fusion 21.1 host/manual evidenceを優先します。

## Related Symptoms

- Viewerに何も表示されない
- Resize後に位置関係が変わる
- frame外へ動かしたImageが戻らない
