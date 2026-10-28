---
title: Dither
description: KrokodoveのDitherで画像に細かなノイズ模様を加え、陰影を感じさせる粗い質感を作る。使い方とNoise・Rasterizeとの違いを説明。
doc_type: node
term_id: dither
term_short: 入力画像にノイズの模様を加え、陰影の見え方や粒立った質感を変えるKrokodoveの画像フィルター。
verification: partial
aliases: [Dither]
concepts: [image-data]
nodes: [Dither]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Dither

Ditherは、**画像に細かなノイズの模様を加え、陰影の見え方を変える**Krokodoveの画像フィルターです。DaVinci Resolve 21.1 Reference Manualでは、模様状のノイズによって陰影を感じさせ、輪郭がはっきりした粗い質感（*crunchy texture*）を作るツールとして紹介されています。

たとえば、なめらかな明暗の変化がある写真に適用すると、元の濃淡の上に細かな模様が現れる表現を期待できます。ただし、模様の規則性、粒の大きさ、色数や階調がどう変わるかは、Manualの短い説明だけでは確定しません。実際の効果はViewerで比較します。

## ディザリングと、このDitherの役割

一般に**ディザリング**とは、限られた色や明るさの値を使う場面で、周囲の画素に小さな差を付け、目には中間の明るさや色があるように見せる方法です。遠くから見ると灰色に見える部分が、近くでは明るい点と暗い点の集まりになっている場合を考えると分かりやすくなります。

KrokodoveのDitherは、この考え方に関連する**模様状のノイズと陰影表現**を持つフィルターです。しかし、21.1 Manualは「色数を減らす」「特定の誤差拡散アルゴリズムで量子化する」とは説明していません。一般的なディザリングの仕組みを、そのままDitherノードの内部アルゴリズムやInspectorの仕様とみなさないでください。

ここで加工するのは画面の画素で構成された<Term id="image">Image</Term>です。図形の輪郭を描画前のデータとして扱う<Term id="shape-data">Shapeデータ</Term>を生成するノードではありません。Krokodoveには別のデータを扱うツールもあるため、[Family Overview](./)で区別できます。

<!-- capture:S229 -->

## 実機例：グラデーションに模様を加える

白黒の横グラデーションを `Dither` に接続し、出力を元画像と比較しました。

この例ではOutput Bits Per Channelを2に設定すると、元の滑らかなグラデーションに細かな模様が現れます。内部アルゴリズムやビット深度の厳密な意味は未検証です。[接続と設定の記録](/img/fusion/captures/S229/readback.json)に条件を記載しています。

[![グラデーションをKrokodove Ditherへつなぐ構成](/img/fusion/captures/S229/graph.png)](/img/fusion/captures/S229/graph.png)

合成グラデーションをDitherへ渡します。

[![Krokodove Ditherの設定](/img/fusion/captures/S229/controls.png)](/img/fusion/captures/S229/controls.png)

Output Bits Per Channelを2に設定しています。

[![処理前の滑らかなグラデーション](/img/fusion/captures/S229/low.png)](/img/fusion/captures/S229/low.png)

処理前の画像です。

[![Ditherを通したグラデーション](/img/fusion/captures/S229/high.png)](/img/fusion/captures/S229/high.png)

処理後は細かな模様が見えます。

[再現用Graph](/img/fusion/captures/S229/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S229/capture.json)

<!-- /capture:S229 -->

## 入力と出力

| 段階 | 扱うデータ | 21.1 Manualで確認できること |
| --- | --- | --- |
| 入力 | 2D Image | Ditherは画像にノイズ模様を加えるフィルターとして掲載されています。実機SDKではImage入力とEffectMask入力を確認しました。 |
| 処理 | 画像に模様状のノイズを導入する | ノイズによる陰影の表現と、粗い質感の生成が説明されています。 |
| 出力 | 加工後の2D Image | Image Toolsの項目であり、画像フィルターとして扱います。Alphaや解像度の変化は未確認です。 |

まず元映像や静止画像をDitherに接続し、その出力をViewerへ表示します。入力と出力を同じ倍率で見比べると、どこに模様が現れるかを確かめやすくなります。

`inputs: [image]`と`outputs: [image]`は記事内の**データ分類**であり、ノードタイルに表示される正確な端子ラベルや端子数を保証するものではありません。

## 主な用途

### ポスターやMVのざらついた画づくり

写真やタイポグラフィの背景を、滑らかなCGや実写とは違う、粒立った表現に寄せたい場合に使えます。強いグラフィック処理が必要な場合は、Ditherによる変化を確認してから、他の色調整や合成処理と組み合わせます。

### 明暗の境目に模様を加える

グラデーションや影の部分に、小さな模様で陰影を感じさせる表現が考えられます。ただし、どの明るさにどの程度の模様を加えるか、画素パターンを固定・変更できるかは未確認です。「指定した階調だけを加工する」といった機能はInspectorで確認するまで前提にしません。

### 元の映像と加工結果を混ぜる

Ditherの出力が2D画像として得られれば、通常の[Merge](../compositing/merge)を使って原画と合成できます。加工前の質感を残したいときに、ノードを置き換えずに比較できる構成です。

## 制作例：映像の陰影へ細かな模様を足す

次は標準のMergeを併用する**構成案**です。Krokodove Ditherの正式なInspector操作を示す公式チュートリアルではありません。

```text
MediaIn（元映像） ───────────────────→ Merge（BG） ─→ MediaOut
           └────────→ Dither ───────→ Merge（FG）
```

1. Fusionページで元映像のMediaInをDitherへ接続し、Ditherの出力をViewerに表示します。まずは陰影や輪郭のどこにノイズ模様が現れるかを確認します。
2. 元映像を分岐してMergeのBackground（BG）へ、Dither後の画像をForeground（FG）へ接続します。元映像と処理後の映像を同じ画面で比較できるようにするためです。
3. Merge側のBlendを調整し、原画と加工結果の混合量を変えます。これはMergeの機能であり、Dither固有の強度パラメータを示したものではありません。
4. 効果を画面の一部に限定するなら、MergeのEffect Maskを使う構成を検討します。Dither自身に専用のマスク端子があると確認したわけではありません。
5. 全体像に加えてViewerの等倍表示でも確認します。細かな模様は表示倍率や最終的な縮小処理で見え方が変わるためです。

出力のAlpha（透明度）が元画像と一致するかは未確認です。Mergeで思ったように合成されない場合は、Ditherの前後のAlpha表示も確認します。

## 似たツールとの違い

| ツール | 21.1 Manualで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Dither（Krokodove）** | 画像に模様状のノイズを加え、陰影と粗い質感を表す | 元画像の見え方に粒立ちを足したい |
| [Noise（Krokodove）](./noise) | ピクセル状の模様を作る。色をランダム生成または指定できる | 色の付いた不規則な模様が必要 |
| [Rasterize（Krokodove）](./rasterize) | 元画像を点・四角形・菱形などの形の集まりに変換する | 写真や映像を網点・ハーフトーン風に描き直したい |
| [Generate（Krokodove）](./generate) | 入力素材に質感を足し、グレースケールのランダム風ノイズを作る | 濃淡のあるノイズ表現を試したい |

DitherとNoiseはどちらもノイズを扱いますが、Manualの説明では**Ditherは画像へのフィルター処理**、Noiseは**ピクセル状の模様の生成**に重点があります。Rasterizeは元画像を小さな図形の集まりとして描き直す処理です。見た目が似る場面でも、元画像をどう扱いたいかで選びます。

標準の**Change Depth**にも「Dither」という設定があります。こちらは画像のビット深度を下げる際に、階調の不自然な段差を目立ちにくくするための設定です。Krokodove Ditherと同じ機能・アルゴリズムだと考えないでください。

## 注意点と確認が必要な仕様

- **元画像が判別しづらい**：模様が目立つ場合は、Mergeで原画との混合を試します。細部がつぶれるかどうかはViewerで確認します。
- **階調の段差が消えると思った**：21.1 ManualはDitherを質感と陰影のフィルターとして紹介しています。バンディング除去や色数の削減は保証していません。
- **フィルム粒子と同じだと思った**：時間方向の変化、粒径の分布、色チャンネルごとの特性は未確認です。フィルムグレインの物理的な再現としては扱いません。
- **設定名を探しても見つからない**：実機のInspectorではOutput Bits Per Channel、Dither Method、Multiplierを確認しました。選択中の方式名はFloyd & Steinbergでしたが、その内部実装は検証していません。

## バージョン・出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2434「Image Tools / Dither」。ノイズ模様による陰影表現と粗い質感の生成を確認。
- **比較対象**：同Manual p.2435（Generate・Rasterize）、p.2436（Noise）、p.2583（Change DepthのDither設定）。一般的なディザリングの説明は概念の補足であり、Krokodove Dither固有のアルゴリズムの証明ではありません。
- **関連**：[Krokodoveの画像・Shape・3D・Region](./)。データの種類を区別してからツールを探す場合に利用できます。

**未確認**：実機ではKD_DitherのImageとEffectMask入力、上記のInspector項目と表示例を確認しました。出力端子の詳細、項目の初期値・範囲、ノイズパターンの内部実装、色数と色深度の扱い、Alpha・解像度・DoD、時間変化・アニメーション可否、Free / Studio・Fusion StudioのEdition差。

基本的な役割は21.1 Manualに記載されていますが、詳細仕様を実機で照合していないため`verification: partial`を維持します。
