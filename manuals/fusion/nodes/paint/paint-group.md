---
title: Paint Group
description: Paint内部の複数ストロークをまとめ、位置・角度・大きさを一括調整して追従させるためのグループ。
doc_type: node
term_id: paint-group
term_short: Paint内の複数の描画操作をまとめ、同じ移動・回転・拡大縮小を適用する機能。
verification: partial
aliases: [Paint Group]
concepts: [paint, image-data]
nodes: [Paint Group]
node_family: paint
controls: [Center, Angle, Size, Show Subgroup Controls]
inputs: []
outputs: []
tasks: [paint, cleanup, animate]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Paint Group

Paint Groupは、[Paintノード](./paint)で描いた複数のストロークを一つにまとめ、**位置・角度・大きさをまとめて調整する**ための機能です。例えば被写体に付いた複数のマーカーを消した後、補修箇所を一つずつ動かす代わりに、グループの中心位置をトラッキングデータに追従させられます。

**Paint GroupはFlowに独立して置く画像処理ノードではありません。** Paintを選択するとViewer上部に現れるツールバーの「Paint Group」から、Paint内部の描画要素をグループ化します。

## 入力と出力

Paint Groupそのものに、Flow上の独立した入力・出力端子はありません。画像を受け取り、結果を後段へ渡すのはPaintノードです。

- **PaintのInput（オレンジ）**：必須の2D画像。素材やBackgroundの画像を接続し、その解像度を描画キャンバスとして使います。
- **PaintのEffect Mask（青）**：任意のマスク。Paintの描画を反映する領域を制限します。クローン画像の参照先ではありません。
- **Paintの出力**：グループ内のストロークを含む、描画後の2D画像。MergeやMediaOutへ接続できます。

~~~text
MediaIn → Paint（内部の複数ストロークをPaint Group化）→ MediaOut
~~~

この構成で、Paint GroupをPaintの前後に別ノードとして接続する必要はありません。Flow上の接続はそのままに、Paint内部の複数の描画だけをまとめて操作します。

## グループを作る手順

1. Paintに2D画像を接続し、Viewerで必要な[Stroke](./stroke)や[Multistroke](./multistroke)を描きます。
2. Paintツールバーで描画モードから**Select**へ切り替えます。これで、誤って新しいストロークを増やさずに選択できます。
3. Viewer上で範囲をドラッグして対象を囲むか、Shiftクリック／Commandクリックで複数のストロークを選びます。
4. 同じツールバーの**Paint Group**をクリックします。選んだストロークが一つのグループになります。
5. Viewerにはグループ全体の操作ハンドルが現れ、Inspectorの**Modifiers**タブでグループの設定を変更できます。

個々のストロークを選んで動かす方法と違い、同じ対象に付いた補修をまとめて移動・回転・拡大縮小できます。グループの中心を変えたい場合は、ViewerでCommand／Ctrlを押しながらグループの十字ハンドルをドラッグすると、描画全体を移動させずに中心位置を調整できます。

## 主な操作と編集範囲

| 操作 | 変わるもの | 用途 |
| --- | --- | --- |
| **Center** | グループ全体の位置 | 複数の補修をまとめて被写体へ追従させる |
| **Angle** | グループ全体の回転 | 被写体の傾きに補修を合わせる |
| **Size** | グループ全体の大きさ | 被写体との距離の変化に合わせ、補修の広がりを調整する |
| **Show Subgroup Controls** | グループ内の操作ハンドルの表示 | 編集可能な個別ストロークを選び直して調整する |

グループ化しても、すべての線が一本の線に統合されるわけではありません。**Show Subgroup Controls**を使えば、通常のStrokeなど、もともと編集可能な内部要素の操作に戻れます。

ただし、[Multistroke](./multistroke)と[Clone Multistroke](./clone-multistroke)は、描いた後に内部の線を一本ずつ編集できない方式です。Paint Groupへ入れてもこの制限は変わりません。グループ単位で移動・回転できることと、個々のブラシ操作を描き直せることは別です。

## 運用例：動く被写体のマーカーをまとめて消す

複数のトラッキングマーカーが同じ衣服に付いていて、画面内を一緒に移動する映像を想定します。

1. **MediaIn → Paint → MediaOut**を接続します。MediaInの画像を直接Paintのキャンバスにします。
2. PaintでClone Multistrokeなどを選び、マーカーの近くにある布地の画素を参照して補修します。CloneではAlt／Optionクリックで参照位置を指定します。
3. Multistroke系を使う場合、**描く前**にDurationを補修したいフレーム数へ設定します。初期状態では1フレームのみの描画になるためです。
4. 補修した複数箇所を選択し、Paint Groupにまとめます。
5. 被写体の動きを追跡し、**グループのCenter**を追跡結果に接続します。21.1 Manualでは、ModifiersタブにあるPaint GroupのCenter Xラベルを右クリックして接続する操作が示されています。
6. フレームを送って、補修がマーカーの上に残っているか確認します。必要ならグループの位置・角度・大きさや、補修そのものを調整します。

この方法でまとめられるのは、**ほぼ同じ動きをする複数の補修**です。例えばマーカーごとに異なる動きをする袖や手首を、一つのCenterだけで正確に追うことはできません。衣服の伸縮、遠近変化、マーカーの遮蔽、照明変化もグループ化だけでは補正されないため、崩れた区間は別グループや別の補修方法を使います。

## 運用例：複数の手描きマークを一括で配置する

~~~text
Background（映像と同じ解像度、Alpha 0）→ Paint → MergeのForeground
MediaIn ─────────────────────────────────→ MergeのBackground
Merge → MediaOut
~~~

透明なBackground上にStrokeで複数の丸や矢印を描き、Paint Groupにまとめます。完成したグループをCenterで移動し、AngleやSizeでまとめて向きと大きさを変えれば、複数の図形の相対的な配置を保ったまま別の位置へ置けます。透明なキャンバスを使うため、Mergeで実写への重ね方を後から変更できます。

この構成でCloneを使う場合は、PaintのInspectorに元映像をSourceとして指定してください。MergeのBackgroundへMediaInをつないだだけでは、透明なPaintの複製元にはなりません。

## 使い分けと注意点

- **1本の線を後から細かく直したい**：個別の[Stroke](./stroke)を使います。Make Editableで経路も修正できます。
- **多数の細かな補修を素早く描きたい**：[Multistroke](./multistroke)または[Clone Multistroke](./clone-multistroke)を使い、必要に応じてPaint Groupで全体の動きを制御します。
- **複数の補修を一緒に動かしたい**：Paint Groupが適しています。個別のストロークにそれぞれ追跡結果を接続する作業を減らせます。
- **面の変形を含めて追従したい**：中心位置の追従だけで十分かを確認します。必要ならPlanar Trackerなど別の追跡・変形手段を検討します。

描画方式によって、表示されるフレームと後編集できる範囲が異なります。**グループ化はストロークのDurationを自動延長する操作ではありません。** 補修したい時間範囲と実際の表示を、それぞれ確認してください。

描画データとマスクの違いは[Paintの解説](./paint)、各描画方式の選択は[Paintカテゴリ](./)を参照してください。

## バージョンと出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 80「Paint」pp.1756、1760、およびChapter 113「Paint Node」pp.2639–2640、2645。複数ストロークの選択とグループ化、**Center / Angle / Size**、**Show Subgroup Controls**、Multistroke系の追跡、グループ中心の操作を確認しました。画像入出力は同Manual pp.1747–1749、2638に基づきます。

本記事の操作はManualで確認した範囲です。Resolve 21.1実機での内部ID、Controlの数値範囲、すべての描画方式での挙動、Free / Studioの差は個別には検証していないため、`verification: partial`としています。
