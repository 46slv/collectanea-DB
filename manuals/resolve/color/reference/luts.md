---
title: LUTの適用位置と管理
description: ColorページのLUTを入力条件・出力条件・使用目的から選び、ノードや表示経路への適用と二重変換を点検する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [LUTs, LUT Browser, Node Editor, Color Management]
tasks: [grade, color-management, look-development, troubleshoot, delivery]
level: intermediate
updated: "2026-10-22"
---

# LUTの適用位置と管理：何を入力し、何を出力するか

LUT（Look-Up Table）は入力の色値を別の色値へ対応づける変換表です。カメラLogを表示用に変換する場合にも、作品のLookを再利用する場合にも使えます。ただし、**LUTのファイル名だけでは、正しい入力色域・Gammaや出力条件は決まりません**。同じLUTでも、ノードへ入る画像の状態が違えば結果が大きく変わります。

最初に確認するのは「そのLUTは何を入力とし、何を出力するために作られたか」です。[Color Managementの基本](../learn/color-management-basics)、[Color Space Transform（CST）](./color-space-transform)、[ColorのNode Graph](../learn/color-node-graph)と併せて、LUTの役割を明示します。

## 技術変換、Look、表示用を分ける

| 目的 | よくある使い方 | 確認する条件 |
| --- | --- | --- |
| 技術変換用LUT | 指定カメラのLogや撮影色域から、別の作業・表示状態へ変換 | 撮影記録の色域・Gamma、LUTの想定入力／出力 |
| Look LUT | 共通の作業空間にそろえた画像へ色や階調の傾向を与える | 作業空間、Lookの想定入力、後段の出力変換 |
| モニタリング用LUT | 特定の表示装置や観察経路で判断するために使用 | 観察だけに使うのか、納品ファイルにも反映するのか |

これはファイル形式だけで決まる分類ではありません。変換とLookを一つにしたLUTもあります。作成者・カメラメーカーの説明、受領した仕様書、撮影時の記録を優先し、仕様不明のLUTを見た目だけで「正しい技術変換」と判定しません。

Blackmagic Designの公式『The Colorist Guide to DaVinci Resolve 20』には、カメラ用の変換LUTと、Group Post-ClipのLOOKノードに置くDWG入力向けクリエイティブLUTの例が掲載されています。以下のUI操作に関する直接根拠は**Resolve 20の公式教材**で、21.1実機のメニュー位置や初期値を保証するものではありません。

## LUTの前後にある信号を確認する

### LUTとCSTは役割を照合して使う

[CST](./color-space-transform)は、Input／Output Color SpaceとGammaなどを指定して変換を構成する手段です。LUTはすでに作成された変換を適用する手段であり、LUTに設定すべき色空間が自動で保証されるわけではありません。

適用前に次の四点を記録します。

1. **LUT直前の画像**：カメラLogのままか、RAW現像後か、RCMやCSTで作業空間へ変換済みか。
2. **LUTの想定入力**：色域とGamma、前処理の条件、作成・配布者が指定した表示基準。
3. **LUTの想定出力**：次の補正へ渡す作業状態か、最終的な表示向けの状態か。
4. **後段の処理**：別CST、RCMのOutput変換、他のLUTが同じ目的を二度担当していないか。

例として、すでにカメラLogから表示用へ変換した画像に、再び同じカメラLog用LUTを適用すれば、意図しないコントラストや彩度になり得ます。LUTを外すと自然に見える場合でも、LUTのファイル自体が誤りなのか、上流の変換が重複しているのかを分けて調べます。

### ノードで適用位置を見えるようにする

以下は信号経路を説明する**設計例**です。LUTの仕様とProject Settingsによって適切な構成は変わります。

```text
カメラLog
  → [INPUT CST]    カメラ色域／Gamma → DWG／DI
  → [BALANCE]      ショットごとの露出・色のバランス
  → [LOOK LUT]     DWG／DI入力を想定したクリエイティブLUT
  → [OUTPUT CST]   DWG／DI → 納品・表示条件
  → 出力
```

この構成が成り立つのは、**LOOK LUTがDWG／DIを入力とし、その後段が想定する状態を出力する**と確認できた場合です。カメラLogを直接入力する変換LUTをそのままLOOKノードへ移すことはできません。また、上記は手動CSTでの例であり、RCMを使うプロジェクトへ入力・出力CSTを無条件に追加する指示ではありません。

技術LUTが「特定のLogから特定の表示向け状態まで」を担当する場合は、LUTの前段で想定Logを保ち、後段で同等の変換を重複させないようにします。カラー管理が自動処理している範囲を先に確認します。

### GroupとShared Nodeの使い分け

異なるカメラで撮った複数ショットに共通Lookを用いるときは、各クリップの入力状態と露出・ホワイトバランスをそろえた後に、共通のLookを適用する設計が考えられます。[Group Pre-Clip／Clip／Post-Clip](./group-grading)と[Shared Node](./shared-nodes)を利用する場合も、**技術変換まで共通化してよいか**は別に判断します。

同じLUTを全クリップへ置くだけでは、カメラAとBの入力条件が一致するとは限りません。入力が違うまま共通Lookへ送ると、色が合わない原因をLookの強さだけで解決しようとしてしまいます。

## LUT Browserとノードでの基本操作

以下は公式『The Colorist Guide to DaVinci Resolve 20』で紹介される操作をもとにした手順です。**21.1での正確な画面名・位置やOSごとの差は未照合**です。

1. Colorページでクリップを選び、Node GraphにLUT用のノードを分けて作成します。技術変換かLookか分かる名前にします。
2. LUTsパネル（LUT Browser）から、仕様を確認したLUTを探します。
3. 公式Guide 20には、LUTを目的のノードへドラッグする方法、およびノードの右クリックメニューからLUTを選ぶ方法が示されています。
4. 適用直後の画像を[Scopes](./scopes)とViewerで比較します。技術LUTなら指定の変換条件、Look LUTなら前後の階調・色相やショット間のつながりを確認します。
5. 前段・後段のCST／RCMと併用している別LUTを確認し、同じ変換を重ねていないか点検します。

「ノードへ適用できた」と「入力・出力条件が正しい」は別の判定です。比較するフレームと表示条件を固定し、複数の設定を一度に変えないようにします。

## 外部から受け取ったLUTを管理する

公式Colorist Guide 20は、Resolveで利用するLUTフォルダー、カスタムLUTの追加位置、LUT Browserの内容更新を説明しています。Project SettingsのColor Management内にもLUT関連の設定があります。現行21.1でのフォルダーパス、更新メニュー名、検索優先順位はこの資料だけでは確定できません。

受領したLUTは、ファイルだけでなく次の情報を一緒に管理します。

- ファイル名と版、入手元・配布条件
- 想定Input／Output（色域・Gamma・撮影条件）
- 使う案件とノード／Group／モニタリングの位置
- 変更日と、別の編集環境でも同じファイルを利用できるか

既存LUTと同名のファイルを上書きすると、過去プロジェクトの再現性が変わる可能性があります。ファイルを置き換える前に使用中のプロジェクトを確認してください。追加してもLUT Browserに現れない場合は、認識対象フォルダーと実ファイルの位置を確認し、UIの更新手順は対象版で再確認します。

LUTがプロジェクトに必ず埋め込まれると仮定せず、案件を別PCへ渡す際には依存ファイルを含めて確認します。配布が許されるかはライセンスの条件を参照します。

## 表示用LUTを納品結果へ混ぜない

公式Colorist Guide 20には、プロジェクト設定側のLUTに加えて、ビデオモニタリングやColor Viewer向けのLUT設定が載っています。目的を確認せず、Viewerで見える結果をすべて納品ファイルへ反映される結果と同一視しません。**21.1の各モニタリングLUTの適用順序や機器ごとの挙動は未検証**です。

外部モニターだけ色が違う場合、補正ノードに逆方向のLUTを重ねる前に[外部モニタリング](./external-monitoring)で出力経路と表示装置の設定を点検します。書き出し後の画像だけ違う場合は[書き出し後の色ズレ](../troubleshooting/export-color-mismatch)の再読み込み比較へ進みます。

## 実践例：2カメラを共通Lookへそろえる

カメラAがLog-A、カメラBがLog-Bで記録された架空のインタビュー案件を想定します。ここでのLog-A／Log-Bは製品名ではありません。

1. 撮影記録からA／Bそれぞれの色域とGammaを確定します。カメラメーカー名だけでは決めません。
2. RCMまたは入力CSTを使い、重複を避けながら両者を同じDWG／DI作業空間へそろえます。
3. [Gallery／Stills](./gallery-stills)とScopesで、ショットごとの露出・ホワイトバランス・肌の偏りを整えます。
4. **DWG／DI入力を要求することが確認できた**共通Look LUTを適用します。カメラLog入力の技術LUTならこの段階に置きません。
5. 共通Lookの前後を比較し、ハイライトと肌色、赤や青の高彩度部分が意図せず崩れていないか確認します。
6. 納品先に合わせた出力変換を適用し、[納品前Color QC](../recipes/pre-delivery-color-qc)と書き出し後の再読み込みを行います。

完了条件は、カメラごとの入力から共通Look、出力までの担当を説明でき、同じ観察条件でショットを比べられることです。LUT適用だけでショットマッチが完成したとは扱いません。

## 症状別の点検

| 症状 | 最初に確認すること | 続けて調べること |
| --- | --- | --- |
| LUTを置くと極端に濃くなる | LUTの想定Inputと実際の信号 | 上流RCM／CST／他の技術LUTの重複 |
| カメラBだけ肌色が違う | それぞれのLog／色域、入力変換 | 共通Lookより前のショット別補正 |
| LUTが一覧に表示されない | 認識対象のフォルダーとファイル | 21.1環境でのBrowser更新方法 |
| 一部ショットだけLookが違う | Clip／Group／Shared Nodeの適用範囲 | Versionsや別LUTの重複 |
| Viewerと外部モニターが異なる | 出力デバイス、監視LUT、表示モード | モニター校正、表示用と納品用の分離 |
| レンダーだけ違う | Output変換、LUTの適用経路 | 色タグ、再生環境、レンダー再読み込み |

LUTを一時的に無効にして違いを確認するのは有効な切り分けですが、外した結果がそのまま正しい納品状態とは限りません。

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月8日公開、[公式サポート](https://www.blackmagicdesign.com/support)）。公開を確認しましたが、この環境ではPDFのLUT関連章本文と21.1実機を直接照合できていません。
- **操作説明の直接根拠：** Blackmagic Design『[The Colorist Guide to DaVinci Resolve 20](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)』。LUT Browser／ノードへの適用、LUTフォルダー、Group Post-ClipのLook例を参照。**Resolve 20の教材**であることに注意してください。
- **公式機能の説明：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/products/davinciresolve/color)』のProfessional Color ManagementおよびGroup処理（2026年10月22日確認）。
- **verification: partial。** 操作例は公式資料に沿った設計・切り分け例です。21.1の正確なUI名・初期値、LUT形式別の互換性、Free／Studio差、特定の表示機器での動作は未確認です。未確認の数値プリセットを推奨しません。

関連：[CST](./color-space-transform)／[カラーマネージメント](../learn/color-management-basics)／[外部モニタリング](./external-monitoring)／[書き出し後の色ズレ](../troubleshooting/export-color-mismatch)
