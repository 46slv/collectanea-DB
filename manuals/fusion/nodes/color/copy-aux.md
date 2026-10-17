---
title: Copy Aux
description: Z・Normal・UVなど画像内の補助チャンネルをRGBAに取り出して表示・加工し、必要に応じて補助チャンネルへ書き戻すNode。
doc_type: node
term_id: copy-aux
term_short: 画像に含まれる奥行きや面の向きなどの情報を、RGBAへ取り出したり元の補助チャンネルへ戻したりするNode。
verification: partial
aliases: [Copy Aux, CpA]
concepts: [auxiliary-channels, image-data]
nodes: [Copy Aux]
node_family: color
controls: [Mode, Aux Channel, Out Color Depth, Channel Missing, Kill Aux Channels, Enable Remapping, Detect Range, Update Range, Invert]
inputs: [image, mask]
outputs: [image]
tasks: [auxiliary-channels, inspect-aov, channel-remap]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Copy Aux

Copy Auxは、画像の**通常の色（RGBA）**と、その画像に付いている**補助チャンネル**との間でデータをコピーするNodeです。たとえば3Dレンダリング済みの画像から、物体までの奥行きを表すZや、面の向きを表すNormalを取り出し、Viewerで見たり2DのNodeで処理したりできます。逆向きにコピーすれば、処理結果を補助チャンネルへ書き戻せます。

<Term id="auxiliary-channels">補助チャンネル</Term>とは、赤・緑・青・透明度とは別に各ピクセルへ保存された情報です。Z（奥行き）、UV（模様を貼る位置）、Normal（面の向き）、Object ID（物体の識別番号）などがあります。Copy Auxは**同じ2D Imageの内部にあるデータを移す**もので、別の画像をもう1本入力して合成するNodeではありません。

[Channel Booleans](./channel-boolean)がR・G・B・Aや補助チャンネルを成分単位で演算するのに対し、Copy AuxはZ、UV、Normalなどの**チャンネル群をひとまとまりで**コピーします。

## 入力と出力

| 接続 | 受け取るもの | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | 2D Image | 必須。RGBAと、存在する場合はZ・Normalなどの補助チャンネルを含む画像 |
| **Effect Mask（青）** | Mask | 任意。コピー操作を適用する範囲を制限する。MaskはNodeの処理後に適用される |
| **出力** | 2D Image | 選択したデータをRGBAへ取り出した画像、または補助チャンネルへ書き戻した画像 |

ZやNormalが最初の画像に含まれていなければ、Copy Auxを追加するだけでは生成されません。必要なデータは[Renderer 3D](../3d/renderer-3d)や外部3Dレンダラーから出力し、MediaIn / Loaderで読み込みます。外部ファイルが複数パスに分かれている場合は、そのパスの割り当てや統合も別途必要です。

## Mode：取り出す／書き戻す

Inspectorの**Mode**で方向を選び、**Aux Channel**で対象の補助チャンネルを指定します。

- **Aux to Color**：指定した補助チャンネルをRGBAへコピーします。ZなどをViewerで確認するときや、通常の2D Nodeで処理するときに使います。
- **Color to Aux**：現在のRGBAの値を、指定した補助チャンネルへ書き込みます。処理後の結果を、後段の補助チャンネル対応Nodeへ渡すときに使います。

Color to Auxでは、Controlsタブのほとんどの項目が非表示になり、Aux Channelの選択が残ります。次の表示用Remappingなどは主にAux to Colorで使用します。

### RGBAへどう格納されるか

補助チャンネルの成分数に応じて、コピー先のRGBAが決まります。

| 元の補助データ | RGBAへ取り出した結果 | 見え方・用途 |
| --- | --- | --- |
| Z（1成分） | `(Z, Z, Z, 1)` | 奥行きの数値がR・G・Bに同じ値で入る |
| UV（2成分） | `(U, V, 0, 1)` | Uが赤、Vが緑に入る |
| Normal（3成分） | `(Nx, Ny, Nz, 1)` | 面の向きのX・Y・Z成分がR・G・Bに入る |
| 4成分の補助データ | 4成分をそのままRGBAへ | 各成分が対応するスロットに入る |

これは**数値のコピー規則**であり、見た目が自然なカラー画像になるという意味ではありません。たとえばNormalは負の値も持つため、そのままViewerで表示すると分かりにくい場合があります。

## 使い方1：ZやNormalが入っているか確認する

まずはレンダリング済みの画像に必要な補助チャンネルがあるかを調べます。

```text
MediaIn / Loader（RGBA + Z / Normalなど）
  └─ Copy Aux（Mode: Aux to Color）
       └─ Viewer
```

1. MediaIn / Loaderの後ろにCopy Auxを接続します。
2. **Mode = Aux to Color**にします。
3. **Aux Channel = Z**を選びます。奥行きの値がRGBAのR・G・Bへコピーされます。
4. Normalを確認したい場合は**Aux Channel = Normal**へ切り替えます。
5. 画面が一様な黒や白になる場合は、元のチャンネルの有無、出力ビット深度、下記のRemappingを確認します。

この方法では元のBeauty（通常のRGBA）がコピー先の色に置き換わります。元の画と比較したい場合は、Copy Auxの**手前でNodeを分岐**させておきます。

### Out Color Depth：数値を失わないための設定

補助チャンネルには、通常の8-bit画像に収まらない負数や小数が含まれます。Inspectorの**Out Color Depth**は、Aux to Colorでコピーする先のRGBAのデータ形式を決めます。

| 設定 | 動作 | 注意 |
| --- | --- | --- |
| **Match Aux Channel Depth** | 補助チャンネルに合わせて出力RGBAの精度を上げる | Z・Normal・UVなどはfloat32、Object ID・Material IDはint16として扱われる。元画像よりメモリを使う場合がある |
| **Match Source Color Depth** | 入力画像のRGBAと同じ形式を使う | 8-bit等では負数や1を超える値が切り捨てられ、Z・Normal等の意味が失われる場合がある |
| **Force Float32** | 出力RGBAを常にfloat32にする | Z・Normal・Vectorなどの数値を保って処理したいときの確実な選択肢 |

たとえば21.1マニュアルでは、Zに負の大きな値が含まれることが説明されています。これを8-bit RGBAへそのままコピーすると、多くの値が0に切り詰められます。**数値を再利用する処理では、見た目より先に出力の精度を確認**してください。

## 使い方2：表示用に値の範囲を固定する

Viewerが補助データをそのフレーム内の最小・最大値で自動表示すると、同じZ値でも別のフレームでは異なる明るさに見えることがあります。Copy Auxの**Enable Remapping**を使うと、指定した範囲を一定の表示範囲へ変換できます。

- **Enable Remapping**：選んだ補助チャンネルの数値をコピー前に線形変換する。
- **From > Min / Max**：変換前の数値範囲。
- **To > Min / Max**：変換後の数値範囲（既定は0～1）。
- **Detect Range**：現在の画像を調べ、Fromの最小・最大値を設定する。
- **Update Range**：現在の画像を調べ、既存のFrom範囲を必要に応じて広げる。
- **Invert**：変換後の範囲を反転する。

具体例として、**Normal**の各成分が`-1～1`なら、Fromを`-1, 1`、Toを`0, 1`に設定すると表示用のRGBへ収められます。**Z**は、扱う素材の数値範囲が`-1000～0`の場合、Fromを`-1000, 0`、Toを`0, 1`に設定する例があります。これらは**表示範囲の例**であり、すべてのレンダラーやショットに共通するZの値域ではありません。

設定した範囲は補助チャンネルごとに保持されます。フレーム間の比較には便利ですが、**Remapping後のRGBAをそのままAuxへ書き戻すと、元の数値範囲には戻りません**。後段の[Depth Blur](../deep/depth-blur-deep-pixel)や[Shader](../deep/shader-deep-pixel)などで利用する本来のZ・Normalを変更する予定がないなら、表示確認用の分岐だけでRemappingします。

## 使い方3：補助チャンネルを2D処理して戻す

```text
MediaIn / Loader（RGBA + Z）
  └─ Copy Aux A（Aux to Color / Z / Force Float32）
       └─ Blurなどの2D処理
            └─ Copy Aux B（Color to Aux / Z）
                 └─ 補助チャンネルを使う後段処理
```

補助チャンネルをいったんRGBAへ取り出すと、通常の2D Nodeで値を編集できます。その後、2個目のCopy Auxで指定のAuxへ書き戻します。

ただし、この経路で**元のBeautyが自動的に復元されるわけではありません**。Beautyと加工後のZの両方が必要な場合は、元画像を別の分岐で保持し、[Channel Booleans](./channel-boolean)などで必要なチャンネルを再統合します。また、Zを単純にぼかすと物体の境界で異なる奥行きが混ざり、Depth BlurやFogに不自然な縁が生じることがあります。目的が可視化だけなら、補助データを書き戻さない構成を優先します。

## Channel MissingとKill Aux Channels

**Channel Missing**は、選んだ補助チャンネルが入力画像に存在しない場合の動作です。

- **Fail**：処理を失敗させ、Consoleにエラーを出します。欠落を見逃したくない場合に適します。
- **Use Default Value**：Z以外は0、Zは`-1e30`を代入します。「有効な奥行きが取得できた」という意味にはなりません。

**Kill Aux Channels**を有効にすると、RGBAへコピーした後、出力からその他の補助チャンネルを取り除きます。補助データの読み込み・キャッシュ量を減らし、確認用の長いシーケンスを再生しやすくする目的には有効です。一方、その後でZやNormalを使う処理へ渡すと必要なデータが欠けるため、**補助チャンネルを残す経路では有効にしません**。

## よくある問題

| 症状 | 最初に確認すること |
| --- | --- |
| Copy Auxがエラーになる | Aux Channelの指定と、元Imageにその補助データが実際に存在するか。Channel MissingがFailになっていないか |
| Zが真っ黒、Normalの片側が欠ける | Match Source Color Depthによる負数の切り捨て。Match Aux Channel DepthまたはForce Float32を使う |
| フレームごとにZの明るさが変わる | Viewer側の自動正規化。Enable Remappingで固定のFrom / To範囲を使う |
| 後段のDepth BlurやTextureが動かない | ZやUVが入力に残っているか。Kill Aux Channelsで削除していないか |
| 加工後のZが意図しない範囲になる | 表示用Remappingを適用したままColor to Auxで書き戻していないか |
| 元のカラー画像を失った | Aux to ColorでRGBAが置き換わる。Copy Auxの前からBeautyを分岐して残す |

## 関連記事

- [補助Channel / AOV](../../learn/02-data/auxiliary-channels) — RGBAとは別に保存する情報と、Deep Imageとの違い
- [Renderer 3D](../3d/renderer-3d) — Fusionで補助チャンネルを出力する側の設定
- [Channel Booleans](./channel-boolean) — チャンネル成分の演算・別画像との統合
- [Depth Blur](../deep/depth-blur-deep-pixel) — Zを使った被写界深度
- [Texture](../deep/texture-deep-pixel) — UVを使ったレンダリング後のテクスチャ差し替え

## 出典と確認範囲

- **DaVinci Resolve 21.1 Reference Manual**, Chapter 93「Color Nodes」pp.2182–2185、「Copy Aux [CpA]」。入力、Mode、Aux Channelの成分対応、Out Color Depth、欠落時の動作、Kill Aux Channels、Remappingを確認。
- **Chapter 77「Understanding Image Channels」**。補助チャンネルの保存・伝搬・値の意味を参照。

本記事は**21.1公式マニュアルで説明されている挙動**を記載しています。Resolve 21.1の実機での全パラメータの既定値・範囲・Edition差は未検証です。
