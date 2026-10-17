---
title: Transform
description: 2D Imageを同じ解像度のまま移動・拡大縮小・回転し、PivotやAspect、Edgesも調整する基本Transform Node。
doc_type: node
term_id: transform
verification: partial
aliases: [Transform, XF, 変形]
concepts: [normalized-coordinates, coordinate-space, parameter-data]
patterns: [share-position-across-elements, link-values-with-expression]
nodes: [Transform]
node_family: transform
controls: [Center, Pivot, Use Size and Aspect, Size, Aspect, Angle, Flip, Edges, Filter Method, Invert Transform, Flatten Transform, Reference Size, Auto Resolution]
inputs: [image, mask]
outputs: [image]
tasks: [position, scale, rotate, layout, animate]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
slug: /fusion/nodes/transform/transform
updated: "2026-10-17"
---

# Transform

Transformは、2D <Term id="image">Image</Term>を移動・拡大縮小・回転する基本Nodeです。**画像の表示位置や大きさを変えても、出力するImageのWidth / Height自体は変更しません。**

たとえば、1920×1080の映像を右へ48pxずらしても、出力は1920×1080のままです。右へずれた分、左端には新しく見える領域が生じます。この領域をどう埋めるかはEdgesやCanvas Colorの設定で決まります。

## 入力 / 出力

| 接続 | 内容 |
| --- | --- |
| Input（オレンジ） | 変形する2D Image。映像、画像、Generatorなどの出力を接続する。 |
| Effect Mask（青、任意） | Transformの適用範囲を指定するMask。21.1 ManualではTransform処理後に適用される。 |
| Output | 変形後の2D Image。解像度は入力Imageと同じ。 |

```text
MediaIn → Transform → MediaOut
```

映像全体を動かす場合はこの構成で十分です。別の映像の上へタイトルやロゴを置きたいときは、Transformの出力を[Merge](../compositing/merge)のForegroundへ接続します。

## 主な設定

### Center X / Y — 画像の位置

Transform後の画像をどこへ置くかを指定します。既定の正規化値`(0.5, 0.5)`は中央です。Xは画像の幅、Yは画像の高さを1.0とする座標系なので、解像度に依存しない相対位置を指定できます。

1920×1080の入力画像を中央から右へ48px動かすなら、Xを`0.5 + 48 / 1920 = 0.525`にします。Yは`0.5`のままです。**48pxは入力Imageの1920px幅を基準にした距離**であり、後段のMergeのBackground幅を自動参照するわけではありません。

### Pivot X / Y — 回転・拡大縮小の支点

Pivotは回転や拡大縮小の中心です。既定は`(0.5, 0.5)`で画像の中央にあります。Centerが「画像をどこへ置くか」を決めるのに対し、Pivotは「どこを支点として変形するか」を決めます。

たとえば、左端を支点に回転する場合はPivot Xを変えてからAngleを動かします。Centerを動かすだけでは回転の支点は移動しません。

### Use Size and Aspect / Size / Aspect

`Use Size and Aspect`がオンのときは、Sizeで均等な拡大縮小、Aspectで横方向と縦方向の比率を調整します。オフにするとXとYのSizeを個別に調整できます。

- **Size**: `1.0`が基準。出力Imageのピクセル寸法は変えず、内部の画像を拡大縮小する。
- **Aspect**: `1.0`を境に、1.0より大きい値はX方向、0〜1の値はY方向へ伸ばす。`Use Size and Aspect`がオンのときだけ表示される。

Sizeのスライダー範囲は0〜5ですが、Manualは数値欄に0より大きな値を直接入力できると説明しています。

### Angle / Flip

AngleはPivotを中心とした回転で、正方向が反時計回り、負方向が時計回りです。`Flip Horizontally`と`Flip Vertically`は、それぞれ水平・垂直方向に画像を反転します。

### Edges — 画像の端を越えた領域

Transformで画像を動かしたり縮めたりすると、元画像の外側が見えることがあります。その領域の扱いを選びます。

- **Canvas**: Canvas Colorを使用。既定はAlpha 0の黒で、必要ならSet Canvas Colorで変更する。
- **Wrap**: 反対側の端へつなげて繰り返す。背景素材を横へ流し続けるときに使える。
- **Duplicate**: 端の画素を外側へ延長する。
- **Mirror**: 端で画像を折り返したように反射させる。

この設定は、画像がキャンバス外へ移動したときの見え方を決めるもので、出力解像度そのものを広げる設定ではありません。

### Filter Method — 拡大縮小時の補間

画像を拡大縮小するとき、元の画素をどう補間するかを決めます。Box、Linear、Quadratic、Cubic、Catmull-Rom、Gaussian、Mitchell、Lanczos、Sinc、Besselなどがあります。

輪郭が強い図形ではシャープさを確認し、撮影素材では細部の見え方を確認します。Sincのようなシャープなfilterではringingが見える場合があります。複雑なfilterが常に最適とは限りません。Sinc / Besselでは追加のWindow Methodが表示されます。

### Invert Transform / Flatten Transform

`Invert Transform`は位置・回転・スケールの変形を反転します。たとえばTrackerで安定化した動きを後段で戻すときに使います。

`Flatten Transform`は、後続NodeとのTransform concatenation（隣接する変形をまとめて処理すること）をこのNodeの出力側で止めます。見た目を変えるCenter / Sizeとは役割が異なります。特別な理由がなければ、最初は既定設定で構いません。

## Reference SizeとAuto Resolution

**Reference SizeはCenter欄の表示・入力に使う寸法であり、画像をリサイズする設定ではありません。** Transformが保存するCenterは正規化値のままです。Reference Width / Heightを変えただけでは画像は移動しません。

たとえば、内部Centerが`(0.525, 0.5)`なら、Reference Width / Heightが1920 / 1080のときInspectorには`(1008, 540)`と表示されます。3840 / 2160へ変更すると表示は`(2016, 1080)`になりますが、内部Centerは`(0.525, 0.5)`のままで、Viewerの位置も変わりません。

`Auto Resolution`がオンの場合のReference Width / Heightの取得先は環境によって異なります。

- **DaVinci ResolveのFusionページ**: Timeline Resolutionを使う。
- **Fusion Studio**: CompositionのFrame Formatを使う。

手動で1920 / 1080を指定したい場合は`Auto Resolution`をオフにしてReference Width / Heightを設定します。Mergeにある対応する項目の名前は`Use Frame Format Settings`です。両Nodeのチェックボックス名を混同しないでください。

Reference Sizeを使ってピクセル位置を入力する際は、**参照寸法と実際に位置を揃えたいImageの寸法が同じか**を確認します。Timelineが1920×1080でも、Transformに入る透過ロゴのImageが960×540なら、そのTransformの座標系まで1920×1080になるわけではありません。[正規化座標](../../learn/03-space/normalized-coordinates)と[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)も参照してください。

## 運用例1：フルHD映像を右へ48pxずらす

1920×1080の映像をTransformへ接続し、次のように操作します。

1. MediaIn → Transform → MediaOutと接続します。
2. Transformの`Auto Resolution`をオフにしてReference Width / Heightを`1920 / 1080`に設定します。
3. Centerを`(960, 540)`に置き、画像が中央であることを確認します。この表示は内部値`(0.5, 0.5)`に相当します。
4. Center Xを`1008`へ変更します。内部値は`1008 / 1920 = 0.525`になり、映像は48px右へ動きます。
5. Reference Width / Heightを3840 / 2160へ変えても、Viewer上の画像位置は動きません。Centerの表示だけが`(2016, 1080)`に変わります。

これは**Reference Sizeの表示変更**を試す例です。入力Imageそのものを3840×2160へ取り替えると、内部Centerが同じ`0.525`でも右への移動量は96pxに変わります。4K UHDの画像でも48pxの距離を維持したいときは、Xを`0.5 + 48 / 3840 = 0.5125`に調整します。

## 運用例2：小さいロゴを背景映像へ配置する

1920×1080の背景映像に、960×540の透明ロゴImageを重ねる場合は次の構成にします。

```text
ロゴ（960×540） → Transform ─┐
                             ├─ Merge → MediaOut
背景映像（1920×1080） ─────────┘
```

Transformでは、まずロゴ自体の拡大縮小・回転・支点を調整します。その出力をMergeのForegroundへ接続し、**背景フレームのどこに重ねるか**はMergeのCenterで調整します。

TransformのCenterはTransformに入っている960×540のImageを基準にし、MergeのCenterはBackgroundの1920×1080のフレームを基準にします。両方で同じ数値を入力しても、同じピクセル位置への移動になるとは限りません。背景上の位置を調整したい場合は[Merge](../compositing/merge)を参照してください。

## Resize / Scale / Cropとの違い

- **Transform**: ImageのWidth / Heightを保ち、内部で画像を動かす・回転する・拡大縮小する。
- **Resize**: 出力ImageのWidth / Heightを指定する。
- **Scale**: 元の画像に対する倍率で出力解像度を変更する。
- **Crop**: 画像を切り出し、キャンバス寸法を変更できる。

見た目が同じでも、後段Nodeが受け取る画像のWidth / Heightが同じとは限りません。解像度を変更したい場合はTransformではなくResize / Scaleを選びます。

## よくある勘違い

- **Reference Sizeを変更したら画像も動くと思った**: 変わるのはCenterの表示単位です。正規化された内部値と画像位置は変わりません。
- **HDとUHDで同じ48px移動になると思った**: Centerの正規化値が同じなら幅に対する割合が同じです。固定ピクセル距離は解像度に応じた計算が必要です。
- **MergeのForegroundもTransformも同じ座標系だと思った**: Transformは入力Image、MergeはBackgroundフレームが配置の基準です。入力のWidth / Heightを確認します。
- **動かした画像の外側が予想外の色になった**: Edgesの設定とCanvas Colorを確認します。
- **エフェクトの一部分だけ動かしたい**: Effect Maskを接続して適用範囲を調整します。Maskを入れた結果の挙動はViewerで確認します。

## 関連記事

- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)
- [解像度 / アスペクト比](../../learn/03-space/resolution-aspect)
- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)
- [解像度を跨ぐ配置](../../patterns/transform/resolution-aware-positioning)
- [Resize](./resize) / [Scale](./scale) / [Crop](./crop)
- [Merge](../compositing/merge)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 120、pp.2879–2883。Input / Effect Mask、Center、Pivot、Use Size and Aspect、Size、Aspect、Angle、Flip、Edges、Filter Method、Invert Transform、Flatten Transform、Reference Size、Auto Resolutionを確認しました。48px移動とReference Sizeの数値はManualの正規化座標の説明から計算した例です。

内部REGID、edition別制約、Transform concatenationの最適化条件、実機描画結果や性能は未確認のため`verification: partial`としています。
