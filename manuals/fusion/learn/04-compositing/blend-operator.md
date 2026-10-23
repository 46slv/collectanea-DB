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

## 実機で3つのControlを個別に変える

Resolve Studio 21.1.0.14、Windows、日本語UIで、同じチャートと赤い楕円を2つのMergeへ分岐させました。左のMergeBaseはNormal / Over / Blend 1で固定し、右のMergeChangedだけを変更します。

[![チャートと赤い楕円の画像をMergeBaseとMergeChangedへ別々に接続した比較用の実機Graph](/img/fusion/captures/S32/graph.png)](/img/fusion/captures/S32/graph.png)

[![変更前のMergeChanged Inspector。適用モードNormal、Operator Over、Blend 1](/img/fusion/captures/S32/inspector.png)](/img/fusion/captures/S32/inspector.png)

[![比較の基準。左右ともNormal、Over、Blend 1で赤い楕円がチャートの上に重なる](/img/fusion/captures/S32/compare.png)](/img/fusion/captures/S32/compare.png)

### Blendを0.5へ

[![適用モードNormal、Operator Overを保ち、Blendだけを0.5にしたInspector](/img/fusion/captures/S32/blend-inspector.png)](/img/fusion/captures/S32/blend-inspector.png)

[![左の基準に対し、右はBlend 0.5で楕円の内側にもチャートが透けて見える](/img/fusion/captures/S32/blend.png)](/img/fusion/captures/S32/blend.png)

Blendだけを0.5にすると、右は楕円の内側にもBackgroundが戻ります。

### Apply ModeをMultiplyへ

[![Blendを1へ戻し、適用モードをMultiplyにしたInspector。この状態ではOperator欄が表示されない](/img/fusion/captures/S32/multiply-inspector.png)](/img/fusion/captures/S32/multiply-inspector.png)

[![右のMultiplyでは楕円の範囲が暗くなり、チャートの線や色の違いが乗算結果として残る](/img/fusion/captures/S32/multiply.png)](/img/fusion/captures/S32/multiply.png)

Blendを1へ戻してMultiplyを選ぶと、重なる部分の色の計算が変わります。このUI状態ではOperator欄が表示されません。

### Normalへ戻してOperatorをInへ

[![適用モードをNormalに戻し、Blend 1のままOperatorをInへ変えたInspector](/img/fusion/captures/S32/in-inspector.png)](/img/fusion/captures/S32/in-inspector.png)

[![左はチャート上へのOver、右のInは赤い前景だけが残り、楕円の外は透明な市松模様になる](/img/fusion/captures/S32/in.png)](/img/fusion/captures/S32/in.png)

最後はNormal / Blend 1へ戻したうえでOperatorだけをInにしました。BackgroundのAlphaが全面1なので、右には赤い前景の形が残ります。チャートのRGBを背景として残すOverとは違う結果です。

各比較は基準から対象のControlだけを変えています。フレーム0、両Viewer 40%。書き出したGraphはNormal / Over / Blend 1へ復元した状態です。半透明背景や他のmode、Premultiplicationの違いはこの撮影に含めていません。

[再現用Graph](/img/fusion/captures/S32/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S32/capture.json)

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
