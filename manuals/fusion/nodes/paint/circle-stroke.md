---
title: "Circle Stroke"
description: "Paint内部のCircle。中心と半径を調整して円形の塗りを作り、位置や大きさをアニメーションする。"
doc_type: node
term_id: circle-stroke
term_short: "Paint内のCircleは、中心と半径を変更できる円形描画要素。独立したFlowノードではない。"
verification: partial
aliases: [Circle Stroke, Circle]
concepts: [paint, image-data]
nodes: [Circle Stroke]
node_family: paint
inputs: []
outputs: []
tasks: [paint, animate]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Circle Stroke（PaintのCircle）

**Circleは、[Paintノード](./paint.md)の中で円形の領域を描くツール**です。中心位置と半径を変えられるため、映像上の丸い目印、図形の塗り、円が広がるアニメーションなどに使えます。描いた後も形状や表示期間を調整できます。

本サイトの項目名は「Circle Stroke」ですが、**DaVinci Resolve 21.1 Reference ManualのPaintツール一覧では「Circle」**と記載されています。単独のFusion Flowノードではなく、Paint内部で作成する描画要素です。「Circle Stroke」という名前の独立ノードをAdd Toolで探す必要はありません。

## 入力と出力

Circle自体にはFlow上の入力・出力端子はありません。画像を受け渡すのは親のPaintノードです。

- **PaintのInput（オレンジ）**：描画先となる2D画像を接続する必須入力。MediaInやBackgroundなどをつなぎ、この画像の大きさが描画キャンバスになります。
- **PaintのEffect Mask（青）**：任意のマスク入力。接続したマスクでPaintの処理範囲を制限します。Circleの形状を受け取る端子ではありません。
- **Paintの出力**：円形の描画を反映した2D画像。MergeやMediaOutなど、画像を扱う後段へ接続できます。

映像へ直接描く最小構成は次のとおりです。

```text
MediaIn → Paint（内部でCircleを作成）→ MediaOut
```

元映像を上書きせず円だけを別レイヤーとして重ねるなら、透明なBackgroundを描画先にします。

```text
Background（映像と同じ解像度、Alpha 0）→ Paint ─→ MergeのForeground
MediaIn ──────────────────────────────────────→ MergeのBackground
Merge → MediaOut
```

後者ではPaintの出力だけを非表示にしたり、Mergeで合成量を変えたりできます。**円を描くためだけなら、クローン元画像の接続は不要**です。

## Circleで何を編集できるか

Resolve 21.1 Manualでは、Circleは**中心位置（center）と半径（radius）をアニメーションできる円形ツール**と説明されています。自由な経路を制御点で組み立てる[Polyline Stroke](./polyline-stroke)とは異なり、円形という基本形を保ちながら位置と大きさを調整する用途に向きます。

1. FlowでPaintノードを配置し、MediaInまたはBackgroundなどの2D画像を入力につなぎます。
2. Paintを選択し、Viewer上部のPaintツールバーから**Circle**を選びます。
3. Viewer上で円形を作成し、Inspectorで描画色や不透明度を調整します。
4. 必要な位置と大きさに合わせて中心と半径を調整します。
5. 描画が済んだらPaintツールバーを**Select**に切り替えます。後から選び直せる描画要素は、Inspectorの**Modifiers**タブに一覧表示されます。

Circleは**コンポジション全体が初期表示期間**です。必要な区間だけ描画を残したい場合は、Keyframes Editorでその円の表示期間を短くできます。表示期間の調整と、中心・半径のアニメーションは別の操作です。

### StrokeのWrite Onと混同しない

線が道筋に沿って伸びるアニメーションは、[Stroke](./stroke)や[Polyline Stroke](./polyline-stroke)の**Write On**が適しています。一方、Circleは円の中心と半径を変えられる**図形ツール**です。円を徐々に大きくしたいときは半径をアニメーションします。

21.1 Manualの**Stroke Animation / Write OnはStroke・Polyline Strokeなどのベクトルストローク用**として説明されており、Circleに同じWrite On設定があるとは確認できません。円周に沿って線が描かれる表現と、塗られた円が拡大する表現を区別してください。

## 制作例

### 動画上に丸い注目マークを出す

製品のボタンを円形の目印で示す例です。MediaInとは別に透明BackgroundをPaintへ入力し、Circleを一つ作ります。色と不透明度を設定し、対象のボタンへ円の中心を合わせます。

画面上に目印を出したい数秒間だけKeyframes Editorで表示期間を設定します。対象が画面内を動く場合は、中心位置を必要なフレームごとに調整します。Trackerによる自動追従が必要なら、追跡結果とのパラメータ接続を実機で確認してから使ってください。**Circleを作成するだけで映像の対象を自動追跡するわけではありません。**

この方法では円の描画が透明レイヤーに分かれているため、映像の色調整や後段の合成と独立して表示を調整できます。

### 画面の中で塗りつぶした円を広げる

グラフィックのアクセントとして、小さな色付きの円が大きくなる演出を作ります。

1. 透明Background → Paint → MergeのForegroundを接続し、MediaInはMergeのBackgroundへつなぎます。
2. Paint内部にCircleを作り、円の色を設定します。
3. 開始フレームでは小さな半径にし、終了フレームでは目的の大きさになるよう半径を変化させます。
4. キーフレーム間を再生し、拡大速度と画面端の見え方を確認します。

**変わっているのはPaint内部で描く円の半径**です。映像全体にTransformで拡大をかける方法とは、影響する対象が異なります。円を画面全体の切り替えに使う場合は、画面四隅まで覆える大きさか確認します。

### 円形の画素コピーとは使い分ける

人物の衣服にある小さなマーカーを、近くの布地で覆う場合を考えます。この用途で必要なのは単色の円ではなく、**別の場所の画像を円形に切り取って複製する処理**です。その場合は[Copy Ellipse](./copy-ellipse)（21.1 ManualでいうCopy Circle系）などのコピー用Paint要素を検討します。

Copy系の形状では、Manualに従って複製元の画像をPaintに指定し、Fill TypeをImageにする必要があります。単にCircleを作り、色で塗るだけでは布地の質感や照明は復元されません。

## 関連項目と注意点

- [Paint](./paint.md)：画像入力、Effect Mask、ブラシ・Clone・Modifiersなど親ノードの構成。
- [Paintの概要](./)：Stroke、Shape、Copy系、Groupの使い分け。
- [Polyline Stroke](./polyline-stroke)：自由な輪郭を制御点で作り、経路上に線を描く。Write Onの用途はこちら。
- [Copy Ellipse](./copy-ellipse)：円／楕円形の範囲で画像をコピーする用途。Circleの色付き描画とは別。
- [Paint Group](./paint-group)：複数の描画要素をまとめて位置・大きさなどを調整する。
- [Fill](./fill)：隣接した近い色の画素を探して塗りつぶす。中心と半径を指定するCircleとは範囲の決め方が違う。

「円」を作りたいだけならCircleが適していますが、**別ノードの処理範囲を制限するマスク**を作りたい場合は、Paintの描画要素ではなくMask系を選びます。Paintの2D画像出力とMaskの単一チャンネル出力は同じデータではありません。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 80「Paint」pp.1750–1752：Shape Drawing Tools、編集可能な表示期間、Copy Shapeでの画像参照。
- 同Chapter 113「Paint Node」pp.2638–2640：PaintのInput／Effect Mask、透明Backgroundを使った構成、Circleのcenter・radius、初期表示期間。
- 同Chapter 113 pp.2642–2645：InspectorのBrush／Apply／Stroke Controls、Modifiers、Write Onが対象とするストローク。

本文の「Circle」は21.1 Manualで確認できたツール名です。**個々のInspector項目の正確な内部ID、既定値、設定可能範囲、Trackerとの実機接続手順、製品Edition差は確認していない**ため、`verification: partial`のままにしています。
