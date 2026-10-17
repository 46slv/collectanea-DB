---
title: "Duplicate（Krokodove）"
description: "入力画像を選んだ模様や形に沿って複製するKrokodoveのツール。入出力、Pattern・標準Duplicateとの違い、映像への合成例を解説。"
doc_type: node
term_id: "krokodove-duplicate"
term_short: "入力した2D画像を選んだパターンや形に沿って繰り返し配置するKrokodoveのツール。"
verification: partial
aliases: ["Duplicate"]
concepts: ["image-data"]
nodes: ["Duplicate"]
node_family: "krokodove"
inputs: ["image"]
outputs: ["image"]
tasks: ["motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-17"
---

# Duplicate（Krokodove）

KrokodoveのDuplicateは、**入力した画像を繰り返し複製し、選んだ模様や形に沿って配置する**ツールです。たとえば小さなロゴ画像を入力し、そのロゴを何度も繰り返して装飾を作る用途が考えられます。

『DaVinci Resolve 21.1 Reference Manual』では「Image Pixel Tools」に分類され、入力画像を選んだパターンまたは形に沿って複製すると説明されています。ただし、具体的な配置の種類、複製数、間隔、時間差の設定はこの説明からは分かりません。

## 画像を複製するとは

複製されるのは、色と透明度を持った**2D画像**です。小さな円が描かれた画像を入力すれば、円の画素を含む画像が複数配置される、という考え方です。ロゴやText+で描画した文字も、画像として入力すれば同じように複製元として使えます。

Manualの「pattern/shape」は**配置方法**を示す説明です。Fusion標準の<Term id="shape-data">Shapeデータ</Term>を専用の入力端子へ接続できるという記述ではありません。輪郭や塗りの情報を画像化せずに複製したい場合は[sDuplicate](../shapes/sduplicate)を、Shapeを画像化する場合は[sRender](../shapes/s-render)を参照してください。

同じ「Duplicate」という名前でも、Krokodove版と標準の[Duplicate](../effects-film/duplicate)は別項目です。標準版のInspectorの設定をKrokodove版にそのまま当てはめないようにします。

## 入力と出力

| 段階 | 内容 | 確認範囲 |
| --- | --- | --- |
| 入力 | 複製元の2D <Term id="image">Image</Term> | Manualにincoming imageとある。端子名、補助入力の有無は未確認。 |
| 処理 | パターンや形に沿って画像を複製する | Chapter 105、p.2436で確認できる基本機能。具体的な配置候補と操作方法は未確認。 |
| 出力 | 複製した画像を含む2D Image | Image Pixel Tools分類と既存カタログに基づく。Alpha・解像度・DoDは未確認。 |

入力画像のAlphaがどう保持されるか、元画像も出力に残るか、コピー同士の重なり順はManualの短い説明だけでは確定できません。入力と出力をViewerで比較して確認します。

## 主な用途

**ロゴやアイコンの反復**：完成済みの絵柄を繰り返し配置する背景装飾。図形のパターンではなく、入力画像そのものを保ちたいときの候補です。

**文字を使った装飾**：Text+などで文字を2D画像にしてから複製し、背景の一部やタイトル周囲の繰り返し要素として使う構成です。

**背景パターンとの比較**：Patternが画面全体の図形模様を作るのに対し、Duplicateはすでにある画像を増やすという違いがあります。具体的な配列がどの程度似るかは実機で確かめます。

これらは機能から考えた制作案で、格子・円周など特定の配列が必ず選べると確認した作例ではありません。

## 制作例：ロゴを繰り返し、実写へ重ねる

1. Fusionで透明な余白を持つ小さなロゴの2D画像を用意します。まずViewerのAlpha表示で、ロゴの外側が透明になっているか確認します。
2. KrokodoveのDuplicateへその画像を入力し、Duplicateの出力をViewerに表示します。入力画像と結果の違いを比較します。
3. Inspectorで実際に存在する配置関連の項目を確認し、変更前後の出力を比べます。複製数・位置・間隔は確認したい性質であって、**これらがそのままInspectorの項目名であるとは断定していません**。
4. 結果を標準の[Merge](../compositing/merge)のForegroundへ接続し、実写映像をBackgroundへ接続します。

```text
ロゴ画像 → Krokodove Duplicate ──→ Merge（FG）──→ MediaOut
                                   ↑
映像（MediaIn） ───────────────→ Merge（BG）
```

5. 出力画像が背景全体を覆う場合は、Duplicateの出力Alphaを確認します。透明な余白がなくなるようなら、複製元のAlphaと処理後のAlphaを比べます。合成量を下げるだけならMergeのBlendを調整できます。

この配線は2D Imageを複製して標準合成へ渡す**構成案**です。Krokodove固有の設定値やAlpha保持を実機で検証済みとするものではありません。

## 類似ツールとの違い

| ツール | 確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Duplicate（Krokodove）** | 入力画像を模様や形に沿って繰り返す | 既存の画像を特定の配置で増やす |
| [Duplicate（標準）](../effects-film/duplicate) | コピーごとの移動・回転・サイズなどを段階的に変える | コピー間の変形量や時間差を調整する |
| [Pattern](./pattern) | 図形を並べて画面全体の模様を生成する | 画像の複製より幾何学模様の生成が目的 |
| [Shapes](./shapes) | 同心円や同心四角形を何重にも作る | 同じ中心の周りに図形を重ねる |
| [sDuplicate](../shapes/sduplicate) | 描画前のShapeを複製する | 複製後も輪郭データを加工する |
| [Duplicate 3D](../3d/duplicate-3d) | 3Dオブジェクトを複製する | 画像ではなく立体を配置する |

標準DuplicateのCopies、Time Offset、Jitterといった設定は、標準版のManualで確認されています。Krokodove版にも同じ項目があるかは未確認です。

## 思った結果にならないとき

- **何も出ない**：入力が2D画像か、Krokodove版の出力をViewerで表示しているかを調べます。
- **一つにしか見えない**：コピーが重なっているのか、そもそも生成されていないのかを入力と出力の比較で切り分けます。
- **四角い背景も並んでしまう**：複製元のAlphaが透明か確認します。背景を除く必要があればDuplicateの前段で切り抜きます。
- **Shapeを直接つなげない**：ShapeのままならsDuplicate、画像化して使うならsRenderを先に試します。

KrokodoveのImage・Shape・3Dなどの分類は[Family Overview](./)を参照してください。

## 出典・バージョン・未確認事項

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2436、Image Pixel Tools／Duplicate。
- **比較対象**：同Manual Chapter 97「Effect Nodes」、pp.2272–2278の標準Duplicate。こちらの詳しいInspector仕様は**Krokodove版の証拠にはなりません**。
- **公式の機能掲載**：[DaVinci Resolve 21新機能](https://www.blackmagicdesign.com/jp/products/davinciresolve/whatsnew)にはKrokodove導入が記載されています。
- **未確認**：端子名・端子数、選べる配置形状、複製数の数え方、Inspector項目・初期値・範囲、Alpha・DoD・解像度、アニメーション、Free/Studio差、21.1実機結果、内部REGID。

`verification: partial`は、公式資料で確認できる基本的な用途と、追加検証が必要な仕様を区別する状態です。
