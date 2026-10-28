---
title: 夕景の複数ショットをGroupでそろえ、共通Lookを一度に調整する
description: Resolve 21.1のGroup Pre-Clip／Clip／Group Post-Clipを使い、夕景4カットの基礎補正・ショット差・共通Lookを分けるレシピ。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Groups, Group Pre-Clip, Clip, Group Post-Clip, Node Editor, Primaries, Scopes, Image Wipe]
tasks: [group-grading, shot-matching, look-development, grade]
level: intermediate
updated: "2026-10-28"
---

# 夕景4カットの色をそろえ、Lookだけを一括で変える

同じ夕方のシーンでも、人物の寄り、街路、空、引きの画では露出や光の向きが異なります。全カットへ同じ補正をコピーすると、暗いショットまで明るくなったり、せっかく整えた個別補正を上書きしたりします。

この制作例では、**共通の基礎補正をGroup Pre-Clip、ショットごとの差をClip、シーンの演出LookをGroup Post-Clip**へ分けます。最後にLookを変更しても、個別カットの露出調整を一つずつやり直さない構成が完成条件です。各モードの機能説明は[Group Grading](../reference/group-grading)を参照してください。

## 素材と完成条件

編集タイムラインに次の5ショットがあると想定します。A〜Dは同じ夕景シーンで連続または離れた位置に配置され、Eは翌朝の屋内カットです。すべて実素材を使った検証結果ではなく、操作範囲を学ぶための**仮想制作例**です。

| カット | 内容・想定尺 | 開始時の課題 | グループ |
| --- | --- | --- | --- |
| A | 夕日の逆光を受ける人物の寄り・4秒 | 顔は適切だが全体が少しマゼンタ寄り | 夕景 |
| B | 日陰の街路・3秒 | Aより中間調が暗い | 夕景 |
| C | 空を含む横顔・3秒 | 夕日の暖色が強いが、残したい | 夕景 |
| D | 人物と建物の引き・4秒 | Aより低コントラスト | 夕景 |
| E | 翌朝の室内・4秒 | 夕景の演出を加えたくない | 所属なし |

A〜Dは例として同じカメラのS-Gamut3.Cine／S-Log3、10-bitで収録したものとし、**Resolve Color Management（RCM）**で各クリップのInputを正しく割り当て、TimelineはDaVinci Wide Gamut／Intermediate、OutputはRec.709 Gamma 2.4とします。納品先が異なる場合は条件を置き換えます。RCMを使う例なので、同じLog→Timeline変換をGroup内のCSTや技術LUTで重ねません。[色管理の基礎](../learn/color-management-basics)も参照してください。

成功の判定は、A〜Dに共通する演出を一度に変更できること、BとDの個別補正が保持されること、Eには夕景Lookが作用しないことです。夕日の色や逆光まで無彩色にそろえる必要はありません。

## 1. A〜Dだけをグループ化する

1. Colorページで対象タイムラインを開き、A〜Dのクリップサムネイルを選択します。離れているカットを含める場合も、目的の4カットだけが選択されていることを確認します。
2. 選択したサムネイルを右クリックし、**Add Into New Group**から新しいグループを作り、「夕景」と名付けます。これはResolve 21.1公式ManualのChapter 142に記載された操作です。
3. 4カットにグループ所属を示すリンク状のバッジが出ることを確認します。Eには表示されないことを確かめます。
4. グループ所属クリップを選ぶと、Node Editorのモードに**Group Pre-Clip／Clip／Group Post-Clip／Timeline**の4段階が現れます。どの段階を編集中か、補正を加える前に確認します。

ここでEまでグループに入っていたら、補正を始める前に所属を修正します。Groupは同じ編集タイムラインで隣接するかどうかではなく、**補正を共有したいクリップの集合**です。

## 2. Pre-Clipに共通する基礎補正を置く

1. Aを選び、Node Editorを**Group Pre-Clip**へ切り替えます。
2. [Primaries](../reference/primaries-color-wheels)でA〜Dに共通する弱いマゼンタ寄りや低いコントラストを、全カットを見比べながら少しずつ補正します。まず1項目だけを動かし、別のカットにも変化が及ぶことを確認します。
3. A、B、C、DのViewerと[Scopes](../reference/scopes)を確認します。Cに残したい夕日の暖色が薄れ、逆に不自然な青みが出るなら、共通補正を弱めてCの事情はClip側で扱います。
4. Eへ移動し、夕景グループで加えた共通補正が波及していないことを確認します。

**期待する結果：** A〜Dには共通の基準ができる一方、カット間の露出差はまだ残ります。Pre-Clipは全カットを機械的に一致させる段階ではありません。

## 3. ClipでB・Dだけを調整する

1. Bを選び、Node Editorを**Clip**に切り替えます。Bの中間調だけが暗く見えるなら、Primariesで露出の印象を整えます。Aの基準と[Image Wipe](./image-wipe-two-shot-comparison)またはScopesを使って比較します。
2. Dへ移動し、Clip段階で引きの構図に合うコントラストを調整します。人物の顔、建物の明部、暗い路地を一緒に確認します。
3. AとCは必要がなければClipに補正を足しません。Bを補正してもA・C・DのClipノードには変更が及ばないことを確認します。
4. A→B→C→Dを連続再生し、顔と街路の明るさが唐突に跳ばず、逆光・日陰という照明の違いは保たれているか確認します。

ClipはPre-Clipの**後**に適用されます。後からPre-Clipを大きく変えると、Clip段階の選択範囲や補正結果が変わり得ます。特にQualifierを使っている場合は、共通補正後にMatteも点検します。

## 4. Post-Clipに夕景Lookを置く

1. Aへ戻り、Node Editorを**Group Post-Clip**に切り替えます。先ほどのClip補正を保持したまま、シーン全体へ共通するLookを作ります。
2. 例として暗部を少し寒色寄りにする、あるいはコントラストの印象をわずかに変える補正をPrimariesで試します。夕日の暖色が失われるほど強く変更しません。
3. A〜Dを順に表示し、顔・空・建物の暗部への影響を確認します。意図した方向でもCの空の彩度だけ過剰になる場合は、Post-Clipを弱めるかClipの調整を見直します。
4. Post-Clipのノードを一時的に無効化して有無を比較し、最後に再度有効化します。BとDのClip補正が残っていること、EにはLookが適用されないことを確かめます。

**期待する結果：** A〜Dは共通の夕景Lookを持ち、BとDのショット別の調整は維持されます。クライアントから「夕景全体を少し落ち着かせたい」と依頼された場合は、まずPost-Clip側を変更して4カットで成立するか再評価できます。

## 5. Timeline補正と取り違えていないか確認する

**Timeline**段階は現在の編集タイムライン全体に作用し、夕景グループ外のEにも影響します。夕景だけを変える目的ならTimelineにLookを置きません。既存のTimelineグレードがある場合は[Timelineグレーディング](../reference/timeline-grading)に沿って全編への影響を調べます。

またGalleryのStillは、保存した画像にはPre-Clip・Clip・Post-Clipの合成結果が映っていても、**保存されるグレードはStillを作ったときに選択していたNode Editorモードに依存する**と公式Manual Chapter 142は説明しています。後からStillを別カットへ適用するとき、見た目の画像とコピーされるノードを同一視しないでください。

## よくある失敗と切り分け

| 症状 | 確認と対応 |
| --- | --- |
| Bだけ補正したつもりがA〜Dも変わる | 編集モードがClipではなくGroup Pre-Clip／Post-Clipになっていないかを確認 |
| Eまで夕景Lookになった | Eがグループへ所属していないか、Timeline段階にLookを置いていないかを確認 |
| Cの夕日が青くなった | Pre-Clipの共通色補正が強すぎないか確認し、共通処理を弱める |
| Post-Clipで一部の空だけ彩度が破綻する | A〜Dの入力変換、Clipでの補正量、共通Lookの強さを確認 |
| Stillを適用しても期待したLookにならない | 保存時と適用時のNode Editorモードを確認。Stillの画像と保存グレードの範囲は異なる |
| 同じカメラなのに一部だけ異常な色になる | クリップのInput設定・CST／LUTの二重変換、グループに不適切な素材が混ざっていないか確認 |

グループからクリップを取り出す場合、**Remove From Group**と**Collapse Group Grades**は同じ操作ではありません。後者はPre-Clip／Post-ClipのノードをClipへ移し、グループから外すとManualにあります。元の構造を維持したい案件では、実行前に残したいグレードと所属を確認します。

## 出典と未検証範囲

- **直接確認した一次資料：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月版）、**Color Chapter 142「Grade Management」pp.3377–3382**。2026-10-28に公式ManualをChatGPT Libraryから再取得し、Add Into New Group、4段階の適用範囲と処理順、Stillの保存範囲、Collapse Group Gradesの説明を照合しました。
- **作例の位置づけ：** A〜Eの素材、RCMの設定例、夕景Lookの強さと完成判定は、公式機能から構成した**仮想ワークフロー**です。実際のグレーディング結果や推奨パラメータ値を測定したものではありません。
- **verification: partial。** Resolve 21.1実機でのメニュー操作、素材の実際の色変化、Free／Studio差、OS別の選択操作、全ての色管理・RAW経路、レンダー結果は未検証です。Manual上の仕様と実機受入を分けて扱います。

関連：[グループの機能](../reference/group-grading)／[Node Graph](../learn/color-node-graph)／[3カメラのショットマッチング](./matching-multicamera-interview)／[ノード無効化による診断](../troubleshooting/node-bypass-diagnostics)
