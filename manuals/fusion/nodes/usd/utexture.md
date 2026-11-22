---
title: uTexture
description: 画像ファイルやFusionの映像をUSDマテリアル用テクスチャとして渡すノード。Image Input、Source Color Space、U/V Address Modeと接続例を説明する。
doc_type: node
term_id: utexture
term_short: uTextureは、静止画像やFusionの2D Imageを、USDマテリアルの色や法線などを決めるテクスチャとして供給するノード。
verification: partial
aliases: [uTexture, uTx]
concepts: [usd-scene, texture, image-data, color-space]
nodes: [uTexture]
node_family: usd
controls: [File Name, Source Color Space, U Address Mode, V Address Mode]
inputs: [image]
outputs: [texture]
tasks: [usd, texture, material]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uTexture

uTextureは、画像を**USDオブジェクトの表面の見え方を決めるデータ**として読み込むノードです。木目の画像を表面の色に使ったり、白黒画像で反射の粗さを変えたりできます。動画やFusion内で生成した画像も、Image Inputから渡せます。

「テクスチャ」は必ずしも表面に表示する写真ではありません。色を表すもののほか、反射の粗さや凹凸の向きを数値として伝える画像も含みます。**画像を読み込むuTexture**、**材質のどの性質に使うかを決める[uShader](./ushader)**、**その材質をオブジェクトに割り当てる[uReplaceMaterial](./ureplacematerial)**は、それぞれ役割が異なります。

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Image Input** | Fusionの2D Image | MediaIn、Background、合成結果など。接続中は画像ファイル指定より優先する |
| **出力** | USDマテリアル用テクスチャ | uShaderの可変入力やuNormalMapなどに渡す |

```text
MediaIn / Background / 合成結果
               │ 2D Image（任意）
               ▼
            uTexture ──→ uShader ──→ uReplaceMaterial ──→ uRenderer
                         （材質）       ↑ USD scene
                                   uLoader
```

この線は、MediaInを直接2D Mergeで合成する処理ではありません。uTextureから先は、画像が**どの材質プロパティを制御するか**というデータの流れです。最終的に2D画面へ描画するには、USDシーンの処理を経て[uRenderer](./u-renderer)へ接続します。

<!-- capture:S341 -->

## 実機例：画像を材質の色へ渡す

`Background`の単色画像を`uTexture`へ渡し、`uShader`のdiffuseColor、`uReplaceMaterial`を通してCapsuleに適用しました。入力を赤から緑へ変えると、描画された形状の色も変わりました。比較画像は更新のため0フレームと1フレームで撮影しています。Filenameとの優先順位、色空間の数値精度、模様のUV配置や特定Primの選択は確認していません。市松模様はViewerの透明表示です。[接続と設定の記録](/img/fusion/captures/S341/readback.json)に条件を記載しています。

[![BackgroundからuTextureとuShaderを経てuReplaceMaterialへ渡す構成](/img/fusion/captures/S341/graph.png)](/img/fusion/captures/S341/graph.png)

画像を材質のdiffuseColorとして形状に適用します。

[![Image Inputを接続したuTextureのControls](/img/fusion/captures/S341/controls.png)](/img/fusion/captures/S341/controls.png)

Image Inputを接続したuTextureを選択しています。

[![緑の画像から描画された緑のCapsule](/img/fusion/captures/S341/green-result.png)](/img/fusion/captures/S341/green-result.png)

緑の入力、1フレームの描画です。

[![赤の画像から描画された赤のCapsule](/img/fusion/captures/S341/red-result.png)](/img/fusion/captures/S341/red-result.png)

赤の入力、0フレームの描画です。

[再現用Graph](/img/fusion/captures/S341/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S341/capture.json)

<!-- /capture:S341 -->

## File NameとImage Input：画像をどこから供給するか

### ファイルを指定する

1. uTextureを追加します。
2. Inspectorの**File Name**にあるBrowseから画像ファイルを指定します。Media Poolの画像をFile Nameへドラッグする方法も、21.1マニュアルに記載されています。
3. 必要に応じて**Source Color Space**を確認します。
4. uTextureをuShaderへ接続し、表示される入力先の候補から用途に合うプロパティを選びます。

21.1マニュアルでは、File Nameから読み込む画像は**単一フレームのテクスチャ**として扱われています。動画を時間に合わせて更新したい場合は、次のImage Inputを使います。

### Fusionの画像や動画を直接渡す

MediaInなどの2D Image出力を**Image Input**へつなぐと、そのフレームをテクスチャとして供給できます。接続するとInspectorの**File Nameは非表示**になり、以前File Nameから読み込んでいた画像より**接続中のImage Inputが優先**されます。

たとえば画面のある3Dモデルに動画を表示するなら、MediaInの動画をuTextureへ渡し、uShaderで色用の入力先を選び、uReplaceMaterialで画面部分のオブジェクトを指定します。

```text
MediaIn（再生したい動画） → uTexture → uShader ─────┐ Material Input
                                              ▼
uLoader（画面つきUSDモデル） ────────→ uReplaceMaterial → uRenderer
```

**Image Inputを接続したままFile Nameを探しても表示されません。** ファイルへ戻す場合は、まずImage Inputの接続を外して確認します。また、画像が時間に応じて変わることと、3Dモデルの正しい位置に映ることは別問題です。表面のUV（画像のどの位置を対応させるかを表す座標）が適切かどうかも見た目に影響します。

## Source Color Space：画像の値をどう解釈するか

**Source Color Space**は、読み込んだ画像の色空間を指定する項目です。色のテクスチャと、色として見せることを目的としない数値データでは、適切な読み方が異なります。

特に法線マップは、表面の細かな凹凸に見える光の向きを画像の各チャンネルへ記録したデータです。**21.1マニュアルは法線マップの読み込み時にLinearを選ぶことを推奨**しています。色画像のような変換をかけると、記録された数値の意味が変わるおそれがあります。

```text
uTexture（法線マップ、Source Color Space: Linear）
       → uNormalMap → uShader → uReplaceMaterial
```

[uNormalMap](./unormalmap)は法線画像をuShaderへ渡す前に使うノードで、立体そのもののポリゴン数を増やすものではありません。通常の色テクスチャはuNormalMapを経由させる必要はなく、uShaderの対応する入力へ接続します。

**注意：** すべてのテクスチャを無条件にLinearへする、という意味ではありません。正しい設定は画像が表す情報と制作時の色管理に依存します。21.1マニュアルのこの節では、各Source Color Space選択肢の変換式までは確認できません。

## U / V Address Mode：画像の端の外側をどう扱うか

USDモデルの表面には、画像の横方向・縦方向に対応する**U/V座標**があります。uTextureの**U Address Mode / V Address Mode**は、テクスチャの拡大縮小や移動によって**画像の端の外側が参照されたとき、その領域をどう扱うか**を決める設定です。

たとえば木目を壁に使い、模様の位置をずらした場合、壁の端で画像範囲外の部分が発生することがあります。このとき色や模様が不自然に途切れたら、U/V Address Modeを確認します。Uは横方向、Vは縦方向に対応します。

画像の位置や角度そのものは[uTextureTransform](./utexturetransform)で調整します。**uTextureTransformはテクスチャの位置を変え、U/V Address Modeは範囲外の扱いを決める**ため、両方を組み合わせて使います。

21.1マニュアルのuTexture節にはこの項目の目的が記載されていますが、各メニュー選択肢の名称、初期値、繰り返し回数などの詳細は掲載されていません。本記事では実機で未確認の選択肢を列挙しません。

## 制作例：木目を合わせ、壁だけ材質を変更する

1. uLoaderで壁を含むUSDシーンを読み込みます。
2. uTextureのFile Nameで木目画像を指定し、uShaderへ接続します。
3. uShaderで、色を制御するプロパティを入力先に選びます。テクスチャが接続されたプロパティでは、対応する数値スライダーの代わりにChannel / Scale / Biasなどの設定が現れることがあります。
4. 必要ならuTextureとuShaderの間にuTextureTransformを入れ、木目の大きさ・角度・位置を調整します。
5. uShaderをuReplaceMaterialのMaterial Inputへ、uLoaderをScene Inputへ接続します。
6. uReplaceMaterialのPrim Selectionで壁を選び、ほかのオブジェクトを変えないようにします。
7. uRendererの出力を確認します。端が不自然ならU/V Address Modeと画像自体の継ぎ目を確認します。

木目画像の模様が横に伸びたり、向きが合わなかったりするとき、原因はuTextureの設定だけとは限りません。読み込んだUSDモデルのUVも確認が必要です。

## トラブル診断

| 症状 | 最初に確認すること |
| --- | --- |
| **File Nameが表示されない** | Image Inputに線が接続されていないか。接続中はFile Nameが隠れる |
| **動画を指定したのに静止している** | File Name指定ではなく、時間とともに更新されるMediaInなどをImage Inputへつないでいるか |
| **モデルの色が変わらない** | uShaderの目的の可変入力へつながっているか、uReplaceMaterialで対象Primを選んでいるか |
| **モデル自体が表示されない** | uLoader等のUSD scene経路とuRendererの接続を確認。uTexture単独では完成した2D Imageを出さない |
| **法線の凹凸が不自然** | uTextureのSource Color SpaceがLinearか、uNormalMapへ正しく渡しているかを確認 |
| **模様が引き伸ばされる・ずれる** | uTextureTransformとモデル側のUVを区別して確認 |
| **端で模様が切れる** | U/V Address Modeと画像の端の模様を確認 |
| **uShaderの数値スライダーが操作できない** | 対応するプロパティにテクスチャが接続されると、Channel / Scale / Biasが表示される場合がある |

## 関連ノード・出典

- [uShader](./ushader)：色・粗さなど、読み込んだテクスチャの使い道を決める。
- [uNormalMap](./unormalmap)：法線テクスチャをuShaderへ渡す前に調整する。
- [uTextureTransform](./utexturetransform)：模様のScale / Rotation / Positionを変える。
- [uReplaceMaterial](./ureplacematerial)：材質をUSDシーン内の対象Primへ割り当てる。
- [uRenderer](./u-renderer)：USDシーンを2D画像へ描画する。

**Version / Source:** DaVinci Resolve 21.1 Reference Manual（2026年9月版）、Chapter 121「USD Nodes」、pp.2941–2945（uShaderの可変入力、uTextureの入力・Inspector、uTextureTransform）。Image Inputの優先動作と法線マップのLinear推奨はp.2944で確認。

本記事はマニュアルに書かれた機能を説明したもので、**実機でのポート位置、U/V Address Modeの全選択肢と既定値、MaterialXとの全互換性、Edition差、動画テクスチャの描画結果は未検証**です。これらを確認済みの仕様として扱わず、`verification: partial`を維持します。
