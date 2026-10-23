---
title: USDシーンを2D画像・OpenEXRに出力する
description: uMergeからuRendererで描画し、AOV・補助Z・画像レイヤーを確認して、SaverでOpenEXRに保存・再読込する手順。
doc_type: recipe
verification: partial
aliases: [USD render, uMerge uRenderer, USD AOV EXR, OpenEXR export]
concepts: [usd-scene, image-data, aov]
patterns: [defer-domain-conversion]
nodes: [uMerge, uRenderer, Saver, Loader]
tasks: [usd, render-3d, convert-domain, aov]
prerequisites: [usd-scene]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-19"
---

# USDシーンを2D画像・OpenEXRに出力する

Fusionで組み立てたUSDシーンを映像として使うには、まず**uRendererで3Dシーンを2D画像へ描画**します。さらに、奥行きや物体の識別情報を別の工程へ渡したい場合は、必要なAOV（レンダリング時の追加出力）を確認し、**SaverでOpenEXR連番を保存**します。

このレシピでは、車のUSDモデルを描画し、通常のカラー画像と奥行き情報を取り出して保存・再読込するところまで扱います。AOVを有効にしただけで、すべての情報が保存ファイルや後段ノードへ自動的に渡るとは考えません。

## 作るもの・必要なノード

- **uLoader / uShape**：車のUSDモデルや確認用の立方体など、描画する形状を用意します。
- **uCamera**：撮影する視点を用意します。カメラがない場合のuRendererは既定のPerspective視点を使います。
- **uMerge**：形状とカメラなど、USD形式の要素を一つのシーンへまとめます。
- **uRenderer**：USDシーンをRGBA画像や追加AOVへ変換します。
- **Saver / Loader**：2D画像の枝をOpenEXR連番に保存し、保存結果を読み直します。**uExportとは役割が異なります**。

~~~text
uLoader（車） ──┐
uCamera ────────┼→ uMerge → uRenderer ─┬→ MediaOut（合成結果）
USDライト ─────┘                      └→ Saver ⇒ .exr連番
                                               ↓
                                         Loader → 内容を確認
~~~

最初は形状とカメラだけでも確認できます。ライトを追加した場合、uRendererの**Lighting: Scene**でシーン内の照明を使います。

## 1. まずカラー画像として描画する

1. uLoaderで車のUSDファイルを読み込むか、uShapeで確認用の形状を作ります。
2. uCameraと必要なライトをuMergeへ接続し、uMergeのUSD出力をuRendererの**SceneInput（オレンジ）**へ接続します。
3. uRendererの**Camera**で撮影視点を確認します。**AOV: Color**を表示し、形状、材質、照明、フレーミングを確認します。
4. uRendererの出力をViewerで表示し、必要に応じて通常の2D MergeやMediaOutへ接続します。

**uMergeはUSDシーンをまとめるノード、uRendererはそれを2D画像へ変えるノード**です。Classic 3DのMerge 3D／Renderer 3Dと端子のデータ形式を取り違えないようにします。

### 実機の参考例

<!-- capture-reuse:R46 -->

uShapeのCapsuleをuMerge経由でuRendererへ渡しています。Storm、Default Camera、Camera Lighting、Color AOVの最小描画例です。

[![S12の実機Node Editorの接続](/img/fusion/captures/S12/graph.png)](/img/fusion/captures/S12/graph.png)

[![S12の実機Inspectorの設定値](/img/fusion/captures/S12/inspector.png)](/img/fusion/captures/S12/inspector.png)

[![S12のViewer出力](/img/fusion/captures/S12/result.png)](/img/fusion/captures/S12/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS12の参考例です。Colorの表示だけを確認した例です。外部USD、非Color AOV、EXR保存と再読込の忠実度は未確認です。 [撮影条件と確認範囲](/img/fusion/captures/S12/capture.json)

## 2. AOV・補助Z・レイヤーを区別する

uRendererの主なAOVは次のとおりです。

| 設定 | 出力の意味 | この例で確認すること |
| --- | --- | --- |
| **Color** | 材質と照明を含むカラー画像 | 車の見た目とAlpha |
| **Depth** | フレームごとに正規化した白黒の深度マップ | 前後関係。異なるフレームの同じ灰色を同じ距離とみなさない |
| **PrimID** | USDのPrim（シーン内の要素）ごとの数値 | 車と床などを区別できるか。Classic 3DのObjectIDと同じ規則だとは扱わない |
| **Camera Depth** | カメラに対する奥行きの32-bit float画像 | 距離の値。通常の白黒表示で黒く見えても欠落とは限らない |

**Output AOVs As Layers**を有効にすると、そのシーンで存在するAOVを別々の画像レイヤーとして出力します。一方、**Aux Channel Z**はCamera Depthを画像の**補助Zチャンネル**へ出す設定です。**画像レイヤーと補助チャンネルは別の格納方法**なので、使う側がどちらを読むのかを確認してください。

まずColorで描画が成立することを確認し、次にDepthとCamera Depthを比較します。後段のDepth Blurなどが補助Zを使う構成なら、Aux Channel Zを有効にして、そのノードが実際にZを読めるか調べます。AOVの各種設定については[補助チャンネルとAOV](../../learn/02-data/auxiliary-channels)と[uRenderer](../../nodes/usd/u-renderer)を参照してください。

## 3. SaverでOpenEXRとして保存する

1. uRendererの**2D出力側**から枝を分け、**Saver**を接続します。uMergeのUSD出力をSaverへ直接つなぐのではありません。
2. SaverのInspectorで**Browse**から保存先とファイル名を指定し、拡張子を**.exr**にします。ResolveのFusionページでSaverはOpenEXR出力用です。
3. **Fusion > Render All Savers**を実行し、連番ファイルが生成されたことを確認します。Manualでは通常、拡張子の前に4桁のフレーム番号が自動追加されると説明されています。
4. 保存したEXR連番を、Fusionページの**Effects Library > Tools > I/O > Loader**で読み込みます。
5. Loaderの**Format**タブで、ファイルに含まれる追加チャンネルを確認します。必要な情報がない場合は、uRenderer側の出力設定、Saverへ分岐した位置、書き出したEXRの内容を順に調べます。

FusionページのSaverは、Deliverページ経由ではなくノードの枝を直接OpenEXRへ書き出します。MediaOutはタイムラインへ結果を返す通常の出口であり、**uExportはUSDの3Dシーンを書き出す別のノード**です。三者を同じ保存方法として扱わないでください。

## 4. 読み直して合格とする条件

**EXRファイルが作成されたことと、欲しいAOVが保持されたことは別の確認項目です。** 少なくとも次の点を見比べます。

1. **Color**：Saverへ入れた画像とLoaderから読み直した画像の大きさ、見た目、Alphaが一致しているか。
2. **Depth / Camera Depth**：対応するパスが読めるか。プレビュー上の白黒だけではなく、想定した情報が含まれるか。
3. **Aux Channel Z**：保存前に必要だったZを、読み直した画像を使う後段ノードが利用できるか。
4. **複数レイヤー**：Output AOVs As Layersを使う場合、再読込後にViewerのレイヤー選択やInspectorの対象レイヤー設定で、必要なレイヤーが見つかるか。
5. **複数フレーム**：カメラや車を動かし、少なくとも開始・中間・終了フレームでColorと奥行きの関係を比較する。

DaVinci Resolve 21.1 Manualは、**Fusionの多層レイヤー操作をStudio版のみ**と記載しています（Chapter 66）。そのため、Free版でも同じレイヤー選択・保持操作ができると断定しません。OpenEXRが追加チャンネルを格納できることも、個々のuRenderer出力が無条件にすべて保存されることの証明にはなりません。

## うまくいかないとき

- **車が描画されない**：uRendererのSceneInputにUSDシーンが入っているか、Cameraの視点が正しいかを確認します。
- **シーンのライトが効かない**：ライトを同じuMergeへ入れ、uRendererのLightingをSceneにします。
- **Depthがフレーム間で変化する**：Depthはフレームごとに正規化されます。距離の数値が必要ならCamera Depthを確認します。
- **EXRにAOVが見当たらない**：Output AOVs As Layers、Aux Channel Z、LoaderのFormatタブを別々に確認します。レイヤー名と補助チャンネル名を同一視しません。
- **保存できない**：Saverの保存先・書き込み権限・.exr拡張子を確認し、Fusion > Render All Saversで出力します。

## 関連する考え方・ノード

- [USDシーンの基礎](../../learn/02-data/usd) — USDの形状・カメラ・材質が同じシーンに含まれる理由
- [補助チャンネル / AOV](../../learn/02-data/auxiliary-channels) — 深度、ID、補助Z、レイヤーの違い
- [uMerge](../../nodes/usd/u-merge) / [uRenderer](../../nodes/usd/u-renderer) — USDシーンの統合と描画
- [uExport](../../nodes/usd/uexport) — 画像ではなくUSDシーンを保存する場合
- [データ形式の境界で2Dに戻す](../../patterns/data-domain/defer-domain-conversion) — 3Dと2Dの接続の考え方

## 出典と検証範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）。

- **Chapter 64 pp.1345–1346**：FusionページのLoader / Saver、OpenEXR連番、追加チャンネルの読込、BrowseとRender All Savers。
- **Chapter 65 p.1361**：Resolve FusionページのSaverはOpenEXR専用で、AOVを含むEXRも出力対象となること。
- **Chapter 66 pp.1410–1412**：多層画像のViewer／Inspector操作、Studio版のみの記載。
- **Chapter 121 pp.2911–2913**：uRendererのSceneInput、AOV、Output AOVs As Layers、Camera Depth、Aux Channel Z。

本文の接続手順はこれらの記述を合わせた制作例です。**uRenderer → Saver → Loaderの実機による全AOV・レイヤー・ビット深度の往復保持、Free版の多層画像操作、GPU・環境差は未検証**です。未確認の保持動作を仕様として断定しないため、verificationはpartialです。
