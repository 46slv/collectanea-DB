---
title: キーフレーム / スプライン / 時間（Keyframe / Spline / Time）
description: Fusionのパラメータを時間で変化させるときの、KeyframeとSplineの役割を分けて理解する。
doc_type: concept
term_id: keyframes-spline-time
term_short: KeyframeとSplineでparameterの時間変化を作る仕組み。
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
# キーフレーム / スプライン / 時間（Keyframe / Spline / Time）

## このページで分かること

値そのものの変化と、その変化の仕方を分けて扱う方法を説明します。

## 基本の考え方

まず2つに分けます。

- **Keyframe**: ある時点でパラメータにどの値を持たせるか。
- **Spline**: Keyframe間をどのような変化としてつなぐかを調整するview。

Blackmagic Designの現行Fusion紹介でも、Inspectorのcontrolからkeyframeを追加し、Spline Editor / Keyframe Editorでアニメーションを調整する流れが案内されています。

## 最小例

<Term id="transform">Transform</Term>のCenterを使います。

1. 最初の時点で<Term id="center-pivot-size-angle">Center</Term>にkeyframeを置く。
2. 後の時点へ移動する。
3. Centerを別の位置へ変更する。
4. 再生して変化を見る。
5. Spline Editorでそのパラメータを確認する。

最初は1つのパラメータだけを動かし、別のeffectやModifierを同時に足さないようにします。

## 共通ルール

- アニメーション対象はNode全体ではなく、具体的なパラメータとして読む。
- 「開始値と終了値」と「途中の変化」は別の問題。
- 複数パラメータを同時に動かす前に、1つのパラメータで時間変化を観察する。
- Graphの接続関係とパラメータの時間変化は別の軸として診断する。

## 1つずつ変えて確認する

keyframeの値は変えず、Spline側のcurveだけを調整して比較します。

これにより「どこからどこへ移動するか」と「どう移動するか」を分けて観察できます。

## 他のNodeにも応用する

### Transform

Center / Size / Angleなど、animatableなcontrolを同じ考え方で観察します。

### Merge

Blendなどのcontrolを時間変化させる場合も、値と補間を分けて考えます。

### Other Node families

Inspectorでkeyframe可能なcontrolを見つけたら、Node名が違っても同じ手順で「値 over time」を切り出して確認します。

## 初見のNodeを読む

初見Nodeでアニメーションを作る前に、次を判断できます。

1. どのパラメータを変化させるか。
2. keyframeで十分か。
3. curve shapingが必要か。
4. 他パラメータとの関係をExpression / Modifierへ分離した方がよいか。

## よくある誤解

**Spline Editorを「別のアニメーション方式」だと思うこと。**

まずは、Keyframeで指定した時間変化を見て調整するためのsurfaceとして捉えると整理しやすくなります。

## Deepen

- [フレーム 評価](./frame-evaluation)
- [Modifier / パラメータ Sources](./modifier-parameter-sources)

## 関連パターン

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## 次に読む

→ [式（Expressions）](./expressions)

---
検証メモ: Inspectorからのkeyframe操作とSpline / Keyframe Editorの存在は、2026-10-02時点のBlackmagic Design公式Fusion紹介と照合済み。補間方式・curve controlの厳密な仕様は今後Reference Manual / 実機で確認します。
