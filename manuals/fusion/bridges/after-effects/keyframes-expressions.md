---
title: Keyframe / Expressionの読み替え
description: AEのKeyframe・Graph Editor・Expression経験を、FusionのSpline・Expression・parameter sourceへ翻訳する。
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

## If you know After Effects

AEではLayer propertyへKeyframeを置き、Graph Editorで時間変化を調整し、Expressionでproperty valueをproceduralに駆動する考え方が中心です。

## First decision in Resolve

単純なtimeline clip animationならEdit側で十分な場合があります。

Fusion Graph内部のNode parameterや複数parameter間の関係を設計するならFusionのTime / Automationへ進みます。

## Fusion mental model

Fusionではparameter valueのsourceとして:

- static value
- keyframe spline
- expression
- modifier
- tracking / audio等のdata

を分けて考えます。

## What maps cleanly

- keyframeで時間上のvalueを指定する
- curve editorで補間を整える
- expressionで別valueから結果を導く
- property/parameterのsourceを意識する

というgoalは移しやすいです。

## What does not map 1:1

- AE Expression syntax / object modelをFusionへコピーしない。
- AE Graph EditorとFusion Spline Editorを同じUI/APIと考えない。
- Layer property hierarchyとNode parameter ownershipは異なる。
- evaluation orderやsource timeの扱いをAE前提で推測しない。

## Learn this next

- [Keyframe / Spline / Time](../../learn/05-time/keyframes-spline-time)
- [Expressions](../../learn/05-time/expressions)
- [Frame Evaluation](../../learn/05-time/frame-evaluation)
- [Modifier / Parameter Sources](../../learn/05-time/modifier-parameter-sources)

## Reusable Patterns

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## Relevant Nodes

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## Example tasks

- [TransformでImageを移動する](../../recipes/layout/move-image-with-transform)

## Related index entries

- [Controls / Parameters](../../index/controls-parameters)
- [Concept A–Z](../../index/concept-a-z)

---

Verification scope: Adobe current documentation confirms timeline/keyframe/curve workflows; Fusion canonical pages own Fusion-specific syntax and evaluation claims.
