---
title: Color Space Transform（CST）
description: ColorページのCSTで色域とガンマの変換元・変換先を指定し、RCMとの重複やトーン／色域マッピングを確認する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Color Space Transform, Input Color Space, Input Gamma, Output Color Space, Output Gamma, Tone Mapping, Gamut Mapping]
tasks: [color-management, color-space-transform, grade, troubleshoot, delivery]
level: intermediate
updated: "2026-10-22"
---

# Color Space Transform（CST）：変換元と変換先をノードで指定する

カメラLog素材を自然なコントラストで見たい、異なるカメラを同じ作業空間へそろえたい、完成したグレードを別の表示条件へ変換したい。こうした用途で、Colorページのノード上に色変換を明示するのが**Color Space Transform（CST）**です。

CSTは「彩度をよくするエフェクト」ではなく、入力画像を**どの色域・ガンマとして解釈し、どの色域・ガンマへ変換するか**を定義する処理です。意図に合わない入出力を選ぶと、コントラストや色相、彩度が不自然になることがあります。単に見た目が近づく設定ではなく、**そのノードへ実際に入ってくる画像の状態**を基準に指定します。

カラーマネージメントの全体像は[Input／Timeline／Outputの基礎](../learn/color-management-basics)で扱っています。ここではCSTの各指定項目、配置、使い分け、点検手順に絞ります。

## 4つの基本指定

Blackmagic Design公式『The Colorist Guide to DaVinci Resolve 20』は、Colorページの**Effects**からCSTをノードへ適用し、次の入出力を指定する手順を示しています。以下の項目名は**Resolve 20の公式教材で確認した英語表記**です。21.1実機のメニュー配置や初期値が同一であることまでは確認していません。

| 項目 | 指定するもの | 誤設定を疑う例 |
| --- | --- | --- |
| **Input Color Space** | CSTに入る画像の色域（RGBの原色など） | 撮影色域と異なるカメラ設定を流用している |
| **Input Gamma** | CSTに入る画像の階調符号化・伝達特性（Logなど） | Logから変換済みの素材を、再びLogとして入力している |
| **Output Color Space** | CSTから出す画像の色域 | 次のノードが想定する作業色域と一致しない |
| **Output Gamma** | CSTから出す画像の階調符号化・伝達特性 | 表示用の画像を出したのに、後段でまだLogとして扱っている |

**Color SpaceとGammaは対で確認**します。「Rec.709」とだけメモしても、変換に必要な条件をすべて説明したことにはなりません。素材の撮影モードや変換済みファイルの仕様が不明な場合は、カメラ名から決め打ちせず、撮影記録とファイルの来歴を調べます。

同じ名前の色空間が入出力に指定されているように見えても、ノードのほかのマッピング設定や前後処理まで同一とは限りません。「設定上の名前が同じ＝必ず無処理」とは扱わないでください。

## Tone MappingとGamut Mappingは別の問題

CSTには、入出力の色域・ガンマに加えて**Tone Mapping**と**Gamut Mapping**に関する設定があります。これらは似た名称でも対象が異なります。Blackmagic DesignのResolve 20公式Colorist Guideにも両者の設定群が掲載されています。

| 処理 | 何を扱うか | 確認する見た目 |
| --- | --- | --- |
| Tone Mapping | 入出力の明るさの扱える範囲が異なるとき、階調やハイライトをどう対応させるか | 明部のディテール、白の圧縮、暗部の階調 |
| Gamut Mapping | 出力色域で扱いにくい色をどう収めるか | 高彩度の照明、ネオン、原色の飽和や色相の変化 |

広い撮影色域から小さい表示色域へ移す場合、色域変換だけで終わらず、非常に明るい部分や高彩度色の扱いも検討します。ただし**最適な方式は素材、作業空間、表示・納品先によって変わります**。ここではマッピング方式のプリセット、21.1の数値範囲、最大輝度の既定値を指定しません。

たとえば暗いライブ映像の赤いLEDだけが平面的になった場合、単純に全体のSaturationを下げる前に、変換の入出力、マッピング、高彩度色の処理と実際の露出を分けて比較します。逆にハイライトの階調が失われたように見えたら、Tone Mappingだけを原因とせず、素材のクリップや後段のコントラスト補正も調べます。

## どこに置くか：入力CST／補正／出力CST

Colorページで手動のノード色管理を行う場合は、次の構成が基本形の一つです。

```text
撮影素材（元の色域・Log等）
  → [INPUT CST]   撮影色域／Gamma → 作業色域／Gamma
  → [BALANCE]     露出・ホワイトバランスなどの補正
  → [LOOK]        演出用の補正
  → [OUTPUT CST]  作業色域／Gamma → 表示・納品用の色域／Gamma
  → 出力
```

これは**プロジェクトの自動的なInput／Output変換と役割が重複しないように構成した手動管理の概念例**です。Blackmagic DesignのResolve 20公式Colorist Guideは、入力用と出力用の2つのCSTで作業空間を囲む手法を紹介しています。カラーマネージメント方式、グループ／タイムライン処理、ノードの位置によって実際の信号経路は変わります。

入力CSTの**Outputの色域とGamma**は、補正ノードが扱う画像の状態を決めます。出力CSTの**Inputの色域とGamma**は、そこへ届く画像の状態と一致している必要があります。途中で別の色空間へ変換したなら、出力側の入力設定もその状態に合わせて設計し直します。

[Node Graphの基本](../learn/color-node-graph)と[Serial／Parallel／Layerノード](./serial-parallel-layer-nodes)のように、分岐や合成を含む構成では特に注意します。「ノード上で右端にある」「名前にOUTPUTと付けた」だけでは、どの画像がそのノードへ入力されるかは保証されません。

## RCMと手動CSTを混同しない

Blackmagic Designの[公式Colorページ](https://www.blackmagicdesign.com/products/davinciresolve/color)は、Project SettingsのColor Managementで**Input／Timeline／Output変換とTone Mapping**を扱えると説明しています。Resolve Color Management（RCM）でそれらを担当させたプロジェクトに、同じ目的のCSTをそのまま追加すると、二重変換につながる可能性があります。

| 管理方式 | 変換の担当 | CSTを追加する前の質問 |
| --- | --- | --- |
| RCMを用いたプロジェクト | プロジェクト／クリップ側のカラー管理 | その入力／出力変換はすでに行われていないか |
| 手動ノード管理 | ノード上のCSTなど | 入力から出力まで必要な変換が途切れず、一度ずつ配置されているか |
| 意図的な併用 | 管理側とノード側で別の役割を分担 | CSTへ入る信号の状態と、追加する変換の目的を説明できるか |

RCMとCSTの併用が一律に誤りなのではありません。たとえば特定のエフェクトの前後だけ一時的に別の作業色空間へ移す場合は、ノードのCSTに役割があるかもしれません。ただし、その区間の入出力が対応し、最終的な出力変換が重複していないことを確認します。これは一般的な設計判断であり、21.1の特定エフェクトとの相互作用を保証するものではありません。

[Shared Node](./shared-nodes)や[Group Grading](./group-grading)へ変換を移すときも、複数クリップに同一のInput設定が適切かを見ます。カメラの記録方式が異なるクリップをまとめて、撮影条件を無視した一つの入力CSTで扱わないでください。

## 操作例：カメラLogを共通作業空間へ変換する

Log収録したカメラAのインタビューと、同じシーンの別カメラBを手動CSTで扱う想定例です。以下は**公式教材の操作概念を使った設計例**で、21.1実機における作業完了報告ではありません。

1. プロジェクトの[Color Management](../learn/color-management-basics)を確認し、手動CSTがすでに担当している変換と競合しない状態にします。変更前の設定は記録します。
2. カメラAの撮影記録から、元の**色域**と**Log／Gamma**を特定します。「A社のカメラ」とだけ分かる状態では先へ進みません。
3. Colorページでクリップを選び、Node Graphに入力変換用ノードを用意します。Effectsにある**Color Space Transform**をそのノードへ適用するのが公式Colorist Guideで示された基本操作です。
4. そのCSTの**Input Color Space／Input Gamma**をカメラAの記録条件に、**Output Color Space／Output Gamma**を採用した作業空間に対応させます。たとえば色域に**DaVinci Wide Gamut**、ガンマに**DaVinci Intermediate**を採用する構成が公式ガイドで説明されています。ただし、この組合せをすべての案件の必須設定とはしません。
5. 入力CSTの後に、ショット固有の露出・ホワイトバランス補正と演出Lookを置きます。[Scopes](./scopes)とViewerで、肌、白、ハイライトが意図に近いかを見ます。
6. 最終段に、作業空間から**今回の納品仕様**へ向けた出力CSTを用意します。出力CSTのInputが実際の作業空間、Outputが納品先の色域・Gammaを指しているかを確認します。
7. カメラBには**B自身の撮影色域とGamma**を入力する別の変換を設けます。同じ作業空間へそろえた後に、両カメラのショットマッチングを行います。共通Lookを共有する場合は、素材ごとの前処理を先に区別します。
8. 元画像との比較、グレーディング前後の比較、各カメラ間の比較を分けます。さらに最終レンダーを確認し、再読み込みで余計な変換を重ねないようにします。

この例の**完了判定**は、各素材のInputと補正段の色空間が説明でき、全ショットを同一の納品条件で評価できることです。コントラストが強くなった、彩度が上がったという見た目だけでは、変換が正しい証拠になりません。

## CSTが原因と思われるときの点検

| 症状 | 最初の点検 | 次に切り分けること |
| --- | --- | --- |
| 変換直後に極端なコントラスト | Input Gamma、変換済み素材の再解釈 | 上流のRCMやLUTとの重複 |
| 色相・彩度が予想外 | Input／Output Color Space | 別カメラの設定流用、Gamut Mapping |
| ハイライトが不自然 | Tone Mappingと納品先の条件 | 素材側のクリップ、後段の補正 |
| CSTを外すと自然に見える | そのノードの入出力と前後関係 | 表示変換を外しただけで「正しくなった」と誤認していないか |
| 1カメラだけ色が違う | カメラ別InputとGroup／Shared Node | 撮影条件・前段補正の違い |
| 書き出し後だけ色が違う | 出力CST、RCMのOutput、色タグ | [書き出し後の色ズレ](../troubleshooting/export-color-mismatch)の比較手順 |

原因究明では一度に複数設定を変えず、元の設定を控えて代表フレームで比較します。CSTを一時的に無効にした比較は**原因の切り分け**であり、その状態が正しい納品変換だと示す検証ではありません。

## 出典・対象版・検証範囲

- **対象版：DaVinci Resolve 21.1。** [Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月8日公開）。公式サポートで公開を確認しました。ただしPDF全体が大容量のため、今回の環境では**21.1のCST該当章本文とUIを直接照合できていません**。
- **操作項目と手動2段変換の直接根拠：** [Blackmagic Design『The Colorist Guide to DaVinci Resolve 20』](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)。EffectsからCSTをノードへ置き、Input／Output Color Space／Gammaを指定する操作、Tone Mapping／Gamut Mapping、入力CST・出力CSTで作業空間を挟む構成を確認しました。**Resolve 20の教材であり、21.1固有画面の検証ではありません。**
- **プロジェクト側の色管理の直接根拠：** [Blackmagic Design『DaVinci Resolve — Color』](https://www.blackmagicdesign.com/products/davinciresolve/color)「Professional Color Management」（2026年10月22日確認）。Project SettingsのColor ManagementからInput／Timeline／Output、Tone Mappingを扱うことを確認しました。
- **verification: partial。** 上記の公式資料と色管理の原理に基づく説明です。21.1実機操作、項目の画面位置・初期値、個々のマッピング方式の挙動、監視装置の校正、Free／Studioの機能差は未検証です。

関連：[カラーマネージメントの基礎](../learn/color-management-basics)／[Shared Node](./shared-nodes)／[書き出し後の色ズレ](../troubleshooting/export-color-mismatch)
