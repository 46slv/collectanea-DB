---
title: "Highlight"
description: "明るい部分に星形の光条を加えるFusion Node。発生源と表示範囲のマスク、光条の形や色の設定を解説。"
doc_type: node
term_id: "highlight"
term_short: "Highlightは、入力画像の明るい部分から星形の光を伸ばす2D Effect Node。"
verification: partial
aliases: ["Highlight", "HIL"]
concepts: ["image-data", "mask-data"]
nodes: ["Highlight"]
node_family: "effects-film"
controls: ["Low", "High", "Curve", "Length", "Number of Points", "Angle", "Merge Over", "Red Scale", "Green Scale", "Blue Scale", "Alpha Scale"]
inputs: ["image", "mask", "mask"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Highlight

Highlight [HIL]は、入力画像の**明るい部分から星形の光の筋（光条）を伸ばす**Nodeです。夜景の街灯、イルミネーション、金属やガラスの強い反射などに、スターフィルターを通したような輝きを加えます。

光条が生じる場所は画像の明るさから決まります。画面内の光源位置を手動で指定し、レンズ内反射を組み立てる[Hot Spot](./hot-spot.md)とは、効果の作り方が異なります。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualで確認できる入力は次の3つです。

- **Input（オレンジ）**：加工する2D <Term id="image">Image</Term>。その中の明るい画素から光条が作られます。
- **Effect Mask（青、任意）**：完成した効果の表示範囲を制限する<Term id="mask">Mask</Term>。処理後に適用されるため、光条がマスクの境界を越えて伸びた部分も切り取られます。
- **Highlight Mask（白、任意）**：光条を**作り始める場所**を制限するマスク。元画像を先にこのマスクで絞り、その範囲から光条を作って元画像へ重ねます。マスク内の光源から生じた光条は、マスクの外まで伸ばせます。

出力は光条を適用した2D Imageです。**Merge Over**を無効にすると光条のみを出力でき、後段で色を調整してから元画像と合成する構成を取れます。

例えば看板の発光部分だけから長い光条を出したい場合、Effect Maskでは光条の先端まで切られることがあります。Highlight Maskなら発生源だけを看板へ限定し、光条は看板の外へ広げられます。

## 主な設定項目

### 発生する明るさと光条の形（Controls）

- **Low / High**：光条を発生させる輝度の範囲です。Lowより暗い部分では発生せず、Highより明るい部分では効果が最大になります。中間の画素には段階的に効果がかかります。光条が背景全体から発生する場合は、まずこの範囲を見直します。
- **Length**：光条の長さ。短くすると明点の周囲に収まり、長くすると遠くまで筋が伸びます。
- **Number of Points**：中心から伸びる光条の本数。数を変えると十字状や多方向の星状など、光の印象が変わります。
- **Angle**：光条全体の向きを回転させます。
- **Curve**：光条が外側へ向かって暗くなる速さです。値を高くすると中心近くで暗くなり、低くすると遠くまで明るさが残ります。
- **Merge Over**：有効なら元画像に光条を重ね、無効なら光条のみを出力します。光条だけを別に色補正したい場合に使います。

Low / Highは「どこから光が出るか」、Length・Number of Points・Angleは「どう伸びるか」、Curveは「伸びた光がどう減衰するか」を調整するものです。まず輝度範囲を決め、次に形を調整すると変化を判断しやすくなります。

### 色と透明度（Color Scale）

**Red / Green / Blue Scale**は、光条が外へ伸びるにつれて各色がどう弱まるかを調整します。**Alpha Scale**を下げると、外側へ減衰する光条がより透明になります。元画像の光源が青みを帯びている場合は、色チャンネルの減衰も合わせると自然に見せやすくなります。

このタブにはViewerから色を選択する**Pick**操作もあります。ManualではPickを押したままViewerへドラッグする方法が案内されています。

## 最小構成

明るい被写体の写った画像へHighlightを挿入し、Merge Overを有効にして結果を確認します。

~~~text
MediaIn → Highlight → MediaOut
~~~

変化が見えない場合は、入力画像に十分明るい領域があるか、Low / Highがその輝度を対象にしているかを確認します。光源の場所を指定する専用のTrackerは、この最小構成には不要です。

## 運用例：夜景の看板だけに星形の光を付ける

夜景映像の看板だけを発生源とし、周囲の窓や街灯には同じ光条を作らない例です。

1. 夜景のMediaInをHighlightのInputへ接続し、Merge Overを有効にします。
2. Low / Highを調整して、看板の明るい文字や電球から光条が出るようにします。この時点でほかの街灯から光が出ても構いません。
3. RectangleやPolygonで看板を囲い、**Highlight Mask**へ接続します。これで看板内の明るい部分だけが発生源になりますが、光条は囲いの外へ伸ばせます。
4. Number of Pointsで本数を決め、Lengthで長さ、Angleで向きを合わせます。Curveで光条の先端がどう暗くなるかを整えます。
5. Color Scaleで色と透明度の減衰を調整し、元映像の光と極端に食い違わないように仕上げます。

~~~text
夜景（MediaIn） ─────────→ Highlight → MediaOut
                                ↑
看板を囲うRectangle/Polygon → Highlight Mask（白）
~~~

看板が移動する映像ではマスクも追従させる必要があります。Highlight Maskは発生源を指定する入力であり、映像を自動追跡する機能ではありません。

**光条を別工程で色補正する場合**はMerge Overを無効にします。元画像を分岐し、Highlightの出力を処理した後にMergeのForegroundへ、元画像をBackgroundへ接続して合成する方法が考えられます。これはManualで確認できる「光条だけを出す」機能を利用した構成案で、明るさとAlphaの見え方は素材に応じて調整します。

## 使い分けと注意点

- **[Hot Spot](./hot-spot.md)**：指定した位置に光源やレンズ内反射を作るNode。複数の明点を自動的に星形へ変えるHighlightとは異なります。
- **[Rays](./rays.md)**：画像のAlphaや明るい領域から、指定した中心へ向かう放射状の光条を作るNode。Highlightではそれぞれの明点を中心に星形の光条が作られます。
- **Effect MaskとHighlight Mask**：前者は完成後の表示範囲、後者は光の発生源を制限します。マスクの外まで光を伸ばしたいときはHighlight Maskを使います。
- **光学的な正確さ**：撮影レンズの内部構造や絞り形状を測定して再現するNodeではありません。実写との一致は光条の方向・本数・長さ・減衰を見て調整します。

## 関連する考え方

- [画像（Image）の基礎](../../learn/02-data/image.md)：2D Imageと出力。
- [マスク（Mask）の基礎](../../learn/02-data/mask.md)：処理する範囲の指定。
- [Effect / Filmノード一覧](./index.md)：関連効果の入口。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 97「Effect Nodes」、**Highlight [HIL]（pp.2278–2281）**を一次資料としています。3入力、Highlight Maskの処理前マスク、Low / High、Curve、Length、Number of Points、Angle、Merge Over、Color Scaleを確認しました。

夜景の例と別工程の合成は、確認済みの機能を組み合わせた運用案です。21.1実機での描画結果、Inspectorの初期値・数値範囲、内部REGID、edition差は未確認のため、verificationはpartialとしています。
