---
title: "Fill"
description: "Paint内部で、指定した画素に隣接する色の近い領域を塗る描画要素。Color Space、Channel、期間設定と制作例を解説。"
doc_type: node
term_id: fill
term_short: "Paint内でクリックした位置から、色やチャンネルの値が近く、つながっている画素を塗る描画要素。独立したFlowノードではない。"
verification: partial
aliases: [Fill]
concepts: [paint, image-data]
nodes: [Fill]
node_family: paint
controls: [Color Space, Channel]
inputs: []
outputs: []
tasks: [paint, cleanup]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# Fill（つながった色領域を塗る）

**Fillは、[Paint](./paint.md)の中で使う塗りつぶしツール**です。Viewerで指定した位置の周囲から、色の近い画素がつながっている範囲を探し、その範囲へ色を塗ります。例えば、輪郭が明確な看板の一部分や、透明背景に描かれた図形の内部をまとめて塗り替える場合に使います。

ここでの「つながっている」は、画像内で隣接する画素をたどって到達できることです。画面の別の場所に同じ色があっても、間に異なる色の領域があれば、必ず一緒に塗られるわけではありません。Fillの選択方法は、色が近い部分を選択する[Wand Mask](../masks/wand-mask)に似ています。ただし、Wand Maskが後段の効果を制限するマスクを作るのに対し、FillはPaintの描画として画像に色を加えます。

## 入力と出力

Fillは**Paint内部の描画要素**であり、Flow上にFill専用のノードや入出力端子が現れるわけではありません。

- **PaintのInput（オレンジ）**：必須の2D画像入力。どの画素が隣接し、どの色に近いかを判断する元の画像です。MediaInでもBackgroundでも構いません。入力画像の解像度が作業キャンバスの大きさになります。
- **PaintのEffect Mask（青）**：任意。Paintの適用範囲を別のマスクで制限します。Fillが色を調べるための専用入力ではありません。
- **Paintの出力**：Fillを含む描画結果を反映した2D画像。MergeやMediaOutへ渡せます。

~~~text
MediaIn → Paint（内部でFillを使用）→ MediaOut
~~~

このページのFrontmatterでinputs / outputsを空配列にしているのは、**Fill自身には独立したFlow端子がない**ためです。親のPaintには上記の画像入力・Effect Mask・画像出力があります。「Paint形式」という別種のデータを送受信するわけではありません。

## 塗る範囲の決まり方

Paintを選択し、Viewer上部の描画ツールバーから**Fill**を選びます。対象領域の内側に塗りつぶしの基準点を置くと、そこから隣接する似た色の画素を対象にします。

例えば、白い背景の中央に黒い図形がある場合、黒い図形の内側を指定すれば、周囲の白い背景まで無条件に塗る操作ではありません。ただし境界にアンチエイリアス（輪郭を滑らかにするための中間色）やノイズが含まれると、意図した境界と塗りの境界が一致しないことがあります。

### Color Space

**Color Space**は、Fillの中心付近で色を調べ、塗りつぶしの対象範囲を判定するときの色空間を選ぶメニューです。単純に「画像全体を別の作業色空間へ変換する」設定ではありません。

同じ素材でも、色の近さをどの色空間で評価するかによって、対象に入りやすい画素が変わります。似た色の背景へ塗りが広がる場合や、境界の一部が取り残される場合は、結果を見ながら選択を見直します。**21.1 Manualはこのメニューの役割を説明していますが、選択肢の全名称や初期値までは本記事で確定していません。**

### Channel

**Channel**は、Fillの対象を判定する際に使う色チャンネルを選びます。Manualでは、**Alphaを選ぶとAlphaチャンネルで隣接した画素を基準に塗る**例が明示されています。

RGBの見た目では違う色でも、Alphaが同じ値で連続していれば、Alphaを基準にした結果は広い範囲になり得ます。逆に、透明部分と不透明部分を区別したい素材では、Alphaを基準にする意味があります。選んだChannelは「塗る位置の判定」に関わる設定なので、最終的に変更される画像の色・AlphaはPaintの描画設定と出力を見て確認してください。

### 塗る色と表示期間

描画する色はPaintの**Color Apply Mode**および色の設定で指定します。**Fillという描画ツールの種類**と、筆先が色を描くか・別画像を複製するかを決める**Apply Mode**は別の選択です。Copy系の形状で使う「Fill Type = Image」とも混同しないでください。

Fillで作った要素は、既定ではコンポジションの全期間に表示されます。短い区間だけ塗りたい場合は**Keyframes Editor**で表示期間を変更します。指定した位置の色がフレームによって変化すると、同じ設定でも塗られる領域が変わり得ます。表示期間の設定だけで、動く物体の輪郭へ自動追従するわけではありません。

## 制作例1：単色に近い看板の一部分を塗り替える

固定カメラで撮った看板に、他の部分と区別しやすい単色の領域があるとします。その領域を別の色で仮に置き換え、配色を確認する作業です。

1. **MediaIn → Paint → MediaOut**を接続し、Paintの出力をViewerに表示します。
2. Paintで**Fill**を選び、Colorの描画設定で置き換えたい色を指定します。
3. 看板の対象領域の内側を指定してFillを作ります。隣接している色の近い範囲が塗られたか、Viewerで確認します。
4. 似た色の周囲まで塗られたり、輪郭に塗り残しが出たりする場合は、**Color Space**や**Channel**を見直します。
5. 前後のフレームも再生します。照明・反射・被写体の位置が変わると対象範囲が変わるため、継続的な補正が必要な場合はマスクやトラッキングを組み合わせる方法も検討します。

これは色の近い連続領域を利用する簡易的な塗り替え例です。素材の模様、陰影、質感を自動的に保って色だけを正確に置換する機能ではありません。質感を保持したまま色を変えたい場合は、選択範囲を作った上で後段の色調整を使う方が適することがあります。

## 制作例2：透明背景の図形をAlphaで区別する

透明な背景の上に、輪郭のはっきりした不透明なアイコンが描かれている画像を使います。背景の透明部分とアイコンの不透明部分を区別して、アイコン側を塗り替える例です。

~~~text
Loader / MediaIn（透明背景のアイコン）→ Paint（Fill）→ MediaOut
~~~

1. アイコン画像をPaintのInputへ入れます。**透明なBackgroundだけ**では、アイコンの輪郭を判断する画素が存在しません。
2. Fillの**ChannelをAlpha**に切り替え、アイコンの不透明部分を基準として指定します。
3. 塗りがアイコンの内部に収まるか確認します。透明な周囲を誤って指定すると、広い透明領域が一続きの対象になることがあります。
4. Color Apply Modeの色と結果のAlphaを確認し、必要な合成先へ接続します。

対象領域の判定にAlphaを使うことと、**AlphaだけのMaskを出力すること**は異なります。マスクを作って別のノードのEffect Maskへ接続したい場合は、[Wand Mask](../masks/wand-mask)や[Mask Paint](../masks/mask-paint)を使います。2D画像とマスクの違いは[Imageの基礎](../../learn/02-data/image)と[Maskの基礎](../../learn/02-data/mask)を参照してください。

## Fillが適していない場合

- **不要物を周囲の画素で隠したい**：Fillは連続領域を色で塗るので、元画像の木目や壁の模様を復元しません。別の位置の画素を使う[Copy Polyline](./copy-polyline)や[Clone Multistroke](./clone-multistroke)を検討します。
- **色の近い離れた場所も一度に選びたい**：Fillは隣接した画素をたどる方式です。画像全体から条件に合う色を選ぶ処理と同じではありません。
- **動く対象の境界を厳密に保ちたい**：フレーム間で色の分布が変わる素材では、Fillだけに輪郭の安定を任せない方が確実です。必要に応じてマスク、追跡、キーフレームを使います。

Paint内部のほかの描画方法との選び分けは[Paintカテゴリ概要](./index.md)を参照してください。

## 実機例：基準点を移して塗る領域を変える

<!-- capture-case:S95 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%で撮影しました。LoaderのチャートをPaintへ入力し、Paintの画像出力をMediaOutへ接続しています。左が入力、右が描画後の画像です。

[![LoaderからPaintを経てMediaOutへ渡す実機Graph、FillはPaint内部に保持](/img/fusion/captures/S95/graph.png)](/img/fusion/captures/S95/graph.png)

[![実機FillのInspector、今回変更した座標と描画設定を表示](/img/fusion/captures/S95/inspector.png)](/img/fusion/captures/S95/inspector.png)

Fillを選び、赤いパッチの内部をクリックしました。実際に描いたFill1を選択するとCenter X0.11328125／Y0.3125、Color Space RGB、Channel RGB、Range0.1、Soft Edgeの範囲0.05、白のRGBA各1、Opacity1が表示されました。下の出力では赤いパッチだけが白くなり、隣の黄色いパッチは残っています。

[![フレーム0、Fillの基準点を赤いパッチに置くと、その領域だけが白くなる実機比較](/img/fusion/captures/S95/compare.png)](/img/fusion/captures/S95/compare.png)

同じFill1のCenterをX0.27／Y0.3125へ移すと、今度は黄色いパッチが白くなり、赤いパッチは入力の色へ戻りました。Color SpaceやChannelを変えずに、判定の基準点を移した比較です。

[![FillのCenter Xを0.27へ移すと黄色いパッチだけが白くなり、赤は元の色に戻る実機比較](/img/fusion/captures/S95/yellow.png)](/img/fusion/captures/S95/yellow.png)

最後はCenterをX0.11328125／Y0.3125へ戻しています。

[![フレーム119でもPaint内部のFillによる描画結果が残る実機比較](/img/fusion/captures/S95/frame119.png)](/img/fusion/captures/S95/frame119.png)

フレーム0と119で同じ結果が残ることを確認し、最後は0へ戻して保存しました。全120フレームを個別に検査した例ではありません。内部REGIDは`Fill`、描画要素は`Fill1`でした。

Color Space・Channel・Range・Soft Edgeの変更、Alphaを使った判定、同じ色の離れた複数領域、期間変更、実写、筆圧、他OS・Edition差と性能は未確認です。`verification: partial`を維持します。

[再現用Graph](/img/fusion/captures/S95/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S95/capture.json)

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 113「Paint Node」**p.2640**：FillがWand Maskに似た方式で、選んだ色チャンネルに基づき似た色の隣接画素を塗ること、初期表示期間がコンポジション全体でKeyframes Editorから変更できること。
- 同Chapter 113 **pp.2638、2642–2643**：Paintの画像入力・Effect Mask、InspectorのColor Space / Channel、Color Apply Modeの説明。
- 同Chapter 80「Paint」**pp.1747–1749、1752–1753**：PaintとMask Paintの違い、キャンバス解像度、Paintの描画色とApply Modeの扱い。

このページは21.1 Manualに記載された挙動を基に、接続例と使い分けを独自に説明しています。S95で内部REGID `Fill`、掲載したRGB／RGBと範囲設定、Center変更による塗り領域、フレーム0／119の出力を実機確認しました。Color Space／Channelの全選択肢、判定閾値の変更、Free／Studio差と上記未確認範囲は残るため、`verification: partial`を維持します。
