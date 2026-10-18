---
title: uShader
description: USDの材質を作るノード。Variable Inputs、反射・透明度の設定、uReplaceMaterialへの適用例を解説する。
doc_type: node
term_id: ushader
term_short: uShaderは、色・反射・透明度と画像テクスチャを組み合わせ、USDオブジェクトへ適用する材質を作るノード。
verification: partial
aliases: [uShader, uSd]
concepts: [usd-scene, material, texture]
nodes: [uShader]
node_family: usd
controls: [Shader Model, Diffuse Mode, Emissive, Workflow Mode, Metallic, Specular Color, Roughness, Clearcoat, Clearcoat Roughness, Opacity, Channel, Scale, Bias]
inputs: [texture]
outputs: [usd-material]
tasks: [usd, material, shader, lookdev]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-18"
---

# uShader

uShaderは、**3Dオブジェクトの表面をどんな色・反射・透明度で描くか**を設定する「マテリアル（材質）」を作るノードです。画像を貼るだけでなく、金属らしさや塗装の光沢も調整できます。

材質は立体そのものではありません。形・位置を持つ<Term id="usd-scene">USD scene</Term>と、材質を作るデータは別です。uShaderの出力をそのまま通常の画像用Mergeへつないでも完成画像にはなりません。**適用先を選ぶのは[uReplaceMaterial](./ureplacematerial)、画像に描画するのは[uRenderer](./u-renderer)**です。

## 入力・出力と接続例

| 接続 | データ | 役割 |
| --- | --- | --- |
| Variable Inputs（可変入力） | uTextureなどのテクスチャ | 材質のどのプロパティを画像で制御するか、接続時に選ぶ |
| 出力 | USD用マテリアル | uReplaceMaterialのMaterial Inputへ渡す |

~~~text
uTexture ──────→ uShader ─────────────┐
                         （材質）     │ Material Input
                                     ▼
uLoader ──────────────────────→ uReplaceMaterial
  （USD scene）                      │
                                    ▼
uCamera / uDistantLight ───────→ uMerge → uRenderer → 2D Image
~~~

uShaderは**USDシーン自体を入力してモデルを塗り替えるノードではありません**。uLoaderが供給するシーンとuShaderが供給する材質を、uReplaceMaterialで合わせます。uReplaceMaterialの**Prim Selection**は、シーン内のどのオブジェクトを変更するかを選ぶ設定です。「Prim」はUSDシーンの階層を構成するオブジェクトなどの単位で、[USD sceneの基礎](../../learn/02-data/usd)でも説明しています。

## Variable Inputs：画像で材質の数値を変える

Roughnessなどは通常Inspectorの数値で指定しますが、uShaderは**テクスチャを接続する時点で割り当て先のプロパティを選べる**仕組みです。

1. [uTexture](./utexture)を作り、使いたい画像を読み込みます。
2. uTextureの出力をuShaderへ接続します。
3. 表示された選択メニューから、画像で制御するプロパティを選びます。
4. 対応するInspectorのスライダーが無効になり、**Channel / Scale / Bias**などのテクスチャ用設定に切り替わります。

**Channel**は画像から使うチャンネルを選ぶ項目、**Scale**は値の効き具合、**Bias**は基準値を調整する項目です。明暗で粗さを変える場合、まず意図したChannelを使っているかを確認します。具体的なチャンネル候補やScale / Biasの厳密な計算順序は21.1 Manualのこの節に載っていないため、実機で確認してください。

**数値を変えても効かないときは、同じプロパティへuTextureが接続されていないか**を先に確認します。可変入力は単なる「画像を貼る端子」ではなく、材質の個々の性質を外部から制御する入口です。

### テクスチャの位置や法線を調整する

- [uTextureTransform](./utexturetransform)：uTextureとuShaderの間に置き、画像の**Scale / Rotation / Position**を変えます。立体そのものの座標を変える[uTransform](./utransform)とは異なります。
- [uNormalMap](./unormalmap)：凹凸の見え方に使う**法線マップ**を調整します。法線マップは、細かな凹凸に見える光の当たり方を表すデータで、実際に形状を細分化する画像ではありません。21.1 Manualは法線画像をuTextureで読む際、**Source Color SpaceをLinear**にすることを推奨しています。

~~~text
uTexture（色など）→ uTextureTransform ──┐
                                        ├→ uShader
uTexture（法線）──→ uNormalMap ─────────┘
~~~

画像ごとに別のuTextureを用意し、接続時に目的のプロパティを選びます。法線と基本色の画像を1本の線に直列につなぐわけではありません。

## Shader Model：USDとMaterialXの違い

Inspectorの**Shader Model**では、**USD**または**MaterialX**のツールセットを選びます。これはuShaderの材質の組み立て方を切り替える設定で、外部の`.mtlx`ファイルを読み込む操作ではありません。

**MaterialX**は、制作ソフト間で材質と見た目の設定を交換するためのオープンな規格です。21.1 ManualはuShaderのMaterialXモードを紹介していますが、MaterialXで定義できるすべての材質表現がFusionで同じ結果になると保証しているわけではありません。

| やりたいこと | 材質を用意する場所 | 次に渡すもの |
| --- | --- | --- |
| Fusionで車体の塗装色やRoughnessを調整する | **uShader / Shader Model = USD**。必要ならuTextureを個別の材質プロパティに接続する | uShaderの材質出力を[uReplaceMaterial](./ureplacematerial)のMaterial Inputへ |
| Fusion内でMaterialX系の材質設定を使う | **uShader / Shader Model = MaterialX**。USDモードとは異なるInspectorを使う | uShaderの材質出力をuReplaceMaterialへ |
| 別の制作ソフトから受け取った`.mtlx`を使う | **uReplaceMaterial / Type = MaterialX**で直接ファイルを指定するか、**[uMaterialX](./umaterialx) / Material File**で読み込む | 直接指定なら追加ノードは不要。uMaterialXを使う場合は材質出力をuReplaceMaterialのMaterial Inputへ渡す |

### 外部`.mtlx`を使う2つの経路

21.1のuReplaceMaterialでは、**Type = MaterialX**にすると、`.mtlx`ファイルをそのノードから直接選ぶ方法と、**Material Input（緑の入力）へ接続した材質から選ぶ方法**が使えます。**外部MaterialXを使うためにuMaterialXが必須というわけではありません**（21.1 Reference Manual p.2916）。

~~~text
直接指定:
uLoader（USD scene）→ uReplaceMaterial（Type = MaterialX、.mtlxを指定）→ uRenderer

ノード経由:
uMaterialX（.mtlx） ─────────────┐ Material Input
                               ▼
uLoader（USD scene） → uReplaceMaterial → uRenderer
                        Scene Input
~~~

どちらも**Prim Selectionで適用対象を選ぶ**操作は別途必要です。外部ファイルを一つのオブジェクトへ使うだけなら直接指定で済みます。材質の読み込みを独立させたい場合はuMaterialXを使います。また、**uShaderのShader Model = MaterialXは、外部ファイルを読み込む設定ではありません**。uReplaceMaterialでType = MaterialXを選ぶと、ほかの材質設定欄は隠れます。設定を見失った場合は、まずTypeを確認してください。

例えば、同じ車のUSDモデルを使って**Fusion内で塗装案を作る**なら、uShaderのUSDモードで色とRoughnessを設定し、uReplaceMaterialのPrim Selectionでボディだけを指定します。外部で仕上げた**`.mtlx`材質を受け取って比較する**なら、uReplaceMaterialからファイルを直接指定するか、uMaterialXから材質を渡して適用先のPrimを選びます。両者を同じカメラ・照明で描画すると、材質の差を比較できます。

**混同しやすい3つの設定**は、uShaderの**Shader Model**（材質の作成方式）、uMaterialXの**Material File**（外部ファイルの読み込み）、uReplaceMaterialの**Type**（材質の指定方式。MaterialXなら直接ファイル指定／入力から選択）です。同じ「MaterialX」という文字が表示されても、作用する段階が違います。

21.1 Manualでは、USDモードのDiffuse、Workflow Mode、Roughnessなどの項目が列挙されています。一方、MaterialXモードについては概要とInspectorの例示が中心です。**MaterialXモードで使える全パラメータ、既定値、入力候補、外部`.mtlx`との完全な互換性は、この資料だけでは確定しません。** 他ソフトとの見た目の一致が必要なら、実際のシーンとレンダー結果で確認してください。

## USDモードの主な設定

| Inspectorの項目 | 意味 |
| --- | --- |
| **Diffuse Mode / Color** | 表面の基本色を設定する |
| **Emissive** | 自ら光っているような色の寄与を加える。周辺まで照らすライトと同じ機能とは限らない |
| **Workflow Mode — Metallic** | **Metallic**スライダーで金属らしさを調整する |
| **Workflow Mode — Specular** | **Specular Color**で反射する光の色を調整する |
| **Roughness** | 表面の反射が広がる度合いを調整する |
| **Clearcoat** | 塗装面などを想定した追加の光沢層の寄与を加える |
| **Clearcoat Roughness** | 追加の光沢層の粗さを調整する。基本のRoughnessとは別 |
| **Opacity** | 表面の不透明度を変え、描画色とAlphaに影響する |

**MetallicとSpecular Colorは常に同時に表示される設定ではありません。** Workflow Modeの選択によって項目が変わります。また、Roughnessは反射の見え方、uShapeなどのSubdivisionは面の細かさを変えるため、役割が異なります。

## 制作例1：車のボディだけを別の塗装にする

1. uLoaderで車のUSDを読み込み、uReplaceMaterialの**Scene Input**につなぎます。
2. uShaderをUSDモードにしてDiffuseの色、Workflow Mode、Roughnessを調整します。
3. uShaderの出力をuReplaceMaterialの**Material Input**につなぎます。
4. uReplaceMaterialで**Prim Selection**を開き、車体のPrimを選びます。**Invert Prim Selection**が意図した状態か確認します。
5. uCamera・ライトを[uMerge](./u-merge)でシーンに加え、uRendererで確認します。

車体だけ変わりタイヤやガラスが変わらなければ、選択対象を正しく絞れています。別の部品まで変わる場合は、まずuShaderの色ではなくPrim Selectionを見直します。

## 制作例2：画面部分へ動画テクスチャを使う

1. MediaInなどで時間とともに変化する**2D Image**を用意し、uTextureの**Image Input**へ接続します。
2. uTextureをuShaderへ接続し、色に関係する適切な材質プロパティをメニューから選びます。
3. uShaderをuReplaceMaterialへ渡し、Prim Selectionでモデルの画面部分を対象にします。
4. uRendererで複数フレームを見て、表面の画像が切り替わるか確認します。

uTextureの**File Name**から静止画像を指定する方法とは違い、**Image Input**ではノードから流れる画像を利用できます。21.1 ManualによるとImage Inputを接続するとファイル指定より優先され、アニメーションした画像も使えます。映像の向きや大きさが合わない場合はuTextureTransformのScale / Rotation / Positionも確認します。

## 想定どおりにならない場合

| 症状 | 確認すること |
| --- | --- |
| uShader単体では絵が出ない | これは材質データです。uReplaceMaterialへ渡してUSDシーンに適用し、uRendererで描画します。 |
| 色が変わらない | uReplaceMaterialの**Scene Input**と**Material Input**に、それぞれシーンと材質が入っているか確認します。 |
| 全体や別の部品まで変わる | uReplaceMaterialの**Prim Selection / Invert Prim Selection**を確認します。 |
| Inspectorのスライダーが無効 | その項目へuTextureなどの可変入力が接続されていないかを確認します。 |
| 画像の色・強さが不自然 | uShaderの**Channel / Scale / Bias**とuTextureの**Source Color Space**を分けて点検します。 |
| 画像の貼られ方がおかしい | uTextureTransformのScale / Rotation / Position、モデルのUVを確認します。 |
| 法線マップの凹凸が不自然 | uNormalMap経由か、uTextureがLinearとして読んでいるかを確認します。 |
| 動画が静止している | uTextureのFile Nameだけでなく、時間変化する画像をImage Inputへ流しているか確認します。 |
| Roughnessを変えても差が小さい | Workflow ModeとRoughness / Clearcoatの違い、ライトやuRendererの設定を確認します。 |
| MaterialXが期待どおり動かない | uShaderのMaterialXモード、uReplaceMaterialのType = MaterialXによる直接指定、uMaterialXのMaterial Input経由を区別し、選択中の材質と描画結果を確認します。 |

## 関連ノード

- [uTexture](./utexture)：画像をUSD用テクスチャへする
- [uTextureTransform](./utexturetransform)：テクスチャの位置・向き・大きさを変える
- [uNormalMap](./unormalmap)：法線用テクスチャを調整する
- [uReplaceMaterial](./ureplacematerial)：材質をUSDシーンの選択Primへ割り当てる
- [uMaterialX](./umaterialx)：外部`.mtlx`ファイルを読み込む
- [uShape](./ushape)：立体生成と簡単な材質設定
- [uRenderer](./u-renderer)：USDシーンを2D画像へ描画する

## バージョン・出典・未確認事項

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」、pp.2940–2945**を基準に、可変入力とChannel / Scale / Bias、USD / MaterialX切り替え、USDモードのInspector、uTexture・uNormalMap・uTextureTransformの役割を照合しました。uReplaceMaterialの入力・Prim Selection、およびType = MaterialXの直接ファイル指定とMaterial Input経由の選択は同Chapter **pp.2915–2917**を参照しています。

制作例はManualで確認できる仕様を組み合わせた説明です。**全プロパティの入力候補、数値範囲と既定値、MaterialXの互換性、Edition差、21.1実機でのレンダリング結果は未確認**です。そのため`verification: partial`を維持します。
