---
title: Frame Evaluation
description: parameter value・composition time・source time・render requestを分け、Fusionがframeを評価する仕組みを理解する。
doc_type: concept
verification: partial
aliases: [frame evaluation, composition time, render request]
concepts: [evaluation, time, render-request]
tasks: [animate, debug, temporal-effect, automate]
prerequisites: [node-graph, keyframes]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Frame Evaluation

## Question

「Nodeに値を設定した」ことと、「そのframeでその値が使われた」ことは同じでしょうか。

## Mental Model

Fusionでは次を分けます。

- **parameter value** — その時点でNode input/controlが返す値。
- **composition time** — composition上のcurrent frame / time。
- **source time** — Loader / MediaIn / retime等が参照するsource側時間。
- **render request** — hostが実際に評価を要求するframe / region / channel。

Graphはcurrent requestに応じて評価されます。

## Minimum Example

1つのanimated parameterを持つNodeを選び、frameを移動します。

同じNodeでもframeごとにparameter valueが変わり、Viewer outputが変化することを確認します。

## Invariants

- stored control値とevaluated valueを分ける。
- composition timeとsource timeを分ける。
- rendererが必ずframe 0 → 1 → 2の順で評価すると仮定しない。
- temporal effectやcustom automationではprevious-frame mutable stateを暗黙に持たせない。

## Change One Thing

current frameだけを変え、Graph接続・parameter sourceは固定します。

## Transfer

### Keyframes

Splineがcurrent timeに対してvalueを供給する層として読めます。

### Expressions / Modifiers

static valueではなく別のsourceからparameterが評価されると理解できます。

### Temporal tools

前後frameを必要とする処理では、明示的なtime reference / cache designを確認します。

## Predict

animation不具合で「値が入っているか」だけでなく、「どのtimeで何がevaluationされたか」を確認できます。

## Common Misread

**timelineを順再生したときだけ正しければ、renderでも同じ評価順になる**と考えること。

cache、parallel render、scrub、out-of-order requestがあり得るため、順序依存の暗黙stateは危険です。

## Related Patterns

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Node Reference

時間依存NodeのReferenceは今後拡張します。

## Next

→ [Modifier / Parameter Sources](./modifier-parameter-sources)

---

Verification note: parameter value / composition time / source time / render requestの分離とout-of-order evaluation注意はFusion 21系semantic baselineで確認。
