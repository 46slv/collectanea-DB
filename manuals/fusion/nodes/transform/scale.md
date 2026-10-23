---
title: Scale
description: 2D Imageの幅と高さを元画像に対する倍率で変え、出力解像度そのものを変更するNode。
doc_type: node
term_id: scale
term_short: Scaleは、入力Imageのピクセル寸法を倍率で変更するNode。
verification: partial
aliases: [Scale, SCL]
concepts: [image-data, resolution, transform]
nodes: [Scale]
node_family: transform
controls: [Lock X/Y, Size, X Size, Y Size, Edges, Only Use Filter in HiQ, Change Pixel Aspect, Pixel Aspect, Filter Method, Window Method]
inputs: [image]
outputs: [image]
tasks: [transform-image, resize, resolution]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-17"
---

# Scale

Scaleは、入力された2D <Term id="image">Image</Term>の**ピクセル寸法そのものを倍率で変更する**Nodeです。1920×1080のImageに`0.5`を指定すると、出力は960×540になります。

[Transform](./transform)でSizeを`0.5`にする場合は、1920×1080の出力キャンバスの中で画像が小さく見えるだけです。Scaleでは後段Nodeへ渡されるWidth / Heightが変わるため、同じ「半分」でも目的が異なります。

## 入力 / 出力

| 接続 | 何を扱うか |
| --- | --- |
| Input（オレンジ） | 解像度を変えたい2D Image。MediaInやGeneratorなどの出力を接続する。 |
| Output | 指定した倍率でピクセル寸法が変わった2D Image。 |

Scaleは入力Imageの解像度を基準に計算します。例えば、入力が3840×2160でSizeが`0.5`なら1920×1080、入力が1920×1080なら960×540です。**特定の解像度へ必ず揃える**必要があるなら、倍率ではなく出力Width / Heightを指定する[Resize](./resize)を使います。

## 主な設定

### Lock X/Y・Size・X Size / Y Size

`Lock X/Y`がオンなら、1つの`Size`で幅と高さを同じ割合に変更します。

- `1.0`：入力と同じ解像度
- `0.5`：幅と高さを半分にする
- `2.0`：幅と高さを2倍にする

`Lock X/Y`をオフにすると、`X Size`と`Y Size`を別々に指定できます。たとえば1920×1080の入力にX=`0.5`、Y=`1.0`を指定すると、幅だけ半分の960×1080になります。この操作は画面上の位置を変更するのではなく、出力Imageのピクセル寸法を軸ごとに変更します。

倍率の計算は「入力Width × X方向の倍率」「入力Height × Y方向の倍率」です。端数のピクセル寸法や上限など、入力条件に依存する細部は実機で確認してください。

### Only Use Filter in HiQ

HiQ以外の処理では、通常、速度を優先してNearest Neighbor（近傍画素を選ぶ方式）が使われます。このチェックをオフにすると、HiQ以外でも`Filter Method`で選択したフィルターを使います。

編集作業中のプレビューだけ輪郭が粗く見える場合は、まずHiQの状態とこのチェックを確認してください。設定を変えたときはViewerで文字の輪郭や細線を比較します。

### Filter Method・Window Method

解像度を変えるとき、元の画素から新しい画素値をどう求めるかを指定します。21.1 ManualにはBox、Linear、Quadratic、Cubic、Catmull-Rom、Gaussian、Mitchell、Lanczos、Sinc、Besselなどが記載されています。

- 細かな線の多いグラフィックでは、縮小後の文字や輪郭が残るかを確認します。
- 撮影素材では、細部のシャープさだけでなく、輪郭の不自然な縁取りも確認します。
- SincやBesselを選ぶと`Window Method`を追加設定できます。これらは計算範囲を有限に近似するための項目です。

高負荷な方式があらゆる素材で最適とは限りません。Manualも、縮小時にはLinearを使う例や、Catmull-Romによるシャープさの違いを説明しています。

### Change Pixel Aspect

この項目をオンにすると、出力の`Pixel Aspect`を変更できます。Pixel Aspectは**1ピクセルの表示上の縦横比**であり、Width / Heightという**ピクセル個数**とは別の情報です。

正方形ピクセルの映像を半分の解像度にしたいだけなら、通常はPixel Aspectを変更する必要はありません。非正方形ピクセルの素材を扱うときは、[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)と合わせて確認します。

### Edges

21.1 ManualのScale節では、縮小時に画像の端をどう扱うかを選ぶ`Edges`メニューにも言及しています。ただし同節には選択肢ごとの挙動が詳しく列挙されていないため、ここでは個別モードの動作を断定しません。端の見え方が問題になるときはInspectorに表示される選択肢とViewerを照合してください。

## 運用例1：素材の解像度を半分にしてから合成する

3840×2160の背景素材を、1920×1080の出力Imageとして扱いたい場合を考えます。

```text
背景 MediaIn（3840×2160） → Scale（Size 0.5） ─┐
                                             ├─ Merge → MediaOut
タイトル画像 ─────────────────────────────────┘
```

1. 背景のMediaInからScaleのInputへ接続します。
2. `Lock X/Y`をオンにして`Size`を`0.5`にします。Scaleの出力は1920×1080になります。
3. Scaleの出力をMergeの**Background**へ接続します。MergeはBackgroundを基準に出力解像度を決めるため、合成の出力も1920×1080になります。
4. タイトル画像をMergeの**Foreground**へ接続し、Merge側で表示位置・大きさを調整します。

Scaleを**Foreground側だけ**へ入れた場合、通常はMergeの出力解像度は変わりません。背景側の解像度を維持したまま前景素材のピクセル寸法だけ変えたい場合と、合成全体の基準解像度を変えたい場合とで接続位置を分けます。

## 運用例2：異なる入力解像度を「常に半分」にする

同じNode構成へ1920×1080と3840×2160の素材を入れ替えて使うなら、ScaleのSize=`0.5`でそれぞれ960×540、1920×1080になります。素材の解像度が変わっても倍率が一定なので、前処理として一貫したルールを保てます。

一方、「どの素材も必ず1920×1080に出力する」という要件にはScale単独では適しません。こちらは[Resize](./resize)のWidth / Heightを1920 / 1080に設定します。

## Transform・Resize・Cropとの使い分け

| Node | 変更するもの | 使いたい場面 |
| --- | --- | --- |
| [Scale](./scale) | 出力ImageのWidth / Heightを倍率で変更 | 入力に対して常に半分、2倍など |
| [Resize](./resize) | 出力ImageのWidth / Heightを指定値へ変更 | どの素材も1920×1080に統一 |
| [Transform](./transform) | Imageの解像度を維持して内部の配置・見た目を変更 | 位置や拡大率をアニメーション |
| [Crop](./crop) | 残す範囲とキャンバス寸法を変更 | 特定の範囲を切り出す |

Scaleは画像の物理解像度を変えるため、**Sizeなどをフレームごとにアニメーションさせる運用は21.1 Manualでも推奨されていません**。時間とともに拡大する見た目を作りたい場合は、まずTransformを使います。

## 実機の参考例

<!-- capture-reuse:R54 -->

1920×1080の同じチャートをScale1へ渡し、X/YをロックしてSize 0.5にした例です。左のScale1と右のResize1はどちらも960×540で、Viewerは40%です。

[![S24の実機Node Editorの接続](/img/fusion/captures/S24/graph.png)](/img/fusion/captures/S24/graph.png)

[![S24のScaleのSize 0.5設定](/img/fusion/captures/S24/scale-inspector.png)](/img/fusion/captures/S24/scale-inspector.png)

[![S24のScaleとResizeの960×540出力](/img/fusion/captures/S24/scale-compare.png)](/img/fusion/captures/S24/scale-compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS24の参考例です。Scaleの倍率と出力寸法を確認した固定例です。Pixel Aspectやフィルタ画質、全Controlの範囲は含みません。 [撮影条件と確認範囲](/img/fusion/captures/S24/capture.json)

## 関連する考え方

- [解像度 / アスペクト比](../../learn/03-space/resolution-aspect)
- [正規化座標](../../learn/03-space/normalized-coordinates)
- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition)
- [Merge](../compositing/merge) — 背景入力が合成の出力解像度を決める

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 120「Transform Nodes」、pp.2876–2878。ScaleのInput、Lock X/Y、Size、Only Use Filter in HiQ、Change Pixel Aspect、Filter Method、Window Method、Edgesへの言及と、Merge Backgroundが出力解像度を決める例を確認しました。

内部REGID、Edition差、Edgesの選択肢別挙動、端数ピクセル寸法の扱い、実機レンダリング結果・性能は未検証です。そのため`verification: partial`を維持します。
