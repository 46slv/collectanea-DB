---
title: 合成量と演算（Blend / Apply Mode / Operator）
description: Mergeで「結果をどれだけ戻すか」「色をどう混ぜるか」「Alphaでどう組み合わせるか」を分けて理解する。
doc_type: concept
term_id: blend-operator
term_short: MergeのBlend、Apply Mode、Operatorを別の役割として読む考え方。
verification: partial
aliases: [Blend, Apply Mode, Operator, compositing mode]
concepts: [blend, compositing-operator, foreground-background]
nodes: [Merge]
tasks: [composite, mix, blend-mode]
prerequisites: [foreground-background, alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# 合成量と演算（Blend / Apply Mode / Operator）

## このページで分かること

<Term id="merge">Merge</Term>には「Blend」「Apply Mode」「Operator」があります。どれも合成結果を変えますが、同じ種類のControlではありません。

## 基本の考え方

21.1 Manualでは、次の3つを分けて扱えます。

- **Blend** — Merge済みの結果をBackgroundへどれだけ戻すか
- **Apply Mode** — ForegroundとBackgroundの色をどの計算で混ぜるか
- **Operator** — 主にAlphaを使ってForeground / Backgroundをどう組み合わせるか

この3つを一度に変えると、何が結果を変えたのか分かりにくくなります。

## Blend

Blendを1.0未満にすると、Merge結果へBackgroundが戻ってきます。

「ForegroundのOpacityを下げる」と似た見た目になる場面はありますが、BlendはMerge処理全体の結果とBackgroundを混ぜるControlです。

## Apply Mode

Apply Modeは、RGBをどの計算で組み合わせるかを選びます。

21.1 ManualにはNormal、Screen、Dissolve、Multiply、Overlay、Difference、Color、Luminosityなど多数のmodeがあります。

たとえば:

- **Normal** — Foreground Alphaを使う通常の合成
- **Screen** — 結果を明るくする方向の合成
- **Multiply** — 色値を乗算し、一般に暗くする方向の合成
- **Difference** — ForegroundとBackgroundの色差を使う

mode名だけを「濃さpreset」と考えず、計算方法そのものが変わると考えます。

## Operator

Operatorは、Apply ModeがNormalまたはScreenのときに表示されます。

代表的なOperator:

- **Over** — ForegroundをBackgroundの上へ置く
- **In** — Background AlphaでForegroundを切り抜く
- **Held Out** — Background Alphaの反転側でForegroundを残す
- **Atop** — Backgroundにmatteがある範囲へForegroundを置く
- **XOr** — ForegroundかBackgroundのどちらか一方だけにmatteがある領域を残す

Mask、Stencil、Underなどもあります。

## 最小確認

最初は次の順で1つずつ変えます。

1. Apply Mode = Normal
2. Operator = Over
3. Blend = 1.0
4. Foreground / Backgroundを確認
5. Blendだけを変更
6. Blendを戻し、Apply Modeだけを変更
7. Normalへ戻し、Operatorだけを変更

これで「量」「色の演算」「Alphaの演算」を分離して観察できます。

## Premultiplicationとの関係

MergeにはSubtractive / Additiveもあり、Foregroundがpremultipliedかどうかで合成結果、特に透明Edgeが変わります。

これはApply ModeやBlendとは別の論点です。

→ [プリマルチプライ（Premultiplication）](./premultiplication)

## よくある誤解

### BlendとOpacityを完全に同じものとして扱う

BlendはMerge済みの結果とBackgroundを混ぜるControlです。

### Apply ModeとOperatorを同じ一覧だと思う

Apply Modeは色の混ぜ方、Operatorは主にAlphaを使った画像の組み合わせ方です。

### modeを変えて直ったので原因も解決したと考える

透明Edgeの問題なら、Alphaやpremultiplicationが原因の可能性があります。見た目が改善しただけで原因を確定しません。

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [MultiMerge](../../nodes/compositing/multi-merge)

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [Merge chainとMultiMergeを選ぶ](../../patterns/compositing/choose-merge-vs-multimerge)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94、pp.2213–2217で、Apply Mode、Operator、Subtractive/Additive、Blendの役割を確認しました。

各Apply Modeの画作りや全数式をこのConceptでは再掲していません。必要なNode固有情報は[Merge](../../nodes/compositing/merge)を参照してください。
