---
title: "sNGon"
description: "三角形・五角形などの多角形をShapeとして生成し、塗り・輪郭・描画アニメーションを設定するノード。"
doc_type: node
term_id: "sngon"
term_short: "多角形を生成して、輪郭や配置を調整するShape Generator。"
verification: partial
aliases: ["sNGon"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sNGon"]
node_family: "shapes"
outputs: ["shape"]
controls: ["Solid", "Border Width", "Border Style", "Cap Style", "Position", "Length", "X Offset", "Y Offset", "Width", "Height", "Angle", "Color", "Allow Combining"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-11"
---

# sNGon

sNGonは、三角形・五角形・八角形など、複数の辺を持つ図形を作る<Term id="shape-data">Shape</Term> Generatorです。塗りつぶした多角形だけでなく、線だけの多角形や、輪郭が途中まで描かれるアニメーションも作れます。

Shapeは、まだ画素に変換していない図形データです。普通の画像に重ねるには、後段の `sRender` で2D Imageへ変換します。基礎から確認したい場合は[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。

## 入力と出力

**外部入力はありません。** sNGonは画像や別のShapeを加工するのではなく、図形を自分で生成します。以前のカタログにある「入力: shape」という分類は、21.1 Manualの入力仕様とは一致しません。

出力は**Shape**です。次のShapeノードへ渡して複製・変形するか、`sRender` に接続して画像化します。

```text
sNGon → sRender → Merge（映像へ重ねる）
      ↓
      sGrid / sDuplicate → sRender（多角形を増やしてから画像化）
```

上の図は2つの選択肢を示しています。1本の出力を途中で分岐させる必要はありません。画像化前なら、[sGrid](./sgrid)や[sDuplicate](./sduplicate)でShapeのまま処理を続けられます。

## 主な設定

### Solid / Border Width

`Solid` を有効にすると、Styleタブで決めた色で内部を塗りつぶします。無効にすると内部は透明になり、`Border Width` で輪郭の太さを調整します。

`Border Width` はSolidが有効な場合にも使えますが、特に輪郭だけの図形で効果が分かりやすい設定です。

### Border Style / Cap Style

`Border Style` は、多角形の角で線をどうつなぐかを決めます。

- **Bevel**：角を切り落としたような接合。
- **Round**：角を丸くつなぐ。
- **Miter**：尖った角を保つ。

`Cap Style` はSolidが無効なときに現れ、線の両端をFlat（平ら）、Rounded（半円状）、Squared（線幅の半分だけ外へ伸ばす）から選びます。**輪郭が閉じていると端は見えません。** 次の`Length`を1.0未満にすると違いを確認できます。

### Position / Length

いずれも**Solidが無効なとき**に表示される輪郭用の設定です。`Length = 1.0` なら輪郭が閉じ、1.0未満にすると一部が欠けた状態になります。`Position` はその開きの位置をずらします。

`Length` にキーフレームを打って短い状態から1.0へ変化させると、多角形の輪郭が順に描かれる「書き順」のようなアニメーションになります。開き始める場所を変えたい場合は`Position`も調整します。

### X / Y Offset、Width / Height、Angle

`X Offset` / `Y Offset` で多角形の位置を動かします。Manualでは、座標はフレームの**幅**を基準に正規化され、`X Offset = 0.0` が中央、`0.5` が中心をフレーム右端へ置く例として説明されています。一般的なピクセル座標をそのまま入力する設定ではありません。

`Width` / `Height` は形の横方向・縦方向の大きさ、`Angle` は中心軸を基準にした回転を調整します。21.1 Manualのこの段落は説明対象を「ellipse」と表記しており、sNGonに関する記述としては整合しません。ここでは大きさを調整する設定として扱い、辺の長さ・頂点数の厳密な制御方式は実機での追加確認対象とします。

### Style / Color / Allow Combining

Styleタブの`Color`では塗りと輪郭の色およびAlpha（透明度）を指定します。

`Allow Combining` は、[sDuplicate](./sduplicate)や[sGrid](./sgrid)で同じShapeを重ねた際のAlphaの扱いに関わります。Manualの例ではAlphaが0.5の多角形を重ねるとき、**有効なら重なっても0.5を維持**し、無効なら重なる部分のAlphaが合成によって大きくなります。半透明の図形を反復させるときは、意図する濃さに合わせて切り替えます。

## 具体的な使い方

### 六角形などの図形を並べ、背景パターンにする

sNGonで元になる多角形を作り、`Solid`を有効にして色と大きさを調整します。出力を`sGrid`へ渡して横・縦に並べ、最後に`sRender`で画像にします。

```text
sNGon → sGrid → sRender → Merge → MediaOut
                                  ↑
                             MediaIn（映像）
```

この構成ではsNGonが「どんな形の一個を作るか」、sGridが「それをどこへ何個並べるか」、sRenderが「完成したShapeを画素に変えるか」を担当します。背景パターンとして映像に重ねたい場合は、最後の通常の`Merge`で前景・背景を合わせます。多角形の辺数を変更する具体的なInspector項目名は、この節のManual本文だけでは確定できないため記載していません。

### 輪郭が描かれるHUD風のマーク

`Solid`を無効にして`Border Width`で線幅を決めます。`Length`を小さくした開始フレームから、後のフレームで1.0へキーフレームを付けます。`Position`を変えると、輪郭のどこから描き始めるか調整できます。

`sNGon → sRender`で確認し、必要なら画像化後にGlowなどを追加します。GlowはShapeではなく2D Image側の処理なので、`sRender`より後ろへ置きます。

### 半透明の多角形を重ねる

sNGonのStyleタブでAlphaを0.5などに下げ、`sDuplicate`で位置を少しずつずらして重なりを作ります。重複部分だけ不自然に濃くなる場合は`Allow Combining`を有効にして比べます。逆に重なるほど濃く見せたい場合は、無効の結果を確認します。

この例はManualに記載されたAlphaの重複動作とShapeの接続仕様を使った運用案です。21.1実機でのレンダリング結果まで確認したものではありません。

## 近いノードとの違い・注意点

- [sRectangle](./srectangle)は長方形、[sEllipse](./s-ellipse)は円・楕円を作ります。多角形が必要ならsNGonが候補です。
- [sStar](./sstar)は星形を作ります。単純な多角形ではなく突起のある形が必要な場合に比較します。
- [sPolygon](./spolygon)は頂点を操作して任意の輪郭を描く用途に向きます。規則的な多角形が目的なら、まずsNGonから始めます。
- [sRender](./s-render)はShapeを2D Imageへ変換します。sNGonから通常のMergeやBlurへ直接接続するのではなく、間にsRenderを置きます。
- Solidが有効なままではPosition / Length / Cap Styleを期待どおり操作できません。輪郭だけの設定を試すときは、先にSolidを無効にします。

Shape系ノードの用途別一覧は[Shapeノード](./index)を参照してください。

## バージョンと確認範囲

**DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 117「Shape Nodes」、pp.2747–2750**を参照しました。外部入力なし、Shape出力、Solid、Border Width、Border Style、Cap Style、Position、Length、X/Y Offset、Width/Height、Angle、Color、Allow Combiningは同資料で確認済みです。

頂点数の変更に使う正確なInspector項目名、内部REGID、Edition差、実際の端子表示・描画結果は未確認です。ManualのWidth/Height節にある「ellipse」の表記も、sNGon固有の厳密なサイズ動作の根拠には使用していません。そのため`verification: partial`を維持しています。
