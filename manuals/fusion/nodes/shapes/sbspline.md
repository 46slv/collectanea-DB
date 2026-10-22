---
title: "sBSpline"
description: "少数の制御点で滑らかな曲線や輪郭を描き、Shapeとして加工・アニメーションできる生成Node。"
doc_type: node
term_id: "sbspline"
term_short: "sBSplineは、ハンドルを操作せず制御点の位置から滑らかな曲線を描くShape生成Node。"
verification: partial
aliases: ["sBSpline", "sBSp"]
concepts: ["shape-data", "rasterization"]
nodes: ["sBSpline"]
node_family: "shapes"
outputs: ["shape"]
controls: ["Solid", "Border Width", "Border Style", "Cap Style", "Position", "Length", "X Offset", "Y Offset", "Size", "Color", "Allow Combining"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# sBSpline

sBSplineは、画面上に置いた**制御点から、滑らかな曲線や図形を作る**Shape生成Nodeです。曲線を点ごとに細かく調整する代わりに、いくつかの点を置いて大まかな輪郭を整えたいときに使います。

ここでいう<Term id="shape-data">Shape</Term>は、まだ画像のピクセルになっていない図形データです。sBSplineで作った形を後段のShape系Nodeで複製・変形し、[sRender](./s-render)で通常の2D Imageへ変換します。

## sPolygonとの違い

どちらも自由な形を描けますが、点が曲線へ働く仕組みが異なります。

- **sBSpline**：置いた点が曲線をその方向へ引き寄せます。曲線は必ずしも点の位置を通りません。点ごとのハンドルを調整せず、少ない点でなだらかな輪郭を作れます。
- **[sPolygon](./spolygon)**：Bézier曲線を使います。点に加えて方向・曲がり具合を決めるハンドルを使い、局所的な形をより直接調整します。

たとえば雲のような丸みのある形ならsBSpline、直線と鋭い角を混ぜて細部を指定したい形ならsPolygonから試すと違いを確認できます。どちらが常に滑らか、という違いではありません。

## 入力と出力

**外部入力はありません。** sBSplineは別のShapeを加工するNodeではなく、Viewer上で点を置いて図形そのものを生成します。旧記事のメタデータにあった「Shape入力」という分類は誤りだったため削除しました。

出力は**Shapeデータ**です。一般的な画像処理や通常のMergeへ直接渡すのではなく、sRenderで画像へ変換します。

    sBSpline → sRender → Merge

上の構成では曲線をsBSplineで作り、sRenderで画像化し、Mergeで映像に重ねます。複製や変形を行う場合はsRenderの前にShape系Nodeを追加します。

## 描き方

1. sBSplineを追加し、出力をsRenderにつなぎます。sRenderをViewerに表示して、最終的な描画を確認します。
2. sBSplineを選び、Viewer上で点を順にクリックします。最初はCenterのコントロールだけが表示され、クリックするたびに制御点が追加されます。
3. 点を移動して輪郭を調整します。**曲線は制御点を必ず通るわけではない**ので、点のすぐ横を曲線が通っていても異常ではありません。
4. 閉じた形を作るときは、SplineのツールバーにあるCloseを使います。輪郭線だけを描くときは、開いた形のまま扱うこともできます。
5. 塗り、輪郭の太さ、色を設定します。必要ならsGridやsDuplicateをsRenderより前に挿入します。

### ViewerのSplineツールバー

ManualではPolygonとB-Splineに共通のツールバーが説明されています。

| モード | できること |
| --- | --- |
| Click | 点をクリックで追加する |
| Draw | 手で線を描くように点を作る |
| Insert and Modify | 既存の線へ点を追加し、点を動かす |
| Modify Only | 点を追加せずに既存の点を調整する |
| Done | 点の移動や追加を一時的に防ぐ |
| Close | 開いた曲線の端と端をつないで閉じる |

細部を直すときに意図せず点が増える場合はModify Onlyへ切り替えます。形が決まったらDoneにすると不用意な編集を減らせます。

## 主なInspector項目

21.1 Manualは「sBSplineは曲線方式以外、sPolygonと同じ」と説明しています。以下の項目は同ManualのsPolygon Controls / Style（pp.2753–2755）を併せて確認したものです。現在の実機Inspectorの全項目・既定値は未検証です。

### Solid / Border Width：面か線か

- **Solid**：有効にすると閉じた図形の内側を塗ります。無効にすると内側が透明になり、輪郭線を表示します。
- **Border Width**：輪郭の太さを調整します。細い線から太い帯状の輪郭へ変えられます。

線だけを動かすアニメーションを作りたい場合は、まずSolidを無効にし、Border Widthで線が見える太さを決めます。

### Border Style / Cap Style：角と線端

**Border Style**は輪郭が折れ曲がる箇所のつなぎ方です。Bevelは角を切り落とし、Roundは丸め、Miterは尖った角を保ちます。

**Cap Style**は線の両端の形です。Flatは平ら、Roundedは丸く、Squaredは線幅の半分ほど外へ伸びる四角い端です。線端の違いを見るには、輪郭に切れ目ができるようLengthを1.0未満にします。

### Position / Length：輪郭の一部だけを表示する

Solidを無効にしたときに使う設定です。

- **Length**：輪郭のどれだけの長さを表示するかを決めます。1.0より小さくすると表示されない区間ができます。
- **Position**：表示区間の開始位置を移動します。Lengthと組み合わせると切れ目の位置をずらせます。

Lengthへキーフレームを付けると、線が順番に現れる**描画アニメーション**を作れます。これは輪郭を表示する割合の制御であり、制御点を追加・削除する操作とは別です。

### X / Y Offset・Size・Rotation

**X / Y Offset**は図形全体の位置、**Size**は全体の拡大・縮小、**X / Y / Z Rotation**は回転を調整します。Manualは、Sizeが制御点どうしの相対的な配置やShapeの点アニメーションを変えずに大きさを変える、と説明しています。

点そのものを動かして形を変える操作と、Size・Offsetで図形全体を動かす操作を分けると、アニメーションを編集しやすくなります。Z Offsetや3D向けのFill Methodも同系統の項目ですが、ここでは2D Shapeの制作を中心に扱います。

### Style：Color / Allow Combining

**Color**で塗りや線の色、RGBAとAlphaを設定します。

**Allow Combining**は、sGridやsDuplicateで複製した図形が重なった部分のAlphaの扱いを決めます。オンでは設定したAlpha値を維持し、オフでは重なりによってAlpha値が累積することがあります。色を変えるための設定ではありません。

## 運用例1：有機的な背景図形

1. sBSplineで丸みのある輪郭を描き、Closeで閉じます。
2. Solidを有効にし、Styleで塗り色とAlphaを設定します。
3. sRenderで画像に変換し、Mergeで背景映像へ重ねます。
4. 図形全体のサイズや配置はSizeとX / Y Offsetで調整します。

    sBSpline → sRender → Merge

同じ形を多数並べたい場合は、sBSplineとsRenderの間に[sGrid](./sgrid)を挟みます。Shapeを画像化する前にコピーするため、各コピーを別の画像として用意する必要はありません。

## 運用例2：曲線を描いて現す

1. sBSplineで曲線を描き、Solidを無効にします。
2. Border WidthとColorで線の見た目を決めます。
3. 最初のフレームでLengthを小さくし、終点のフレームでLengthを1.0にします。
4. sRenderで表示し、輪郭が現れていく方向と速さを確認します。必要ならPositionも変えて開始地点を調整します。

この例はManualに記載されたLengthの挙動を使う制作手順です。実際の動きの見え方は曲線の開閉状態や設定で確認してください。

## 点のアニメーションと注意点

sBSplineには、点の形状を変更するとキーフレームが作られる**自動アニメーション**があります。21.1 Manualでは、Nodeを追加した時点のフレームにキーフレームが入り、別フレームで点の位置などを変えると、その間の形が補間されると説明されています。

- 意図せず曲線の形が変化したら、編集したフレームとキーフレームを確認します。
- 点を追加して輪郭そのものを変える操作と、OffsetやSizeで図形全体を動かす操作を区別します。
- Shapeのまま通常のMergeやGlowへ渡せない場合は、[sRender](./s-render)が入っているか確認します。
- 自動アニメーションの細かな補間条件、実機での端子表示、内部REGID、Free / Studio差はここでは確定していません。

## 関連記事

- [シェイプ（Shape）](../../learn/02-data/shape) — Shapeと通常の2D Imageの違い。
- [sPolygon](./spolygon) — Bézier曲線で制御点とハンドルを使う生成Node。
- [sGrid](./sgrid) — 同じ図形を行と列に並べる。
- [sDuplicate](./sduplicate) — コピーごとに移動・回転・拡大縮小を積み重ねる。
- [sTransform](./stransform) — Shape全体を後段で変形する。
- [sRender](./s-render) — Shapeを2D Imageへ変換する。

## バージョンと出典

**確認済み：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」pp.2732–2733（sBSplineの点の挙動、自動アニメーション、sPolygonとの差）およびpp.2752–2756（共通のsPolygon設定とSplineツールバー）。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)。

**未確認：** Resolve 21.1実機での表示、全Inspector項目の既定値・範囲、端子の内部ID、Edition差。公式Manualから確認した範囲で記述したため、メタデータのverificationはpartialを維持します。
