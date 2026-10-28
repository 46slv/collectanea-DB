---
title: sExpand
description: Shapeの領域を外側へ広げたり内側へ縮めたりし、角の処理を調整するShapeノード。
doc_type: node
term_id: sexpand
term_short: sExpandは入力されたShapeの領域を膨張・収縮させるノード。
verification: partial
aliases: [sExpand]
concepts: [shape-data]
nodes: [sExpand]
node_family: shapes
inputs: [shape]
outputs: [shape]
controls: [Amount, Border Style, Miter Limit]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# sExpand

sExpandは、入力した<Term id="shape-data">Shape</Term>の外形を広げたり、内側へ縮めたりするノードです。例えば、複数の図形を一つにまとめてから外側へ少し大きくしたり、元の図形を縮めて内側の領域を作ったりできます。

これは画像の拡大縮小ではありません。**Shapeの領域そのものを膨張・収縮する処理**です。Shapeが初めての場合は、先に[シェイプ（Shape）の基本](../../learn/02-data/shape)を参照してください。

## 入力と出力

**Input1（オレンジ、必須）**に別のShapeノードの出力を接続します。単体の円・星・多角形だけでなく、複数の図形を組み合わせたShapeも入力できます。

出力もShapeです。後段でさらに形状を加工でき、画像として表示・合成する地点で[sRender](./s-render)を接続します。画像をそのまま入力するノードではありません。

```text
sStar ─────┐
           ├─ sBoolean（Union）→ sExpand → sRender → Merge
sEllipse ──┘
```

この構成では、星と円を`sBoolean`で一つの形にまとめ、その外周を`sExpand`で広げてから画像化します。`sRender`を挟むまでは通常の2D ImageではなくShapeとして扱われます。

## InspectorのControls

### Amount：どれだけ広げるか

- **正の値**：Shapeを外側へ膨張（Dilate）させます。
- **負の値**：Shapeを内側へ収縮（Erode）させます。
- **0**：膨張・収縮のない状態を確認する基準として使えます。

例えば小さな星のAmountを正にすると星の領域が太り、負にすると領域が細ります。元の形が細い場合、大きく収縮させると残る領域が小さくなるため、`sRender`の表示を見ながら調整してください。

Amountはオブジェクト全体の位置・サイズを変える[sTransform](./stransform)とは異なります。星を単に大きく表示する操作と、星の各辺を外側へ押し広げる操作では、角や凹みの結果が変わります。

Amountの単位、初期値、許容範囲はここでは断定しません。画面上の具体的な広がり量は、元Shapeと出力解像度を含めて確認してください。

### Border Style：角のつながり方

Shapeを膨張・収縮したとき、角の部分をどの形でつなぐか決めます。選択肢は次の4種類です。

- **Bevel**：角を斜めに切り落とします。
- **Round**：角を丸くします。
- **Miter**：角を尖らせたままつなごうとします。
- **Miter Clip**：尖った角を保ちつつ、限界を超えた部分を切り詰めます。

円のように鋭い角のない図形より、星や多角形で切り替えると違いが分かりやすくなります。

### Miter Limit：尖った角の限界

Border Styleが**Miter**または**Miter Clip**のときに表示されます。角を尖らせた状態でつなぐ範囲の限界を決める設定です。角が極端に長く伸びることを抑えるために使います。

Miter Limitは常に表示される項目ではありません。BevelやRoundを選んでいるときに項目が見えなくても異常ではありません。

### Settings

SettingsタブはShape系ノード共通の設定です。ここで説明したAmount、Border Style、Miter LimitはsExpandのControlsです。共通Settingsの個別項目や初期値は、この記事では未確認のまま補いません。

<!-- capture:S168 -->

## 実機例：円の領域を広げる・縮める

`sEllipse` のShapeを `sExpand` に接続し、元のShapeと処理後のShapeをそれぞれ `sRender` で画像化します。Amountを+0.05と−0.05に変え、同じframeで比較しました。

正の値では円が広がり、負の値では小さくなります。市松模様はViewerの透明表示です。撮影後は+0.05へ戻して保存しました。[接続と設定の記録](/img/fusion/captures/S168/readback.json)に条件を記載しています。

[![sEllipseからsExpandを経てsRenderで画像化する構成](/img/fusion/captures/S168/graph.png)](/img/fusion/captures/S168/graph.png)

元ShapeとsExpand後のShapeをそれぞれsRenderで画像化します。

[![sExpandのAmount 0.05を示すInspector](/img/fusion/captures/S168/controls.png)](/img/fusion/captures/S168/controls.png)

正の比較ではAmountを0.05に設定しています。

[![元の円とAmount 0.05で広げた円の比較](/img/fusion/captures/S168/positive.png)](/img/fusion/captures/S168/positive.png)

左は元の円、右はAmount 0.05で広げた結果です。

[![元の円とAmountマイナス0.05で縮めた円の比較](/img/fusion/captures/S168/negative.png)](/img/fusion/captures/S168/negative.png)

右のAmountを−0.05にすると、同じ円が小さくなります。

[再現用Graph](/img/fusion/captures/S168/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S168/capture.json)

<!-- /capture:S168 -->

## 具体的な使い方

### 1. テロップの背景を文字の周囲へ広げる

```text
sRectangle → sExpand → sRender ─┐
                               ├─ Merge → MediaOut
Text+ ─────────────────────────┘
```

`sRectangle`でテロップの背景になる四角形を作ります。その後ろに`sExpand`を置き、Amountを正にすると外形が広がります。角丸や角の形を維持したい場合はBorder Styleを切り替え、`sRender`で画像化してText+の画像と重ねます。

これは文字の大きさを自動計測する構成ではありません。文字と背景の位置・サイズは別に合わせる必要があります。外周に余白を足すとき、四角形を手で拡大する代わりにShapeの輪郭を調整できる点が利点です。

### 2. 組み合わせた図形に共通の外側余白を作る

```text
sStar ─────┐
           ├─ sBoolean（Union）→ sExpand → sRender
sEllipse ──┘
```

星と円が重なるアイコンを作り、`sBoolean`のUnionで図形の領域を結合します。その結果を`sExpand`へ渡してAmountを正にすると、結合した外形の周囲を広げられます。個別の図形に別々の拡張量を与えるのではなく、結合後のシルエットを一括で加工したい場合に使います。

重なった図形を別々のまま残すなら[sMerge](./smerge)、領域を一つに計算するなら[sBoolean](./sboolean)という違いも押さえておいてください。

### 3. 元の形との差から縁取り状のShapeを作る

```text
             ┌─ sExpand（Amountを正）─→ sBoolean Input1 ─┐
sNGon ───────┤                                          ├─ sBoolean（Subtract）→ sRender
             └──────────────────────→ sBoolean Input2 ─┘
```

`sNGon`の出力を二つに分け、一方だけ`sExpand`で大きくします。`sBoolean`をSubtractにして、**Input1へ拡張したShape、Input2へ元のShape**を入れると、元の領域が差し引かれ、外周側に残る形を作れます。順番を逆にすると引き算の結果が変わるので注意してください。

この例は公式の入力仕様とBoolean演算から組み立てた制作例であり、21.1実機での表示結果は未検証です。実際の線の見た目を直接設定したい場合は、[sOutline](./soutline)も検討してください。

## 似た処理との違い・注意点

- **[sOutline](./soutline)**：Shapeの輪郭を線として扱い、ThicknessやCap Styleなどで描き方を調整します。sExpandのAmountは線幅の設定ではなく、Shapeの領域の膨張・収縮です。
- **[sTransform](./stransform)**：位置・サイズ・回転を変更します。sExpandは同じ場所にある形の境界を加工します。
- **[sBoolean](./sboolean)**：2つのShapeをUnionやSubtractなどで組み合わせます。sExpandには複数Shapeを結合する演算モードはありません。
- **画像・Mask系のErode / Dilate**：似た発想でも扱うデータが異なります。sExpandにはShapeを入力し、Shapeを出力します。通常の画像処理を続ける場合は先にsRenderで画像化します。

角の鋭い図形ではBorder StyleとMiter Limitが結果に大きく影響します。Amountを先に決めてから角の形を調整し、必要なら出力サイズでも確認すると、意図しない長い突起を見つけやすくなります。

[Shapeノード一覧](./)へ戻ると、生成・結合・加工・描画の各ノードを役割別に探せます。

## バージョンと出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2741–2742**を参照。Input1（必須、オレンジ）、Shapeの膨張・収縮、単体・複合Shapeへの適用、Amount、Border Styleの4種類、Miter Limitの表示条件、sRenderへの接続を確認しました。

各接続図は確認済みのノード機能から作った制作例です。上記固定例以外の21.1実機でのレンダリング結果、細かな数値範囲・初期値、Edition差は未確認のため、`verification: partial`を維持しています。
