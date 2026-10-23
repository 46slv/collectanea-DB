---
title: Resize
description: 2D Imageの出力Width / Heightをピクセル数で決め、入力画像を指定した解像度へ再サンプリングするNode。
doc_type: node
term_id: resize
verification: partial
aliases: [Resize, Rsz]
concepts: [resolution, image-extent, domain-of-definition]
nodes: [Resize]
node_family: transform
controls: [Width, Height, Auto Resolution, Reset Size, Keep Frame Aspect, Only Use Filter in HiQ, Change Pixel Aspect, Pixel Aspect, Filter Method, Window Method]
inputs: [image]
outputs: [image]
tasks: [resize, resolution, format]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-17"
---

# Resize

Resizeは、2D <Term id="image">Image</Term>を**指定したピクセル寸法で出力する**Nodeです。3840×2160の素材を1920×1080に変換するように、後段のNodeが受け取るWidth / Heightそのものを変えます。

[Transform](./transform)でSizeを`0.5`にすると、元の解像度のキャンバス内で画像が小さく見えます。一方、ResizeでWidth / Heightをそれぞれ半分にすると、**出力Imageの幅と高さが半分（総画素数は4分の1）**になります。解像度を変えるのか、同じフレーム内で見た目の大きさを変えるのかによって使い分けます。

## 入力 / 出力

| 接続 | 内容 |
| --- | --- |
| Input（オレンジ） | 解像度を変更したい2D Image。MediaIn、Background、前段の合成結果などを接続する。 |
| Output | Width / Heightで指定した解像度の2D Image。後段ではこの新しい寸法を基準に処理される。 |

```text
MediaIn（3840×2160） → Resize（1920×1080） → MediaOut
```

入力に含まれる画素を新しい格子へ変換するため、単にメタデータ上の幅と高さを書き換えるわけではありません。縮小時には細部が失われる場合があり、拡大時には元画像に存在しなかった細部が自動的に復元されるわけでもありません。

## 主な設定

### Width / Height — 出力ピクセル数

新しいImageの幅と高さを指定します。たとえば入力が3840×2160でも1920×1080でも、Width=`1280`、Height=`720`なら出力寸法は1280×720です。

InspectorのWidthまたはHeight上で右クリックし、`Select Frame Format`サブメニューから既定のFrame Formatを選ぶこともできます。これを選ぶとWidthとHeightが一緒に設定されます。画面で表示される選択肢は利用できるフォーマットによります。

### Auto Resolution — タイムライン等に合わせる

`Auto Resolution`をオンにすると、Width / Heightはホスト側の設定を参照して決まります。

- **DaVinci ResolveのFusionページ**：Timeline Resolutionを参照します。
- **Fusion Studio**：PreferencesのFrame Format設定を参照します。

手動の固定寸法を指定する運用では、Auto ResolutionをオフにしてWidth / Heightを入力します。たとえばタイムラインがUHDであっても、特定の処理だけ1280×720へ縮小したい場合です。

**[Transform](./transform)の`Auto Resolution`とは役割が異なります。** ResizeのAuto Resolutionは**出力Imageの寸法**を設定します。TransformのAuto Resolutionは主にCenterの**Reference Sizeの表示寸法**を決め、画像の実解像度は変更しません。

### Reset Size / Keep Frame Aspect

`Reset Size`は幅と高さを入力Imageの元の寸法へ戻します。

`Keep Frame Aspect`は元画像の幅と高さの比率を維持してリサイズします。縦横比を保ったまま縮小・拡大したいときに使い、横方向と縦方向を別の比率へ変えたい場合はオフにします。

元画像が16:9なら1920×1080や1280×720も16:9ですが、1920×1080を1024×1024へ変換する操作は縦横比が変わります。**正方形のフレームを作りたい**のか、**正方形内へ画像全体を余白付きで収めたい**のかは別の要件です。Resizeだけでは、必ずしも後者の余白付きレイアウトにはなりません。

### Only Use Filter in HiQ / Filter Method

Resizeは、通常の非HiQレンダーで高速な`Nearest Neighbor`を使う場合があります。`Only Use Filter in HiQ`をオフにすると、非HiQでも選択したFilter Methodを使います。プレビューとHiQレンダーで線や文字の見え方が違うときは、この設定を確認します。

`Filter Method`は、新しいピクセル値を周囲の画素からどのように補間するかを選ぶ項目です。ManualにはBox、Linear、Quadratic、Cubic、Catmull-Rom、Gaussian、Mitchell、Lanczos、Sinc、Besselなどがあります。

縮小では細線や小さい文字が潰れないか、拡大では輪郭の過度な強調やringing（境界周辺に現れる波状の縁取り）がないかをViewerで確認します。Manualは縮小時のBi-Linearフィルターを一般的な選択肢として挙げ、Catmull-Romが細部のシャープさを保つ場合があることも説明しています。フィルター名だけで一律の品質順位を決めず、素材に対して選びます。

`Sinc`と`Bessel`では、有限の範囲で計算するための`Window Method`が表示されます。Hanning、Hamming、Blackman、Kaiserの選択肢があります。通常のリサイズを始める段階で必ず変更する項目ではありません。

### Change Pixel Aspect

`Change Pixel Aspect`をオンにすると、出力ImageのPixel Aspectを設定できます。Pixel Aspectは**1ピクセルが表示上どの比率を持つか**を示し、Width / Heightのピクセル個数とは異なります。

一般的な正方形ピクセル映像をUHDからHDへ変えるだけなら、通常はPixel Aspectを変更する必要はありません。非正方形ピクセル素材を扱うときは、フレームの縦横比とPixel Aspectの両方を確認してください。詳しくは[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)を参照してください。

## 運用例1：4K素材をHDへ縮小し、タイトルを重ねる

入力が3840×2160の背景映像で、最終的に1920×1080のImageとして合成したい場合です。

```text
背景 MediaIn（3840×2160） → Resize（1920×1080） ─┐
                                               ├─ Merge → MediaOut
タイトル画像 ────────────────────────────────────┘
```

1. 背景のMediaInをResizeのInputへ接続します。
2. `Auto Resolution`をオフにしてWidth=`1920`、Height=`1080`に設定します。
3. Resizeの出力をMergeの**Background（オレンジの背景入力）**へ接続します。
4. タイトルをMergeのForegroundへ接続し、Merge側で位置と大きさを調整します。
5. Viewerで背景映像の細線や字幕の輪郭を確認し、必要ならFilter Methodを変えます。

この構成では、**Mergeの出力解像度も1920×1080**です。MergeはBackgroundの解像度を基準に合成Imageを作るためです。Resizeを**Foreground側だけ**に置くと、背景が3840×2160である限り、合成全体の出力解像度は基本的に背景側の寸法を維持します。[Merge](../compositing/merge)のBackground / Foregroundの違いも参照してください。

## 運用例2：サイズが異なる素材を同じ寸法へ揃える

1080pとUHDの素材を混在させても、以後の処理を同じ1920×1080基準にしたいなら、各素材の後ろにResizeを置き、Width / Heightを1920 / 1080へ指定します。

```text
素材A（3840×2160） → Resize 1920×1080 → 処理A
素材B（1920×1080） → Resize 1920×1080 → 処理B
```

同じ設定でも、素材Aは縮小され、素材Bは同じ解像度を保ちます。これは入力に対して一定倍率をかける[Scale](./scale)とは異なります。ScaleのSize=`0.5`なら、それぞれ1920×1080と960×540になってしまいます。

位置のアニメーションは、Resizeで基準解像度を決めてからTransformを接続すると管理しやすくなります。Resize / Scaleは出力の物理解像度が変わるため、21.1 Manualではこれらの解像度変更Controlをアニメーションすることは推奨されていません。

## 他のNodeとの違い

| Node | 何が変わるか | 向いている操作 |
| --- | --- | --- |
| **Resize** | 出力ImageのWidth / Heightを指定値へ変更 | 複数の入力素材をHDなどへ統一する |
| [Scale](./scale) | 出力Width / Heightを入力画像に対する倍率で変更 | いつも元画像の半分・2倍の解像度にする |
| [Transform](./transform) | 出力のピクセル寸法を保って画像を移動・拡大縮小・回転 | 同じ画面内で位置や見た目をアニメーションする |
| [Crop](./crop) | 残す範囲と出力キャンバスの寸法を変更 | 画像の一部を切り出す、周囲の範囲を詰める |

[正規化座標](../../learn/03-space/normalized-coordinates)で扱う相対位置と、実際のピクセル寸法は別の概念です。Resizeの後ろにTransformを置く場合、そのTransformの正規化座標はResize後のWidth / Heightが基準になります。また、[Domain of Definition（DoD）](../../learn/03-space/domain-of-definition)はピクセル寸法とは別に、画素データの有効領域を表す概念です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 120「Transform Nodes」、pp.2873–2875。Resizeの入力、出力解像度、Width / Height、Auto Resolution、Reset Size、Keep Frame Aspect、Only Use Filter in HiQ、Change Pixel Aspect、Filter Method、Window Method、Merge Backgroundとの接続例を確認しました。解像度の数値と運用例は、Manualに記載された動作を使って構成した計算例です。

内部REGID、Edition差、端数の寸法処理、個別フィルターの実機描画結果や性能は未確認のため`verification: partial`を維持します。