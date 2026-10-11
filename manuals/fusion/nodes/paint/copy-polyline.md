---
title: "Copy Polyline"
description: "Paint内部で自由な閉じた輪郭を作り、別の位置・画像の画素をコピーする描画要素。Source、Fill Type、Offset、編集と補修例を解説。"
doc_type: node
term_id: copy-polyline
term_short: "Paintの中で閉じた自由形状の範囲を作り、別の場所や画像の画素を複製する要素。独立したFlowノードではない。"
verification: partial
aliases: [Copy Polyline]
concepts: [paint, image-data]
nodes: [Copy Polyline]
node_family: paint
inputs: []
outputs: []
tasks: [paint, cleanup, clone]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Copy Polyline（Paintの自由形状コピー）

**Copy Polylineは、[Paint](./paint.md)の内部で閉じた輪郭を描き、その範囲へ別の位置や画像の画素をコピーする描画要素**です。例えば、斜めの窓枠に沿って貼られたマーカーを取り除きたいとき、四角形では余分な部分まで覆ってしまいます。Copy Polylineなら輪郭の曲がりや角度に合わせて領域を指定できます。

ここでいう「Polyline」は、点を順番に置いて線や輪郭を作る方法です。各点は**制御点**と呼ばれ、点の位置や曲線の曲がり方を後から変更できます。コピー範囲は閉じた輪郭なので、単に輪郭線を描く[Polyline Stroke](./polyline-stroke)とは結果が異なります。

## 入力と出力

Copy Polyline自体は**Flow上に独立した入出力端子を持ちません**。画像を処理して次のノードへ送るのは、Copy Polylineを保持する親のPaintです。

- **PaintのInput（オレンジ）**：必須の2D画像入力。コピー結果を描き込む画像です。接続した画像の大きさが作業キャンバスの解像度になります。
- **PaintのEffect Mask（青）**：任意。Paint全体の適用範囲を制限するマスクです。コピー元画像を渡す端子ではありません。
- **コピー元画像**：PaintのInspectorにある**Source Tool**へMediaInなどの画像ノードを指定し、コピー形状の**Fill TypeをImage**に設定します。
- **Paintの出力**：指定した輪郭に画素を複製した2D画像。MergeやMediaOutへ接続します。

~~~text
MediaIn → Paint（内部でCopy Polylineを作成）→ MediaOut
   └────→ PaintのSource Tool欄にも指定
~~~

Manualの「Shape Drawing Tools」は、Copy系の形状で**複製元ノードを指定すること**と**Fill Type = Image**を必要条件として挙げています。Paintの描画先InputとSource Toolは役割が異なります。特に描画先が透明なBackgroundの場合、Source Toolを設定せずに元映像の画素がコピーできるとは考えないでください。

## コピー範囲と参照位置を調整する

### 閉じた輪郭を作る

Paintノードを選び、Viewer上部のPaintツールバーから**Copy Polyline**を選択します。標準の**Click Append**では、Viewerをクリックするたびに制御点が増え、折れ曲がった輪郭を作れます。**Draw Append**では、ペンでなぞるように輪郭を描けます。コピー領域として使うため、**Closed**で輪郭が閉じていることを確認します。

作成後はViewerの編集ツールバーで点を修正できます。21.1 Manualには次の操作が掲載されています。

| 操作 | できること |
| --- | --- |
| **Insert** | 輪郭上に新しい制御点を追加する。 |
| **Modify** | 誤って新しい点を増やさずに、既存の点を移動・調整する。 |
| **Smooth / Linear** | 曲線の滑らかさと直線的な形状を切り替える。 |
| **Shape** | 複数の制御点を囲い、一括で変形する。 |
| **Reduce** | フリーハンド描画などで増えすぎた制御点を減らす。 |
| **Done** | 点の追加・個別編集を終え、形全体の移動・回転は可能な状態にする。 |

コピー後に輪郭を直したい場合は、Paintの選択ツールで要素を選び、ViewerまたはInspectorの**Modifiers**タブから編集します。多数の制御点を残すより、必要な角や曲線を少ない点で定義した方が、後から境界を合わせやすくなります。

### Source Tool・Fill Type・Offset

**Source Tool**はコピーに使う画像ノード、**Fill Type = Image**は領域を単色ではなく画像の画素で埋める指定です。**Offset**は、コピーしたい画素がどの位置から来るかを調整します。輪郭を不要物の上に置き、Offsetを動かして不要物のない場所の画素をその中に表示させます。

21.1 Manualは、Copy PolylineのOffsetを**アニメーション可能**としています。移動する対象を補修する場合、輪郭の位置と参照元の位置を別々に調整できます。ただし、Offsetだけで遠近変形や遮蔽の変化まで自動的に補正されるわけではありません。

別の時間の画像を使いたい場合には、Paintのクローン操作に**Time Offset**という時間方向の参照設定もあります。**位置を変えるOffset**と**参照フレームを変えるTime Offset**は別の操作です。参照先の設定と対応するInspector項目が実機で表示されることを確認しながら使ってください。

### 表示期間

Copy Polylineは既定で**コンポジションの全期間**に表示されます。数フレームだけ不要物が映る場合は、**Keyframes Editor**でCopy Polyline要素の表示期間を短くできます。これはコピー範囲の形やOffsetの変更とは独立した時間設定です。

## 制作例1：斜めの窓枠にあるマーカーを消す

固定カメラの映像で、窓枠の一部にマーカーが貼られているとします。近くに同じ材質・明るさのマーカーのない窓枠が見えています。

1. **MediaIn → Paint → MediaOut**を接続し、Paintの出力をViewerへ表示します。
2. Paintの**Source Toolへ元のMediaInを指定**し、Copy Polylineの**Fill TypeをImage**にします。
3. Viewerでマーカーの周囲を制御点で囲み、**Closed**で閉じた領域にします。窓枠の斜めの境界に合わせ、必要ならModifyで点を調整します。
4. **Offset**を調整し、マーカーのない窓枠の画素が領域内に入るようにします。枠の線や木目など、連続して見えるべき模様を優先して合わせます。
5. 前後のフレームを再生し、マーカーが動く、光が変わる、補修境界が見えるといった問題があれば、輪郭やOffsetを必要な区間で調整します。
6. 補修が不要になる区間では、Keyframes Editorで要素の表示期間を調整します。

**Copy Polylineは欠損部分を自動推定して生成するツールではありません。** 元映像に存在する別の画素を複製するため、コピー元に映る模様や影が周囲と合っているか確認する必要があります。

## 制作例2：補修を別のレイヤーとして合成する

元の映像へ直接Paintしたくない場合は、同じ解像度・**Alpha 0**のBackgroundをPaintの入力に使います。

~~~text
Background（同解像度・Alpha 0）→ Paint ─→ MergeのForeground
MediaIn ──────────────────────────────→ MergeのBackground
   └─────────→ PaintのSource Tool欄に指定
Merge → MediaOut
~~~

この構成では、Paint内でCopy Polylineの**Fill TypeをImage**に設定し、複製元としてMediaInを参照します。透明なBackground自体には補修に使える映像の画素がありません。Mergeで補修部分だけを重ねるため、必要に応じて合成量を調整できます。Merge出力で輪郭のAlphaや色の継ぎ目を確認してください。

透明BackgroundとMergeによるPaintの分離は21.1 Manualにある基本構成です。Copy Polylineを使う接続図は、その構成を応用した制作例です。

## 似たPaint要素との違い

- [Polyline Stroke](./polyline-stroke)：制御点で**線の経路**を作り、その経路に沿ってブラシ線を描きます。別位置の画素を閉じた範囲へコピーする用途とは異なります。
- [Copy Rectangle](./copy-rectangle)：直線的な四辺で囲む補修に向きます。矩形で足りるなら、自由形状より点の管理が簡単です。
- [Copy Ellipse](./copy-ellipse)：円・楕円形のコピー範囲を使います。丸いマーカーなどを囲む場合に向きます。
- [Clone Multistroke](./clone-multistroke)：短いブラシ補修を大量に行う場合に向きますが、描画後に個別ストロークの形を直接修正できません。
- [Paint Group](./paint-group)：複数の描画要素をまとめて移動・調整するときに使います。

Copy Polylineは独立したMaskノードではありません。**領域の中へ画素をコピーする**のが目的で、後段エフェクトの適用範囲だけを定義したい場合はMask系を選びます。Paint全体の位置づけは[カテゴリ概要](./index.md)を参照してください。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 80「Paint」p.1751：Copy系のShape Drawing Tools、Sourceノードと**Fill Type = Image**の指定。
- 同Chapter 80 pp.1753–1755、1766：Source Tool・Clone元位置・時間をずらした参照の説明。
- 同Chapter 113「Paint Node」pp.2638–2641：PaintのInput / Effect Mask、Copy Polylineの閉じた輪郭・**animatable Offset**・表示期間、Polylineの編集ツール。
- 同Chapter 113 p.2645：PaintのModifiersとコピー元表示の操作。

本記事の制作例はManualの説明を組み合わせたものです。**Resolve 21.1実機でのツールバーの正確な表示名、内部REGID、Copy Polyline固有のInspector項目の全数・初期値・範囲、およびFree／Studio差は未検証**のため、`verification: partial`を維持しています。
