---
title: Log素材と変換済み素材で色が合わないとき（RCMのInput診断）
description: RCMのInput Color Space／Gammaを素材ごとに調べ、誤認識、二重変換、RAWとの違いを切り分ける。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Color Management, Input Color Space, Input Gamma, Bypass Color Management, Color Space Transform]
tasks: [color-management, match-shots, troubleshoot, color-correct]
symptoms: [wrong-input-color-space, log-contrast-mismatch, double-color-transform]
level: intermediate
updated: "2026-10-26"
---

# Log素材と変換済み素材で色が合わないとき

同じタイムラインにLog収録とRec.709へ変換済みの映像を置くと、片方だけコントラストや彩度が極端に見えることがあります。まず確認するのはPrimariesの補正量ではなく、**各素材がどの色域・ガンマで保存され、Resolve Color Management（RCM）が何をInputとして受け取っているか**です。

ここではDaVinci Resolve 21.1の**DaVinci YRGB Color Managed**を前提に、非RAW素材の入力解釈を一つずつ確認します。手動CSTだけで管理するDaVinci YRGB、ACES、Camera RAWは同じ手順で扱いません。

## 確認用の素材・前提・期待する結果

次の2クリップを、SDR納品を想定した同一タイムラインで比較します。これは操作を説明する**仮想の検証素材**であり、実写の比較試験結果ではありません。

| クリップ | 入力ファイルの状態 | 既知であるべき情報 | 観察したいこと |
| --- | --- | --- | --- |
| A | Sony S-Gamut3.Cine／S-Log3で記録された非RAWのカメラ原本 | 撮影記録、実際の収録色域とLog | カメラLogを正しくInputとして解釈できる |
| B | すでにRec.709／Gamma 2.4として変換・書き出された非RAWファイル | 書き出し時の変換先、ファイルの実際の信号 | 元のカメラLogとして再変換しない |

「Rec.709／Gamma 2.4」はBの**確認済みの制作条件という仮定**であり、一般のH.264／ProResファイルをすべてこの値で扱うという意味ではありません。メタデータがない・不正確な場合は、撮影記録や変換元の設定を確認します。

この例の完了条件は、AとBが**それぞれ正しいInputから共通のTimeline／Outputへ処理され、同じシーンの明暗・色を意図に沿って比較できること**です。カメラ、照明、レンズ、グレードが異なれば、正しいInputを選んでも画像は自動的に同じになりません。

## 1. 変更前にRCMとクリップの条件を記録する

1. **Project Settings → Color Management**で、Color scienceが「DaVinci YRGB Color Managed」か確認します。Automatic Color Managementの有効／無効、RCM preset、Timeline Color Space、Output Color Spaceを控えます。
2. 対象A・Bの撮影／変換情報を照合します。ファイル名や「Log」という見た目だけで色域・Gammaを決めません。
3. ColorページでAとBの代表フレームを固定し、[Scopes](../reference/scopes)のWaveform・RGB ParadeとViewerを比較します。問題が1クリップだけか、カメラ群全体か、タイムライン全体かを分けます。
4. Clip／Group／Timelineに既存のCST、表示用LUT、共通補正があるか記録します。この時点ではノードやプロジェクト設定をリセットしません。

RCMは**Input → Timeline → Output**の変換を管理します。すでに作成したグレードはTimeline Color Spaceに依存するため、診断のためにプロジェクト全体のTimeline作業空間を変更しないでください。21.1 Manual Chapter 9（p.235）でも、グレーディング開始後のTimeline Color Space変更に注意が示されています。

## 2. Media Poolで非RAWクリップのInputを照合する

RCMが色空間を判断する順序は、21.1 Manual Chapter 9（pp.228–230）に説明されています。Camera RAWではメーカーの色情報が使用されます。非RAWでは対応するメタデータが参照され、なければプロジェクトのdefault Inputが使われます。必要な場合はMedia Poolで選択クリップのInput Color Spaceを手動指定できます。

1. **Media PoolでAを選択**し、右クリックメニューの**Input Color Space**を確認します。撮影記録がS-Gamut3.Cine／S-Log3なら、それと整合する色域・伝達特性の選択になっているかを確認します。
2. **Media PoolでBを選択**し、同じ項目を確認します。Bが変換済みなのにAと同じLog Inputに設定されていれば、Inputの誤割り当てが疑われます。
3. 色域とGammaを別々に管理する**Use Separate Color Space and Gamma**が有効なCustom RCMでは、**Input Color SpaceとInput Gammaの両方**を確認します。一方だけが一致していても変換条件は完成しません。
4. 入力の実仕様を確定できた**1クリップだけ**に正しいInputを割り当て、ViewerとScopesを比較します。最初から全素材を一括変更しません。
5. 改善・悪化・無変化を記録し、ほかのクリップが変わっていないか確認します。効果が不明なら変更前の割り当てに戻し、次の候補を調べます。

**メタデータが存在するだけで正しいとは限りません。** QuickTime／MXFの色情報と撮影実態が食い違えば、非RAWクリップには手動のInput指定が必要になる場合があります。逆に、正しい自動判定を根拠なく置き換えないでください。

**Camera RAWは例外です。** Manual pp.228–229では、RAWのInput Color Spaceは非RAWのようには上書きできず、RCMではRAWのdebayerと色解釈が管理されると説明されています。BRAWなどのRAW設定の症状は[Camera RAWの切り分け](./braw-raw-settings-copy-scope)へ進みます。

## 3. Inputが正しくても色が崩れる場合

Inputの不一致を修正しても変化がない、または一部だけ不自然なら、**同じ役割の変換を二度行っていないか**を確認します。

| 症状・条件 | 次に見る場所 | 切り分け |
| --- | --- | --- |
| Aだけ強いコントラスト・彩度になる | AのClip／Groupにある表示用LUT、入力CST | RCMに加えてカメラLog→表示用変換を行っていないか |
| BだけLogのように眠い／色が大きくずれる | BのInput指定、変換済みファイルの仕様 | 表示用へ変換済みのBをカメラLogとして解釈していないか |
| A・Bとも一斉に変わる | Timelineノード、Output、共通LUT／CST | 個別Inputより共通処理が原因ではないか |
| Inputを変更しても見た目が変わらない | Colorページのクリップ右クリック → **Bypass Color Management** | 対象クリップがRCMから除外されていないか |
| Viewerは近いのに書き出しだけ違う | Output、納品ファイルの色タグ・Levels、再生経路 | [書き出し後の色差](./export-color-mismatch)で別に検査する |

21.1 Manual p.243の**Bypass Color Management**は、Colorページのクリップサムネイルの右クリックメニューから、そのクリップだけをRCMの対象外にする機能です。意図せず有効ならInput割り当ての効果を正しく比較できません。診断中に切り替える場合は元の状態を控え、確認後に戻します。「Bypassすると良く見える」だけでは、RCMそのものが不要と確定しません。

手動で管理しているCSTについては、[Color Space Transform](../reference/color-space-transform)で入力と出力の向きを確認します。[LUT](../reference/luts)が技術変換か演出用Lookかも区別します。RCMとCSTを意図的に併用する構成もあるため、**CSTがあること自体を誤りとはしません**。

## 4. 検証結果の判断と復元

A・Bで同じ場面のグレー、肌、ハイライト、暗部を比較します。Scopesで極端なクリッピングやチャンネルの偏りが新たに生じていないか確認し、クリップを交互に再生します。**正しいInputは自動ショットマッチではない**ので、照明差やカメラ固有の色差は[複数カメラのマッチング](../recipes/matching-multicamera-interview)で別に調整します。

- **入力修正でBだけ改善した：** Bの撮影／変換仕様と割り当てを記録し、同じ出自の素材へ適用する前に数カットで確認します。
- **入力修正後もAが強すぎる：** 元ファイルが本当にLogか、Clip／Groupに入力CST・表示用LUTがあるか調べます。
- **すべてのカットが同じ方向に変わる：** Timeline／Outputや共通グレードを優先します。既存グレードを壊す一括変更はしません。
- **実仕様が不明：** 推定値を最終設定として固定せず、カメラ設定・変換履歴・制作側の書き出し仕様を確認します。

修正後はA・B双方のInput、元のRCM設定、ノード／LUTの担当、比較に使ったフレーム、ViewerとScopesの結果を記録します。最終的な納品判断は[Color QC](../recipes/pre-delivery-color-qc)と実ファイルの確認で行います。

## 出典・対象版・未検証範囲

- **一次資料（本文確認）：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月版）、Chapter 9「Data Levels, Color Management, and ACES」、pp.224–230、234–235、243。2026年10月26日に公式21.1 PDFの該当本文を確認。RCMの変換段階、非RAWのメタデータと手動Input、Dual Setting、RAWの例外、Bypass Color Managementを参照。
- **対象：** Resolve 21.1のRCM。A・Bの色域／Gammaは仮想素材の既知条件であり、映像ファイル名・コーデックからの自動推定ではありません。
- **verification: partial。** 21.1実機に素材を読み込んだ比較、GUIの日本語表示、各カメラの記録メタデータの実際の優先関係、Free／Studio差、出力ファイルの品質評価は実施していません。表の症状と改善判定はManualと色管理の原理に基づく**診断手順・期待結果**であり、実測値ではありません。
