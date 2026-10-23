---
title: Kaleidoscope
description: Krokodove Kaleidoscopeの放射状の鏡映を、入力・出力、制作例、MirrorやSeamlessとの違いから説明。
doc_type: node
term_id: kaleidoscope
term_short: 画像を放射状に反転し、万華鏡をのぞいたような対称模様へ変形するKrokodoveの画像ツール。
verification: partial
aliases: [Kaleidoscope]
concepts: [image-data]
nodes: [Kaleidoscope]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Kaleidoscope

**Kaleidoscopeは、画像を放射状に反転し、万華鏡をのぞいたような模様を作るKrokodoveのツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools（画像変形ツール）」に分類され、*radial mirroring of the image to create a kaleidoscopic effect* と説明されています。

色の異なる布や街の明かりを写した画像を入力すると、画像の一部分を鏡に映したような向き違いの模様が、中心の周りに繰り返される表現を作れます。図形を一つずつ描き足すのではなく、**元の画像の配置や向きを変えて対称性を生む**処理です。

## 「放射状の鏡映」とは

鏡映（きょうえい）は、鏡に映したように画像の向きを反転させることです。中央に一本の線を置いて反転するだけなら、左右に対応する絵柄ができます。これを中心から伸びる複数方向へ広げて考えると、同じ色や輪郭が中心を取り囲むような模様になります。

万華鏡では、鏡の反射によって小さな色片が繰り返し現れ、回すと見え方が変わります。Kaleidoscopeはこの**放射状の反復と対称性**を画像変形で表現します。

ただし、公式ManualのKrokodove項目は短い機能説明です。内部で何枚の扇形を切り出すか、反射回数をどう決めるか、中心位置や角度をどのInspector項目で調整するかは、その記述だけでは確定できません。「扇形を複製する」という説明は見た目を理解するためのたとえであり、内部処理の仕様ではありません。

## 入力と出力

| 段階 | データ | 確認できる範囲 |
| --- | --- | --- |
| 入力 | **2D Image** | KrokodoveのImage Warp Toolsとして掲載。既存COLLECTANEAカタログも画像入力に分類。 |
| 処理 | 放射状の鏡映・画像変形 | Manualに記載された中心的な役割。 |
| 出力 | **2D Image** | 変形した画像を後段の画像合成へ渡す分類。 |
| 未確認 | 正式な端子名・端子数、追加入力、Inspector項目、初期値、設定範囲 | Manualの一覧からは特定できません。 |

ここでいう<Term id="image">Image</Term>は、ピクセルからできた映像や静止画です。線や面の輪郭を画像化する前の<Term id="shape-data">Shapeデータ</Term>とは異なります。**万華鏡のような形が見えていても、出力がShapeの輪郭データになるわけではありません。**

Frontmatterの `inputs: [image]` と `outputs: [image]` はデータ分類を示します。ノード画面の接続端子の正式名称や数を保証するものではありません。

## 主な用途

### MVやタイトルの対称的な背景

色のある布、花、光のボケ、模様のある壁などを元画像にすると、色の分布や輪郭が放射状に繰り返される表現を検討できます。中央に視線を集めたい背景や、抽象的なタイトルグラフィックの素材として使う例です。

人物の顔や読ませたい文字をそのまま処理すると、複数の反射像になって判別しづらくなることがあります。背景をKaleidoscopeで作り、文字は後から合成すると役割を分けられます。

### 動く画像から変化する模様を作る

静止画の代わりに動画を入れれば、元画像の色や物体が動くにつれて、反射像の見え方も変わる表現を試せます。これは**入力画像の時間変化を利用する構成案**であり、Kaleidoscope自身に回転アニメーションや速度設定が必ず備わるという説明ではありません。

### 同じ素材から複数の構図を探す

元画像の位置や大きさを前段の[Transform](../transform/transform)などで変えてからKaleidoscopeへ渡すと、入力のどの部分が対称模様に使われるかを比較できます。画面外の画素がどう扱われるかはViewerで確認します。

## 制作例：光の映像を抽象背景にする

街の夜景や光のボケを使い、タイトルの背後に対称模様を置く構成例です。Krokodove固有のInspector設定を説明する公式チュートリアルではありません。

```text
MediaIn（光の映像） ──→ Kaleidoscope ──→ Merge（Background） ──→ MediaOut
Text+（タイトル） ─────────────────────→ Merge（Foreground）
```

1. 光の点や色の変化がはっきりした映像をMediaInからKaleidoscopeへ接続し、その出力だけをViewerで確認します。
2. 中央付近にどの模様が集まり、左右・上下にどのような対称性が見えるか観察します。背景向きの素材を選びます。
3. 見え方を変えたい場合は、元画像の別のフレームを使うか、前段で位置やサイズを変えて比較します。存在を確認していない「反射数」「回転速度」などの設定名を前提にしません。
4. Text+でタイトルを作り、標準の[Merge](../compositing/merge)のForegroundへ、Kaleidoscopeの結果をBackgroundへ接続します。タイトルの文字そのものは反転しません。
5. 再生して、模様の急激な変化、中心付近の見え方、タイトルの読みやすさを確認します。必要なら素材や別背景との混合を見直します。

**背景を変形してから文字を重ねる**のがこの構成の要点です。画像とタイトルをまとめてKaleidoscopeに通すと、タイトルも変形の対象になってしまいます。

## 似たツールとの違い

| ツール | 21.1 Manualで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Kaleidoscope（Krokodove）** | 画像を放射状に鏡映し、万華鏡状の見た目を作る | 中心の周りに繰り返される対称模様が欲しい |
| [Mirror（Krokodove）](./mirror) | 指定した線に沿って画像を反転する | 一つの基準線で鏡映の向きを変えたい |
| [Seamless（Krokodove）](./seamless) | 画像の反対側の端を反転し、元画像と混ぜる | 画像を並べたときの継ぎ目を調整したい |
| [Offset（Krokodove）](./offset-krokodove) | 画像を水平・垂直方向に移動・変形する | 反射ではなく位置をずらしたい |
| [Lines（Krokodove）](./lines) | 線の組を繰り返して模様を作る | 入力画像の鏡映ではなく線模様を作りたい |

Mirrorとの違いは、Kaleidoscopeが**放射状の繰り返しを目的とする**点です。Seamlessは画像の端をなじませる用途に関係し、万華鏡模様を作ることが中心ではありません。

DaVinci Resolve 21.1 Manualには、別の**Resolve FX「Mirrors」**にも「Kaleidoscope」というモードが記載されています（Chapter 165、pp.3667–3668）。これはKrokodoveのKaleidoscopeとは別のエフェクトです。Resolve FX Mirrorsの `Mirror Placement`、`Center Size`、`Number of Sides` などの項目名を、KrokodoveノードのInspector設定として流用しないでください。

## 注意点・未確認の仕様

- **境界**：対称模様の接合部は、元画像と変形条件によって見え方が異なります。中心と端をViewerで確認します。
- **画面外**：反射後に必要な画素が元画像の外に出る場合の補間、透明部分、端の処理は未確認です。
- **Alpha**：透明度の保持、プリマルチプライ、追加Mask入力の詳細は未確認です。合成時は[Merge](../compositing/merge)で境界を確かめます。
- **Inspector**：中心座標、分割数、角度、アニメーション項目の正式名称・初期値・範囲は断定できません。
- **Edition・実機**：21.1 Reference Manualへの掲載は確認済みですが、Resolve Free / Studio / Fusion Studioの提供条件、内部REGID、Effects Libraryでの表示名は別途実機確認が必要です。

## バージョン・出典

一次資料はBlackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436「Image Warp Tools / Kaleidoscope」**です。確認できる役割は画像の放射状の鏡映による万華鏡状の表現です。

別系統のResolve FX MirrorsにKaleidoscopeモードがあることは同ManualのChapter 165、pp.3667–3668で確認しています。**Resolve FX側のUI仕様をKrokodoveへ移していません。**

画像の入出力分類は既存COLLECTANEAカタログを併用しました。制作例は確認済みの役割に基づく提案であり、公式の動作検証結果ではありません。端子・Inspector・Alpha・Editionの詳細が未確認のため、`verification: partial` を維持します。

[Krokodove全体像](./)と[画像（Image）](../../learn/02-data/image)も参照してください。
