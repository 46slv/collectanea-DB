---
title: Fog (Deep Pixel)
description: Zチャンネル付きの2D画像へ、奥行きに応じて霧を加えるFusion Node。Near/Far、画像入力、Fog 3Dとの使い分けを解説。
doc_type: node
term_id: fog-deep-pixel
term_short: Zチャンネルの距離を使い、近景を残して遠景を霞ませる2D後処理Node。
verification: partial
aliases: [Fog, Fog (Deep Pixel)]
concepts: [auxiliary-channels, image-data, depth]
nodes: [Fog]
node_family: deep
controls: [Z-Buffer Near Plane, Z-Buffer Far Plane, Z Depth Scale, Fog Color, Fog Opacity]
inputs: [image, image, mask]
outputs: [image]
tasks: [aov, fog, depth-atmosphere]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Fog (Deep Pixel)

Fogは、**カメラからの距離に応じて、画像へ霧を重ねる**Nodeです。近くの物体は元の色を保ち、遠くの物体ほど指定した霧の色へ近づけられます。3Dの建物を描画した後に遠景だけを霞ませたり、奥行きを強調したりするときに使います。

処理対象は<Term id="image">2D画像</Term>です。画像に保存された<Term id="auxiliary-channels">Zチャンネル（奥行き情報）</Term>を使って画素ごとの霧の量を決めます。色（RGBA）だけから距離を推定するわけではありません。また、1画素へ複数の距離サンプルを保存する<Term id="deep-image">Deep Image</Term>とも別の仕組みです。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input**（オレンジ、必須） | Zを含む2D画像 | 元のRGBAと各画素の距離を受け取る |
| **Blur Image**（緑、任意） | 2D画像 | 霧の模様や色に変化を付ける。未接続なら単色の霧 |
| **Effect Mask**（青、任意） | マスク | 霧を適用する画面内の領域を制限する |
| **出力** | 2D画像 | 距離に応じて霧を加えた画像 |

21.1 Reference ManualのFogの**Inputs節**は、緑の端子を**Blur Image**と記載しています。ただし、この端子の役割は画像の「ぼかし」ではなく、**霧の素材画像を渡すこと**です。従来の記事での「Fog Image」と呼び方が異なるため、ここではManualの表記を採用しています。21.1実機の端子表示名は未確認です。

Effect Maskは霧の素材を渡す端子ではなく、霧の計算結果を画面のどこへ適用するかを制限します。

## 例1：3Dの遠景だけを霞ませる

~~~text
Shape 3D ──┐
Camera 3D ─┼→ Merge 3D → Renderer 3D（RGBA + Z）→ Fog → MediaOut
Light ─────┘
~~~

1. 物体、Camera 3D、Lightを[Merge 3D](../3d/merge-3d.md)へ接続します。[Renderer 3D](../3d/renderer-3d.md)の**Output Channels**でZ（Z-Depth）を有効にします。RGBAしか出力していない場合、Fogは画素の距離を読み取れません。
2. Renderer 3Dの出力をFogのオレンジの**Input**へ接続します。ZはRGBAと同じ画像内の補助チャンネルなので、通常はZ専用の接続が不要です。
3. **Z-Buffer Near Plane**を霧をほとんどかけたくない近景へ、**Far Plane**を霧で見えなくしたい遠景へ合わせます。それぞれの**Pick**ボタンをViewer上の対象位置へドラッグすると、対応するZ値を選べます。
4. **Fog Color**で霧の色を選び、**Fog Opacity**で全体の強さを調整します。Near/Farは霧が増える距離の範囲、Opacityは霧全体の不透明度です。
5. 近景の輪郭が保たれ、遠景が霞んでいるかを確認します。距離変化を誇張・圧縮したい場合は**Z Depth Scale**を変更し、Near/Farも再確認します。

例えば、手前にある建物の壁でNearをPickし、奥にあるビルの壁でFarをPickします。手前の建物を比較的はっきり残しながら、遠くのビルを霧で見えにくくする調整を始められます。**Near/Farの数値は素材のZ値によって異なる**ため、固定の数値をすべてのシーンへ適用するものではありません。

Zが別画像に保存されている場合、[Channel Booleans](../color/channel-boolean.md)などでRGBA画像の**補助チャンネルZ**へ組み込んでからFogへ渡します。単なる白黒の画像を見せるだけでは、FogがZとして参照できるとは限りません。

## 例2：ノイズ画像で霧の模様を変える

均一な霧では単調に見える場合、Fast Noiseなどの2D画像を緑の入力へ接続します。

~~~text
Renderer 3D（RGBA + Z）─→ Input
Fast Noise ─────────────→ Blur Image（緑） → Fog → 出力
Bitmap Mask（任意）─────→ Effect Mask（青）
~~~

Fast Noiseは**霧の見た目に不均一な変化を与える素材**であり、カメラからの距離を決めるZを生成するわけではありません。奥行きに応じた変化はInput側のZとNear/Farで決まります。模様を調整した後にFog ColorとFog Opacityで全体の色と濃さを整えます。

特定の画面範囲だけに霧を適用したい場合は、Bitmap Maskなどを**Effect Mask**へ接続します。模様を作る緑の入力と、適用範囲を決める青の入力は用途が異なります。

## Inspectorの主要設定

| 設定 | 何が変わるか | 調整の目安 |
| --- | --- | --- |
| **Z-Buffer Near Plane** | 霧が消える距離 | 明瞭に残したい近景をPickする |
| **Z-Buffer Far Plane** | 霧が不透明になる距離 | 霞ませたい遠景をPickする |
| **Z Depth Scale** | 入力Z値の拡大・縮小 | 距離変化を強める／弱めるときに調整し、Near/Farも確認 |
| **Fog Color** | 霧の基本色と、その色のAlpha | 色合いと透明度を決める |
| **Fog Opacity** | 霧の全チャンネルの不透明度 | 距離範囲を保ったまま霧全体を調整する |

Z Depth Scaleを上げるとZ値の距離差は拡大し、下げると圧縮されます。**常に霧が濃くなる設定ではなく**、Near/Farとの組み合わせで結果が変わります。

ManualはFog Colorの**Alpha**を霧の透明度、Fog Opacityを**全チャンネルの不透明度**として別々に説明しています。まずNear/Farで対象距離を決め、その後に色とOpacityを調整すると、意図した変化を追いやすくなります。

## Fog 3Dとの使い分け

| | Fog (Deep Pixel) | [Fog 3D](../3d/fog-3d.md) |
| --- | --- | --- |
| **処理対象** | レンダリング済みのRGBA + Z付き2D画像 | Classic 3Dシーン |
| **接続位置** | Renderer 3Dの後 | Merge 3Dの後、Renderer 3Dの前 |
| **必要なデータ** | 有効なZチャンネル | 3DシーンとCamera |
| **向いている作業** | 描画後に遠景の霧を調整 | 3D描画段階で霧を適用 |

Fog 3Dは3Dシーンの段階で働くため、公式Manualではアンチエイリアス、被写界深度、透明物体との組み合わせに対応すると説明されています。Fog (Deep Pixel)は描画済み画像のZによる後処理です。半透明物体の重なりや輪郭が不自然に見えたら、Fog 3Dで処理する方法も比較してください。

## 思ったように動かない場合

- **距離に応じて霧が出ない**：Renderer 3DでZが有効かを確認します。[Copy Aux](../color/copy-aux.md)で補助チャンネルの値を表示できます。RGBの白黒画像はZチャンネルと同じではありません。
- **近景まで一様に霞む**：Near/Farを近景・遠景でPickし直し、Z Depth ScaleとFog Opacityを確認します。
- **ノイズが反映されない**：Fast Noiseが緑のBlur Image入力に接続されているか、Fog ColorとOpacityが効果を見せる状態かを確認します。
- **マスクを使うと霧が消える**：青のEffect Maskとマスクの白黒を確認します。効果が適用されるのはマスクの範囲です。
- **輪郭に帯やにじみが生じる**：Renderer 3DのZ補助チャンネルのアンチエイリアス設定を比較します。Zの境界を色と同じように補間しても、必ず自然な結果になるわけではありません。[補助チャンネルの注意点](../../learn/02-data/auxiliary-channels.md)を参照してください。

## 関連Node・概念

- [Renderer 3D](../3d/renderer-3d.md) — RGBAとZを含む2D画像を作る。
- [補助Channel / AOV](../../learn/02-data/auxiliary-channels.md) — Zなどの補助データの意味。
- [Depth Blur](./depth-blur-deep-pixel.md) — Zを霧ではなく奥行きによるぼかしに使う。
- [Fog 3D](../3d/fog-3d.md) — 3Dシーンの段階で霧を適用する。
- [Channel Booleans](../color/channel-boolean.md) — Zを別画像から組み込む。
- [Copy Aux](../color/copy-aux.md) — Zの存在や値を確認する。

## 出典・確認範囲

- **Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』**、Chapter 96「Fog [Fog]」、本文**pp.2261–2263**。3入力、Renderer 3DのZ-Depth、Near/Far Pick、Z Depth Scale、Fog Color / Opacityを確認。
- 同Manual Chapter 88「Fog 3D [3Fo]」（pp.1950–1952）および「Fog 3D and Soft Clipping」（p.1865）。3D処理と2D後処理の違い。
- [Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)（21.1 Reference Manual）。

21.1マニュアルに基づく説明です。21.1実機での端子ラベル、Z境界、透明素材、Renderer種別やEdition差の動作は未検証のため、`verification: partial`を維持します。
