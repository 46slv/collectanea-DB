---
title: uNormalMap
description: USDマテリアルの法線マップをuShaderへ渡す前に調整するノード。通常の画像との違い、接続方法、色空間と確認手順を説明する。
doc_type: node
term_id: unormalmap
term_short: uNormalMapは、表面の細かな凹凸に見える光の当たり方を決める法線テクスチャを、uShaderへ渡す前に調整するノード。
verification: partial
aliases: [uNormalMap, uNm]
concepts: [usd-scene, material, normal-map]
nodes: [uNormalMap]
node_family: usd
inputs: [texture]
outputs: [texture]
tasks: [usd, material, normal-map]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# uNormalMap

uNormalMapは、**法線マップの内容を調整してuShaderへ渡す**USDマテリアル用のノードです。法線マップは表面の各位置がどちらを向いているかを画像の値で表したデータで、光の当たり方を変えて細かな凹凸があるように見せるために使います。通常の写真のように、色をそのまま表示する画像とは用途が異なります。

例えば平らな板に木目の細かな溝を見せたい場合、板の形状を細かく作り直さず、法線マップによって光沢や陰影の変化を与えられます。ただし、**板の外形やシルエットを実際に凹ませる処理ではありません**。横から見た輪郭まで変更したい場合は、法線マップだけでは目的を満たしません。

## 入力・出力

| 接続 | 受け渡すもの | 役割 |
| --- | --- | --- |
| 入力 | [uTexture](./utexture)からのテクスチャ | 法線として使う画像のデータを受け取る |
| 出力 | 調整した法線用テクスチャ | [uShader](./ushader)の対応する可変入力へ渡す |

```text
法線画像 → uTexture → uNormalMap → uShader ─┐
                                          ▼（Material Input）
USDモデル → uLoader ────────────────→ uReplaceMaterial → uMerge → uRenderer
                                  （Scene Input）
```

uNormalMapが扱うのは**マテリアルに供給するデータ**です。USDシーン全体を入力して立体を変形するノードでも、単独で完成画像を出力するノードでもありません。モデルに材質を割り当てるのは[uReplaceMaterial](./ureplacematerial)、USDシーンを画像に描画するのは[uRenderer](./u-renderer)です。

<!-- capture:S342 -->

## 実機例：単色画像を法線入力へ渡す

単色の`Background`を`uTexture`と`uNormalMap`へ渡し、`uShader`のnormal入力へ接続しました。uNormalMapのScaleを1から0に変えると、描画されたCapsuleの明暗が変わりました。比較画像は0フレームと1フレームで撮影しています。法線ベクトルの数値や向きの規約、実画像の細部やgeometryの変化は確認していません。市松模様はViewerの透明表示です。[接続と設定の記録](/img/fusion/captures/S342/readback.json)に条件を記載しています。

[![uTextureからuNormalMapとuShaderのnormalへ渡す構成](/img/fusion/captures/S342/graph.png)](/img/fusion/captures/S342/graph.png)

画像を法線入力へ渡し、材質を形状に適用します。

[![Scale 0のuNormalMap](/img/fusion/captures/S342/controls.png)](/img/fusion/captures/S342/controls.png)

uNormalMapのScaleを0に設定しています。

[![Scale 0で描画されたCapsule](/img/fusion/captures/S342/scale0-result.png)](/img/fusion/captures/S342/scale0-result.png)

Scale 0、1フレームの表示です。

[![Scale 1で描画されたCapsule](/img/fusion/captures/S342/scale1-result.png)](/img/fusion/captures/S342/scale1-result.png)

Scale 1、0フレームの表示です。

[再現用Graph](/img/fusion/captures/S342/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S342/capture.json)

<!-- /capture:S342 -->

## 法線画像を接続する手順

1. 法線マップ用の画像を用意し、**uTexture**で読み込みます。
2. uTextureのInspectorで**Source Color SpaceをLinear**にします。DaVinci Resolve 21.1 Reference Manualは、法線画像を読み込む際にLinearを選ぶことを推奨しています。
3. uTextureの出力を**uNormalMap**へ接続します。
4. uNormalMapの出力を**uShader**へ接続し、表示される接続先の選択肢から法線に対応する入力を選びます。接続候補の正確な表示名は21.1実機で確認してください。
5. uShaderをuReplaceMaterialの**Material Input**へ、対象のUSDモデルを**Scene Input**へ接続します。**Prim Selection**で材質を変える部品を指定して、uRendererで確認します。

Source Color SpaceはuNormalMapではなく、**画像を読み込むuTexture側の設定**です。法線画像は各色チャンネルが方向を表すデータなので、一般の表示用画像と同じ感覚で色変換を適用すると、意図した凹凸の見え方から外れることがあります。

## ベースカラーの画像との使い分け

木材の色と細かな溝を両方表現したい場合、画像は通常2系統に分けます。

```text
木目の色画像 → uTexture ─────────────────┐
                                      ├→ uShader → uReplaceMaterial
木目の法線画像 → uTexture → uNormalMap ─┘
```

色画像は表面の色を、法線画像は光を受ける方向の変化を担当します。2つを順につなぐのではなく、**uShaderの別々のプロパティへ割り当てる**のが基本です。uShaderでは、テクスチャを接続すると割り当て先を選ぶメニューが表示されます。

法線による効果は光源の方向や材質のRoughnessでも見え方が変わります。陰影の差を確認するときは、カメラとライトを固定し、法線の接続前後だけを比較してください。

## 制作例：動く法線マップで水面の細かい波を表す

法線画像は静止画に限りません。**法線情報として作成された動画や連番**を使えば、モデルの形を変えずに、時間とともに変化する細かな陰影や反射を与える構成を試せます。例えば水面の大きなうねりは形状側で表現し、細かな波紋による光の反射の変化を法線マップで担当させます。

```text
法線マップの連番／動画 → MediaInなどの2Dノード
                              │ 2D Image（各フレーム）
                              ▼ Image Input
                           uTexture → uNormalMap → uShader
                                                      │ 材質
USDの水面モデル → uLoader ─────────────────────────→ uReplaceMaterial → uRenderer
```

1. **法線マップとして作成された**動画や画像連番をMediaInなどから2D画像として供給します。通常の水面映像をそのまま流しても、正しい法線データになるわけではありません。
2. uTextureの**Image Input**にその2D画像を接続し、**Source Color SpaceをLinear**に設定します。
3. uTexture → uNormalMap → uShaderの順につなぎ、uShader側の法線に対応する入力を選びます。
4. uShaderをuReplaceMaterialのMaterial Inputに渡し、水面のPrimを選択します。ライト・カメラ・モデルを含むUSDシーンをuRendererで描画し、複数フレームで陰影が変化するか確認します。

21.1 Manualによると、**uTextureのFile Nameは単一フレームのテクスチャを指定**する経路です。一方、**Image InputはFusionの別ノードからフレームを受け取れる**ため、動くテクスチャに使えます。Image Inputを接続するとInspectorのFile Name欄が隠れ、以前に指定したファイルより入力画像が優先されます。静止画ファイルを選んだまま「連番が動かない」と思ったときは、どちらの入力経路を使っているか確認してください。

**uReplaceMaterialやuShapeのImage Inputに2D画像を直接接続する方法とは役割が違います。** Manualではその入力はDiffuse（表面の色）用として説明されています。法線データで陰影を変えたいときは、2D画像をuTextureからuNormalMap、uShaderへ渡す経路を使います。色の画像と法線の画像を別々の入力へ割り当てる点は、静止画でも動画でも同じです。

## 表示がおかしいとき

| 症状 | 確認すること |
| --- | --- |
| 法線画像を読み込んでも凹凸が出ない | **uTexture → uNormalMap → uShader**の順で接続され、uShader側で対応する入力を選んでいるか確認します。 |
| 意図しない色が表面に出る | 法線画像を色用プロパティへ接続していないか確認します。法線と色は別の役割です。 |
| 凹凸の方向や強さが不自然 | uTextureの**Source Color Space = Linear**を確認します。作成元による法線の向きの違いについては、21.1 Manualのこの節だけでは確定できません。 |
| 接続しても物体自体が見えない | uNormalMapは画像出力ノードではありません。uReplaceMaterialで材質を割り当て、uRendererまで接続されているか確認します。 |
| 横から見た輪郭が変わらない | 法線マップは形状の輪郭を変更しません。目的に応じてモデルの形状側を調整します。 |
| 変化が小さく判断できない | ライトの方向とRoughnessを固定し、法線の接続あり・なしで比較します。 |
| 動かしたい法線マップが静止したまま | uTextureの**File Name**で静止画像を指定していないか確認します。動画・連番は**Image Input**へ2Dフレームを供給する方法を使います。 |
| 動画を接続したが色だけが変化する | uReplaceMaterialやuShapeのImage Inputへ直接接続していないか、uShaderの色用入力へ誤接続していないか確認します。 |

## 関連ノード

- [uTexture](./utexture)：画像ファイルやFusionの画像をテクスチャとして読み込む
- [uShader](./ushader)：色・反射・法線などを組み合わせて材質を作る
- [uTextureTransform](./utexturetransform)：テクスチャの位置・向き・大きさを調整する
- [uReplaceMaterial](./ureplacematerial)：USDシーンの指定した部品へ材質を割り当てる
- [uRenderer](./u-renderer)：USDシーンを2D画像へ描画する

## バージョン・出典と確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」、pp.2940–2941**を基準にしました。Manualで確認できるのは、uNormalMapがuTextureとuShaderの間で法線テクスチャを調整する役割、基本接続、および法線画像をuTextureに読み込む際のLinear指定、およびImage Input経由の動画・連番フレームとFile Nameの切り替え（p.2944）です。説明用の制作例と症状別の確認順序は、これらの仕様に基づく運用例です。

**uNormalMap固有のInspector全項目、各パラメータの範囲・既定値、法線の座標規約、Edition差、21.1実機の最終描画結果は未確認**です。存在を確認していない制御名や数値は記載していません。そのため`verification: partial`を維持しています。
