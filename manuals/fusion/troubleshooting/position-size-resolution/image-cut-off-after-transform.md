---
title: Transform後にImageの端が消える
description: Transform後の欠けをフレーム外移動、端処理、Cropによる寸法変更、DoD clippingに切り分ける再現手順。
doc_type: diagnostic
verification: partial
aliases: [端が切れる, image clipped, cropped after transform]
concepts: [domain-of-definition, resolution, coordinate-space]
nodes: [Transform, Resize, Scale, Crop]
tasks: [debug, transform, resolution]
symptoms: [edge-cut-off, clipped-after-transform]
prerequisites: [domain-of-definition]
level: intermediate
product_scope: fusion
updated: "2026-10-26"
---

# Transform後にImageの端が消える

## まず確認すること

端が消えたときは、最初に「Transformでframe外へ移動しただけ」なのか、「途中でImageの解像度や有効領域が変わった」のかを分けます。

1. TransformのCenterを0.5 / 0.5へ戻すとImage全体が見えるか。
2. TransformのEdgesはCanvas / Wrap / Duplicate / Mirrorのどれか。
3. Transform前後のWidth / Heightは同じか。
4. upstream / downstreamにCrop、Resize、Scaleがあるか。
5. CropのClipping ModeやDoDを変更しているNodeがあるか。
6. 最初に端が消えるNodeはどこか。

## 原因を切り分ける

「端の絵柄が見えない」だけでは原因は決まりません。同じフレームで入力・Transform直後・後段をViewerへ順に出し、画像の幅と高さ、およびDoDを別々に確認します。

```text
素材（1920×1080）→ Transform → Crop / Resize / Scale? → Effect → MediaOut
                       ↑             ↑                ↑
                 移動後の見た目    寸法 / DoD       最初に欠ける位置
```

| 観測 | 主に疑うこと | 次の操作 |
| --- | --- | --- |
| TransformでCenterを中央に戻すと表示が復帰する | フレーム外への移動 | CenterとEdgesを一つずつ確認する |
| Crop以降でWidth / Heightが変わる | 画像解像度の変更 | CropのSize X / YとKeep Centeredを確認する |
| Width / Heightは同じで、DoDの枠だけ変わる | 有効領域の変更 | ViewerでRegion > Show DoDを比較する |
| Blurなどの輪郭だけが直線状に途切れる | サンプリングとDoDの境界 | 該当NodeのClipping Modeを確認する |
| Viewerの一部だけが古い絵のままに見える | RoIによる部分更新の可能性 | Region > Reset Regionを行って再表示する |

### 1920×1080の画像で切り分ける

四隅に異なる色のマークがある1920×1080・正方形ピクセルの静止画像を用意します。背景とマークが分かれば、自作のチャートでも構いません。フレーム0で、ほかの位置・サイズ・回転のアニメーションがない状態を使います。

**A：Transformによるフレーム外移動**

1. `素材 → Transform1` を接続し、素材とTransform1を左右のViewerに出します。
2. Transform1を `Center = (0.5, 0.5)`、`Size = 1`、`Angle = 0`、`Edges = Canvas` にします。出力解像度が1920×1080のままであることを確認します。
3. Centerだけを `(0.75, 0.5)` へ変えます。幅の0.25、つまり1920px基準で480px相当右へ動く設定です。左側にCanvas Colorの領域が現れ、右端の絵柄は表示フレームの外へ出る想定です。
4. Centerを `(0.5, 0.5)` に戻します。見える範囲が元に戻れば、少なくともこの構成では位置が主因です。戻らなければ別のNodeやMask、DoDを調べます。

**B：Cropによる解像度変更**

1. 同じ素材から別の枝を作り、`素材 → Crop1 → Transform2` にします。
2. Crop1で `Keep Centered` を有効にし、`Size X = 960`、`Size Y = 540` にします。Crop1直後の解像度は960×540になる想定です。フレーム中央の一部だけが残るので、四隅のマークは元の全画面と同じようには見えません。
3. Transform2のCenterを変更しても、Crop1より前にあった外周の画素は取り戻せません。Crop1のサイズを元に戻すか、Crop1を迂回して表示を比較します。

AとBは**公式ManualにあるControlの役割から組み立てた検証手順**であり、ここで指定した素材による21.1実機撮影・ピクセル比較は未実施です。チャートの柄と透明度、Canvas Color、隣接Transformの結合最適化によって、見え方は変わり得ます。

## 主な原因

### frame外へ移動した

Transformは出力解像度を変えません。CenterでImageをframe外へ移動すると見えなくなりますが、それだけではWidth / Heightが変わったわけではありません。

Centerを中央へ戻して復帰するなら、まず位置の問題です。

### EdgesがCanvasになっている

Transformで元Imageの外側が露出すると、Edges = CanvasではCanvas Colorが表示されます。

繰り返し画像ならWrap、端を延長したい場合はDuplicate、反射させたい場合はMirrorが使えます。ただし、見た目を埋めるためだけにEdgesを変えず、必要な境界処理を選びます。

#### 実機の参考例

<!-- capture-reuse:R50 -->

EdgesがCanvasのTransform1で、Center 0.65／0.55、Size 1.25、Angle 12°を設定した状態です。Inspectorと実際の表示範囲を対応させて読みます。

[![S06の実機Inspectorの設定値](/img/fusion/captures/S06/inspector.png)](/img/fusion/captures/S06/inspector.png)

[![S06の左右Viewerの比較](/img/fusion/captures/S06/compare.png)](/img/fusion/captures/S06/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS06の参考例です。Centerだけが欠けの原因だと断定しません。中央へ戻す復旧、Cropで失う枝、全Edgesモードの比較は含みません。 [撮影条件と確認範囲](/img/fusion/captures/S06/capture.json)

### Cropで画素を切り出した

CropはMaskと違い、出力Width / Heightを変更します。21.1 Manualの`Size X / Y`は出力解像度をピクセル単位で指定する項目です。`Keep Centered`をオンにすると切り出し位置も自動調整されます。

範囲外になった画素は、後段TransformのCenterを動かしても再取得できません。**Cropのサイズや位置を修正するか、元画像から分岐し直す**必要があります。Cropの解像度をアニメーションすることは公式Manualでも推奨されていません。

### Resize / Scaleで解像度が変わった

Resizeはピクセル寸法、Scaleは倍率でImage解像度を変更します。

その後に同じCenter値を使っても、正規化位置と実pixel距離の関係が変わる場合があります。

### DoD / Clipping Modeが関係している

Cropの`Clipping Mode`には`Frame`、`Domain`、`None`があります（21.1 Manual p.2864）。

- **Frame**：DoDをフレーム全体へ設定します。上流DoDの外側は黒・透明として扱われます。
- **Domain**：上流DoDを尊重します。大きいフィルターなどでは境界で不自然に切れる場合があります。
- **None**：ソース画像を切り詰めず、上流DoD外で必要になるデータは黒・透明として扱います。

これはCropの切り出しサイズそのものやTransformの`Edges`とは別の設定です。DoDを変更しても、既に削られた元画素を復元できるわけではありません。Blurなどのサンプル範囲が原因と疑われるときに比較します。

## 修正方法

1. **位置の問題**なら、TransformのCenterをいったん`(0.5, 0.5)`へ戻して復帰を確認し、必要な配置へ調整します。出力フレーム外にある絵柄を常に表示するには、配置や合成先の画角を見直します。
2. **空いた端の埋め方**なら、Transformの`Edges`を素材に合わせて選びます。`Canvas`は現在のCanvas Color、`Wrap`は反対端への循環、`Duplicate`は端画素の延長、`Mirror`は反転した端画素です。いずれも欠けた実写情報を推定復元する機能ではありません。
3. **解像度が変わった**なら、最初に変化したCrop / Resize / Scaleの値を直します。Cropで失った範囲が必要なら元画像へ戻ります。後段Transformを拡大するだけでは元の全領域を取り戻せません。
4. **DoD境界で切れる**なら、Viewerの`Region > Show DoD`で枠を確認し、問題のNodeで`Clipping Mode`を比較します。値を変える前後でフィルターの縁と背景のAlphaも確認します。
5. **Viewerだけに見える**なら、`Region > Reset Region`でRoIを解除し、同じNodeを再表示します。表示キャッシュと出力データの欠落を区別します。

最終確認は、問題のあるフレームだけでなく前後のフレームでも、欠けの再発・解像度・Alphaを比較して行います。原因が分かる前にCenter、Size、Crop Sizeを同時に動かさないでください。

## なぜ起きるか

Transform、Resize、Scale、Cropは同じTransformカテゴリにありますが、責任が違います。

- Transform: 解像度を維持して配置を変える
- Resize: 指定Width / Heightへ解像度を変える
- Scale: 倍率で解像度を変える
- Crop: 切り出して新しいキャンバス寸法へ変える

この違いを先に確認すると、「移動したのか」「pixelが失われたのか」を分離できます。

## 関連する考え方

- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)
- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)
- [Scale](../../nodes/transform/scale)
- [Crop](../../nodes/transform/crop)

## バージョン・例外

対象はDaVinci Resolve / Fusion 21.1の2D Imageです。Fusion StudioとResolve内Fusionでは素材の取り込み方やタイムラインの管理が異なります。ここで示した診断は、解像度とDoDを区別するためのもので、Deep Image、3D Scene、Shapeの直接出力にはそのまま適用しません。

## 関連する症状

- [解像度が合わない](./resolution-does-not-match)
- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition)

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）Chapter 120「Transform Nodes」pp.2862–2864（Crop、Keep Centered、Size X/Y、Clipping Mode）、pp.2876–2878（Scale）、pp.2879–2882（Transform、Center、Edges、出力解像度非変更）を公式本文から確認しました。

出典：[21.1 Reference Manual（公式PDF）](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。本ページの480px換算と960×540の例はManualの仕様に基づく**検証用の予測**です。実機での指定チャートの結果、DoDの具体的な座標、Transformを往復させたときの保持範囲、Edition差、画素単位の再現性は未検証です。

既存S06実機画像はTransformでCenter・Size・Angleを同時に変えた参考例に限られ、今回のA/B切り分け結果の実機証拠とは扱いません。
