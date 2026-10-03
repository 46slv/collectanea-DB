---
title: Resolution / Domain of Definitionを確認する
description: フレーム size・有効ピクセル領域・計算要求領域を分け、切れ・消失・位置ずれを診断する。
doc_type: concept
term_id: resolution-domain-of-definition
term_short: frame size・有効pixel領域・計算要求領域を分ける診断観点。
verification: partial
aliases: [DoD, Domain of Definition, resolution, canvas]
concepts: [resolution, domain-of-definition, canvas, roi]
tasks: [debug, resize, transform, performance]
prerequisites: [coordinate-space, image-data]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---
# Resolution / Domain of Definitionを確認する

## このページで分かること

Transform後に端が消れる、戻しても復活しない、といった症状をresolutionと<Term id="domain-of-definition">Domain of Definition</Term>の違いから整理します。

## 基本の考え方

「画像サイズ」を1つの概念にまとめず、少なくとも次を分けます。

- **フレーム / image extent**: nominalなwidth / height。
- **Canvas / image space**: 画像が配置される空間。
- **<Term id="domain-of-definition">Domain of Definition</Term> (DoD)**: 実際に有効ピクセルが存在する領域。
- **Region of Interest (RoI)**: rendererが今回計算を要求している領域。

DoDは「どこにピクセルが存在するか」、RoIは「どこを今計算してほしいか」で、同じものではありません。

## 最小例

TransformでImageをフレーム外へ動かし、その後戻す構成を考えます。

```text
Image → Transform A (outside) → Transform B (back) → Output
```

Aの段階で有効ピクセルが保持されていれば戻せる場合があります。途中でclip / cropされてピクセルが失われれば、Bで位置を戻しても復活しません。

## 共通ルール

- フレーム sizeとDoDを同じだと決めない。
- 「見えない」と「ピクセルが失われた」を分ける。
- Crop / Resize / Transform等でdomain 挙動が変わる可能性を考える。
- 性能問題ではRoIとDoDの広がりも候補にする。
- クリッピング（clipping）の正確な挙動はNodeごとにReferenceで確認する。

## 1つずつ変えて確認する

途中Nodeを1つ外し、フレーム外へ出したピクセルが後段で戻せるか比較します。

位置だけでなく、「その時点でピクセルが存在しているか」を意識してViewer / Node 挙動を確認します。

## 他のNodeにも応用する

### Transform

position 問題とclipping 問題を分けます。

### Blur / Filter

filterによって必要領域が広がる場合、edgeやdomain 挙動を確認します。

### Resize / Crop

resolutionを変える操作と、単にImageをscaleする操作を同一視しません。

## 初見のNodeを読む

「端が切れる」症状を見たら、次を順に考えられます。

1. 画面外にあるだけか。
2. DoDとしてピクセルは残っているか。
3. 途中でclip / cropされたか。
4. resolution自体が変わったか。

## よくある誤解

**Transformのpositionを元へ戻せば、どこかで失われたピクセルも必ず戻ると思うこと。**

後段は存在するdataしか再配置できません。

## 関連する概念ページ

- [解像度 / アスペクト比（Resolution / Aspect）](../03-space/resolution-aspect)
- [有効領域（Domain of Definition）](../03-space/domain-of-definition)

このページでは、それらを「切れ・消失・位置ずれ」の診断へ使うことだけを扱います。

## 関連パターン

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## 関連Node

- [Transform](../../nodes/transform/transform)
- Resize Referenceはこのバッチで追加します。

## 次に読む

→ [症状ではなくGraphを診断する](./diagnose-graph-not-symptom)

---
検証メモ: DoD / RoI / フレーム extentの区別はFusion 21系semantic baselineに基づく。Nodeごとの現在の clipping/domain 設定は21.1 実機 / マニュアル verificationを優先します。
