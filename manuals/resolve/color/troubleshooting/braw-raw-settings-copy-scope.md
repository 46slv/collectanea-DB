---
title: BRAWのRAW設定が編集できない・コピーすると別カットの色が変わるとき
description: Camera RawのDecode Using、グレードコピー、Use Changes／Use Settings、BRAW sidecarを切り分けて、クリップ別のRAW現像設定を守る。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Camera Raw, Decode Using, Use Changes, Use Settings, Copy Grade, Update Sidecar]
tasks: [decode-raw, match-shots, troubleshoot, preserve-settings]
symptoms: [raw-controls-disabled, copied-white-balance, raw-settings-overwritten, sidecar-mismatch]
level: intermediate
updated: "2026-10-25"
---

# BRAWのRAW設定が編集できない・コピーすると別カットの色が変わるとき

Blackmagic RAW（`.braw`）で撮影したカットの色温度を直したいのにCamera Rawの項目が操作できない。または、グレードをコピーしたら別カットのホワイトバランスまで変わってしまった。この2つは原因を分けて確認します。

Colorページの`Camera Raw`設定はグレードの一部としてコピーされる場合があります。一方、`Decode Using`を`Clip`にしないと個別クリップ用のパラメータを編集できません。さらにBRAWにはファイルに埋め込まれたメタデータと外部の`.sidecar`があり、別アプリでの見え方の差にも関係します。以下の項目名と動作はResolve 21.1公式ManualのChapter 130に基づきます。

## 確認用の素材と目標

25fps、各10秒程度の**別々のBRAW元ファイル**で撮影したインタビュー2カットを想定します。Aは室内の暖色灯、Bは窓からの昼光が主光源で、どちらも顔とニュートラルな服が映っています。Aの仕上げグレードをBへ流用したい一方、撮影環境に合わせたAとBのRAWホワイトバランスは別々に保持したい場面です。

目標は、**BだけRAWの色温度・Tintを調整でき、Aが変わらず、AのグレードをBへコピーしてもBのRAW設定が意図せず置き換わらない**ことです。両カットを同じKelvin値へそろえることは目標ではありません。この素材条件は説明用の仮想例で、実機で撮影・再現した結果ではありません。

## 最初の確認

1. Colorページのタイムラインで**Bを選択**し、Camera Rawパレットを開きます。別のカットを選んでいたり、RAWではない中間コーデックへ変換済みの場合は診断の前提が違います。
2. `Mode`が選択中のRAW形式に対応しているか見ます。公式ManualではRAW以外のクリップを選択するとCamera Rawのパラメータが無効になります。
3. Camera Rawの`Decode Using`を確認します。**クリップ個別の補正をしたい場合は`Clip`を選択**します。これでパレット内の編集可能な項目を使い、プロジェクト全体のRAW設定をそのクリップで上書きできます。
4. Bの顔・服・背景をViewerで確認し、[Scopes](../reference/scopes)のRGB Paradeとともに色温度またはTintを一項目ずつ小さく変更します。Bを調整した後、Aへ戻して結果が変わっていないか比較します。

`Clip`にしても項目が使えない場合、RAWファイル形式と選択クリップを再確認します。対応コーデックやRAW固有パラメータの詳細はCamera Raw Settings章の領域であり、BRAWでない素材に同じ操作を強制しません。

## グレードをコピーしたらRAW設定まで変わる

### RAWの個別設定を残したい場合

公式Manualは、通常のグレードコピーやGallery Stillの適用に**Camera Raw設定も含まれる**と説明しています。したがってAとBの色温度が別でも、AのグレードをBへ適用しただけでBのRAWの解釈まで変わる可能性があります。

Bの現在のRAW設定を保護したいときは、Galleryのコンテキストメニューにある`Copy Grade: Preserve Camera Raw Settings`を確認します。この選択肢は、グレードのコピー時に対象カットのCamera Raw設定を上書きしないためのものです。適用前にBの設定を控え、コピー後にBの`Decode Using`とColor Temp／Tintをもう一度確認します。

同じクリップで新しいVersionを作る場合も、作成時点のCamera Raw設定が新Versionへコピーされます。ただし、その後のRAW変更はVersionごとに独立します。[Versionsの比較](../reference/versions-and-grade-comparison)と、同じ元素材のカット間でグレードが共有される[Remote Gradesの診断](./remote-grades-linked-clips)は別の仕組みです。

### 複数クリップへRAWの変更を反映する場合

BRAWのRAW設定だけを意図して複数クリップへ反映させる場面では、先にColorページのタイムラインで**対象クリップの範囲**を選びます。Camera Rawで基準クリップの値を変更すると、変更されたパラメータ名は**アンバー色**で示されます。

| 操作 | 21.1 Manualでの動作 | 向いているケース |
| --- | --- | --- |
| `Use Changes` | アンバー色の**変更した項目だけ**を選択範囲の他クリップへ反映。未変更項目の差は残す | 共通して少しTintだけ補正し、カット固有の色温度は保持したい |
| `Use Settings` | 基準クリップの**Camera Raw全項目**を選択範囲の他クリップへ反映 | RAW設定を意図的に完全統一したい |

AとBが異なる照明下なら、安易に`Use Settings`を押さないでください。逆に`Use Changes`でも、**選択中のクリップには変更項目が伝播**します。「1カットだけ直す」場合は複数クリップへ反映する操作を使いません。反映後はAとBをそれぞれ開き、保持したいRAW項目まで変わっていないか確認します。

## 別のPCやBRAW対応アプリで見え方が違う

Blackmagic RAWは`.braw`内のlookメタデータに加え、外部`.sidecar`ファイルを利用できます。公式21.1 Manualでは、**sidecarがある場合、埋め込みメタデータよりsidecarの設定が優先**されると説明しています。別の環境で見え方が異なるときは、プロジェクトのカラー管理やLUTだけでなく、同名素材に対応するsidecarの有無と内容も比較します。

Colorページには`Update Sidecar`という操作があります。Manualの手順は、BRAWクリップを選択し、`Decode Using`を`Clip`にしてRAW項目を調整した後、`Update Sidecar`を押すものです。**これはディスク上のsidecarメタデータを更新して他のBRAW対応アプリにも影響させ得る操作**です。単にBだけ見た目を試している間は押さず、ファイル側へ変更を引き渡す意図がある場合にだけ使用してください。

## 誤操作後の切り分け

| 症状 | 最初に切り分ける箇所 | 戻す・調べ直す方向 |
| --- | --- | --- |
| RAW項目がグレーで操作できない | 選択クリップがRAWか／`Decode Using`が`Clip`か | RAW素材と個別デコード設定を確認 |
| Bへグレードをコピーしたら色温度も変わる | コピー元のCamera Raw設定まで適用していないか | コピー時のPreserve Camera Raw Settingsを確認 |
| Aだけ直すつもりがBも変わる | 複数選択と`Use Changes`／`Use Settings`の操作履歴 | RAW設定の伝播か、[Remote Grades](./remote-grades-linked-clips)等のグレード共有か分ける |
| 一部のRAW設定だけ全カットで一致する | `Use Changes`で変更項目を伝播したか | アンバー表示された変更項目と対象カットを確認 |
| 別アプリでBRAWの色が違う | `.sidecar`の有無・設定、出力色管理 | RAWメタデータ解釈と[カラーマネージメント](../learn/color-management-basics)を別に比較 |
| 変更前に戻したい | Camera RawのOptionsメニュー | `Reset`は初期値へ戻す、`Revert`は**現在のクリップを選択したときの状態**へ戻す。両者は同じ操作ではない |

RAW変更後にノードや出力側まで同時に変更すると原因が追いにくくなります。[Camera RAWの基礎](../reference/camera-raw)と[ノード無効化による診断](./node-bypass-diagnostics)を使い、RAW設定・クリップグレード・出力変換を別々に確認します。

## 修正できたかの判定

Bを`Clip`に設定して個別RAW調整ができること、Aの色温度・Tintが維持されること、必要なグレードコピー後もBのRAW設定が意図どおりであることを確認します。複数クリップへ反映した場合は、全対象カットを選択し直して差分を確認します。sidecarは明示的に更新しない限り書き換えない運用とし、外部環境の差を確認する場合は比較対象のsidecar・カラー管理条件を記録します。

## 出典・対象版・未検証範囲

- **公式一次資料：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（September 2026）、**Chapter 130「Camera Raw Palette」pp.3135–3140**。2026年10月25日に本文を直接確認。RAW／非RAWの挙動、`Decode Using: Clip`、Galleryの`Copy Grade: Preserve Camera Raw Settings`、`Use Changes`／`Use Settings`、Version、`Reset`／`Revert`、BRAW sidecarの優先関係と`Update Sidecar`の手順を根拠としています。
- **対象：** Resolve 21.1、BRAW素材を中心としたColorページ。ほかのRAW形式固有の項目、Free／Studioでの提供差、OSごとのローカライズUIは未照合です。
- **`verification: partial`。** 上記Manual記述の直接確認は完了。25fps・各10秒の例、実際のグレードコピー結果、選択範囲の誤操作再現、sidecar書き出し・別アプリとの相互運用、実機／CI／Pagesの検証は未実施です。画面上の項目名はManualで確認できる英語表記を用いています。
