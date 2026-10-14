---
title: uTextureTransform
description: USDモデルの形を動かさず、uTextureで読み込んだ模様の大きさ・角度・位置を調整するノード。接続例とUVの注意点を説明する。
doc_type: node
term_id: utexturetransform
term_short: uTextureTransformは、USDモデルの形を変えず、材質に使う画像の大きさ・角度・位置を調整するノード。
verification: partial
aliases: [uTextureTransform, uTXF]
concepts: [usd-scene, texture, uv]
nodes: [uTextureTransform]
node_family: usd
controls: [Scale, Rotation, Position]
inputs: [texture]
outputs: [texture]
tasks: [usd, texture, uv-transform]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uTextureTransform

uTextureTransformは、3Dモデルの表面に使う画像の**大きさ・向き・位置**を調整するノードです。たとえば壁の木目をもう少し細かく見せる、布の柄を斜めにする、ラベルの位置をずらすといった変更に使います。**壁や布そのものの大きさ・角度・位置は変更しません。**

画像を読む[uTexture](./utexture)と、画像を材質の色や粗さなどへ使う[uShader](./ushader)の**間**へ入れます。DaVinci Resolve 21.1のマニュアルが示す基本的な使い方も、この接続です。

## 役割：モデルではなく、模様の配置を変える

3Dモデルの表面には、画像の横・縦の位置に対応する**UV座標**が用意されることがあります。UV座標は「画像のどの部分を、モデルの表面のどこに対応させるか」を決める手がかりです。

uTextureTransformは、その対応関係を使って見える画像の配置を調整します。模様が変わって見えても、モデルを構成する面や頂点の位置は変わりません。

たとえば同じ壁を表示したまま、木目だけを横向きから縦向きに調整できます。壁自体を回転する必要はありません。反対に、モデルに適切なUVが用意されていない場合、uTextureTransformを動かすだけで狙いどおりの配置になるとは限りません。

## 入力・出力と最小構成

| 接続 | 受け渡すもの | このノードで行うこと |
| --- | --- | --- |
| **入力** | uTextureから来る、材質用の画像テクスチャ | 画像を表面へ当てはめるときの配置を調整する |
| **出力** | 配置を調整したテクスチャの情報 | uShaderへ渡し、色・粗さなどの材質プロパティに使う |

```text
uTexture（木目画像） → uTextureTransform → uShader
```

これは**2D Imageのピクセルを直接変形してViewerへ返す経路ではありません**。最終的に3Dモデルへ表示するには、材質をUSDシーンに割り当て、描画する必要があります。

```text
uTexture → uTextureTransform → uShader ───────────┐ 材質
                                               ▼
uLoader（USDモデル） ───────────────→ uReplaceMaterial
                                               │
                                               ▼
                                           uRenderer → 2D Image
```

uShaderへの接続では、テクスチャを基本色など**どの材質項目へ使うか**を選びます。uReplaceMaterialでは、シーン内の**どのオブジェクトにその材質を適用するか**を選びます。詳しい設定は[uShader](./ushader)と[uReplaceMaterial](./ureplacematerial)を参照してください。

## 主な設定項目

21.1 Reference ManualのuTextureTransform節で、次の3項目を確認できます。いずれも**画像の配置**に作用する設定であり、3Dモデル全体の座標を直接変更するものではありません。

| Inspectorの項目 | 変わるもの | 観察するポイント |
| --- | --- | --- |
| **Scale** | 模様の大きさ | 木目の線や格子の一つ一つが、表面に対して大きく／小さく見えるか |
| **Rotation** | 模様の角度 | 木目の流れる方向や柄の傾きが変わるか |
| **Position** | 模様の位置 | 同じ形の表面を保ったまま、絵柄の見える場所が移るか |

### Scale：柄の密度を調整する

大きな格子の模様を貼ったとき、マス目が大きすぎる場合はScaleを調整します。模様が大きく見える状態と小さく見える状態を行き来し、3Dモデルの寸法を変更せずに比較できます。

数値を増減したときの厳密な拡大方向、軸別の挙動、初期値・範囲は、マニュアルのこの節では説明されていません。特定の数値で何回繰り返されるかを前提にせず、**実際の模様を見ながら合わせる**のが安全です。

### Rotation：柄の向きを変える

木目の方向を家具の長辺にそろえる、布の斜め模様の角度を調整する、といった用途です。変更しているのはテクスチャの向きで、モデルの回転ではありません。

### Position：見せる部分をずらす

模様の中心や特徴的な部分が意図した場所から外れている場合に使います。たとえばラベル画像の中心を合わせたい場合、モデルを移動させる前にPositionで調整できるか確認します。

ただし、画像の配置可能な範囲はモデルのUVや画像の端の扱いにも左右されます。**Positionだけで、UVの欠落や歪みを修復できるわけではありません。**

## 制作例：木目を家具の面に合わせる

以下はマニュアルにある接続と設定を使った**制作手順の例**です。指定値や完成画像が公式に検証された例ではありません。

1. uLoaderで、UVを持つ家具のUSDモデルを読み込みます。
2. uTextureで木目画像を指定し、出力をuTextureTransformへ接続します。
3. uTextureTransformの出力をuShaderにつなぎ、木目を色に使う材質項目を選びます。
4. uShaderをuReplaceMaterialの材質入力へ、uLoaderをシーン入力へ接続します。家具のうち木製部分だけを変えたい場合は、uReplaceMaterialのPrim Selectionで対象を確認します。
5. uRendererで結果を表示します。まずScaleで木目の粗さを合わせ、Rotationで木目の方向をそろえ、最後にPositionで節や境目の位置を調整します。
6. 端で画像が途切れる場合は、次項のU/V Address Modeを確認します。立体に沿って木目が歪む場合はモデル側のUVも確認します。

**別の用途**として、床のタイルの模様の大きさを調整する、包装紙の柄を回す、画面に表示する画像の位置を微調整するといった使い方が考えられます。ただし、表面のどこに画像が現れるかは元のUVに依存します。

## uTextureのU/V Address Modeとの関係

画像の外側が参照されるときに、その領域をどう扱うかは[uTexture](./utexture)側の**U Address Mode / V Address Mode**が担当します。これらは横方向・縦方向それぞれで、画像の端を越えた部分の扱いを決める設定です。

uTextureTransformでScaleやPositionを変えた結果、画像の端が表面に現れたら、**配置の問題**なのか、**端の外側の扱い**なのかを分けて確認してください。Address Modeを調整しても、元の画像に継ぎ目があれば模様が自然につながるとは限りません。

21.1マニュアルのuTexture節ではAddress Modeの用途は説明されていますが、各選択肢の名称・初期値・描画差はこの箇所だけでは確定できません。

## uTransform・2D Transformとの違い

| ノード | 操作対象 | 使う場面 |
| --- | --- | --- |
| **uTextureTransform** | USD材質用のテクスチャの配置 | 木目やタイルの向き・大きさ・位置を変える |
| **[uTransform](./utransform)** | USDシーン内のオブジェクト | 家具そのものを移動・回転・拡大縮小する |
| **[Transform](../transform/transform)** | Fusionの2D画像 | 合成用の平面画像を移動・回転・拡大縮小する |

名前は似ていますが、**扱うデータが異なるため、同じ場所へ自由に差し替えられるノードではありません**。3Dモデルを動かす操作と、モデルに貼った模様を動かす操作を区別します。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| **操作してもモデルの見た目が変わらない** | uTexture → uTextureTransform → uShaderの順になっているか。uShaderの目的の材質項目へ接続しているか |
| **別のパーツまで同じ柄になる** | uReplaceMaterialのPrim Selectionで、変更したい部分だけを指定できているか |
| **模様が引き伸ばされる** | uTextureTransformのScaleと、元のモデルに付いたUVの形・比率を切り分ける |
| **端で模様が切れる・意図せず繰り返す** | uTextureのU/V Address Modeと元画像の端の模様を確認する |
| **画像が表示されない** | uTextureの読み込み、uShaderとの接続、uReplaceMaterialによる割り当て、uRendererまでのUSDシーン経路を順に確認する |
| **モデル全体が動いた** | uTransformなど、オブジェクト側の変形設定を操作していないか確認する |

## 関連する考え方・ノード

- [USDシーンの基礎](../../learn/02-data/usd)：オブジェクトと材質を分けて扱う理由。
- [USDノード一覧](./index)：読み込み・材質・描画までの全体像。
- [uTexture](./utexture)：画像の読み込みとU/V Address Mode。
- [uShader](./ushader)：画像をどの材質項目に使うかを決める。
- [uReplaceMaterial](./ureplacematerial)：材質を適用するオブジェクトを選ぶ。
- [uTransform](./utransform)：USDモデルそのものの変形。
- [uRenderer](./u-renderer)：USDシーンを2D画像として描画する。

## バージョン・出典と検証範囲

**DaVinci Resolve 21.1 Reference Manual（2026年9月版）、Chapter 121「USD Nodes」、p.2945**で、`uTextureTransform [uTXF]`の名称、`uTexture → uTextureTransform → uShader`という配置、Scale / Rotation / Positionの3設定を確認しました。**p.2944**はuTextureのU/V Address Modeの説明です。

Inspectorの厳密な初期値・可動範囲、軸ごとの処理順序、UVが不完全なモデルでの実描画、Free / Studioの違いはこの資料だけでは確定していません。実機での端子名・端子数・描画結果も未確認のため、`verification: partial`を維持します。
