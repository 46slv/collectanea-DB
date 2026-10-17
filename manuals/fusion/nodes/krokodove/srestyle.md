---
title: sRestyle
description: KrokodoveのShapeツール。入力された図形の塗り・輪郭線の見た目を後段から変更する。
doc_type: node
term_id: srestyle
term_short: 入力Shapeの塗り・輪郭線の見た目を変更するKrokodoveツール。
verification: partial
aliases: [sRestyle]
concepts: [shape-data]
nodes: [sRestyle]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape, style-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-12'
---

# sRestyle

**sRestyleは、作成済みの図形の塗りや輪郭線の見た目を、あとから変更するKrokodoveのShapeツールです。** 形を作るノードごとに見た目を設定する代わりに、図形の構成を決めた後で外観を調整したいときに使います。

ここでいう<Term id="shape-data">Shape</Term>は、円や四角形の輪郭などを保持する図形データです。画像を構成する画素とは異なり、Shapeのまま変形や複製を続けられます。基本は[シェイプ（Shape）](../../learn/02-data/shape)、Krokodove全体の位置づけは[カテゴリの案内](./)を参照してください。

## 何が変わるのか

図形を編集するときは、**輪郭がどこを通るか**と、**その輪郭をどう描画するか**を分けて考えます。前者は円の半径や頂点の位置などの形状、後者は内部の塗りと境界の線の見た目です。

21.1 Reference Manualでは、sRestyleは入力された1つまたは複数のShapeに対し、**塗り（fill）や輪郭線（outline）の属性を変更して見た目を上書きする**ツールと説明されています。たとえば複数の図形を組み立てた後に、外観を同じ方針で調整する使い方が考えられます。

ただし、ManualのsRestyle項目は機能の短い説明に限られます。塗りのどの成分や輪郭線のどの属性を個別に変更できるか、Inspectorの正式な項目名と初期値、上流に複数の異なるスタイルがあるときの上書き範囲は、本文だけでは確定できません。ここでは**塗り・輪郭線を変更できるという確認済みの役割**と、その役割を使った構成案を区別します。

## 入力と出力

- **入力：Shape**。上流で作った図形、または複数の図形をまとめたShapeデータを対象にします。
- **出力：Shape**。スタイルを変更した図形を引き続きShapeとして加工する、という使い方です。完成した図形を通常の映像へ重ねるには[sRender](../shapes/s-render)で2D画像へ変換します。

```text
sRectangle → sRestyle → sRender → Merge → MediaOut
  図形を作る   外観を変更    画像にする   映像へ合成
```

この図は**データの流れを説明する構成例**です。sRestyleの正確な入力端子名、入力端子数、出力端子の内部形式を21.1実機で検証したものではありません。通常の2D画像をsRestyleへ直接入れて色補正する用途とは区別してください。

## 制作での使い方

### テロップ背景を、形とデザインに分けて調整する

1. **sRectangle**で文字の後ろに置く長方形を作ります。ここでは幅、高さ、角の形などの構成に集中します。
2. sRectangleのShapeを**sRestyle**へ渡し、塗りと輪郭線の見た目を調整します。
3. **sRender**で画像化し、通常のMergeで背景映像に重ねます。文字は別のレイヤーとして合成しても構いません。

```text
sRectangle → sRestyle → sRender ─┐
                                Merge → MediaOut
映像 ────────────────────────────┘
```

長方形の寸法を変える作業と、見た目を決める作業を別ノードに分けられます。輪郭線の詳細な設定可否は、実際のsRestyleのInspectorで確認してください。**線幅や線種という名称のControlが必ずある、という意味ではありません。**

### 複数の図形をまとめた後で見た目を変える

```text
sEllipse ────┐
             sMerge → sRestyle → sRender
sRectangle ──┘
```

円と四角形を別々に作り、[sMerge](../shapes/smerge)で1つのShapeの流れにまとめてからsRestyleへ渡します。形や位置をそれぞれの生成ノード側に残し、共通の外観調整を後段へ集めたい場合の構成案です。

Manualには複数のShapeの見た目を変更する役割が記されていますが、**異なる色・線・階層を持つ複合Shapeの全要素が同じ結果になるか**までは明記されていません。意図した部分だけ変わったかどうかをsRenderの結果で確認します。一部の図形を別のスタイルに保つなら、先にその図形を別の枝として扱う方法も検討してください。

### 複製する図形の外観を管理する

```text
A: sEllipse → sRestyle → sGrid → sRender
B: sEllipse → sGrid → sRestyle → sRender
```

[sGrid](../shapes/sgrid)は、受け取ったShapeを行と列に並べるノードです。Aは複製前の元図形に外観を設定し、Bは複製後の図形群に外観変更を行う位置関係です。

同じ円を何個も並べるドット背景や装飾模様で、調整箇所をどこに置くか考えるための比較です。**AとBが常に同じ描画結果になるとは確認していません。** とくに複製後の各要素の見た目や重なりを調整する場合は、sRenderで画像化した結果を比較してください。

## 似たShapeノードとの違い

| ノード | 何をしたいときに選ぶか |
| --- | --- |
| **sRestyle** | Krokodove系。既存Shapeの塗りや輪郭線の見た目を上書きしたい。詳細なInspector仕様は要確認。 |
| [sChangeStyle](../shapes/schangestyle) | 標準Shape系。色・Alphaと**Allow Combining**の変更が21.1 Manualに個別解説されている。 |
| [sExpand](../shapes/sexpand) | 塗りの見た目ではなく、Shapeの外側・内側へ輪郭を広げたり縮めたりしたい。 |
| [sOffset](../shapes/soffset) | Krokodove系。輪郭の拡張・収縮やその反復を行いたい。 |
| [sRender](../shapes/s-render) | Shapeのまま見た目を整えるのではなく、完成したShapeを2D画像へ変換したい。 |

sRestyleとsChangeStyleはどちらも見た目を変更する候補ですが、**同じノードの別名ではありません**。sChangeStyleのColorやAllow Combiningが、sRestyleにも同名・同仕様で存在すると推測しないでください。逆に輪郭を膨張させるなど形状そのものを変えたい場合は、sExpandやsOffsetを検討します。

## 確認するときの順序

sRestyleの挙動を実機で確かめるなら、まず単一の円や長方形をsRenderにつないで表示し、その間にsRestyleを挿入します。塗りと線のどの変更がViewerへ反映されるかを確認してから、sMergeで複数Shapeを渡します。

その後、複製の前後にsRestyleを置き、影響する範囲や重なり方に差が出るかを比較します。画像化してからの色補正や、Shape自体の変形と混同しないことが重要です。未確認のInspector項目を前提に作業手順を固定することは避けます。

## バージョンと出典

**出典：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Tools」のsRestyle項目。

この資料で確認できるのは、sRestyleがKrokodoveのShape Toolsに分類され、入力Shape（複数を含む）の見た目を、塗りや輪郭線の属性で変更する役割です。図中の接続順序と制作例は、この説明と一般のShapeワークフローを基に組み立てた**運用案**です。

**未確認：** Inspectorの正式なControl名・既定値・範囲、端子の表示名と数、複合Shapeへの厳密な作用範囲、内部REGID、Edition差、21.1実機での描画結果。これらはRuntimeでの確認後に追記します。
