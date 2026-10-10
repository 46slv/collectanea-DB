---
title: "sMerge"
description: "複数のShapeを入力順に重ね、1つのShapeデータにまとめるノード。画像化せずに後段のShape処理へ渡せる。"
doc_type: node
term_id: "smerge"
term_short: "複数のShapeを接続順に重ね、1つのShapeデータにまとめるノード。"
verification: partial
aliases: ["sMerge"]
concepts: ["shape-data"]
nodes: ["sMerge"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Override Axis"]
tasks: ["build-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-11"
---

# sMerge

sMergeは、四角形・円・文字など、別々に作った複数の<Term id="shape-data">Shape</Term>を重ねて、1つのShapeデータとして次のノードへ渡すためのノードです。複数の図形を1つの画面に置きたいときや、まとめた図形を後段で一緒に変形・複製したいときに使います。

ここで扱うShapeは、まだピクセル画像ではありません。通常の画像を重ねる`Merge`とは異なり、`sMerge`の出力は`sRender`で画像化するまでShapeのままです。

## 入力：複数のShapeを重ねる

入力は`Input[#]`と表記され、Shape系ノードの出力を受け取ります。最初は2つの入力が見えており、図形を接続すると新しい空き入力が自動的に現れます。21.1 Reference Manualには、入力数に固定の上限はないと記載されています。

重要なのは**入力の順番**です。最初のオレンジ色の入力が一番下の図形になり、次の緑色の入力がその上、3つ目のピンク色の入力がさらに上に重なります。

```text
sRectangle ──→ ① オレンジ ┐
sEllipse   ──→ ② 緑      ├─ sMerge ─→ sRender
sText      ──→ ③ ピンク  ┘
```

この例では、四角形を背景、その上に円、さらに手前に文字を置く構成になります。図形の見える位置や大きさは、それぞれ上流のShapeノードで設定します。重なり順が意図と違う場合は、まずどの入力に接続したかを確認します。

## 出力：Shapeのまま次へ渡す

複数の図形を含む1つのShapeデータが出力されます。次の`sTransform`でまとめて位置を変える、`sDuplicate`で図形の組を繰り返す、といった後段のShape処理につなげられます。

Viewerで通常の2D画像として確認したり、`Merge`や`Glow`などの画像処理へ渡したりするには、間に`sRender`を置きます。

```text
sRectangle ─┐
            ├─ sMerge ─→ sTransform ─→ sRender ─→ Merge
sText ──────┘            Shapeのまま        2D Image
```

Shapeと画像の違いは[シェイプ（Shape）](../../learn/02-data/shape)、画像化の設定は[sRender](./s-render)を参照してください。

## 主な設定項目

### Override Axis

`sMerge`のControlsタブにある固有の設定は**Override Axis**チェックボックスです。21.1 Reference Manualでは、接続したShapeのAxisを上書きする設定として説明されています。

Axisは図形を変形するときの基準に関わる情報ですが、この節のManual記述だけでは、各入力のAxisが具体的にどう再計算されるかまでは判断できません。複数のShapeをまとめて変形する場合、チェックを切り替えた前後で下流の`sTransform`の結果を比較してください。個々のAxisの挙動は21.1実機での追加確認が必要です。

Settingsタブの共通項目はShape系ノード共通の設定です。Override Axisとは別に扱います。

## 主な用途と具体例

### 四角形・円・文字でタイトルカードを作る

`sRectangle`でカードの背景を作り、`sEllipse`で装飾用の円を作り、`sText`で見出しを作ります。これらを順に`sMerge`へ接続し、`sRender`へ渡すと、3つの図形を1枚の2D画像として後段の`Merge`で映像へ重ねられます。

背景の四角形が文字を隠してしまう場合、まず入力順を調べます。画像化後に通常の`Merge`を3段重ねる構成とは違い、画像化する前の段階で複数の図形をまとめられる点が特徴です。

### 複数図形を1組として動かす

たとえば円と文字で構成したラベルを、セットのまま左から右へ移動したい場合は、`sMerge`の後ろに`sTransform`を置きます。

```text
sEllipse ─┐
          ├─ sMerge ─→ sTransform ─→ sRender
sText ────┘                  ↑
                      組全体の位置を動かす
```

円と文字を別々の画像に変換してからそれぞれ移動させる必要はありません。これはManualに記載されたShapeの接続形式から組み立てた**構成例**であり、ここでは実機レンダリング結果までは確認していません。

### まとめた図形を反復させる

小さなマークと文字を`sMerge`でまとめ、続けて`sDuplicate`へ渡す構成も考えられます。個々の図形ではなく、組み合わせたShapeを入力にするため、同じラベルを一定間隔で繰り返す構成を作りやすくなります。複製数や間隔は[sDuplicate](./sduplicate)側で調整します。

## sBooleanや通常のMergeとの違い

- **[sMerge](./smerge)**：複数のShapeを入力順に重ねてまとめます。図形同士の重なりを、新しい切り抜き形状へ計算し直す目的ではありません。
- **[sBoolean](./sboolean)**：2つのShapeの重なりを利用して、共通部分だけ残す、片方で穴を開けるなど、図形の領域を演算します。
- **通常のMerge**：画像化されたForegroundとBackgroundなど、2D Imageを合成します。Shapeのままの入力を直接合成する役割ではありません。

複数の図形を並べて1つのデザインにしたいなら、まずsMergeです。重なり部分をくり抜く必要があるならsBooleanを選びます。完成した図形を撮影素材に重ねる場合は、sRenderの後に通常のMergeを使います。

## 確認時の注意点

- sMergeの結果をViewerへ画像として出すには、通常`sRender`が必要です。sMerge単体を画像ノードとして扱わないでください。
- 図形の前後関係は、位置だけでなく**何番目の入力に接続したか**に依存します。
- 入力は動的に増えます。最初に表示される端子が2つでも、2図形しか扱えないわけではありません。
- Override Axisの正確な効果、現在の内部REGID、Edition差、実機での動作・上限性能は、このページでは確定していません。

## 関連Nodeと考え方

- [Shapeノード一覧](./index) — Shapeを作る・変える・まとめる処理を探す
- [シェイプ（Shape）](../../learn/02-data/shape) — ShapeとMask・2D Imageの区別
- [sBoolean](./sboolean) — 形状の重なりを演算する
- [sTransform](./stransform) — Shapeの位置や大きさなどを変える
- [sDuplicate](./sduplicate) — Shapeを繰り返す
- [sRender](./s-render) — Shapeを2D Imageへ変換する

## バージョンと検証状況

**DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 117、pp.2746–2747**を参照しました。入力の動的追加、入力数に固定上限がないこと、オレンジ・緑・ピンクの重なり順、Override Axisの存在、sRenderを介した表示はManualで確認済みです。

具体的なタイトルカードや一括移動・複製は、確認済みの接続仕様から組み立てた運用例であり、21.1実機での結果確認ではありません。内部REGID、端子の属性値、Override Axisの詳しい挙動、Edition差は未検証のため、`verification: partial`を維持しています。
