---
title: Shader (Deep Pixel)
description: Normalチャンネルから面の向きを読み取り、レンダリング後の明るさ・ハイライト・映り込みを調整するShaderノード。
doc_type: node
term_id: shader-deep-pixel
term_short: 2D画像に保存されたNormal（面の向き）を使い、レンダリング後の照明や反射を調整するNode。
verification: partial
aliases: [Shader, Shd, Shader (Deep Pixel)]
concepts: [auxiliary-channels, image-data, normals, relighting]
nodes: [Shader]
node_family: deep
controls: [Ambient, Diffuse, Specular, Reflection, Reflection Type, Equator Angle, Polar Height, Diffuse Curve, Specular Curve, Specular Color]
inputs: [image, image, mask]
outputs: [image]
tasks: [aov, relight, reflection, shading]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# Shader (Deep Pixel)

Shaderは、3Dシーンを2D画像へ描画した後に、表面の明るさ・ハイライト・映り込みを調整するNodeです。通常の色補正と違い、<Term id="image">Image</Term>に格納された**Normal（法線）チャンネル**から、画素ごとに表面が向いている方向を読み取ります。

例えば球の正面と側面では表面の向きが違います。NormalのX・Y・Z成分を使うことで、その違いに応じて明暗や反射の見え方を変えられます。**Normalを持たない実写素材やRGBA画像では効果がありません**。

名称はDeep Pixelですが、Shaderの入力は**補助チャンネル付きの2D画像**です。画素内に複数の奥行きサンプルを保存するDeep Imageとは別物です。詳しくは[補助Channel / AOV](../../learn/02-data/auxiliary-channels.md)を参照してください。

## 入力と出力

### Input

**Normal X・Y・Z**チャンネルを含む2D画像です。Normalは別端子へ配線するのではなく、この画像の補助情報として読み取ります。RGBAの色だけでは面の向きは分かりません。

### Reflection Map Image

映り込みに使う環境画像を接続する**緑色の任意入力**です。Normalを入力する端子ではありません。マニュアルは、**32-bit floatの正距円筒図法（equirectangular）画像**を適した形式として挙げています。

### Effect Mask

効果を2D画像の一部へ限定する**青色の任意入力**です。マニュアルによれば、マスクは処理後の結果に適用されます。

入力画像にObject ID / Material IDが保存されていれば、共通設定で処理対象の物体・材質を絞ることもできます。ID情報がなければ、その方法で対象を分けることはできません。

### 出力

Normalに基づいて明暗や反射を調整した**2D画像**を出力します。3DオブジェクトやMaterialを出力するNodeではなく、通常の2D Mergeや色補正Nodeへ接続できます。

## Lightの主要設定

Inspectorの**Controls > Light**で、面の見え方を構成する要素を調整します。同じ「明るさ」でも、どの部分へ変化を与えるかが異なります。

| 設定 | 変化する部分 | 使い方の例 |
| --- | --- | --- |
| **Ambient** | 影になっている部分にも加わる基礎的な明るさ・色 | 暗部が沈みすぎる場合に調整する |
| **Diffuse** | 光が面で拡散し、広い方向から見える基本色の成分 | 面の向きに応じた明暗を整える |
| **Specular** | 光沢のある面で光が反射して見えるハイライトの成分 | 金属などの光沢を強く・弱く見せる |
| **Reflection** | 緑入力の環境画像を映り込ませる寄与量 | 周囲の景色の映り込みを強める |

例えば球を調整するとき、暗い側が沈みすぎるなら**Ambient**を、表面全体の明暗を変えるなら**Diffuse**を、光源の反射による明るい点を調整するなら**Specular**を確認します。**Reflection**は映り込み用画像の寄与を変える設定で、緑入力に画像がなければ効果がありません。

これらは元の3Dシーンへ光源を追加する操作ではありません。入力画像に残ったNormalを使って、**描画後の画素の見え方**を調整します。

## Reflection Type

緑入力の画像をどのように面へ投影するかを選びます。

- **Screen**：視点の後ろにスクリーンがあるように環境画像を配置する
- **Spherical**：シーン全体を取り囲む巨大な球へ投影するように扱う
- **Refraction**：面の形状に応じて屈折・歪みが生じるように扱う

**Equator Angle**は左右方向、**Polar Height**は上下方向の向きを調整します。Reflectionの強さだけを変えても反射位置が合わない場合に確認します。

## Shaderタブ

**Shader**タブでは、Diffuse（拡散反射）とSpecular（光沢反射）の明暗がどのように変わるかをカーブで調整します。Lightタブが各成分の量を扱うのに対し、こちらでは**明るい部分から暗い部分へ移る変化の仕方**を調整できます。

**Diffuse / Specular**のチェックボックスを有効にすると、対応するカーブをShaderのSpline画面で編集できます。**In / Out**は選択中のカーブの点の値を表示・編集する欄です。複数の点を囲んで選び、右クリックメニューからカーブを調整する操作もマニュアルに記載されています。**Specular Color**はハイライトに付ける色です。

例えば金属表面のハイライトが広く見えすぎる場合は、まずLightタブのSpecularで寄与量を比べ、次にShaderタブのSpecularカーブで変化を調整します。量と変化の仕方を分けて確認すると、何が映像を変えたか追いやすくなります。

## 例1：Renderer 3Dの出力へ反射を追加する

~~~text
3Dオブジェクト ──┐
Camera 3D ──────┼→ Merge 3D → Renderer 3D（RGBA + Normal） → Shader → 出力
Light ──────────┘                                          ↑ Reflection Map Image
環境画像（LatLong形式など）──────────────────────────────────┘
~~~

1. [Renderer 3D](../3d/renderer-3d.md)の**Output Channels**でNormalを有効にしてから、Shaderの**オレンジ入力**へ接続します。3DシーンをShaderへ直接接続する構成ではありません。
2. **Ambient**で影の部分にも加わる明るさ、**Diffuse**で拡散反射、**Specular**で光沢のあるハイライトを個別に調整します。どの成分が変化しているか、一項目ずつ比較します。
3. 環境の映り込みが必要ならHDR画像などを緑入力へ接続し、**Reflection**の寄与を調整します。Reflection Mapをつながなければ、Reflectionの値を変えても効果はありません。
4. 反射の位置や歪み方が意図に合わない場合は、**Reflection Type / Equator Angle / Polar Height**を変更して比較します。
5. 特定の物体だけを調整したい場合は、Effect MaskまたはObjectID / MaterialIDによる制限を使います。

Shaderは3Dレンダリングをやり直すNodeではありません。**レンダリング後に残された表面方向の情報を利用する後処理**なので、画像の裏側や隠れた面の情報を新しく生成するわけではありません。

## 例2：読み込んだEXRのNormalパスを使う

外部の3Dソフトで作ったEXRでも、Normalの各成分が保存されていればShaderの入力にできます。ただし、**RGBにNormalらしい色が見えていることと、FusionのNormal補助チャンネルに正しく割り当てられていることは異なります**。

1. **MediaIn**または**Loader**で、カラー画像とNormalパスを含む素材を読み込みます。
2. **Channels**または**Format**タブで、法線X・Y・Z成分をそれぞれ**X Normal / Y Normal / Z Normal**チャンネルへ割り当てます。
3. 読み込みノードの出力をShaderのオレンジ入力へ接続します。必要に応じて反射用EXRを緑入力へつなぎます。
4. ShaderのAmbient・Diffuse・Specularを変え、法線に応じた変化が出るか確認します。

この接続は21.1マニュアルのChapter 77「Understanding Image Channels」に記載された手順です。NormalパスがRGBにしか存在しない場合、[Channel Booleans](../color/channel-boolean.md)などで補助チャンネルへ割り当てます。元のRGBAとNormalデータを入れ替えないよう注意してください。

## 3D Materialとの違い

OpenPBRやPhongなどの3D Materialは、3Dオブジェクトをレンダリングする**前**に表面の見え方を定義します。一方、Shader (Deep Pixel)はレンダリングが終わった**後**の2D画像とNormalを使って調整します。

合成段階で光沢や映り込みを微調整するならShaderが候補ですが、隠れた面、影の形、3Dシーン内の光の伝わり方まで再計算するものではありません。必要な情報がレンダリング結果に残っていない場合は、3D側を変更して描画し直します。

## よくある問題

- **Shaderの値を変えても変化しない**：オレンジ入力画像にNormal X・Y・Zがあるかを確認します。外部EXRならMediaIn / Loaderの割り当ても確認します。
- **Reflectionが効かない**：緑のReflection Map Image入力に画像を接続しているか確認します。
- **面の境界で陰影が不自然**：[Renderer 3D](../3d/renderer-3d.md)のNormal補助チャンネル用アンチエイリアス設定を確認します。21.1マニュアルはNormal値を境界で平均しないことを強く推奨しています。
- **別の物体にも効果が出る**：Effect MaskやObjectID / MaterialIDの指定に対応するデータが入力画像にあるか確認します。

## 関連Node・概念

- [補助Channel / AOV](../../learn/02-data/auxiliary-channels.md) — NormalやIDなどの意味
- [Renderer 3D](../3d/renderer-3d.md) — Normal付きの2D画像を作る
- [Channel Booleans](../color/channel-boolean.md) — 外部画像のRGBと補助チャンネルを組み合わせる
- [Ambient Occlusion](./ambient-occlusion-deep-pixel.md) — ZとNormalなどを使って接触部の陰影を近似する
- [Texture (Deep Pixel)](./texture-deep-pixel.md) — UV座標を使って面の模様を変更する

## 実機例：Normalを使って陰影を変える

<!-- capture-case:S118 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%、フレーム0で撮影しました。左がRenderer 3Dのカラー出力、右が処理後です。

[![Software RendererからShaderへ画像を渡し、Normal確認用Copy Auxを分岐した実機Graph](/img/fusion/captures/S118/graph.png)](/img/fusion/captures/S118/graph.png)

原点の球、Z＝7のカメラ、点光源から作ったシーンです。Software RendererのRGBAとNormalを有効にしました。

[![Software RendererのRGBAとNormalを有効にした実機Inspector](/img/fusion/captures/S118/renderer-inspector.png)](/img/fusion/captures/S118/renderer-inspector.png)

ShaderのAmbient＝0.1、Diffuse＝0.5、Specular＝0、Reflection＝0、Polar Height＝30に固定し、Equator Angle＝45で表示しました。反射マップは接続していません。

[![ShaderのAmbient0.1、Diffuse0.5、Specular0、Reflection0、Equator45、Polar30の実機Inspector](/img/fusion/captures/S118/baseline-inspector.png)](/img/fusion/captures/S118/baseline-inspector.png)

[![Equator Angle45で元のカラーとは異なる陰影が表示されるShaderの実機比較](/img/fusion/captures/S118/baseline.png)](/img/fusion/captures/S118/baseline.png)

Equator Angleだけを−45へ変えると、右の球は暗くなり、陰影の分布が変わりました。元の3D光源とカメラは変えていません。レンダリング後の2D画像に対する処理の比較です。最後は−45で保存しました。

[![Equator Angleだけをマイナス45にしたShaderの実機Inspector](/img/fusion/captures/S118/inspector.png)](/img/fusion/captures/S118/inspector.png)

[![Equator Angleの変更で右の球の明るさと陰影が変わるShaderの実機出力](/img/fusion/captures/S118/compare.png)](/img/fusion/captures/S118/compare.png)

確認用Copy AuxでNormalを選び、From＝−1〜1をTo＝0〜1へ再マッピングしました。右の球はRGBの連続した色で表示されます。Channel Missing＝Failで出力できており、Normalを含む入力であることを確認しました。これは方向データを表示用の色へ変換したもので、元の材質色ではありません。

[![Copy AuxでNormalと欠落時Failを選び、マイナス1から1を0から1へ変換した実機Inspector](/img/fusion/captures/S118/normal-inspector.png)](/img/fusion/captures/S118/normal-inspector.png)

[![カラー画像と、RGBへ可視化した球体のNormalを並べた実機診断](/img/fusion/captures/S118/normal.png)](/img/fusion/captures/S118/normal.png)

この例ではShader曲線を編集していません。反射マップ・Reflection Type、Specularや曲線編集、Mask／IDでの限定、外部Normal、EXR保存、物理的な照明再現、Edition差と性能は未確認です。通常の2D画像と補助Normalを使っており、Deep Imageは使っていません。

[再現用Graph](/img/fusion/captures/S118/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S118/capture.json)

## 出典と確認範囲

一次資料：**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**。

- Chapter 96「Shader [Shd]」、pp.2263–2266：Normal要件、入出力、反射の投影方式、Light / Shaderの各設定。
- Chapter 77「Understanding Image Channels」、p.1694：MediaIn / LoaderでNormal X・Y・Zを割り当てる具体的な手順。
- Chapter 88「Renderer3D」、pp.1974–1975：Normal出力と補助チャンネルのアンチエイリアス。

S118でSoftware Rendererの補助Normalと、Shaderの角度による表示変化を実機確認しました。外部EXR、ほかのControl、GPUやEdition差は未確認のため、**verification: partial**を維持します。
