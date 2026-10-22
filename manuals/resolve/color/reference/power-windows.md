---
title: Power Windows（形で補正範囲を指定する）
description: DaVinci Resolve ColorページのPower Windowsで選択範囲を作り、Window・Qualifier・Trackerを組み合わせて局所補正する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Window, Linear, Circular, Polygonal, Curve, Gradient, Transform, Softness, Invert, Mask]
tasks: [secondary-grading, regional-isolation, shape-mask]
level: intermediate
updated: "2026-10-22"
---

# Power Windows（形で補正範囲を指定する）

**Power Window**は、Colorページで補正が作用する領域を、画像の位置と形によって選択する機能です。人物の顔を少し明るくする、空だけを落ち着かせる、背景から特定の物体を除外するといった二次補正に使います。Window自体が色を変えるわけではなく、**そのノードで行う補正をWindowで選んだ領域に限定**します。

[HSL Qualifier](./hsl-qualifier)は色相・彩度・輝度の条件で画素を選ぶのに対し、Windowは画面上の形で選びます。青い服を選んだら青空まで入った、というときにWindowで服のある場所へ範囲を限定できます。

## 5種類のWindow

| 種類 | 形と調整 | 使用例 |
| --- | --- | --- |
| **Linear** | 四辺を動かせる四角形・台形 | 建物の面、床 |
| **Circular** | 円・楕円 | 顔、光の周辺 |
| **Polygonal** | 制御点を増やせる多角形 | 直線や角が多い物体 |
| **Curve** | クリックとドラッグで自由な曲線・角を描く | 車体など複雑な輪郭 |
| **Gradient** | 境界線を挟んで柔らかく変化する範囲 | 空など画面の広い部分 |

顔ならCircular、空ならGradientから始め、形が合わないときだけCurve等を使います。複雑なWindowほど良いとは限りません。

## 新しい補正ノードでWindowを作る

1. Colorページで対象ショットを選び、全体の露出・ホワイトバランスを整えます。
2. [Node Graph](../learn/color-node-graph)に**新しいシリアルノード**を追加します。一次補正に使っていた既存ノードへWindowを追加すると、そのノードの全補正がWindow内だけに制限されてしまいます。
3. 新しいノードを選び、**Windowパレット**で目的に合う形を追加します。
4. Viewer上で位置・サイズ・形を合わせます。WindowパレットのTransformにはSize、Aspect、Pan、Tilt、Rotate、Opacityなどがあります。
5. **Softness**で輪郭をなじませ、同じノードの[Primaries](./primaries-color-wheels)などで明るさや色を控えめに調整します。
6. Windowの輪郭表示を隠して通常映像で見直し、補正ノードのオン／オフとショットの複数フレームで比較します。[Scopes](./scopes)は補正後の信号の確認に使います。

Windowの位置とSoftnessを正しく合わせても、補正量が大きければ境界は目立ちます。**形の問題か、補正量の問題か**を分けて点検します。

## 形の調整とSoftness

CircularはViewer内をドラッグして移動し、ハンドルで大きさ・縦横比を調整します。Linearは四隅や辺を動かせます。Curveはクリックで角、クリック＆ドラッグで曲線の制御点を追加し、最初の点へ戻って閉じます。

Softnessは端に近づくほど補正の効き方を弱めます。**Circular／Gradientは基本的に1つ、Linearは四辺ごと、Polygonal／CurveはInside SoftnessとOutside Softness**を調整できます。顔の輪郭にWindowをぴったり合わせると、かえって境界が見えることがあります。顔より少し大きく置いて周辺となじませ、背景まで変わっていないかを確認します。

## InvertとMask、複数Window

**Invert**は、そのWindowの内側と外側を反転します。顔の外側を少し暗くしたい場合などに使います。

1つのノードに複数Windowを追加することもできます。**Mask**の状態はほかのWindowへ領域を追加するか、そこから差し引くかを決めます。Invertとは異なる操作です。例えば空の広いWindowから手前の人物を差し引けば、人物を守りながら空を調整できます。別の領域へ別の色調整が必要なら、複数のWindowを無理に1ノードへまとめず、補正ノードを分けます。

## Qualifierとの交差

同じノードでWindowと[HSL Qualifier](./hsl-qualifier)を併用すると、既定では**両方の条件を満たす領域だけ**が補正対象になります。2つのキーを単純に足し合わせるわけではありません。

例として、青いシャツの彩度だけを下げたい場合、Qualifierで青を選ぶと空も選択されることがあります。そこでシャツ周囲にWindowを追加すれば、**色条件と位置条件の重なり**だけへ補正を限定できます。選択が消えた場合は、色の範囲とWindowの位置が本当に重なっているかを確認します。

## 操作例：顔を明るくする

1. ベース補正の後に、顔用のシリアルノードを置きます。
2. Circular Windowを顔より少し大きく配置してSoftnessを調整します。
3. Primariesで顔の明るさを控えめに上げ、頬・髪・首だけでなく背景も見て補正の境界を点検します。
4. ノードをオン／オフして視線誘導の効果と不自然さを比べます。
5. 顔が動くショットでは、Windowが動きに追従しているかを複数フレームで確かめます。必要ならTrackerまたはキーフレームを使います。

完成判定は、顔が見やすくなり、再生しても境界やWindowのずれが目立たず、元の光の方向性が保たれていることです。顔の輝度を一定の数値へ揃えることではありません。

## 操作例：空の明るさを抑える

1. 空用ノードを作り、Gradient Windowを配置します。地平線の位置と境界のなだらかさを合わせます。
2. 空の明るさを下げ、雲の階調と地上の被写体に不自然な変化がないかを見ます。
3. 人物に補正がかかる場合は、差し引きのWindowで除外するかCurveによる形の定義を検討します。
4. カメラのパン・ティルトで地平線が動く場合、固定Windowのままではずれるため、ショット全体を確認します。

## 動く被写体：Trackerは別機能

Power Windowは**範囲の定義**、Trackerはその範囲を映像の動きに**追従させる**ための機能です。公式Colorページには、Windowを選択してTrackerパレットを開き、動きに適した解析を実行する基本的な流れが示されています。

追跡後も顔や服がWindowからはみ出さないか、遮蔽物の前後で関係ない場所に補正が残らないか、急なカメラ移動で形がずれないかを確認します。Trackerの詳細な解析条件は別記事で扱います。

## 症状から確認する

| 症状 | 確認点 |
| --- | --- |
| 全体補正が突然一部にしか効かない | 一次補正のノードへWindowを追加していないか |
| 補正領域の輪郭が目立つ | Softness、Windowの位置、補正量 |
| 内側ではなく外側が変わる | Invertの状態 |
| 2つのWindowの関係が意図と違う | Mask／InvertとWindowの有効状態 |
| Qualifierとの併用で何も選ばれない | 2つの選択範囲の交差が存在するか |
| 動画再生時だけ背景が変わる | Tracker／キーフレームの追従状態 |

## 出典・対象版・検証範囲

- **対象版：DaVinci Resolve 21.1**。Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、**Color / Chapter 138「Secondary Windows」、PDF p.3265–3279**。Windowの種類、ノードとの関係、Transform・Softness、Invert・Mask、Qualifierとの交差を確認。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)。
- Blackmagic Design、[DaVinci Resolve — Color（公式日本語ページ）](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)、「Power Windowでオブジェクトに的を絞る」「オブジェクトの追跡」。
- **資料で確認**：上記の機能・操作構造。**実用例は学習用の構成**で、特定映像を用いた実機テストではありません。21.1実機UI・ショートカット・最適数値・Free／Studio差・追跡精度は未検証です。

関連：[HSL Qualifier](./hsl-qualifier)／[Primaries](./primaries-color-wheels)／[Scopes](./scopes)／[Node Graph](../learn/color-node-graph)／[Colorページ索引](../)
