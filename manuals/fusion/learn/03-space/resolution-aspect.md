---
title: 解像度 / アスペクト比（Resolution / Aspect）
description: Fusionで画像のピクセル寸法・表示比率・Pixel Aspect・配置上の倍率を区別し、Transform、Resize、Scale、Crop、Mergeを使い分ける。
doc_type: concept
term_id: resolution-aspect
term_short: Imageのピクセル寸法、フレームの縦横比、Pixel Aspect、配置の倍率を区別する考え方。
verification: partial
aliases: [resolution, aspect ratio, pixel aspect]
concepts: [resolution, aspect-ratio, normalized-coordinates]
nodes: [Resize, Scale, Crop, Transform, Merge]
tasks: [resize, layout, position]
prerequisites: [normalized-coordinates]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# 解像度 / アスペクト比（Resolution / Aspect）

Fusionで「映像を半分の大きさにする」と言うとき、二つの操作が考えられます。1920×1080のフレームを保ったまま被写体だけ小さく見せる操作と、1920×1080の画像データを960×540へ作り直す操作です。前者は主に**Transform**、後者は**Scale**や**Resize**で行います。

画面を見ただけでは区別しにくいことがありますが、後段のMergeで使うキャンバスや、Editページへ戻る映像の有効解像度まで変わるため、先に何を変更したいのかを決めます。

## まず四つの値を分ける

| 項目 | 意味 | 例 |
| --- | --- | --- |
| **Width / Height（解像度）** | Imageが横・縦に持つピクセル数 | 1920×1080、960×540 |
| **Frame Aspect（フレーム比）** | WidthとHeightの比 | 1920:1080＝16:9 |
| **Pixel Aspect Ratio（PAR）** | 1ピクセルを表示するときの横幅と縦幅の比 | 正方形ピクセル、非正方形ピクセル |
| **Normalized Coordinates（正規化座標）** | 幅・高さを基準にした相対的な位置 | Center＝(0.5, 0.5) |

1920×1080の**正方形ピクセル**画像なら、フレーム比と表示上の縦横比はともに16:9です。一方、非正方形ピクセルではWidth / Heightが同じでも表示上の形が変わり得ます。フレーム比はピクセル数から求める比であり、表示比はPARも考慮した結果です。

正規化座標は寸法や比率そのものではありません。たとえばX＝0.1の移動は、横幅1920pxを基準にすれば192px相当ですが、横幅960pxを基準にすれば96px相当です。詳しい換算は[正規化座標](./normalized-coordinates)で扱います。

## 操作ごとに何が変わるか

| Node / 操作 | 出力ImageのWidth / Height | 映像の見え方 | 選ぶ場面 |
| --- | --- | --- | --- |
| **Transform / Size** | 原則として入力と同じ | 同じキャンバス内で拡大・縮小・移動する | 位置・倍率を動かす |
| **Resize / Width・Height** | 指定したピクセル寸法へ変更 | 全体を新しい寸法へ再サンプリングする | HDなど決まった寸法に揃える |
| **Scale / Size** | 入力寸法に倍率を掛けて変更 | 画像を倍率で再サンプリングする | 元サイズの半分・2倍にする |
| **Crop / Size X・Y** | 指定したキャンバス寸法へ変更 | 画像の一部を切り出す、または余白を含む領域へ配置する | 一部分だけ残す・枠の大きさを変える |
| **Merge** | Background入力の寸法を採用 | ForegroundをBackgroundへ合成する | 合成後のキャンバスを決める |

これは通常の2D Imageを扱う場合の整理です。Mask、Shape、Deep Image、3D Sceneはデータの種類が異なるため、この表のNodeをそのまま置き換えて使うことはできません。

### Transform：大きさを変えても解像度は保持する

1920×1080の画像へTransformを置き、Inspectorの**Size＝0.5**にしても、Transformから出るImageは1920×1080のままです。

~~~text
1920×1080 Image
  └─ Transform（Size 0.5）
       └─ 1920×1080 Image
          ※ 同じフレーム内で内容が小さく見える
~~~

Transformの**Aspect**は画像を横・縦に伸縮して見せるControlですが、それだけでPixel Aspect RatioのメタデータやWidth / Heightを変更するものではありません。「画像が横長に見える」と「出力が横長のピクセル数になった」は別です。

Transformは隣接する一部の変形をまとめて評価できるため、移動や拡大縮小のアニメーションに適しています。ただし、途中に別の画像処理が入る場合など、常に無劣化になるとまでは考えません。

### Resize：出力するピクセル数を指定する

4K UHDの3840×2160を1920×1080に変えるなら、Resizeの**Width＝1920、Height＝1080**とします。

~~~text
3840×2160 Image
  └─ Resize（Width 1920 / Height 1080）
       └─ 1920×1080 Image
~~~

**Keep Frame Aspect**は元画像の縦横比を保ちたい場合に使用します。**Auto Resolution**を有効にすると、DaVinci Resolve内のFusionではタイムライン解像度、Fusion StudioではFrame Formatに合わせてWidth / Heightが設定されます。素材自体のサイズを自動採用する機能とは区別してください。

Resizeは実際のピクセルを再サンプリングするため、後からTransformで大きくしても、Resizeで取り除いた元の細部が自動的に復元されるわけではありません。**Filter Method**は縮小・拡大時の補間方法を指定します。

### Scale：元の解像度に倍率を掛ける

Scaleは**Lock X/Y**を有効にすると、単一の**Size**で縦横を同倍率にできます。1920×1080にSize＝0.5を適用すると、出力は960×540になります。

~~~text
1920×1080 Image
  └─ Scale（Size 0.5）
       └─ 960×540 Image
~~~

元の解像度が異なる素材を「それぞれ半分のピクセル数にしたい」ならScale、どの素材も1920×1080に統一したいならResizeが適しています。**Lock X/Y**を解除するとX/Yを別倍率にできますが、その場合は出力の縦横比も変わります。

ResizeとScaleはともに物理解像度を変えます。21.1 Manualは、解像度が時間とともに変化するため、これらのControlのアニメーションを推奨していません。映像の拡大縮小を動かす用途には、通常はTransformを選びます。

### Crop：画像を伸縮せず、出力範囲を変える

Cropの**Size X / Size Y**は出力のピクセル寸法、**Offset X / Offset Y**は内容を移動するピクセル単位の値です。Resizeのように元画像全体を新しい枠に縮小して収める操作とは異なります。

たとえば1920×1080の映像から中央の1080×1080だけを残すなら、次のように設定します。

1. Cropを接続して、Inspectorで**Keep Aspect**を無効にします。元の16:9を維持したままでは正方形にできないためです。
2. **Keep Centered**を有効にし、**Size X＝1080、Size Y＝1080**とします。
3. Viewerで中央が残っていることを確認します。単純な中央切り出しでは、横方向は左右420pxずつ除かれます。
4. 切り出し位置をずらしたい場合はKeep Centeredを解除し、Offset X / Yを調整します。

~~~text
1920×1080 Image
  └─ Crop（Size X 1080 / Size Y 1080）
       └─ 1080×1080 Image
          ※ 元画像の縦横比を保って縮小したのではない
~~~

Cropは出力範囲を広げる用途にも使えます。単に透明な領域や効果範囲を制限する**Mask**とは異なり、Width / Heightそのものが変わります。切り出し後の端で効果が欠ける場合は[有効領域（DoD）](./domain-of-definition)とCropの**Clipping Mode**も確認します。

## Mergeに入れると、どちらの解像度が残るか

**MergeのBackground（オレンジ入力）が出力解像度を決めます。** Foreground（緑入力）に小さなImageを接続しても、その寸法へMergeの出力全体が縮むわけではありません。

~~~text
Background（1920×1080） ─┐
                          Merge ─→ 1920×1080
Foreground（960×540） ────┘
~~~

逆に、Background側へ960×540のImageを入れると、Mergeの出力も960×540です。Foregroundが高解像度でも、出力の基準を自動的に拡張しません。

複数の異なる解像度の素材を合成するときは、最終出力と同じWidth / HeightのBackground Imageを用意し、MergeのBackgroundへ接続すると意図を明示できます。背景を透明にしたい場合も、目的の解像度を持つBackgroundを用意する考え方は同じです。

## Pixel Aspectは「画像を何ピクセルにするか」ではない

非正方形ピクセルの映像では、同じWidth / Heightでも表示上の縦横比が変わります。21.1 Manualでは、DaVinci ResolveのProject Settings（Timeline Format）やClip AttributesでPARを扱うこと、Fusionの**Resize / Scale / Crop**に**Change Pixel Aspect**があることを説明しています。

ここで変更するのは各ピクセルの表示比率です。1920×1080から1280×720への**解像度変更**、TransformのAspectによる**見た目の引き伸ばし**、Pixel Aspectの**表示解釈**は混同しないでください。

通常の正方形ピクセル素材で形が崩れている場合、すぐにChange Pixel Aspectを操作するのではなく、素材のClip Attributesとタイムライン設定、ResizeのKeep Frame Aspect、TransformのAspectを順に確認します。

## Resolveのタイムライン解像度との関係

Fusionには、すべてのNodeに一律で適用される固定の「コンポジション解像度」があるわけではありません。**各Imageがどの解像度を持ち、最後のNodeから何を出すか**が重要です。

DaVinci Resolve 21.1 Reference Manualでは、次の違いが説明されています。

- タイムライン上の**通常のクリップ**をFusionで開く場合、基本的にはそのクリップのソース解像度がFusion側の処理解像度の基準です。タイムラインがHDでも、4KソースのFusion処理が必ずHDになるわけではありません。
- 複数クリップをまとめた**Fusion Clip**は、基本的にタイムライン解像度が基準です。通常のクリップと同じ前提で解像度を推定しないでください。
- FusionでCrop・Resize・Scaleを使う、あるいは異なる解像度のImageをMergeのBackgroundへ接続すると、**最後のNodeの出力解像度**がCut/Editページへ戻る際の有効なソース解像度になります。
- Cut/Edit側のImage Scaling設定によって、Fusionから渡されたImageがタイムラインへどう収められるかも変わります。「Viewerでは合っているのにEditでは大きさが違う」場合は、この段階も調べます。

Fusionページを使うと、Cut/Edit/Colorページだけで操作する場合とは解像度を保った変形の扱いが変わることがあります。特にResizeで一度小さな画像データにすると、後段で拡大しても元のディテールは取り戻せません。解像度を下げる操作を合成途中に置くか、最終段階まで保持するかは用途に応じて決めます。

## 実際に見比べる

1920×1080の画像を一つ用意し、それぞれ別の枝で次の三つを比較します。三つを直列に置くのではなく、**同じ入力から分岐**させると違いを確かめやすくなります。

~~~text
             ┌─ Transform（Size 0.5）→ A
1920×1080 ───┼─ Scale（Size 0.5）────→ B
             └─ Resize（960×540）───→ C
~~~

| 枝 | 出力のWidth / Height | 調べること |
| --- | --- | --- |
| A | 1920×1080 | 被写体は小さくなるがフレームの寸法は変わらない |
| B | 960×540 | Imageのピクセル数が倍率で変わる |
| C | 960×540 | Imageのピクセル数が指定寸法へ変わる |

Viewerは画像ごとに表示倍率を自動調整することがあるため、見かけの大きさだけで判断しません。**各NodeをViewerに表示し、Viewer上部の解像度表示を確認**します。次にA・B・Cを個別に同じ1920×1080のMerge Backgroundへ重ね、前後の余白や鮮明さがどう変わるかも比較できます。

最後に、上の三つの枝をすべて**MergeのForeground**として使う場合と、各枝を**MergeのBackground**へ入れる場合で、Mergeの出力寸法を比べます。これにより「素材の大きさ」と「合成結果のキャンバスの大きさ」を区別できます。

## 解像度が変わる案件での判断

同じレイアウトを1920×1080と3840×2160の両方で使うなら、配置比率を保つか、余白を同じピクセル数に保つかを先に決めます。前者は正規化座標でCenterを管理し、後者は基準解像度から位置のオフセットを計算します。

Transformの**Reference Size**はCenterのInspector表示をピクセル値へ変換する設定であり、ImageのWidth / Heightを変更しません。見えているCenterが960, 540でも、内部では(0.5, 0.5)として保持されている場合があります。詳しくは[正規化座標](./normalized-coordinates)と[解像度を跨ぐ配置](../../patterns/transform/resolution-aware-positioning)を参照してください。

## 関連記事

- [Transform](../../nodes/transform/transform)：キャンバス寸法を変えずに位置・倍率を調整
- [Resize](../../nodes/transform/resize)：Width / Heightを指定した再サンプリング
- [Scale](../../nodes/transform/scale)：元解像度に対する倍率で変更
- [Crop](../../nodes/transform/crop)：出力範囲とキャンバス寸法を変更
- [Merge](../../nodes/compositing/merge)：Backgroundが出力解像度を決める
- [正規化座標](./normalized-coordinates)：位置を相対値とピクセル値で読み替える
- [有効領域（DoD）](./domain-of-definition)：解像度と実際に有効な領域の違い

## 出典と検証範囲

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）。

- Chapter 11「Image Sizing and Resolution Independence」pp.287–290：Pixel Aspect、通常クリップとFusion Clipの解像度、FusionからEditへ渡す有効解像度、TransformとResizeの違い。
- Chapter 75「Controlling Image Processing and Resolution」pp.1643–1644：Fusionの解像度管理、Merge Background、Crop / Resize / Scale / Letterbox、Image Scalingとの関係。
- Chapter 94「Composite Nodes」p.2212：MergeのBackgroundが出力解像度を決める仕様。
- Chapter 120「Transform Nodes」pp.2862–2864、2873–2878、2879–2883：Crop、Resize、Scale、Transformの各Control、物理解像度とReference Size、Pixel Aspect。
- Chapter 6「Project Settings」およびChapter 11 p.287：タイムラインとクリップのPixel Aspect設定。

操作例と数値例は上記の仕様から構成しました。記載したNodeの働きとControl名は21.1 Manualで確認していますが、手順全体の21.1実機操作、素材固有のPAR挙動、フィルタの画質比較、Free / Studioの全差分は確認していません。そのため、検証状態は**partial**としています。
