---
title: "From Image"
description: "画像上の線に沿って色をsampleし、その結果からGradientを生成するModifier。"
doc_type: node
term_id: "from-image"
term_short: "From Imageは、Image上の線に沿って色をsampleし、その色列からGradientを作るModifier。"
verification: partial
aliases: ["From Image"]
concepts: ["parameter-data"]
nodes: ["From Image"]
node_family: "modifiers"
controls: ["Image to Scan", "Start X/Y", "End X/Y", "Number of Sample Steps", "Edges"]
inputs: ["image", "parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# From Image

From Imageは、**指定したImage上の線に沿って色をsampleし、その結果からGradientを作るModifier**です。

数値Parameterを動かす一般的なModifierではなく、DaVinci Resolve 21.1 Reference Manualでは**Gradient専用**として説明されています。たとえばBackground NodeのGradientへ適用すると、別のImageから拾った色の並びをそのままGradientの出発点にできます。

## 何をするModifierか

From Imageでは、まずsample元のImageを持つNodeを指定します。次にImage上でStartとEndを決め、その2点を結ぶ線に沿って複数の色をsampleします。

sampleした色はGradientのcolor stopとして並びます。

~~~text
Image to Scan
     ↓
Start ───────── End
   線上の色をsample
     ↓
Gradient color stops
     ↓
対象のGradient
~~~

Imageそのものを加工して新しいImageを出すNodeではありません。**Imageを色のsourceとして読み、その結果をGradient Parameterへ反映する**Modifierです。

## 追加方法

From Imageは通常の`Modify With` menuにはありません。

21.1 Manualでは、Inspector上の**Gradient barを右クリックして`From Image`を選ぶ**方法が示されています。

つまり、任意のnumeric Parameterへ追加するModifierではなく、From Imageを利用できるGradient Controlから直接追加します。

## 入力と出力

### Image to Scan

Gradientの色を取得するImageを指定します。

Node Editorからsample元のNodeを`Image to Scan`欄へdragして指定します。

ここで指定したNodeのImageがsample sourceになります。From ImageがそのNodeのImage connectionを置き換えたり、Image streamを後段へ渡したりするわけではありません。

### 対象のGradient

出力先は、From Imageを追加したGradient Controlです。

From Imageが生成するのは単一の数値ではなく、sample結果に応じた複数のcolor stopを持つGradientです。

frontmatterの`parameter`は、このModifierがNode Editor上のImage出力ではなくParameterへ結果を返すことを表す分類です。

## 主なControl

### Start X/Y・End X/Y

Image上で色をsampleする線の始点と終点を指定します。

2点を結ぶ線に沿ってImageの色が読み取られます。Start / End pointはInspectorだけでなくViewer上でも移動できます。

どの位置からどの位置まで色を拾うかを変えると、生成されるGradientの色の並びも変わります。

### Number of Sample Steps

StartからEndまでの間で、何個のcolor sampleを取るかを指定します。

sample数を増やすほど、Gradient Control上に生成されるcolor stopも増えます。

色変化を大まかに取りたい場合は少ないstep、細かな色変化までGradientへ残したい場合は多いstepが必要になります。ただし、このページでは用途別の推奨値やdefaultは推測しません。

### Edges

sample lineがImageのframe外まで伸びたとき、範囲外をどう扱うかを決めます。

21.1 Manualで確認できるmodeは次の4種類です。

- **Black** — Image外のsampleをblackとして扱う
- **Wrap** — 反対側のedgeへ回り込む
- **Duplicate** — Image edgeの色を延長する
- **Color** — Image外を指定したcolorとして扱う

Start / Endをframe外まで動かす場合は、この設定によってGradientの端側に入る色が変わります。

## 主な用途

### 画像の配色からGradientを作る

写真やgraphicの中にある色の並びを、BackgroundなどのGradientへ移したい場合に使えます。

~~~text
sample元Image
   ↓
From Image
   ↓
BackgroundなどのGradient
~~~

手作業でcolor stopを1つずつ作らず、Image上の色の変化をGradientの初期状態として取り込めます。

### 画面上の方向に沿った色変化を拾う

Start / EndはViewer上で動かせるため、横方向だけでなく、縦・斜めなど任意の方向に沿った色の並びをsampleできます。

たとえば、画面上部から下部へ変化している空の色や、斜めに照明が当たっている領域の色変化をGradientへ変換するといった使い方ができます。

## 運用例: ImageからGradientを作って手動調整する

21.1 Manualでは、From ImageでGradientを生成したあと、**From Image ModifierをGradient Controlから外しても生成済みGradientは残る**と説明されています。

そのため、From Imageは常にsample元Imageと連動させ続ける用途だけでなく、Gradient作成の初期工程としても使えます。

1. Gradient barからFrom Imageを追加する。
2. sample元Nodeを`Image to Scan`へ指定する。
3. Viewer上でStart / Endを動かし、欲しい色の並びを探す。
4. `Number of Sample Steps`でcolor stopの数を調整する。
5. 必要なGradientができたらFrom Image Modifierを外す。
6. 残ったGradientのcolor stopを手作業で調整する。

この使い方なら、「画像から色を拾う工程」と「最終Gradientを手で整える工程」を分けられます。

## Probeとの違い

[Probe](./probe)もImageを参照するModifierですが、作るdataが異なります。

- **From Image** — 線に沿って複数の色をsampleし、Gradientを作る
- **Probe** — 1 pixelまたは矩形領域を測定し、numeric valueを作る

Imageの明るさや色を数値Controlへ使いたい場合はProbe、Imageの配色そのものをGradientへ変換したい場合はFrom Imageを選びます。

## 注意点

From Imageは**Gradient専用**です。通常のnumeric Parameterへ`Modify With > From Image`を追加する操作ではありません。

また、`Number of Sample Steps`を増やすと生成されるcolor stopも増えます。sampleを細かくするほど必ず扱いやすくなるわけではないため、最終的に手動調整する場合は必要な色変化を残せる範囲でstep数を決めます。

`Edges`はsample lineがImage外へ出た場合にのみ意味を持ちます。Image内だけをsampleしているときは、Black / Wrap / Duplicate / Colorの違いは結果に現れません。

このページでは21.1 Manualで確認できる追加方法、Control名、sample処理、Edgesのmodeを基準にしています。current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差は確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Probe](./probe)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3007–3008を基準にしています。

同Manualで、From ImageがGradient専用であること、Gradient barから追加すること、`Image to Scan`、`Start X/Y` / `End X/Y`、`Number of Sample Steps`、`Edges`のBlack / Wrap / Duplicate / Colorを確認しています。

また、生成後にFrom Image Modifierを外してもGradientが残り、手動でfine tuneできる運用を確認しています。
