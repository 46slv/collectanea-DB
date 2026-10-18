---
title: sTrace Create
description: 2Dの文字や図形をFusionのShape環境へ取り込み、輪郭の加工へつなぐKrokodoveツール。
doc_type: node
term_id: strace-create
term_short: 2Dの文字や図形をShape環境へ移し、太さ・不透明度・線のスタイルを調整できるツール。
verification: partial
aliases: [sTrace Create, sTraceCreate]
concepts: [shape-data]
nodes: [sTrace Create]
node_family: krokodove
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sTrace Create

**sTrace Create**は、2Dで作った文字や図形を、FusionのShape環境へ取り込むKrokodoveのツールです。すでにある文字・図形の形を出発点にして、後段のShape系ツールで輪郭を加工したい場合に使います。

ここでいう<Term id="shape-data">Shape</Term>は、画像のピクセルではなく、図形の輪郭などを保持して加工するためのデータです。2Dの文字・図形をそのまま重ねる場合と、Shapeとして輪郭を変えた後に画像化する場合では、処理の順序が違います。

ただし、**写真を自動でベクター化する一般的な画像トレース機能**と同じとは確認できていません。DaVinci Resolve 21.1 Reference Manualが明示している入力対象は「2Dの文字または図形」です。

## 何をするノードか

Krokodoveの「Shape Create Tools」に含まれますが、[sPrimitiveCreate](./sprimitive-create)や[sSpiral Create](./sspiral-create)とは違い、既存の文字・図形を受け取るツールとして説明されています。

たとえば、文字の輪郭を後段で加工したい場合、文字を直接合成するのではなく、いったんShape環境へ移してから画像へ戻す構成を考えられます。

```text
2Dの文字・図形 → sTrace Create → Shapeの加工 → sRender → 2D画像として合成
                   Shapeへ取り込む              画像化
```

これは各ツールの**説明に基づく構成案**であり、Krokodove 21.1の実機で接続・描画を検証したレシピではありません。

## 入力と出力

| 段階 | 扱うもの | 確認範囲 |
| --- | --- | --- |
| 入力 | 2Dの文字または図形 | 21.1 Manualには直接接続すると記載。正式な端子名や、対応する入力ノードの全種類は未確認。 |
| 処理 | 受け取った2D文字・図形をShape環境へ渡す | 公式の役割記述。輪郭をどのように抽出・変換するかは未確認。 |
| 出力 | 後段のShape系ツールで扱うためのShape | Manualの用途と既存カタログによる分類。正式な出力端子名・本数は未確認。 |
| 画像への変換 | [sRender](../shapes/s-render)でShapeから2D Imageへ変換 | 標準Shape系の機能。Krokodoveとの接続自体は実機確認が必要。 |

**「2Dの文字・図形」と「任意の2D画像」は同義ではありません。** MediaInからの写真や動画、SVGファイル、文字をラスタライズした画像をそのまま入力できるかは、この一文からは分かりません。文字列の編集情報やフォント設定が変換後も残るとも断定できません。

Shapeのまま通常のMergeへつなぐのではなく、画像として扱う段階でsRenderを使います。詳しいデータの区別は[シェイプ（Shape）の基礎](../../learn/02-data/shape)を参照してください。

## 主な設定項目

21.1 Manualは、調整できる内容として**太さ（thickness）・不透明度（opacity）・線のスタイル（line styles）**を挙げています。

| 要素 | 見た目を考えるときの意味 |
| --- | --- |
| 太さ | 取り込んだ輪郭を細い線にするか、幅のある線にするかという調整。どの線へどう適用されるかは未確認。 |
| 不透明度 | 輪郭をどの程度透けて見せるかに関係する要素。入力Alphaとの合成方法は未確認。 |
| 線のスタイル | 線の見せ方を変える要素。選べる線種、端点、角の処理は未確認。 |

これらは**Manualに記載された機能の種類**であり、`Thickness`、`Opacity`、`Line Style`がそのままInspectorの正式なラベルであることを保証しません。値域・初期値・各タブの配置も未確認です。

## 具体的な運用例

### 文字の輪郭を現すタイトル

1. 一文字や短い単語を2Dの文字ツールで用意します。Text+など、どのツールの出力が直接対応するかは実機で確認します。
2. sTrace Createへ入力をつなげられるか確認し、いったんsRenderで画像化して元の文字と比べます。最初から複数の加工を重ねない方が違いを判断できます。
3. Shapeとして受け渡せることを確認できたら、[sWriteOn](./swriteon)を後段へ加え、輪郭が現れたり消えたりする演出を検討します。
4. sRenderを経由した画像を[Merge](../compositing/merge)で背景へ重ね、文字の穴・輪郭の欠け・読みやすさを確認します。

```text
2D文字 → sTrace Create → sWriteOn → sRender → Merge
         Shapeへ取り込む   輪郭の表示   画像化    合成
```

この構成は**試すための案**です。とくに「O」「田」のように内側に穴がある字形がどう扱われるか、線がどの順に現れるか、筆順のような動きを指定できるかは未確認です。

### 図形の線・塗りを加工する

すでに2Dで作った図形をShapeへ移せるなら、[sRestyle](./srestyle)で塗りや輪郭線の見た目を変更し、画像化する流れも考えられます。

```text
2D図形 → sTrace Create → sRestyle → sRender → Merge
          Shapeへ取り込む    見た目     画像化    合成
```

図形の作成、Shapeへの変換、見た目の変更、画像化をそれぞれ別のツールに分ける考え方です。複雑な曲線・交差線が元の2D図形と同じ形になるかはViewerで比較します。

## 似たノードとの違い

| ノード | 役割 | 選ぶ目安 |
| --- | --- | --- |
| **sTrace Create** | 既存の2D文字・図形をShape環境へ渡す | 元の文字や図形がすでにある |
| [sPrimitiveCreate](./sprimitive-create) | 十字・多角形・長方形・星形などを生成 | 新しい基本図形を作る |
| [sSpiral Create](./sspiral-create) | らせん状の曲線を生成 | 巻いた線を作る |
| [sRestyle](./srestyle) | Shapeの塗りや輪郭を変更 | 形ではなく線や塗りの見た目を変える |
| [sWriteOn](./swriteon) | Shapeの輪郭を現す・隠す | 輪郭の表示演出を作る |
| [sRender](../shapes/s-render) | Shapeを2D Imageへ変換 | 通常の画像合成へ渡す |

sTrace CreateとsRenderは、どちらもデータの扱いを変える位置にありますが**向きが異なります**。前者は2D文字・図形をShape環境へ持ち込み、後者はShapeを通常の画像にします。

## 注意点と確認範囲

- **入力互換性**：Manualの「2D text or shapes」が、具体的にどのノードのどの出力を指すかは未確認です。任意の写真・映像・SVGをトレースできるとは説明しません。
- **輪郭の再現**：文字の内側の穴、重なった図形、細線、鋭角、曲線、アンチエイリアスの扱いは未確認です。単純な文字・図形から検証します。
- **設定**：太さ・不透明度・線のスタイルが調整可能なことはManualに記載されています。正式なInspector項目名、値域、初期値、適用範囲は未確認です。
- **提供条件**：Resolve Free / Studio / Fusion StudioのEdition差、内部REGID、Effects Library上の現在の表示名と実機結果は未確認です。

## バージョンと出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Create Tools — sTrace Create」。同ページで2Dの文字・図形との接続、Shape環境への受け渡し、太さ・不透明度・線のスタイルの調整を確認しました。

Shapeから2D Imageへの変換は同ManualのChapter 117「Shape Nodes」（pp.2759–2761）と[sRender](../shapes/s-render)を参照。本文の接続例は各ツールの役割から組み立てた**未検証の制作案**です。端子の正式名称・数、Inspectorの全設定、変換精度、Edition差は未確認のため`verification: partial`を維持します。
