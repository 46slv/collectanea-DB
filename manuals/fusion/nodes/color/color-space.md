---
title: Color Space
description: RGBをYUV・HLSなどの成分へ変えて処理し、必要に応じてRGBへ戻すFusionノード。Viewer表示、Alpha、マスクの注意点も説明。
doc_type: node
term_id: color-space
term_short: RGBをYUV・HLSなど別の色成分に変換し、成分ごとの処理やRGBへの復帰を行うノード。
verification: partial
aliases: [Color Space, CS]
concepts: [image-data, color-space]
nodes: [Color Space]
node_family: color
controls: [Conversion, Color Type]
inputs: [image, mask]
outputs: [image]
tasks: [color-space, channel-processing]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Color Space

Color Spaceは、画像の赤・緑・青（RGB）を、**明るさと色の差**や**色相・彩度・明るさ**など、別の組み合わせで扱えるように変換するノードです。通常はRGBを使って画像を表示・加工しますが、色と明るさを別々に調整したいときは、YUVやHLSなどの成分に分けると便利な場合があります。

このノードは、変換後の3成分を一時的に元のR・G・Bチャンネルへ格納します。そのため、Viewerでは変換直後の画像が不自然な色に見えることがあります。**Viewerが画像を正しい色で表示できないのではなく、別の意味を持つ数値をRGBとして表示している**ためです。処理が終わったら、対応するColor SpaceノードでRGBへ戻します。

カメラLogからRec.709への変換、HDR→SDR、表示色域・ガンマの管理を主目的とする場合は、[Color Space Transform](./color-space-transform)を使用します。両者は名前が似ていますが、用途が異なります。

## 入力・出力

| 端子 | 何を接続するか | 動作 |
| --- | --- | --- |
| **Input**（オレンジ、必須） | MediaIn、Loader、Mergeなどの2D画像 | RGBまたは変換済みの3成分を受け取り、Conversionの指定に従って変換する |
| **Effect Mask**（青、任意） | Rectangle、Polygonなどのマスク | ノードの変換を適用する画面上の範囲を限定する |
| **Output** | 次の2DノードやMediaOutなど | 変換結果を3つの主要チャンネルとして出力する |

```text
MediaIn ──→ Color Space（To Color）──→ 加工するノード
                                             │
                            Color Space（To RGB）──→ MediaOut
```

Effect Maskは、21.1マニュアルではノードの処理後に適用されると説明されています。**RGBから別形式へ変換する最初のノードだけを部分マスクで制限すると、1枚の画像の中で変換済み領域とRGBのままの領域が混在します。** その画像全体を一律に「To RGB」で戻すと、RGBのままの領域まで別形式と誤解されるため注意が必要です。通常は変換を画像全体へ行い、中間の色調整をマスクで制限するか、変換・復帰を終えた枝を元画像へ合成します。

**Alpha（透明度）はColor Spaceの変換によって変更されません。** RGB以外の成分を使う場合も、透明部分の扱いは後段の合成・加工ノードと合わせて確認してください。

## Inspector：Conversion

| 設定 | 動作 |
| --- | --- |
| **None** | 色空間を変換しない |
| **To Color** | 入力RGBを、Color Typeで選択した3成分へ変換する |
| **To RGB** | 入力画像の3成分を、Color Typeで指定された形式とみなしてRGBへ変換する |

`To RGB`を使う場合のColor Typeは、**そのノードへ実際に入力されている画像の形式**と一致させます。たとえば先にYUVへ変換したなら、戻す側もYUVを選びます。処理途中で別の3成分形式に変わったのに設定を合わせないと、見た目が大きく崩れることがあります。

## Inspector：Color Type

21.1マニュアルにある選択肢は8種類です。

| Color Type | 何に分けるか・どう変えるか | 主な使いどころ |
| --- | --- | --- |
| **HSV** | Hue（色相）、Saturation（彩度）、Value（明るさ） | 色相や彩度を成分として取り扱う |
| **YUV** | Y（明るさ成分）、U・V（色の差を示す成分） | 明るさと色の情報を分けて扱う |
| **YIQ** | Y（明るさ成分）、I・Q（色差に関係する成分） | アナログNTSC由来の表現との処理・比較 |
| **CMY** | Cyan、Magenta、Yellow | RGBとは異なる3成分の表現へ変換する |
| **HLS** | Hue（色相）、Luminance（明るさ）、Saturation（彩度） | 明るさと色相・彩度の各成分を分ける |
| **XYZ** | CIE XYZの3成分 | 色の数値表現や別の色空間との関係を扱う |
| **Negative** | 色チャンネルの値を反転する。RGBA形式自体は維持 | ネガ反転の効果 |
| **BW** | RGBから白黒画像へ変える。RGBA形式自体は維持 | 白黒化、明るさ成分を作る |

`BW`を選ぶと、赤・緑・青を白黒の明るさにどの程度反映するか指定するスライダーが現れます。色の情報を失うため、**BWで白黒にした画像を「To RGB」で元の色付き画像へ完全復元することはできません。** NegativeとBWは、YUVやHLSのように3種類の成分を後段で個別処理する場合とは性格が異なります。

XYZはCIEの色表現です。XYZの各値をViewerでそのままRGBとして見ることは、色が正しく表示されることを意味しません。なお、Color SpaceノードのXYZ変換を使うことと、Resolve Color Managementで入力・出力の色域とガンマを管理することは同じ操作ではありません。

## ViewerとRGBAチャンネル表示の注意点

Color Spaceは変換後も、3つの主要チャンネルへ値を格納します。**FusionのViewerや多くのノードは、それらを引き続きR・G・Bだと解釈します。**

たとえばYUVへ変換すると、ViewerではYがR、UがG、VがBとして表示されます。HLSならHueがR、LuminanceがG、SaturationがBに入ります。見た目が変わっても、変換が失敗した証拠ではありません。

InspectorのSettingsタブにあるR・G・Bチャンネルの処理オン・オフも、ボタンの表示は変わりません。しかし処理対象は**変換後の成分**です。

| 変換後の形式 | Rボタンが扱う成分 | Gボタンが扱う成分 | Bボタンが扱う成分 |
| --- | --- | --- | --- |
| YUV | Y | U | V |
| HLS | Hue | Luminance | Saturation |

つまり「Rだけ有効にした」のは必ずしも赤色成分だけを変更する意味ではありません。各成分へ計算を加えるノードが、値をRGB色として扱ってしまう場合もあります。中間の処理には、対象チャンネルの値を意図どおり操作できるものを選んでください。

## 実践例：YUVの明るさ成分だけを加工してRGBへ戻す

赤・緑・青を個別に調整する代わりに、YUVのY（明るさ成分）だけへ処理をかける構成です。

```text
MediaIn
   ↓
Color Space A ── Conversion: To Color / Color Type: YUV
   ↓
Brightness Contrast ── 対象チャンネルをR（= Y）だけに制限
   ↓
Color Space B ── Conversion: To RGB / Color Type: YUV
   ↓
MediaOut
```

1. MediaInの後にColor Space Aを置き、`To Color`と`YUV`を選びます。Viewerの色が奇妙に見えるのは想定内です。
2. [Brightness Contrast](./brightness-contrast)を接続します。変換後は**RチャンネルがY値**なので、処理チャンネルをRのみに制限し、BrightnessやContrastを少しずつ調整します。ほかの成分が変更されていないかも確認してください。
3. Color Space Bを追加し、`To RGB`と`YUV`を選びます。これで画像をRGBとして扱う後続ノードへ渡せます。
4. Color Space Bを一時的に無効化して中間値を確認するときは、Viewerの色を通常のRGB画像だと思って評価しないでください。

この方法は、処理中のチャンネル値がYUVとして意味を持つことを利用しています。RGBを前提とした彩度補正やカラーグレーディングを、そのままYUVの中間段へ挿入するのは避けます。また、色変換・調整を繰り返せば数値が変化する場合があり、無処理で往復したとしてもすべての条件でビット単位の一致を保証するものではありません。

## ほかのノードとの使い分け

| 目的 | 適した候補 |
| --- | --- |
| HSV / YUV / HLSなどの成分を一時的に使って加工する | **Color Space** |
| 素材の入力色空間・ガンマから別の出力色空間・ガンマへ変える | [Color Space Transform](./color-space-transform) |
| 色空間とガンマの除去・追加を扱う | [Gamut](./gamut) |
| 入力画像や別画像からチャンネルをコピー・演算する | [Channel Booleans](./channel-boolean) |
| RGBに対して明るさ・コントラストを調整する | [Brightness Contrast](./brightness-contrast) |

## うまくいかない場合

| 症状 | 確認すること |
| --- | --- |
| To Color直後に色が崩れる | ViewerがYUV / HLSなどをRGBとして表示している可能性。To RGBまでつないで判断する。 |
| To RGBを通しても奇妙な色になる | 変換元と復帰側のColor Typeが一致しているか。中間ノードが別の成分を変更していないか。 |
| Rだけを調整したのに赤だけが変わらない | YUVならRはY、HLSならRはHue。現在のColor Typeを確認する。 |
| マスク外の色まで変わる | 変換の最初のノードだけ部分マスクしていないか。混在した形式を全域で復帰変換していないか。 |
| BWにした色が元へ戻らない | BWは白黒化で色情報が失われる。往復可能な3成分の表現変換と区別する。 |
| 透明部分の縁で結果が変わる | Color Space変換自体はAlphaを変更しない。中間ノードのRGB・Alphaの取り扱いを確認する。 |

## 出典・確認範囲

- Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 93「Color Nodes」、pp.2180–2182。Conversion、Color Typeの8種類、入力・Effect Mask、Viewer・SettingsのRGB解釈、Alphaが変換されないことを確認。
- 関連する処理例は同マニュアルの記載を組み合わせた運用例です。Brightness Contrastにおける設定名やチャンネル選択は21.1記事にも照合しています。Fusion実機による全形式の数値一致、各方式の演算精度、Edition差は未検証です。
