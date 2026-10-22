---
title: Group Pre-Clip／Clip／Group Post-Clipの補正範囲
description: DaVinci Resolve Colorページのグループ補正を3段階に分け、複数ショットの共通補正と個別補正を管理する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Groups, Group Pre-Clip, Clip, Group Post-Clip, Node Editor, Group Versions]
tasks: [group-grading, match-shots, grade, reuse-grade, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# Group Pre-Clip／Clip／Group Post-Clip：共通補正とショット別補正を分ける

同じシーンの多数のカットを調整するとき、全クリップに共通するLookを一つずつ更新するのは手間がかかります。一方、完成したグレードを各クリップへコピーすると、カットごとに整えた露出や肌の補正まで置き換える場合があります。

Colorページのグループグレーディングは、複数クリップに共通する補正と、各ショット固有の補正を別の段階で扱う機能です。Blackmagic Designの[公式Colorページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)は、グループの前段・個別クリップ・グループの後段という構造を案内しています。

## 3段階の役割

| 段階 | 補正が作用する範囲 | 目的の例 |
| --- | --- | --- |
| Group Pre-Clip | グループ内の全クリップに、個別補正より前に適用 | 同じ撮影条件の素材に共通する基礎調整 |
| Clip | 選択した個別クリップ | ショットごとの露出・色・局所補正 |
| Group Post-Clip | 個別クリップの補正より後に、グループ全体へ適用 | シーンに共通するLookや最終調整 |

概念上の処理順は「素材 → Group Pre-Clip → Clip → Group Post-Clip → 後段」です。これはグループ内の3段階だけを示した簡略図で、Resolve Color Management、CST、Timelineレベルの補正、出力変換がどこで処理されるかを網羅しません。[カラーマネージメントの基礎](../learn/color-management-basics)を参照して、実際の変換経路を確認してください。

Pre-Clipを変更すると各Clipに入力される画像も変わります。例えばPre-Clipで全体の色を変更すると、後続Clipに置いたQualifierの抽出条件も変化し得ます。Post-Clipは個別Clipの後に作用するため、Lookを共通化する際に利用できます。

## グループの切り方を先に決める

同じカメラ・照明条件のクリップなら基礎調整を共有しやすい一方、同じシーンでも収録ガンマや色域、照明が異なるカットを無条件にまとめるべきではありません。

AカメラのLog映像とBカメラの別ガンマ映像に、同一のカメラ固有CSTをGroup Pre-Clipで適用すると、一方へ誤った変換を行う可能性があります。RCMで変換済みの素材へ同じCSTを重ねることも避けます。必要に応じてカメラごとにグループを分けるか、個別Clipやプロジェクト側で適切に入力を管理してください。

グループの共通条件は「同じ日に撮った」ではなく、どの補正を共有してよいかで決めます。同じカメラでも窓際と部屋の奥では露出・光源が違うため、共通補正がすべてのショットに有効か確認が必要です。

## 操作例1：インタビューの3ショットを整える

同じカメラ設定・照明で撮った正面・寄り・引きの3ショットを考えます。共通する色かぶりを直し、各ショットの露出を合わせ、最後に同じLookを加えます。

1. Colorページで対象の3ショットを選び、グループを作ります。Blackmagic Designの公式Colorページは、フィルムストリップ上のクリップを選択して右クリックし、グループを作成する方法を説明しています。ただし21.1の各メニュー項目と配置は未照合です。
2. Node Editorで現在の対象がGroup Pre-ClipかClipかを確認します。共通の色かぶりを調整する場合だけGroup Pre-Clipで補正し、3ショットを交互に確認します。
3. Clip段階で、寄りだけ顔が暗ければ寄りの[Primaries](./primaries-color-wheels)を調整します。正面・引きの個別グレードは変更しません。
4. Group Post-Clipに、3ショット共通のコントラストや色の演出を少量加えます。個別の露出差を強いLookで隠さないようにします。
5. [Scopes](./scopes)と[Gallery／Stills](./gallery-stills)で比較し、A→B→Cの順で再生して、肌・白い衣服・背景が不自然に跳ばないか確認します。比較の進め方は[3カメラインタビューのショットマッチング](../recipes/matching-multicamera-interview)も参照してください。

判断例として、共通の緑かぶりを補正すると正面と寄りは自然になったが、引きの照明がマゼンタに寄った場合、Pre-Clipを弱めて個別Clipで対処するか、グループの分割を検討します。これは操作の考え方を示す例で、21.1実機の検証結果ではありません。

## 操作例2：異なるカメラの共通Look

同じ会話場面を異なるカメラで撮影した場合、素材が正しく表示できるかを先に確認します。各素材の入力ガンマ・色域、RCMとCSTの適用状態を把握し、必要ならClip段階で露出と色を整えます。

その後、Group Post-Clipで共通Lookを試し、各カメラの肌・白い物・ハイライトが不自然にならないか確認します。同じLookで一方だけ破綻するなら、そのLookの内容、個別Clipの補正、グループ構成を見直します。グループ化はカメラ差を自動で解決しません。[Color Matchとカラーチャート](./color-match-chart)のような機能を使う場合も、入力条件の確認は必要です。

## DaVinci Resolve 21のGroup Versions

Blackmagic Designの[『DaVinci Resolve 21 New Features Guide』](https://documents.blackmagicdesign.com/SupportNotes/DaVinci_Resolve_21_New_Features_Guide.pdf)のColor章「Clip Groups Support Grade Versioning」（冊子91ページ）は、グループ単位で複数のグレード案を管理できるようになったと説明しています。Group Pre-Clip／Group Post-Clipのノードグラフにもバージョンを持たせられます。

**Group Versionは、グループの各クリップで別々のものを同時に選ぶ仕組みではありません。** グループのバージョンを切り替えると、所属する全クリップへ反映されます。同ガイドではColorページのグループ所属クリップを右クリックし、Groups配下のメニューからバージョンの作成・切り替えを行う操作が紹介されています。

「自然な色」と「冷たい色」の2案を検討する際は、共通LookをGroup Versionとして比較しつつ、所属するすべてのショットで成立するか確かめます。個別クリップのLocal／Remote VersionsやStillとの違いは[Versions／グレード比較](./versions-and-grade-comparison)を参照してください。

## Shared NodeやLayer Mixerとの違い

グループのPre-Clip／Post-Clipは、クリップが属するグループ全体に適用する処理段階です。一方、Shared Nodeは異なるクリップのグレード内で特定のCorrectorノードを共有する方法です。公式ColorページはShared Nodeの保存と複数クリップへの適用を説明しています。補正全体を共通化したいのか、一部のノードだけを共有したいのかで選びます。

[Serial／Parallel／Layerノード](./serial-parallel-layer-nodes)は、選んだ段階の内部でノードの処理・合成を構成する仕組みです。Group Pre-Clip／Clip／Post-Clipという**クリップへの適用範囲**とは役割が異なります。

## 症状別の確認

| 症状 | 確認すること |
| --- | --- |
| 1ショットだけ直したつもりが別ショットも変わった | 現在編集中の段階がPre-Clip／Post-Clipではないか |
| グループ内の特定カメラだけ彩度が異常 | 入力ガンマ・色域とRCM／CSTの重複を確認 |
| Pre-Clip変更後にQualifierの選択が変わった | Clip段階の入力画像と選択範囲を再確認 |
| Group Versionを切り替えたら他のカットも変わった | それがグループ全体に作用する仕様であることを確認 |
| ショット間の露出がそろわない | 個別の明暗差をClip段階で調整しているか確認 |
| 予定外のシーンまで同じLookになる | グループの所属クリップを再確認 |

## 出典・対象版・確認範囲

- 対象：DaVinci Resolve 21.1。[『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（Blackmagic Design、2026年9月8日公開）。今回はPDFの該当章を直接照合できておらず、21.1の全UI項目・例外・処理経路は未確認です。
- 基本機能：Blackmagic Design [『DaVinci Resolve — Color』](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)「グループ化したクリップでグレーディングを高速化」「グレードの保存、コピー、再利用」（2026年10月22日確認）。
- Group Versions：Blackmagic Design [『DaVinci Resolve 21 New Features Guide』](https://documents.blackmagicdesign.com/SupportNotes/DaVinci_Resolve_21_New_Features_Guide.pdf)、Color章、冊子91ページ「Clip Groups Support Grade Versioning」。グループバージョンの適用範囲と基本操作を確認。
- **verification: partial。** 操作例は公式資料に基づく想定例です。21.1実機操作、個別パラメータ、数値、Free／Studio差は推測していません。

関連：[Color Node Graph](../learn/color-node-graph)／[Color Management](../learn/color-management-basics)／[Versions](./versions-and-grade-comparison)／[ショットマッチング](../recipes/matching-multicamera-interview)