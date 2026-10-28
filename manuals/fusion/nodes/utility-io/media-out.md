---
title: "MediaOut"
description: "Fusionで合成した画像をResolveのTimelineへ返す出力Node。Color Gradeプレビュー、追加MediaOutによるMatteの受け渡しを説明。"
doc_type: node
term_id: "media-out"
term_short: "MediaOutは、Fusionの処理結果をResolveのTimelineへ渡す終端Node。"
verification: partial
aliases: ["MediaOut", "Media Out", "MO"]
concepts: ["image-data", "resolve-integration", "output-boundary"]
nodes: ["MediaOut"]
node_family: "utility-io"
inputs: ["image"]
tasks: ["output", "cross-page-workflow", "matte"]
level: foundation
product_scope: resolve
suite_surfaces: ["fusion", "edit", "color"]
updated: "2026-10-15"
---

# MediaOut

**MediaOutは、Fusionで作った2D画像をDaVinci ResolveのTimelineへ返す出口です。** クリップの加工、タイトル、キーイング、複数素材の合成など、Fusion内で処理した結果をEdit／Cutページで使用するときに接続します。ResolveのFusion compositionには、少なくとも1つのMediaOutが必要です。

通常のクリップをFusionページで開くと、[MediaIn](./media-in)からMediaOutへ画像が流れる構成になります。

```text
MediaIn1 → Transform1 → MediaOut1
```

MediaInが素材を読み込み、Transformが位置や大きさを変え、MediaOutがその結果をTimeline側へ渡します。MediaOut自体に画像を加工するための通常のフィルター設定があるわけではありません。また、**MediaOutをViewerへ表示することと、最終動画ファイルを書き出すことは別**です。Timeline全体の書き出しはResolveのDeliverページなどで行います。

## 入力・出力

| 接続・出力先 | 役割 |
| --- | --- |
| オレンジ色のImage入力（必須） | 最終的に返したい2D Imageを受け取る。Merge、Transform、Text+などの処理結果を接続できる |
| ResolveのTimeline／Colorページへの受け渡し | Node Editor内の次のNodeへ出す端子ではなく、Resolve内部の映像処理経路へ画像を送る |

MediaOutは、Image入力に何も接続していなければ完成画像を受け取れません。出力先で画像が黒く見える場合は、まずMediaOutの前にあるNodeをViewerに表示し、画像が実際に届いているか確かめます。

**MediaOutはDaVinci Resolve専用**です。独立したFusion Studioで画像連番や動画をディスクへ出す場合は[Saver](./saver)を使います。

## 接続例：Shapeを画像化して渡す

下の例では、2つのShapeをsMergeでまとめ、sRenderで画像化した後、MediaOut1へ接続しています。[sMergeの実機例](../shapes/smerge)で使った同じGraphです。

[![2つのShapeをsMergeでまとめ、sRenderの画像出力をMediaOut1へ接続したGraph](/img/fusion/captures/S171/graph.png)](/img/fusion/captures/S171/graph.png)

`Render_`はsRenderの名前で、右隣のMediaOut1へ画像を渡します。[接続と撮影条件](/img/fusion/captures/S171/readback.json)にはframe 0の構成を記録しています。この画像はFusion内の接続例です。EditやColorページでの表示、MediaOutのColor Grade設定は示していません。

## MediaOut1と追加のMediaOut

**最初のMediaOut（通常はMediaOut1）**は、合成した画像をEdit／CutページのTimelineに戻します。Fusionページの完成画像をつなぐ先は、通常このMediaOut1です。

一方、MediaOutを2つ以上置くこともできます。**追加のMediaOutは、Colorページで使うMatteを渡す用途**があります。Matteとは、人物だけに色調整をかける場合などに、調整を適用する領域を表す白黒・透明度の情報です。

```text
映像の合成結果 ────────────→ MediaOut1 → Timelineの完成画像
人物を分離したMatteを持つ画像 → MediaOut2 → Colorページの追加Source
```

MediaOut2を追加しただけで、Matteが自動的にColorの補正へ適用されるわけではありません。Colorページ側でそのSourceを追加し、補正NodeのKey入力につなぐ必要があります。

## InspectorのColor Grade：None／Color／Mix

MediaOutのInspectorには、FusionのViewerで他ページの処理結果を確認するための**Color Gradeプレビュー**があります。

| 設定 | Fusion Viewerに表示されるもの | 表示解像度 |
| --- | --- | --- |
| **None**（初期値） | Fusion compositionの出力のみ | 元素材／compositionの解像度 |
| **Color** | Fusionの出力に、Colorページの調整を含めた見た目 | Timeline解像度 |
| **Mix** | Fusionの出力に、Edit／CutページのエフェクトとColorページの調整を含めた見た目 | Timeline解像度 |

重要なのは、**3つともプレビューの切り替えであり、MediaOutが受け取った実際の出力画像は変わらない**ことです。

例えば、Editページでクリップにエフェクトをかけ、Colorページでもグレーディングした場合、Fusionの加工結果だけを確認するならNone、グレーディング後の見え方を確認するならColor、Edit側のエフェクトも含めて確認するならMixを選びます。NoneとColor／Mixで画面上の大きさや画質が違って見える場合は、まず上表の**表示解像度の違い**を確認します。

このプレビューは、Colorページの補正をFusionのNode Graphの途中へ差し込む機能ではありません。Fusion内で色を使ったキーイングや合成をする場合は、Fusionの処理そのものと、後段のColorページを区別して考えます。

## カラーマネジメントとの関係

Resolve Color Management（RCM）またはACESを使用する場合、Manualでは、**各MediaOutがColorページへの受け渡しに際して画像をTimeline color spaceへ変換する**と説明されています。

そのため、MediaOutに到達するまでのFusion内部の処理空間と、Colorページへ渡る画像の色空間は同じとは限りません。色の違いが生じたら、[MediaIn](./media-in)側の素材解釈、Fusion内の色処理、プロジェクトのColor Management設定を順に確認し、同じ変換を重複して挿入しないようにします。

MediaOutのColor GradeをColorやMixへ変更しても、この受け渡しの変換設定を変更することにはなりません。**プレビューの見え方**と**色管理された出力経路**は別の仕組みです。

## Timelineへ返す画像・透明度・キャッシュ

MediaOut1へ渡すのは、完成した**2D Image（RGBとAlphaを含む画像）**です。Alphaを透明にしたまま返せば、Editページの下のトラックを背景として見せることもできます。必ずしもFusion内で背景までMergeして完成させる必要はありません。

例えば、Editページで人物のグリーンバック素材を上段トラック、背景映像を下段トラックに置いている場合、人物のクリップをFusionページで開き、次のようにつなぎます。

```text
MediaIn1（人物素材） → DeltaKeyer1（背景を透明化） → MediaOut1
Editページ：上段＝Alpha付き人物 ／ 下段＝背景映像
```

Delta Keyerが作ったAlphaをMediaOut1まで保持すると、Editページでは人物の透明部分から下段の背景が見えます。逆に、人物と背景を1つのFusion Compositionの中で完成させたい場合は、人物と背景を[Merge](../compositing/merge)してからMediaOut1へ接続します。**「Timelineで上下のトラックを重ねる」のか「Fusion内で合成を完結させる」のか**で構成が変わります。

### 画像サイズはTimelineと必ずしも同じではない

通常の単独クリップをEdit／CutページからFusionへ開いた場合、そのFusion Compositionは**元クリップの解像度**を基準にします。一方、複数のTimelineクリップをまとめて**Fusion Clip**にすると、各クリップはTimeline解像度へ合わせられます。例えば4K素材2本をHD Timeline上でFusion Clipにすると、そのFusion Clip内では元の4K解像度をそのまま扱えません。解像度を維持したい素材は、単独クリップからFusionを開き、ほかの素材をMedia Poolから追加する方法も検討します。

MediaOutで返した画像がTimeline解像度と異なる場合のスケーリングや、Edit／Cutページで使うキャッシュのファイル形式は、**ResolveのProject Settings側**で扱われます。MediaOutにはSaverのようなFilenameやOutput Formatの指定はありません。Smart Render Cacheを利用する構成では、Edit／Cutページに戻るとMediaOutの結果がキャッシュされることがありますが、それは[Saver](./saver)から手動でEXRをファイルに書き出す処理とは別です。

## 制作例1：TimelineのショットにFusionで加工を加える

1. Editページで映像クリップを選び、Fusionページへ移動します。
2. `MediaIn1 → MediaOut1`の間にTransformやBlurなど必要なNodeを接続します。
3. 最後のNodeの2D Image出力がMediaOut1のオレンジ色の入力につながっていることを確認します。
4. Editページに戻り、Timeline上で処理結果を確認します。

この構成では、FusionのNodeごとの処理がMediaOut1に集まり、編集クリップの映像として使われます。動画ファイルを書き出すためにFusion StudioのSaverを追加する必要はありません。

## 制作例2：人物のMatteをColorページへ渡して部分補正する

グリーンバックで抜いた人物を背景に合成した後、人物の肌だけをColorページで別に調整したい場合です。

1. Fusionで[Delta Keyer](../matte-keying/delta-keyer)などを使って人物のAlpha（透明度）を作り、背景と[Merge](../compositing/merge)します。
2. 背景と人物の完成画像を**MediaOut1**へ接続します。
3. 人物のMatteを保持した画像を、別に追加した**MediaOut2**へ接続します。
4. ColorページでNode Editorの空白を右クリックして**Add Source**を選び、MediaOut2に対応するSourceを表示します。
5. そのSourceを、人物だけを調整したいCorrector Nodeの**Key入力**につなぎます。例えば肌の色味を変えても、背景側にはその補正がかからないようにできます。

ColorページでSourceを複数表示した場合、各Sourceにカーソルを合わせると対応する出力を確認できます。Manualでは通常、FusionのMediaOutの順に上から下へ並ぶと説明されています。

**Matteの画像サイズにも注意してください。** 例えばキーイングした人物素材と背景素材の解像度が違うと、KeyerのAlphaをそのままMediaOut2へ送っただけでは、最終合成の表示領域とMatteが一致しないことがあります。21.1 Manualの例では、Mergeを追加しOperatorを**In**にして合成結果に合った領域へMatteを整え、その画像をMediaOut2へ送っています。まずMatteと完成画像のサイズ・位置が一致しているか確認します。

## 制作例3：Fusionの加工と他ページの調整を見比べる

1. Editページでクリップにエフェクトを追加し、Colorページでグレーディングします。
2. Fusionページで完成画像をMediaOut1へ接続し、Viewerに表示します。
3. MediaOutのColor Gradeを**None**にして、Fusionが作っている画像そのものを確認します。
4. **Color**にしてColorページの調整を含む見え方を確認します。
5. **Mix**にしてEdit／Cutページのエフェクトも含めた見え方を確認します。

プレビューの違いを見ながらFusionの合成を調整できる一方、**None／Color／Mixの切り替え自体は書き出し結果を変更しません**。Viewerのプレビューを最終出力への追加エフェクトと誤認しないことが大切です。

## よくある確認事項

- **Editに結果が戻らない**：MediaOut1へ画像がつながっているか、その手前のNodeは画像を出しているかを確認します。
- **Color GradeをColor／Mixへ切り替えたら画像のサイズが違って見える**：Noneは素材／Composition、Color／MixはTimeline解像度でのプレビューです。
- **Colorページで人物のMatteが使えない**：MediaOut2を作っただけでなく、ColorのNode EditorでAdd Sourceし、目的のCorrectorのKey入力へつないだか確認します。
- **Matteの境界が映像とずれる**：背景と人物の解像度、Fusionでの合成結果の表示領域、MediaOut2へ渡すMatteの大きさを確認します。
- **MediaOutとSaverのどちらを使うか迷う**：ResolveのTimelineへ返すならMediaOut、Fusion Studioから直接ファイルへレンダリングするならSaverです。

## 関連ページ

- [MediaIn](./media-in) — Timeline／Media Poolの素材をFusionへ渡す
- [Saver](./saver) — Fusion Studioで画像・連番をディスクに書き出す
- [Merge](../compositing/merge) — 前景と背景を重ね、Alphaを扱う
- [Delta Keyer](../matte-keying/delta-keyer) — グリーンバックなどからMatteを作る
- [External Matte Saver](./external-matte-saver) — Matteをファイル経由で扱う別の出力手段
- [I/O・Graph Utility一覧](./)

## バージョンと出典

**DaVinci Resolve 21.1 Reference Manual（September 2026）**を基準にしています。

- Chapter 104「I/O Nodes」pp.2419–2422：MediaOutの必須Image入力、Resolve専用の役割、複数MediaOut、Color GradeのNone／Color／Mixと表示解像度、RCM／ACESの受け渡し。
- Chapter 146「Combining Keys and Using Mattes」pp.3428–3430：FusionのMediaOut2からColorページでAdd Sourceを作成し、CorrectorのKey入力へ接続する実例。画像サイズが異なるときのMatteの調整。
- Chapter 64「Getting Clips into Fusion」pp.1332–1334：単独クリップとFusion Clipの解像度差、AlphaをTimelineの下段トラックと合成する例。
- Chapter 65「Rendering Using Saver Nodes」p.1358：MediaOutのTimelineへの出力とSmart Render Cache、Project Settingsで扱う出力解像度・キャッシュ形式、Saverとの違い。

本記事の説明は21.1 Manualで確認できた範囲です。Inspectorの内部Parameter ID、全Hostでの細かなUI差、解像度の特殊条件、複数Outputのすべての利用方法を実機で網羅検証したものではありません。
