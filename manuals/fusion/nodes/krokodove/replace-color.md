---
title: Replace Color
description: Krokodove Replace Colorで、指定した元の色に対して補正を加える考え方と、Recolorなどとの違いを説明。
doc_type: node
term_id: replace-color
term_short: 画像内の元の色を指定し、その色を対象とする補正を行うKrokodoveの画像ツール。
verification: partial
aliases: [Replace Color]
concepts: [image-data]
nodes: [Replace Color]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Replace Color

Replace Colorは、**画像内で元の色を指定し、その色に対して補正を加える**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは、変更対象となる色（source color）を指定して、それを補正（correction）で置き換えると説明されています。

たとえば青い看板の色味だけを調整したいとき、まず「どの青を対象にするか」を決める考え方です。ただし、Manualは具体的な補正項目や選択範囲の広さを説明していません。**対象の色を指定できること**と、**どんな色補正を設定できるか**は分けて考える必要があります。

## 「色を選ぶ」と「色を補正する」

色補正を画面全体にかける場合と、特定の色を基準に適用する場合では、変わる場所が違います。

- **元の色（source color）**：補正対象を判断する基準となる色。看板の青などを指定します。
- **補正（correction）**：選ばれた色の部分へ適用する処理。21.1 Manualには「correction」と記載されていますが、色相・彩度・明度などの個別コントロール名は示されていません。
- **結果の確認**：似た色が背景や衣装にもあると、意図しない部分まで変わる可能性があります。境界、影、反射をViewerで確認します。

Replace Colorという名前でも、単に「青の画素をすべて赤の単色で塗る」機能だと決めつけることはできません。**単色への置換**を明示している[Recolor](./recolor)とは、Manualの説明が異なります。

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | 2D Image | 色を補正したい元画像。 |
| 処理 | source colorの指定と補正 | 元の色を基準に補正対象を決め、処理した画像を作ります。 |
| 出力 | 2D Image | 補正後の画像。Alpha、補助チャンネル、解像度の扱いは未確認です。 |

ここで扱う<Term id="image">Image</Term>は、画素ごとの色を持つ画像データです。輪郭や塗りを描画前の状態で保持する<Term id="shape-data">Shapeデータ</Term>そのものを操作するツールではありません。[Krokodoveの全体像](./)では、Image・Shape・3D・Regionの違いを説明しています。

Frontmatterの `inputs: [image]` / `outputs: [image]` はデータ分類であり、実際の入力端子名・端子数や出力端子名を検証したという意味ではありません。

## 主な用途

### 小物や背景の特定色を調整する

MVの背景にある青い看板だけ色味を整え、人物の肌色や道路には手を加えたくない場面が考えられます。補正したい色を指定し、加工前後を比べます。

ただし、画面内の別の青い物体も対象になる可能性があります。完全に対象を限定したい場合は、後段の[Merge](../compositing/merge)で合成する際にEffect Maskを使う方法もあります。これは**Merge側のマスク機能**を利用する構成であり、Replace Color固有のマスク端子の存在を意味しません。

### 同じ素材から色調整案を比較する

素材を二系統に分けて、一方にはReplace Colorを適用し、MergeのBlendで元画像と比較する構成を作れます。変更前後を見比べる用途であり、Replace Colorに独自のBlendコントロールがあるという主張ではありません。

## 制作例：看板の青を補正して元画像と比較する

以下は標準のFusionノードと組み合わせる**構成案**です。21.1 Manualに掲載されたReplace Colorの操作手順をそのまま再現したものではありません。

```text
MediaIn ───────────────────→ Merge（Background） ─→ MediaOut
       └→ Replace Color ──→ Merge（Foreground）
```

1. MediaInをReplace Colorにつなぎ、両方をViewerで表示して元画像と結果を見比べます。
2. Replace Colorで看板の青に当たる**元の色**を指定します。指定に使う正確なInspector項目・操作方法は21.1実機で確認してください。
3. 利用できる補正を設定し、看板の明るい部分だけでなく影や反射の部分も確認します。Manualが明示しない補正項目の名前や数値はここでは指定しません。
4. 元画像をMergeのBackground、Replace Colorの結果をForegroundにつなぎます。MergeのBlendを変えると、元画像と補正画像の合成割合を調整できます。
5. 別の青い物体にも変化が現れる場合は、MergeのEffect Maskで補正結果を重ねる範囲を絞ります。動画ではフレームを移動させ、対象物やカメラが動く間も確認します。

この例では元画像と補正画像を重ねるため、**Replace Colorの出力だけをMediaOutへ送る構成**よりも前後比較がしやすくなります。独立した画像処理として使う場合は、Replace Colorの後ろにそのまま次の画像ノードをつないでも構いません。

## 関連ツールとの使い分け

| ツール | 21.1 Manualで確認できる働き | 選ぶ目安 |
| --- | --- | --- |
| **Replace Color（Krokodove）** | 元の色を指定し、その色に対する補正で置き換える | 特定の元の色を基準に補正したい |
| [Recolor（Krokodove）](./recolor) | 1色以上の元の色を指定し、色見本（color swatch）で設定した新しい色へ置き換える | 指定した色を別の色へ置換することが目的 |
| [Match Color（Krokodove）](./match-color) | シャドウ・中間調・ハイライトなどの明るさの帯域を選んで色を置き換える | 元の色そのものではなく明暗の領域を選びたい |
| [Color Map（Krokodove）](./color-map) | テクスチャを1色以上の均一な色に対応づける。色は手動指定または自動検出 | 少数の塗り色へ整理したグラフィック表現を作りたい |
| [Threshold（Krokodove）](./threshold) | 指定チャンネルの色・明るさの狭い範囲を許容幅で選び出す | 補正ではなく、まず特定の値の範囲を分離したい |

RecolorもReplace Colorも元の色を指定しますが、**同じInspector項目や同じ処理結果になるとは確認できていません**。実際の補正操作や仕上がりで比較する際は、各ノードの中間結果を別々にViewerへ出します。

## 注意点・未確認の仕様

- **色の選択範囲**：元の色にどれほど近い色まで含むか、境界をどう扱うか、許容幅の項目名は未確認です。
- **補正内容**：21.1 Manualの説明は「correction」までです。Hue、Saturation、Brightness、Tolerance、スポイトなどをReplace Color固有のInspectorパラメータとして断定しません。
- **複数色**：Recolorと異なり、Replace Colorについて複数のsource colorを一度に設定できるとはManualに記載されていません。
- **透明度とデータ**：Alphaの保持、解像度や補助チャンネルの扱い、正確な入出力端子とREGIDは未確認です。
- **利用環境**：DaVinci Resolve Free / Studio / Fusion Studioでの違い、実際の表示カテゴリは実機検証前です。

## バージョン・出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435「Image Color Tools / Replace Color」。元の色を指定し、補正へ置き換える役割を確認。
- **比較資料**：同ページ「Recolor / Match Color / Threshold」、p.2434「Color Map」。関連ツールの説明はこれらの項目に基づきます。
- **関連**：[Krokodoveの画像・Shape・3D・Region](./)。

現時点では21.1 Manualに記載された機能の範囲を説明した記事です。正式なInspector項目、端子、動作は未検証のため `verification: partial` を維持しています。
