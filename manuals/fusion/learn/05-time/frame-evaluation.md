---
title: フレーム評価（Frame Evaluation）
description: パラメータ 値・composition time・参照元の時間（参照元 time）・render requestを分け、Fusionがフレームを評価する仕組みを理解する。
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

# フレーム 評価

## このページで分かること

Nodeに値を設定することと、そのフレームで実際に使われる値を分けて考えます。

## 基本の考え方

Fusionでは次を分けます。

- **パラメータ 値** — その時点でNode input/controlが返す値。
- **composition time** — composition上の現在の フレーム / time。
- **参照元の時間（参照元 time）** — Loader / MediaIn / retime等が参照する参照元側時間。
- **render request** — hostが実際に評価を要求するフレーム / region / channel。

Graphは現在の requestに応じて評価されます。

## 最小例

1つのanimated パラメータを持つNodeを選び、フレームを移動します。

同じNodeでもフレームごとにパラメータ 値が変わり、Viewer outputが変化することを確認します。

## 共通ルール

- stored control値とevaluated 値を分ける。
- composition timeと参照元の時間（参照元 time）を分ける。
- rendererが必ずフレーム 0 → 1 → 2の順で評価すると仮定しない。
- temporal effectやcustom 自動化ではprevious-フレーム mutable stateを暗黙に持たせない。

## 1つずつ変えて確認する

現在の フレームだけを変え、Graph接続・パラメータの供給元は固定します。

## 他のNodeにも応用する

### Keyframes

Splineが現在の timeに対して値を供給する層として読めます。

### Expressions / Modifiers

固定値ではなく別の参照元からパラメータが評価されると理解できます。

### Temporal tools

前後フレームを必要とする処理では、明示的なtime reference / cache designを確認します。

## 初見のNodeを読む

アニメーション不具合で「値が入っているか」だけでなく、「どのtimeで何が評価されたか」を確認できます。

## よくある誤解

**timelineを順再生したときだけ正しければ、renderでも同じ評価順になる**と考えること。

cache、parallel render、scrub、out-of-order requestがあり得るため、順序依存の暗黙stateは危険です。

## 関連パターン

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連Node

時間依存NodeのReferenceは今後拡張します。

## 次に読む

→ [Modifier / パラメータ Sources](./modifier-parameter-sources)

---

検証メモ: パラメータ 値 / composition time / 参照元の時間（参照元 time） / render requestの分離とout-of-order 評価注意はFusion 21系semantic baselineで確認。
