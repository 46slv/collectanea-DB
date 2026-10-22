---
title: Versions（同じショットのグレード案を切り替えて比較する）
description: ColorページでLocal／Remote VersionsとStillを使い分け、同じショットの補正案を比較する方法。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Versions, Local Versions, Remote Versions, Split Screen, Gallery, Still]
tasks: [compare-grades, manage-grade-variants, grade, reuse-grade]
level: intermediate
updated: "2026-10-22"
---

# Versions（同じショットのグレード案を切り替えて比較する）

同じショットで「自然な肌を残す案」と「コントラストを強めた案」を比較したい場合、グレードを上書きし続けると元の案へ戻って検討しにくくなります。Colorページの**Versions（バージョン）**は、同じクリップに複数のグレード案を持たせるための機能です。Blackmagic Designの公式Colorページでは、**単一クリップの複数バージョンをSplit Screenで比較できる**と案内しています。

このページでは、案を分ける方法、別ショットへの波及を避ける判断、画としての比較方法を扱います。**対象はColorページのグレード**です。編集ページのタイムライン複製、Fusionのノード履歴、DaVinci Resolve 21で追加されたGroup Versionsの詳細操作とは分けて考えます。

## Versions／Still／クリップコピーの違い

| 手段 | 向いている目的 | 比較時の注意 |
| --- | --- | --- |
| Local Version | あるクリップの補正案を複数持ち、選んだ案を調整する | 別クリップや別タイムラインへの連動を期待しない |
| Remote Version | 同一ソースに由来するクリップ間でグレードを共有する運用 | ほかの使用箇所へ変更が及ぶ可能性を把握してから編集する |
| GalleryのStill | 見た目と保存時点のグレードを基準にし、ほかのショットへ再利用する | 保存後のクリップ編集とStillは同一状態とは限らない |
| クリップ／タイムラインを複製 | 編集位置や尺を含めた別構成が必要なとき | 色の案だけなら複製を増やさずVersionsで整理できる |

Local／Remoteの区別はBlackmagic Designの過去の公式Reference Manualにも記載されています。ただし、その版のUIや同期範囲を**21.1で実機確認したものではありません**。現在選択されているVersion種別は、別タイムラインへの影響を判断するためにも操作前に確認してください。

Stillの保存と適用については[Gallery／Stills](./gallery-stills)を参照してください。**Versionは同一ショットの代案、Stillは比較基準や他ショットへの受け渡し**を中心に使うと整理しやすくなります。

## 1. 既存の補正案を残して別案を作る

ここでは、すでに露出とホワイトバランスを整えたインタビューショットに、もう1つのLookを試すことを想定します。

1. Colorページで対象クリップを選び、Viewerと[Node Graph](../learn/color-node-graph)で現在のグレードを確認します。選択しているクリップが意図したショットかを先に確かめます。
2. クリップのVersion管理メニューから、**Local Versionとして別案を作る**操作を探します。過去のBlackmagic Design公式Reference Manualには、クリップの右クリックメニュー内の「Local Versions」から「Create New Version」を選ぶ方法が記載されています。**21.1ではこのメニュー階層と名称を実機照合していない**ため、実際の画面で現在の項目を確認してから操作してください。
3. 基準案と試作案を区別できる名前にします。たとえば「Natural」と「Warm Contrast」です。通し番号だけでは、後で案を選ぶ際に内容が分かりにくくなります。
4. 新しい案を選んでから、[Primaries](./primaries-color-wheels)や[Curves](./custom-curves)で見た目を変えます。肌を暖かくする場合、白い衣装や背景まで不用意に黄ばんでいないかViewerで確認します。
5. 元の案へ切り替え、変更前の見た目を確かめます。元の案まで変わっているようなら、編集していたVersion種別や対象クリップを再確認してください。

**判断例：** 暖色案は雰囲気が良くても、肌の赤みを上げ過ぎているかもしれません。Natural案を残しておけば、色の方向を比べた上で別案の強さだけ戻せます。比較前に両案の入力変換や色管理条件が同じかも確認します。

この手順の「別案を残す」「切り替えて確認する」はVersionsの一般的な用途に基づいています。21.1固有のダイアログ内容、デフォルト名、ショートカットやコピーされる内部データの範囲は確認できていません。

## 2. Split Screenで同一ショットの案を比較する

Blackmagic Designの[Color公式ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)は、Split Screenで**同一クリップの複数Version**を比較できると説明しています。通常の1画面表示で案を順に切り替えるのとは異なり、同時に見て判断できます。

1. 比較対象のクリップと、作成した複数のVersionを確認します。
2. ColorページのViewerで**Split Screen**を有効にします。公式ページでは表示内容をViewer右上のドロップダウンで選べると案内されています。
3. 同じクリップのVersionを比較する表示対象を選びます。ここでの具体的な選択肢の文字列や配置は、21.1実機では未確認です。
4. 顔の中間調、白い服、暗部の色、明るい窓など、同じ画面位置に写る要素を案同士で比べます。必要なら[Scopes](./scopes)でも差を観察します。
5. 最終候補を選んだら、静止比較だけで終えず、前後のカットを通常再生して違和感がないか確認します。1ショットで成立するLookでも、隣接ショットから浮く場合があります。

2案の明暗差を調べるときは、同じフレーム・同じ表示条件で比べます。比較対象が異なる時刻だったり、片方だけ別のカラー変換を経ていたりすると、グレードの違いと撮影条件の違いを取り違えます。

Image Wipeは2つの画像の部分的な比較に使えますが、**複数Versionの一覧にはSplit Screen**が直接対応します。公式Colorページが保証しているのは機能と用途であり、本記事は21.1における各表示モードの全名称を列挙しません。

## 3. LocalとRemoteを選び間違えない

Local Versionは、同じ素材が複数箇所で使われていても、**そのクリップ固有の調整案**として扱いたいときの基本候補です。一方、Remote Versionは、同じソースクリップを別タイムラインでも使い、そのグレードを共通にしたい運用で検討します。この区別はBlackmagic Designの旧版Reference Manualにも説明されています。

例えば、インタビューの同じカメラ素材を本編と告知映像で使っている場合を考えます。

- **本編だけ暖色にしたい：** 本編の当該クリップでLocal Versionを使い、他の使用箇所まで変える運用を避けます。
- **同じソースの全使用箇所で基礎補正を共通化したい：** Remoteの利用を検討できます。ただし、ソース単位の共有という性質を理解し、影響するタイムラインを特定してから操作します。
- **カメラや照明が違う複数ショットをまとめたい：** Remote Versionがショットマッチングを自動で完成させるわけではありません。[複数カメラのマッチング手順](../recipes/matching-multicamera-interview)を参考に、個別の差を整えます。

この区別はグレード管理の考え方を示すもので、21.1での共有単位、コピーや切り替え後の例外、プロジェクトの各種設定をすべて検証した説明ではありません。既存プロジェクトでRemoteを使用している場合、試験的な変更がほかの編集箇所へ反映されないかを優先して確認してください。

## 4. DaVinci Resolve 21のGroup Versionsとの関係

Blackmagic Designの[DaVinci Resolve 21「What's New」](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew)では、Colorページの更新項目として**Group Versions**が明記されています。これはLocal／Remote Versionの説明と混同しない方が安全です。

本記事は**クリップ単位の案の管理と比較**に範囲を限定します。Group Versionsの生成・切り替え・共有対象・優先順位、従来のグループグレーディングとの相互作用は、21.1 Reference Manualの該当箇所または21.1実機で確認できるまで確定手順として示しません。

## 5. 実践：MVの人物ショットで2つのLookを選ぶ

同じ人物が正面を向くショットで、A案＝肌を自然に保ち背景の青を残す、B案＝コントラストを上げて背景を少し寒色に寄せる、という2案を比較するとします。

最初に露出と入力変換を確認し、元の補正案をLocal Versionとして残します。別案では背景の方向を変えますが、顔が暗くなり過ぎていないか、唇の血色が失われていないかも観察します。Split Screenで同じフレームを並べ、**人物の見え方と背景の演出**を別々に評価します。

仮にB案の背景が好みでも、顔が暗くなるならBをそのまま採用する必要はありません。Bのまま顔の補正を調整して再度比較します。採用した後は前後のカットでも再生し、Lookの連続性が保てているか確認します。

最終採用案のグレードを別ショットへ流用する場合は、[Gallery／Stills](./gallery-stills)を使う方法もあります。ただし、別ショットのWindow、Tracker、入力色空間にそのまま適合するとは限りません。

## 期待どおりにならないとき

| 症状 | 先に確認すること |
| --- | --- |
| 前の案へ戻せない | 別Versionを作成・選択していたか、元の案を上書きしていないか |
| 別タイムラインの同素材まで色が変わった | Remote Versionの使用有無、共有対象となるソースと各使用箇所 |
| Split Screenで別案が見つからない | 同一クリップに複数Versionがあるか、表示対象の選択、選択中のクリップ |
| 2案の画がほぼ同じ | 両Versionのグレード内容、比較するフレームと表示条件 |
| 案単体は良いのにカット間で浮く | 前後のショット、照明・露出・肌の連続性、同じ出力条件 |
| Stillを適用したら前の補正が変わった | 適用先のVersionとノード構成、保存済みStillの内容 |

## 出典・対象版・検証範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design[『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月8日公開）。公式サポートで公開日を確認しましたが、PDFが約183 MBと大きく、この環境ではVersionsの該当章を直接照合できませんでした。
- **21系で直接確認：** [Blackmagic Design「DaVinci Resolve — Color」](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)の「ショットの比較」（同一クリップの複数VersionをSplit Screenで比較可能）と[「What's New」](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew)（ColorページのGroup Versionsへの言及）。確認日：2026年10月22日。
- **歴史的操作資料：** Blackmagic Design[『DaVinci Resolve 11 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_11_Reference_Manual.pdf)の「Using Versions to Manage Grades」。Local／Remoteの性質と旧版のVersion作成メニューを確認しました。**そのまま21.1のUI仕様へ一般化していません**。[『The Colorist Guide to DaVinci Resolve 20』](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)もVersionsを扱う公式学習資料ですが、本文の当該章は本環境で直接照合できていません。
- **verification: partial。** 21.1実機でのLocal／Remote作成・切り替えメニュー、Group Versionsの詳細、キーフレーム／Tracker情報の複製範囲、Free／Studio差は未確認です。上記のMV例は操作判断の想定例で、実機受入結果ではありません。

関連：[Gallery／Stills](./gallery-stills)／[Node Graph](../learn/color-node-graph)／[Scopes](./scopes)
