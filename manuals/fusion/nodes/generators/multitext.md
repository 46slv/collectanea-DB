---
title: "MultiText"
description: "複数の文字レイヤーを1つのFusion Nodeで組版・整列・装飾し、2D Imageとして合成する。CSV取込と各レイヤーの設定を解説。"
doc_type: node
term_id: "multitext"
term_short: "MultiTextは、複数の文字レイヤーを1つのNode内で管理し、位置・書式・装飾を個別に設定できる文字Generator。"
verification: partial
aliases: ["MultiText", "MTxT"]
concepts: ["image-data", "effect-mask", "compositing"]
nodes: ["MultiText"]
node_family: "generators"
controls: ["Text List", "Point", "Text Box", "Circle", "CSV", "Font", "Size", "Tracking", "Align", "Justify", "Direction", "Line Direction", "Reading Direction", "Layout Type", "Center X", "Center Y", "Center Z", "Pivot X", "Pivot Y", "Pivot Z", "Align Layer", "Rotation", "Fill", "Outline", "Shadow"]
inputs: ["mask"]
outputs: ["image"]
tasks: ["generate-image", "text", "title", "motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion", "edit"]
updated: "2026-10-14"
---

# MultiText

**MultiText [MTxT]は、複数の文字レイヤーを1つのNode内で管理する2D文字Generator**です。氏名と肩書き、見出しと説明文などを、それぞれ別の書式・位置で配置できます。複数のText+を重ねなくても、Text Listで文字レイヤーを切り替え、位置合わせや装飾をまとめて調整できます。

Text+を基にした機能を持ち、文字を平面上に置くほか、回転や遠近感を加えた表現にも使えます。ただし**出力は2D Image**です。厚みのある文字を3D空間へ置く[Text 3D](../3d/text-3d)とは、出力するデータが異なります。

## 入力と出力

| 接続 | 受け取るもの | 役割 |
| --- | --- | --- |
| **Effect Mask**（青、任意） | Mask | 生成した文字画像をMaskの領域に限定します。 |
| **出力** | 2D Image | 複数文字レイヤーを1枚の画像にした結果を後段へ渡します。 |

MultiTextは文字を自分で生成するため、映像を入れるためのImage入力は必要ありません。既存の映像へ文字を重ねる場合は、出力を[Merge](../compositing/merge)のForegroundへ、元映像をBackgroundへ接続します。

```text
MultiText ───────→ Merge (Foreground) ──→ MediaOut
映像 (MediaIn) ─→ Merge (Background)
```

Effect MaskにEllipseなどを接続すると、文字のうちMask内に入る部分だけを表示できます。文字のレイヤーを個別に追加する操作と、最終的にできた2D ImageをMaskで制限する操作は別です。

## Text Listで複数レイヤーを管理する

Inspectorの**Text tab → Text List**が、作成した文字レイヤーの一覧です。各レイヤーは有効／無効の切替、ロック、名前の変更、削除ができます。編集したいレイヤーを選んでから、書体や配置を調整します。

Text Listの下には、文字を追加・読み込むための操作があります。

| 追加方法 | 何を作るか | 使う場面 |
| --- | --- | --- |
| **Point** | 1点を起点として配置する文字。テキストボックスによる幅・高さの制限はありません。 | 短い見出し、氏名、単語ごとの配置 |
| **Text Box** | 矩形領域に収める文字。Layout tabの**Wrap to Text Box**で折り返し、**Clip to Text Box**ではみ出す部分を非表示にできます。 | 説明文、長い字幕、幅を揃えた段組み |
| **Circle** | 円・楕円の弧に沿う文字。円の内側／外側を含む配置はLayout側で調整します。 | 円周タイトル、エンブレム、ラベル |
| **CSV** | `.csv`の表を取り込み、列を揃えた文字として配置します。 | スタッフ一覧、価格表、複数項目の情報表示 |

CSVの取り込みでは、**元CSVの各列が別々のText List項目**になります。取り込んだ後でもMultiText内で文字を編集できます。表の列と文字のレイヤーの対応を確かめてから、色や位置を整えてください。元CSVとの自動同期は21.1 Manualの該当箇所では確認できないため、CSVを修正した場合は再取り込み後の表示を確認します。

## 文字の書式：Text tab

Text Listでレイヤーを選ぶと、主に次の項目で組版を調整できます。

- **Font / Size / Color**：書体とスタイル、文字サイズ、基本の塗り色を指定します。
- **Tracking / Line Spacing**：文字間隔と行間を調整します。見出しの字間を広げたいときはTracking、説明文の行が詰まっているときはLine Spacingを使います。
- **Align / Justify / Indent**：文字の左右・上下の整列、均等割付、字下げを制御します。レイヤー自体の画面内配置とは区別します。
- **Direction / Line Direction / Reading Direction**：書字方向、行の流れる向き、左から右／右から左などの読み順を設定します。日本語の縦書きなどでは、DirectionだけでなくLine Directionも確認します。
- **Force Monospaced / Use Font Defined Kerning**：字間を均等に近づけるか、フォントに定義されたカーニングを使うかを調整します。
- **Use Ligatures / Stylistic Set**：フォントが対応する連字や字形の選択に関係します。個別の文字を動かす場合、連字が複数の文字を1つの字形として扱う点に注意します。

フォントや言語によって利用できる字形・連字は異なります。縦書きの句読点、欧文の回転、色付き絵文字などは、選んだフォントと実際のViewer表示で確認してください。21.1 ManualはText+とMultiTextの絵文字・カラーフォント対応についても説明していますが、すべてのフォントで同じ描画になることまでは保証していません。

## Layout tab：文字レイヤーをどこへ置くか

**Type**ではPoint、Text Box、Circleを選びます。文字の並び方を決めるTypeと、作成したレイヤーを画面内でどこに置くかは別の設定です。

- **Center X / Y / Z**：レイアウト要素の中心位置です。X/YはViewer上で操作でき、ZはInspectorで調整します。
- **Pivot X / Y / Z**：回転の中心になる位置です。Centerを変えても、回転の支点が意図した場所にあるとは限りません。
- **Size / Perspective / Rotation**：レイヤー全体の拡大縮小、遠近感、3軸回転を扱います。Rotationには回転順序の選択もあります。
- **Align Layer**：文字レイヤーを水平・垂直方向に整列します。基準にはフレーム境界やタイトルセーフ領域を選べます。複数の文字レイヤーを選ぶと、選択中のレイヤー同士を基準にする**Selection**も使用できます。

たとえば「氏名」と「肩書き」を別々に作った場合、文字列内部の左揃えはText tab側で指定し、2つのレイヤーをフレーム左端へ揃える操作はLayout tabのAlign Layerで行います。文字揃えとレイヤー揃えを混同すると、文字数を変更した際に位置がずれやすくなります。

## Shading / Page / Image tab

**Shading tab**では、選択した文字レイヤーの見た目を調整します。

| 項目 | 調整できるもの | 使用例 |
| --- | --- | --- |
| **Fill** | 塗りの色・不透明度、Softness X/Y、Glow、Blend | やわらかい発光文字、半透明の情報表示 |
| **Outline** | 輪郭の色・不透明度・Thickness、Join Style、Line Style、Outside Only | 明るい映像の上でも読める縁取り |
| **Shadow** | 影の色・不透明度、Position X/Y | 背景から文字を浮かせるドロップシャドウ |

Outlineの**Adapt to Perspective**は、遠近変形した文字に合わせて輪郭の厚さを変えますが、Manualは描画コストが高くなると説明しています。通常の小さなテロップでは、必要になるまで有効化しなくても構いません。

**Page tab**では文字の背後に背景色を持つページを作れます。文字だけを既存映像に載せたい場合は、背景を付けた結果になっていないか確認します。**Image tab**には生成画像のアスペクト比や色・ガンマ空間に関する共通設定、**Settings tab**にはGenerator共通の設定があります。

## Viewer上での編集

MultiTextを選択し、Fusion Viewer内をダブルクリックすると文字を直接編集できます。Viewerの操作には文字入力モード、個別の文字位置を調整するモード、文字範囲のアウトライン表示切替があります。

**Allow Manual Positioning**では、文字下のハンドルから文字を選び、macOSはOption＋左右矢印、WindowsはAlt＋左右矢印で文字間の位置を微調整できます。Shiftを加えると大きめの移動になります。文字の位置を時間で変える場合は、Inspectorの**Manual Font Kerning**からAnimateを使う方法がManualに記載されています。

ViewerにはCharacter・Word・Lineの変形用Pivotも表示できます。文字単位で回転や移動を試すときは、どの単位の支点を操作しているかを確認してください。文字の輪郭表示は編集用のガイドであり、レンダリングされるOutline装飾とは異なります。

<!-- capture:S156 -->

## 実機例：2つの文字を管理して背景へ重ねる

初期の文字レイヤーを `Name` とし、InspectorのPointを1回追加して2つ目の `Role` を作りました。`Name` はArial Bold、Size 0.12、Center (0.5, 0.6)、`Role` はArial Regular、Size 0.06、Center (0.5, 0.43) です。Pointの追加とレイヤー選択はGUIで、文字・書式・位置の設定はSDKで行い、値を読み戻しています。

生成した文字をMergeのForeground、濃い青のBackgroundをMergeのBackgroundへ接続します。`SAMPLE NAME` を `NOVA NAME` に変更した前後で、`DESIGNER` とその書式・位置は変わりませんでした。左Viewerで文字出力のAlphaも確認し、撮影後にColorへ戻しています。[接続と設定の記録](/img/fusion/captures/S156/readback.json)に値を記録しています。

WindowsのResolve Studio 21.1.0.14におけるframe 0の例です。CSV、Text Box、Circle、アニメーションやほかのフォントはこの例では検証していません。

[![背景とMultiTextをMergeで重ねてMediaOutへ渡すNode接続](/img/fusion/captures/S156/graph.png)](/img/fusion/captures/S156/graph.png)

PlateをBackground、MultiText1をForegroundへ渡し、CompositeからMediaOutへ接続します。

[![Nameと名付けた1項目だけがあるMultiTextのText List](/img/fusion/captures/S156/one-layer.png)](/img/fusion/captures/S156/one-layer.png)

初期の文字レイヤーをNameとして使います。

[![Pointを追加後、NameのほかにText 1が現れたText List](/img/fusion/captures/S156/point-added.png)](/img/fusion/captures/S156/point-added.png)

Pointを1回追加すると、もう1つの文字項目Text 1が現れました。

[![Roleを選びDESIGNERとArial Regularサイズ0.06を表示したInspector](/img/fusion/captures/S156/role-controls.png)](/img/fusion/captures/S156/role-controls.png)

2つ目をRoleとし、DESIGNER、Arial Regular、Size 0.06に設定します。

[![SAMPLE NAMEとDESIGNERの透明な文字と背景への合成](/img/fusion/captures/S156/before-edit.png)](/img/fusion/captures/S156/before-edit.png)

左は透明部分を含むMultiText出力、右は背景を重ねたMediaOutです。

[![Nameの文字をNOVA NAMEへ変更しRoleを維持したText List](/img/fusion/captures/S156/name-controls.png)](/img/fusion/captures/S156/name-controls.png)

NameだけをNOVA NAMEへ変更し、RoleのDESIGNERは維持しました。

[![NOVA NAMEとDESIGNERの透明な文字と背景への合成](/img/fusion/captures/S156/after-edit.png)](/img/fusion/captures/S156/after-edit.png)

変更後も2行を1枚の画像として出力し、背景に重ねています。

[![左ViewerのチャンネルメニューでAlphaが選択されている](/img/fusion/captures/S156/alpha-menu.png)](/img/fusion/captures/S156/alpha-menu.png)

左ViewerのチャンネルメニューでAlphaが選択されていることを確認しました。

[![左は文字出力のAlpha表示、右は背景に重ねたColor表示](/img/fusion/captures/S156/text-alpha.png)](/img/fusion/captures/S156/text-alpha.png)

左は文字出力のAlpha、右は合成後のColorです。黒は透明、白は不透明を表します。

[再現用Graph](/img/fusion/captures/S156/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S156/capture.json)

<!-- /capture:S156 -->

## 制作例1：氏名と肩書きを1つのテロップにする

1. MultiTextの初期文字レイヤーを使い、Pointを1つ追加して、それぞれに氏名と肩書きを入力します。Text Listで「Name」「Role」などの名前を付けて区別します。
2. Nameには大きなFont Size、Roleには小さなFont Sizeを指定し、Text tabで必要な字間と行間を調整します。
3. Layout tabで2つのレイヤーを配置し、Align Layerで左端を揃えます。氏名が長くなったときも整列が崩れていないか確認します。
4. Shading tabで白い文字にOutlineまたはShadowを付け、映像の明部・暗部の双方で読めるか確認します。
5. MultiText出力をMergeのForegroundへ、撮影映像をBackgroundへ渡します。Viewerで複数フレームを確認し、文字の上下左右が切れていないか点検します。

この構成では文字レイヤーが1つのMultiText内に収まります。氏名だけ差し替えたいときはText ListでNameを選び、ほかの装飾やMergeの接続を維持したまま編集できます。

## 制作例2：CSVからスタッフ一覧を作る

1. 役職・氏名などを列として持つCSVファイルを用意します。日本語や記号の表示は取り込み後に確認します。
2. MultiTextのCSVから読み込み、各列がText Listへどのように展開されたか確かめます。
3. 列ごとにFont、Tracking、Alignを指定します。たとえば役職を右揃え、氏名を左揃えにすることで、異なる長さの文字を一覧にできます。
4. Layout tabで列の間隔と行の位置を合わせ、Page / Shadingを必要に応じて調整します。
5. Mergeへ接続し、文字がフレーム端やセーフ領域を越えていないか確認します。

CSVを使う目的は、表全体を1本の長い文字列として打ち直さず、**列ごとの書式を維持した状態で編集できること**です。多数の行を扱う場合は、読み込んだ列の対応と実際の行順が期待どおりか先に確認します。

## Text+ / Text 3Dとの使い分け

| 目的 | 選ぶNode | 理由 |
| --- | --- | --- |
| 1つの文字列を組版し、文字単位の細かなAnimationを作る | [Text+](./text-plus) | 単一Textの操作を中心にした構成に向きます。 |
| 複数の文字レイヤーを1か所で管理し、整列・CSV取込を行う | **MultiText** | Text Listで複数レイヤーをまとめて扱えます。 |
| 文字に厚みやBevelを付け、3Dシーン内に配置する | [Text 3D](../3d/text-3d) | Classic 3Dシーンを生成し、Renderer 3Dで2D Imageに変換します。 |

MultiTextにはZ位置や3軸回転があっても、それだけでClassic 3Dシーンが出力されるわけではありません。後段へ渡すのはあくまで2D Imageです。

## 注意点と確認範囲

- Effect Maskは文字の生成結果を制限する入力です。既存映像を直接合成する入力としては扱いません。
- Point / Text Box / Circleで文字の流れ方が変わります。長い文章が意図せず切れる場合はText BoxのWrap / Clipの設定を確認します。
- フォント差し替えで行送り・字幅が変わるため、複数レイヤーの相対位置とAlign Layerを見直します。
- CSVの列がText Listへ取り込まれる仕様と、外部CSVとの継続同期は別の話です。後者を確認済み機能としては扱いません。
- このページでは21.1 Reference Manualで確認できたControl名と役割を記載しています。WindowsのResolve Studio 21.1.0.14では内部REGID `MultiText` と実機例を確認しました。すべての初期値・範囲、edition差、各フォントでの描画結果は未検証です。

## 関連ページ

- [Generator Family Overview](./)
- [Text+](./text-plus)
- [Text 3D](../3d/text-3d)
- [Merge](../compositing/merge)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## バージョンと出典

- **DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 103「Generator Nodes」pp.2368–2376：MultiTextのEffect Mask、Text List、Point / Text Box / Circle / CSV、Text / Layout / Shading / Page / Imageの各設定、Viewer操作。
- 同Manual、Chapter 56「Titles, Generators, and Stills」pp.1189–1191：Edit pageのMultiText Titles、CSV取込、タイトル制作での位置づけ。
- 本文の一般的な機能説明は21.1 Manualに基づき、実機例とREGIDは上記の環境に限る観測です。ほかのruntime固有の端子ID・表示差などは確定していません。
