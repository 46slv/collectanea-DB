---
title: 合成量と演算（Blend / Operator）
description: 合成結果のmix量と、Foreground/Background間の合成演算を別々に理解する。
doc_type: concept
verification: partial
aliases: [Blend, Apply Mode, Operator, compositing mode]
concepts: [blend, compositing-operator, foreground-background]
nodes: [Merge]
tasks: [composite, mix, blend-mode]
prerequisites: [foreground-background, alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# 合成量と演算（Blend / Operator）

## このページで分かること（Question）

Mergeで「どれだけ混ぜるか」と「どう合成するか」は同じcontrolでしょうか。

## 基本の考え方（Mental Model）

少なくとも次を分けます。

- **Blend** — 合成結果と元状態のmix量。
- **Apply / Operator** — ForegroundとBackgroundをどの演算意味で合成するか。

Over、In、Atop、Xor、Screen等は同じ種類の「濃さ違い」ではなく、channel / alpha semanticsが異なる合成 operationです。

## 最小例（Minimum Example）

まず通常の合成でForeground / Backgroundを確認します。

次にBlendだけを変え、演算modeは固定します。

その後、Blendを戻してOperator / Apply Modeだけを変更します。

## 共通ルール（Invariants）

- amountとoperationを分ける。
- mode名だけでalpha 挙動を推測しない。
- Screen等を通常のalpha-aware Overと同一視しない。
- input 役割が正しいことを確認してからmodeを比較する。

## 1つだけ変えて確認する（Change One Thing）

BlendかOperatorのどちらか片方だけを変更します。

## 他のNodeへ応用する（Transfer）

### Merge

Node固有controlを「量（Amount）」と「演算（Operation）」へ分けて読めます。

### Color / effect nodes

Blend相当のeffect mixがあっても、合成 operatorと同じ意味だと決めません。

### 診断

「modeを変えたら直った」を原因説明にせず、alpha / channel semanticsへ戻れます。

## 初見Nodeで予測する（Predict）

初見の合成 controlで、値のmixか演算選択かを先に分類できます。

## よくある誤解（Common Misread）

**Screen / Multiply等をBlend値のpresetのように考えること。**

演算自体が変わるため、RGB / alphaの意味も確認します。

## 関連する再利用構成（Patterns）

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## 関連Node

- [Merge](../../nodes/compositing/merge)

## 次に読む

→ [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../05-time/keyframes-spline-time)

---

検証メモ: MergeのBlend、Apply/Operatorと複数合成 operationの区別はFusion 21系semantic baselineで確認。21.1 正確なUI表記 label / mode inventoryは現在の Manual / 実機で確認します。
