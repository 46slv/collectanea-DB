---
title: Keyframe / Expressionの読み替え
description: After EffectsのKeyframe・Graph Editor・Expressionの知識を、FusionのSpline・Expression・パラメータの供給元へ読み替える。
doc_type: bridge
verification: partial
product_scope: resolve
familiar_apps: [after-effects]
familiar_terms: [Keyframe, Graph Editor, Expression, Property]
compare_topics: [animation, expression, parameter-evaluation]
suite_surfaces: [fusion]
tasks: [animate, automate, link-values]
---

# Keyframe / Expressionの読み替え

## After Effectsで知っている考え方

AEではLayer propertyへKeyframeを置き、Graph Editorで時間変化を調整し、Expressionでproperty 値をproceduralに駆動する考え方が中心です。

## Resolveではどこで扱うか

単純なtimeline clip アニメーションならEdit側で十分な場合があります。

Fusion Graph内部のNode パラメータや複数パラメータ間の関係を設計するならFusionのTime / 自動化へ進みます。

## Fusionでの考え方

Fusionではパラメータ 値の参照元として:

- 固定値
- keyframe spline
- expression
- modifier
- トラッキング / audio等のdata

を分けて考えます。

## 共通する考え方

- keyframeで時間上の値を指定する
- curve editorで補間を整える
- expressionで別値から結果を導く
- property/パラメータの参照元を意識する

という目的は移しやすいです。

## そのまま対応しない点

- AE Expression syntax / object modelをFusionへコピーしない。
- AE Graph EditorとFusion Spline Editorを同じUI/APIと考えない。
- Layer property hierarchyとNode パラメータの管理関係は異なる。
- 評価 orderや参照元の時間（参照元 time）の扱いをAE前提で推測しない。

## 次に読む

- [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../../learn/05-time/keyframes-spline-time)
- [式（Expressions）](../../learn/05-time/expressions)
- [フレーム 評価](../../learn/05-time/frame-evaluation)
- [Modifier / パラメータ Sources](../../learn/05-time/modifier-parameter-sources)

## 関連パターン

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## 具体例

- [TransformでImageを移動する](../../recipes/layout/move-image-with-transform)

## 関連する索引

- [Controls / Parameters](../../index/controls-parameters)
- [Concept A–Z](../../index/concept-a-z)

---

検証範囲: Adobeの現行資料でTimeline / Keyframe / Curveの作業方法を確認しています。Fusion固有の構文や評価方法は、このマニュアル内のFusionページで説明します。
