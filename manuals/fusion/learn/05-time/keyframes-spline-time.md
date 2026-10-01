---
title: Keyframe / Spline / Time
description: Fusionのparameterを時間で変化させるときの、KeyframeとSplineの役割を分けて理解する。
doc_type: concept
verification: partial
aliases: [Keyframe, Spline, animation]
concepts: [keyframes, animation-curve, time]
nodes: [Transform, Merge]
tasks: [animate, timing, interpolate]
prerequisites: [parameter-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Keyframe / Spline / Time

## Question

「値を動かす」と「動き方を調整する」は、どこで分けて考えればよいでしょうか。

## Mental Model

まず2つに分けます。

- **Keyframe**: ある時点でparameterにどの値を持たせるか。
- **Spline**: Keyframe間をどのような変化としてつなぐかを調整するview。

Blackmagic Designの現行Fusion紹介でも、Inspectorのcontrolからkeyframeを追加し、Spline Editor / Keyframe Editorでanimationを調整する流れが案内されています。

## Minimum Example

TransformのCenterを使います。

1. 最初の時点でCenterにkeyframeを置く。
2. 後の時点へ移動する。
3. Centerを別の位置へ変更する。
4. 再生して変化を見る。
5. Spline Editorでそのparameterを確認する。

最初は1つのparameterだけを動かし、別のeffectやModifierを同時に足さないようにします。

## Invariants

- animation対象はNode全体ではなく、具体的なparameterとして読む。
- 「開始値と終了値」と「途中の変化」は別の問題。
- 複数parameterを同時に動かす前に、1つのparameterで時間変化を観察する。
- Graphの接続関係とparameterの時間変化は別の軸として診断する。

## Change One Thing

keyframeの値は変えず、Spline側のcurveだけを調整して比較します。

これにより「どこからどこへ移動するか」と「どう移動するか」を分けて観察できます。

## Transfer

### Transform

Center / Size / Angleなど、animatableなcontrolを同じ考え方で観察します。

### Merge

Blendなどのcontrolを時間変化させる場合も、値と補間を分けて考えます。

### Other Node families

Inspectorでkeyframe可能なcontrolを見つけたら、Node名が違っても同じ手順で「value over time」を切り出して確認します。

## Predict

初見Nodeでanimationを作る前に、次を判断できます。

1. どのparameterを変化させるか。
2. keyframeで十分か。
3. curve shapingが必要か。
4. 他parameterとの関係をExpression / Modifierへ分離した方がよいか。

## Common Misread

**Spline Editorを「別のanimation方式」だと思うこと。**

まずは、Keyframeで指定した時間変化を見て調整するためのsurfaceとして捉えると整理しやすくなります。

## Related Patterns

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## Node Reference

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## Next

→ [Expressions](./expressions)

---

Verification note: Inspectorからのkeyframe操作とSpline / Keyframe Editorの存在は、2026-10-02時点のBlackmagic Design公式Fusion紹介と照合済み。補間方式・curve controlの厳密な仕様は今後Reference Manual / hostで確認します。
