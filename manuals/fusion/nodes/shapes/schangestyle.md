---
title: sChangeStyle
description: 複数のShapeに設定された色・透明度とAllow Combiningを、Shapeの処理途中でまとめて上書きするノード。
doc_type: node
term_id: schangestyle
term_short: Shapeの色・Alphaと、複製時にAlphaが重なる部分の扱いを上書きする。
verification: partial
aliases: [sChangeStyle, sCS]
concepts: [shape-data]
nodes: [sChangeStyle]
node_family: shapes
inputs: [shape]
outputs: [shape]
controls: [Color, Allow Combining]
tasks: [build-shape, style-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-11'
---

# sChangeStyle

sChangeStyleは、上流の図形で決めた**色・透明度と「Allow Combining」**を、後からまとめて指定し直すShapeノードです。円や四角形を個別に作り、[sMerge](./smerge)でまとめた後でも、下流のsChangeStyleひとつで共通のスタイルを与えられます。

ここでいう<Term id="shape-data">Shape</Term>は、点や曲線、塗りなどの情報を持つ図形データです。通常のピクセル画像とは別の種類のデータで、最終的に[sRender](./s-render)で画像へ変換します。まず[シェイプ（Shape）の基礎](../../learn/02-data/shape)を読むと、ノードの接続関係を把握しやすくなります。

## 入力と出力

**入力**はShape用の1系統です。色を変更したい[sEllipse](./s-ellipse)、[sRectangle](./srectangle)、[sMerge](./smerge)などのShape出力を接続します。複数の図形を入力したい場合は、先にsMergeでまとめます。画像を直接受け取って色補正するノードではありません。

**出力**もShapeです。変更した結果を[sDuplicate](./sduplicate)や[sGrid](./sgrid)で複製したり、別のShapeノードで加工したりできます。完成した図形を映像と合成するときは、sRenderを通してから通常のMergeなどへ接続します。

```text
sEllipse → sChangeStyle → sRender → Merge
             Shapeの色を変更   画像へ変換
```

この接続は21.1 Reference Manualにある基本例に沿っています。sChangeStyle自体は図形の形状や配置を作り直さず、入力されたShapeのスタイルを変更します。

## Inspectorの設定

### Color：色と透明度をまとめて上書きする

**Color**では、塗りと輪郭に使う色、およびAlphaを設定します。色の見本（スウォッチ）から選ぶ、スポイトでViewer内の画像を参照する、RGBAのスライダーや数値欄を使う、といった指定方法があります。

RGBAは赤（R）、緑（G）、青（B）、Alpha（A）の4成分です。Alphaは透け方に関わり、値が小さいほど下の映像が見えやすくなります。たとえば複数の図形を同じ色の半透明パターンに揃える場合、各図形のColorを修正する代わりに、まとめたShapeの後ろへsChangeStyleを置きます。

上流で意図的に別々の色を付けた図形まで同じ色にしたくない場合は、**sChangeStyleをどこへ置くか**が重要です。sMergeの後に置けばまとめた図形へ作用し、sMergeの前の個別の枝へ置けば、その枝の図形だけを変更する構成になります。

### Allow Combining：重なった図形のAlphaをどう扱うか

**Allow Combining**は、後段の複製処理などでShapeが自身のコピーと重なるとき、Alphaの重なり方を変えるチェックボックスです。

- **有効**：設定したAlpha値を維持します。Manualでは、Alphaが0.5の長方形を複製して重ねても、重なった場所の値を0.5に保つ例が示されています。
- **無効**：同じShapeが重なった場所でAlpha値が重なり合い、濃くなる場合があります。

これはsChangeStyleノード全体の有効・無効でも、図形の位置関係を変えるスイッチでもありません。**半透明Shapeのコピー同士が重なる領域**を見るための設定です。ManualはAlphaがどう加算・合成されるかの一般式までは示していないため、「何枚重なれば必ずこの数値になる」とは扱いません。

## 具体的な使い方

### 1. 色の違う図形を一つの色に揃える

図形を使ったタイトルカードや図解で、円・四角形・文字の色を一括して変更したい場合の構成例です。

```text
sRectangle ─┐
sEllipse ───┼→ sMerge → sChangeStyle → sRender → Merge
sText ──────┘             ↑                         ↑
                        共通色に変更             背景映像と合成
```

各生成ノードで形や位置を決めた後、sMergeでまとめ、sChangeStyleのColorで仕上げの色を指定します。その後sRenderで画像へ変換します。この方法なら、図形の形を調整する処理と色を決める処理を分けられます。

一部の図形だけ別色で残したい場合は、sChangeStyleをsMergeの手前に移し、色を揃えたい枝にだけ挿入します。これはManualの「combined shape treeのスタイルを上書きする」という仕様から組み立てた運用例であり、本リポジトリでの実機描画確認は未実施です。

### 2. 半透明のドット模様で重なり方を比較する

Allow Combiningの効果を確認するには、重なりが分かりやすい単純な図形を使います。

```text
sEllipse → sChangeStyle → sGrid → sRender
            ↑              ↑
         ColorのAlphaを    行・列と間隔を調整
         0.5に設定
```

小さな円を1つ作り、sChangeStyleでAlphaを0.5にします。sGridで円を複製し、間隔を狭めて隣の円と一部が重なるように配置します。そのままAllow Combiningを切り替え、重なった箇所の見え方を比較します。

有効時はManualが示すとおり元のAlpha値を維持する方向、無効時は重なり部分のAlphaが強くなる方向です。sGridの行・列・間隔については[sGrid](./sgrid)を参照してください。ここでの配置手順は仕様を確認するための構成例で、21.1実機での結果は別途確認が必要です。

### 3. 複製してから色を揃える／色を揃えてから複製する

次の2通りは、色を指定する段階が異なります。

```text
A: sRectangle → sChangeStyle → sDuplicate → sRender
B: sRectangle → sDuplicate → sChangeStyle → sRender
```

Aは複製に入る前の元Shapeへスタイルを設定します。Bは複製後のShape群をまとめて変更します。どちらも単色の反復を作る候補ですが、Alphaの重なり方も検討する場合は、**Allow Combiningが複製より前に適用されるA**の方が、Manualの複製例と対応づけて考えやすい構成です。

BをAとすべての条件で同じ結果になるものと決めつけず、実際の重なりをViewerで比較してください。sDuplicateのコピー数や位置の変化は[sDuplicate](./sduplicate)で設定します。

## 関連ノードと使い分け

- [sMerge](./smerge)：複数のShapeをまとめるノード。色の上書き自体はsChangeStyleが担当します。
- [sDuplicate](./sduplicate)／[sGrid](./sgrid)：図形を複製・配列するノード。Allow Combiningの違いを確認しやすい接続先です。
- [sRender](./s-render)：Shapeを通常の2D Imageに変換します。sChangeStyleはこの変換を行いません。
- [sRestyle](../krokodove/srestyle)：Krokodove系の別ツールです。標準のsChangeStyleと同じ設定項目や挙動を備えているとは限りません。

sChangeStyleで確認できる固有のスタイル項目はColorとAllow Combiningです。**輪郭線の太さや形状を変える**目的なら、輪郭を生成・加工するShapeノード側の設定を先に確認します。画像化した後の映像全体を色補正したい場合も、sChangeStyleではなく2D Image用の処理を使います。

## バージョンと確認範囲

**出典**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、pp.2733–2735。

Manual本文で確認できるのは、Shape入力が1系統であること、上流のShape treeのColorとAllow Combiningを上書きすること、sEllipseからsChangeStyleを通してsRenderへ渡す接続、ColorのRGBA指定方法、複製・グリッドで図形が重なる際のAllow Combiningの違いです。

本記事の複数図形の一括配色、ドット模様、処理順序比較は、確認済みのノード仕様を使った**構成例**です。21.1実機での描画結果、内部REGID、初出バージョン、Edition差、Alpha合成の正確な計算式は未確認です。Manualの略号`sCS`も内部REGIDの保証ではありません。このため`verification: partial`を維持しています。
