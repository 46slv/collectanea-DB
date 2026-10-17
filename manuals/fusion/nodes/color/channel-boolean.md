---
title: Channel Booleans
description: 複数の2D画像からRGBAやZなどのチャンネルを選び、コピー・演算で組み替えるNode。Alphaの差し替えと別画像のZの受け渡しを説明。
doc_type: node
term_id: channel-boolean
term_short: 画像の色・透明度・補助チャンネルを、別画像の値や演算で組み替える2D Node。
verification: partial
aliases: [Channel Booleans, Bol]
concepts: [image-data, auxiliary-channels, alpha]
nodes: [Channel Booleans]
node_family: color
controls: [Operation, To Red, To Green, To Blue, To Alpha, Enable Extra Channels]
inputs: [image, image, mask, mask]
outputs: [image]
tasks: [channel-remap, alpha, auxiliary-channels]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Channel Booleans

Channel Booleansは、**画像に含まれる値をチャンネル単位で入れ替えたり、計算したりする**Nodeです。別画像のAlpha（透明度）で元画像を切り抜いたり、カラー画像へ別の画像からZ（奥行き）の値を移したりできます。

ここでいうチャンネルには、RGBAの赤・緑・青・透明度だけでなく、<Term id="auxiliary-channels">Z・Normalなどの補助チャンネル</Term>も含まれます。通常のMergeが前景と背景の**見た目を重ねる**のに対し、Channel Booleansは**出力画像の各チャンネルへ何の値を入れるか**を決めます。処理するのは<Term id="image">2D Image</Term>で、3DシーンやDeep Imageを直接統合するNodeではありません。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Background**（オレンジ、必須） | 2D画像 | 出力の基礎となる画像。変更しないチャンネルもここから保持できる |
| **Foreground**（緑、任意） | 2D画像 | Backgroundへコピー・演算する値の供給元 |
| **Matte**（白、任意） | マット | チャンネルの組み合わせに使う外部マット |
| **Effect Mask**（青、任意） | マスク | 処理結果を適用する画面内の範囲を制限する |
| **出力** | 2D画像 | 指定したRGBA・補助チャンネルを持つ画像 |

MatteとEffect Maskは同じ端子ではありません。Matteはチャンネル操作に使い、Effect MaskはNodeの変更を適用する範囲を制限します。

Foregroundを接続せずFG由来のチャンネルを選択すると、21.1マニュアルによればBackground側の対応する値が代用されます。別画像の値を使いたい場合、緑の入力が接続されているか確認します。

## Inspectorの仕組み

### Color Channels：どの値をどこへ送るか

**To Red / To Green / To Blue / To Alpha**では、出力RGBAの各チャンネルへ入れる元の値を選びます。例えば**Red FG**はForeground画像の赤、**Alpha BG**はBackground画像のAlphaを指します。Z、Luminance、Hueなども候補です。

**Operation**は、選んだ値をどう計算するかを指定します。

| Operation | 働き | 用途例 |
| --- | --- | --- |
| **Copy** | 指定したチャンネルの値をコピー | 別画像のAlphaに差し替える |
| **Add / Subtract** | 値を加える／引く | マットや色成分を組み合わせる |
| **Multiply / Divide** | 値を掛ける／割る | 成分の強さを変更する |
| **Maximum / Minimum** | 二つの値から大きい方／小さい方を採用 | チャンネルの比較 |
| **And / Or / Exclusive Or** | 論理演算 | 値のビット演算 |
| **Solid / Clear** | チャンネルを最大値／ゼロにする | Alphaを不透明／透明にする |

ほかにNegative、Difference、Signed Addなどがあります。単純なチャンネルの差し替えでは、まず**Operation = Copy**を選びます。To Alphaなどの参照元が正しくても、別のOperationが選ばれていると期待した値にはなりません。

### Aux Channels：Zなどを保持・コピーする

**Enable Extra Channels**を有効にすると、通常のRGBA以外の補助チャンネルを出力できます。Aux Channelsタブで、出力の補助チャンネルに割り当てる元の値を選びます。

重要なのは、**白黒画像が自動的にZチャンネルになるわけではない**点です。深度がRGBのRedに入っている画像と、補助チャンネルZとして保存されている画像は異なります。元の値がどこに格納されているかを確認してから、出力Zの参照元を指定します。BG（Background）とFG（Foreground）も区別します。

## 例1：別画像のAlphaだけを採用する

元画像の色は保持し、別画像のAlphaに入れ替えます。

```text
元画像（RGBA）─────────→ Background（オレンジ）
別画像（Alphaあり）──→ Foreground（緑）
                                 ↓
                           Channel Booleans → 出力
```

1. 元画像をBackground、Alphaを持つ画像をForegroundへ接続します。
2. **Operation = Copy**を選びます。
3. **To Red / To Green / To Blue = Do Nothing**にして、元画像の色を変えないようにします。
4. **To Alpha = Alpha FG**を選びます。ForegroundのAlphaを出力Alphaへコピーします。
5. Viewerで抜け方を確認します。RGBとAlphaの関係がおかしい素材では、その後のMerge結果も確認します。

この設定は21.1マニュアルの具体例に基づいています。外部のマットをAlphaとして使いたい場合は、同マニュアルに**To Alpha = Matte**を選ぶ例もあります。

## 例2：色画像とZデータをまとめる

カラー画像にはZがなく、別の画像にZがある場合です。ZはAlphaやRGBとは別の補助チャンネルとして渡します。

```text
カラー画像（RGBA）─────────→ Background
深度画像（Zを含む）────────→ Foreground
                                     ↓
                               Channel Booleans
                                     │（RGBA + Z）
                                     ↓
                                  Depth Blur → 出力
```

1. カラー画像をBackground、Zチャンネルを持つ画像をForegroundへ接続します。
2. 色を変える目的でなければ、RGBAはBackgroundの値を保持するようにColor Channelsを設定します。
3. **Operation = Copy**を選び、**Enable Extra Channels**を有効にします。
4. Aux Channelsで、出力Zへ**ForegroundのZ**を指定します。深度がRGBA側に格納されている画像なら、実際の格納先チャンネルを確認して指定します。
5. [Copy Aux](./copy-aux.md)で出力Zを確認してから、[Depth Blur](../deep/depth-blur-deep-pixel.md)または[Fog](../deep/fog-deep-pixel.md)へ送ります。

21.1マニュアルにも、ForegroundのZをBackground画像へコピーする構成が示されています。**[Renderer 3D](../3d/renderer-3d.md)からRGBAとZを一緒に出力できる場合、Channel Booleansを追加する必要はありません。** Zを有効にしたRenderer 3Dの出力を、そのままDepth Blurなどへ接続できます。

RGBの白黒階調として書き出した深度画像は、元の浮動小数点Zと値域・精度が異なる場合があります。見た目だけで同じ深度データだと判断しないでください。

## うまくいかない場合

- **Alphaが変わらない**：Foregroundの接続、Operation = Copy、To AlphaのFG/BGを確認します。RGBを変えないならTo RGBの設定も確認します。
- **Depth BlurやFogで距離に応じた効果が出ない**：Zが出力の**補助チャンネル**に入っているかを[Copy Aux](./copy-aux.md)で確認します。Enable Extra Channelsと参照元も確認します。
- **画像全体が明るく／暗くなる**：OperationがAddやMultiplyなどになっていないか、不要なRGBまで変更していないかを調べます。
- **物体の輪郭に不自然な深度が出る**：RGBAとZの解像度・画角・輪郭の対応を確認します。Zを色のように補間すると、実際には存在しない中間の距離値が生じることがあります。[補助チャンネルの境界処理](../../learn/02-data/auxiliary-channels.md)も参照してください。

## 似たNodeとの違い

- **[Copy Aux](./copy-aux.md)**：補助データをRGBAへ取り出して表示・加工し、再び補助チャンネルへ戻すのに向きます。
- **Channel Booleans**：複数画像のチャンネルを**個別に移動・演算**する用途です。
- **[Matte Control](../matte-keying/matte-control.md)**：マットの調整やAlphaの組み合わせを中心に使います。
- **[Channel Boolean Material](../materials-lights/channel-boolean-material.md)**：名前は似ていますが**Classic 3DのMaterial用**です。2D画像にはChannel Booleansを使います。

## 出典・確認範囲

- **Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』**、Chapter 93「Channel Booleans [Bol]」、本文**pp.2154–2157**。4入力、Foreground未接続時の挙動、Operation、RGBAの差し替え、Aux Channels、ForegroundのZをBackgroundへコピーする例を確認。
- 関連：同Manual Chapter 93「Copy Aux [CpA]」（pp.2182–2185）、Chapter 96「Depth Blur [DBl]」（pp.2259–2261）と「Fog [Fog]」（pp.2261–2263）。

本文の接続例は21.1公式資料をもとに構成しています。21.1実機での全演算の境界値、外部画像の深度チャンネル形式、Alphaのpremultiplicationによる差は未検証のため、`verification: partial`を維持します。
