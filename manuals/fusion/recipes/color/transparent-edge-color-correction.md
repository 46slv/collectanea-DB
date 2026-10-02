---
title: 透明エッジ（Edge）を保って色補正する（Color Correct）
description: 透明部分を持つ前景（Foreground）を色補正するとき、プリマルチプライ（Premultiplication）とマット（Matte）を分けて考え、エッジの乱れを避ける構造。
doc_type: recipe
verification: partial
aliases: [color correct transparent edge, premult color correction]
concepts: [alpha, premultiplication, color-adjustment]
patterns: [premult-aware-color-operation]
nodes: [Alpha Divide, Color Corrector, Alpha Multiply]
tasks: [color-correct, transparency, alpha]
prerequisites: [alpha, premultiplication]
level: intermediate
product_scope: fusion
---

# 透明エッジ（Edge）を保って色補正する（Color Correct）

> 必ずAlpha Divide / Multiplyが必要という意味ではありません。Color Node自身のpremult-aware 設定がある場合は、現在のFusion 21.1 挙動を確認して二重処理を避けます。

## 作るもの（Result）

透明部分を持つ前景（Foreground）へ色処理（Color operation）を加えつつ、edge RGB / Alpha 関係を壊さない構造を作ります。

## 必要なもの（Requirements）

- Alphaを持つ前景（Foreground）
- 色処理を行うNode
- 参照元とNodeの挙動に応じたプリマルチプライの扱い

## 手順（Steps）

1. 前景（Foreground）単体でAlphaとedgeを確認します。
2. 色処理（Color operation）を一度適用し、エッジの乱れ（artifact）が出るか確認します。
3. プリマルチプライの関係が原因と判断できる場合、明示的なAlpha Divide / Alpha Multiply構造を検討します。
4. 色処理（Color operation）前へAlpha Divide、後へAlpha Multiplyを置きます。
5. Merge前の前景（Foreground）単体を再確認します。
6. 最終合成でエッジ（Edge）を確認します。

```text
Foreground
  → Alpha Divide
  → Color Corrector
  → Alpha Multiply
  → Merge
```

## なぜこの構成で動くか（Why This Works）

色処理（Color operation）をストレートRGB（straight RGB）側で行い、合成前にプリマルチプライの関係へ戻すことで、透明エッジ（Edge）のRGBを扱いやすくする構造です。

## 別の方法（Variants / Alternatives）

- Color Corrector側の前後処理の設定（pre/post 設定）を使う。
- Matte Controlでマット（Matte）の形状を別段階として修正する。
- Keyer後の色かぶり（spill）/ エッジ処理を独立させる。

## うまくいかないときの確認（Failure Checks）

- 参照元が本当にpremultipliedか。
- Color Node側ですでにプリマルチプライ対応の処理をしていないか。
- Alpha Divide / Multiplyを二重に使っていないか。
- エッジ（Edge）の問題がマット（Matte）の形状由来ではないか。

## 関連パターン（Related Pattern）

- [アルファ（Alpha）を保ったまま色処理する](../../patterns/color-alpha/premult-aware-color-operation)

## 関連ノード（Related Nodes）

- [Alpha Divide](../../nodes/matte-keying/alpha-divide)
- [Color Corrector](../../nodes/color/color-corrector)
- [Alpha Multiply](../../nodes/matte-keying/alpha-multiply)
