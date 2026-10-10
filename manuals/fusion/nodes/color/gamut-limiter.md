---
title: Gamut Limiter
description: FusionのGamut Limiterで出力画像の色域を制限する方法と、色空間変換・彩度圧縮との違いを解説する。
doc_type: node
term_id: gamut-limiter
term_short: 指定した色域の外に出る色を強制的に切り捨てる、仕上げ段階向けのColorノード。
verification: partial
aliases: [Gamut Limiter, GML]
concepts: [image-data, color-space]
nodes: [Gamut Limiter]
node_family: color
controls: [Current Gamut, Current Gamma, Limit Gamut]
inputs: [image, mask]
outputs: [image]
tasks: [gamut-limit, delivery, qc]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Gamut Limiter

Gamut Limiterは、画像の色が指定した**色域（gamut）**の外へ出ないよう、範囲外の値を強制的に切り捨てるノードです。

色域とは、ある規格で表現できる色の範囲です。たとえばRec.2020はP3より広い色域を扱えます。映像をRec.2020の条件で納品するものの、品質管理（QC）では色をP3の範囲内へ収める必要がある場合に使えます。

範囲外を強制的に切り捨てる処理を**ハードクリップ（hard clip）**と呼びます。境界を越えた色の差は失われるため、色をできるだけ滑らかに収める[Gamut Mapping](./gamut-mapping)とは目的が異なります。クリップ後に彩度を下げても、失われた色の違いが元どおりに戻るわけではありません。

## 入力・出力

| 接続 | 何を渡すか |
| --- | --- |
| **Input（オレンジ）** | 色域を制限する2D画像。MediaIn、Loader、Color Space Transformなどの画像出力を接続します。 |
| **Effect Mask（青）** | 処理する部分を限定する任意のマスク。PolygonやRectangleなどの出力を接続します。 |
| **Output** | 制限後の2D画像を後続ノードやMediaOut / Saverへ渡します。 |

Effect Maskはノードによる処理後に適用されます。マスクを接続すると、その外側には制限がかかりません。**画面全体を納品基準に合わせる用途では、意図しないマスクが接続されていないか**を確認します。

Gamut Limiterは2D画像用で、3D SceneやDeep Imageをそのまま入力するノードではありません。

## Inspector：3つの設定

| 項目 | 何を指定するか |
| --- | --- |
| **Current Gamut** | 現在の画像に使われている色域。21.1マニュアルでは、画像が使用しているタイムラインのgamutと説明されています。 |
| **Current Gamma** | 現在の画像に使われているガンマ。マニュアルではタイムラインのgammaと説明されています。 |
| **Limit Gamut** | 許可する色域の境界。ここで選んだ範囲を越える色がハードクリップの対象になります。 |

Current GamutとLimit Gamutを同じものと考えないでください。前者は「今の画像の色をどの規格として解釈するか」、後者は「最終的にどの色域まで許すか」です。

また、**gamutとgammaは別の概念**です。gamutは表現できる色の範囲、gammaは明るさと画像の数値との関係を表します。色域の名前だけを正しく設定しても、ガンマが合っていなければ期待どおりに処理できません。

### 直前のノードで色を変換している場合

Current Gamut / Gammaをカメラの収録形式だけで決めないようにします。

前段の[Color Space Transform](./color-space-transform)で別の色空間やガンマへ変換済みなら、Gamut Limiterが受け取るのは**変換後の画像**です。プロジェクトのタイムライン設定、前段のCST、現在のノード出力を照合します。MediaIn / Loaderで変換を行っている場合も同様です。

## 実践例：Rec.2020納品でP3内への色域制限が必要

21.1マニュアルは、納品の色域がRec.2020のように広く、QC仕様ではより狭いP3へ制限したい例を挙げています。

```text
MediaIn / Loader
       ↓
[必要ならColor Space Transform等で色空間をそろえる]
       ↓
色調整・必要に応じてGamut Mapping
       ↓
Gamut Limiter
       ↓
MediaOut / Saver
```

1. まず納品仕様を確認します。「Rec.2020の信号で納品すること」と「色をP3内に制限すること」は別条件です。本当に両方が必要かを調べます。
2. **Current Gamut**には、Gamut Limiterへ入ってくる画像の実際の色域を指定します。Rec.2020で作業している例では、その状態と一致する項目を使います。
3. **Current Gamma**は画像のガンマに合わせます。HDR素材だからといって、前段の変換やタイムラインの設定を確認せずに決めないでください。
4. **Limit Gamut**にはP3に相当する色域を選びます。選択肢の正式名称は21.1のInspectorで確認します。
5. 高彩度のLED、衣装、看板などでノードを有効・無効に切り替え、色の違いが急に消えていないかを見ます。不自然なら、制限前の色調整やGamut Mappingによる彩度圧縮を検討します。
6. 最終出力の色空間・ガンマ・タグと、QCの条件を別途確認します。

この図は**手動処理の説明例**です。Resolve Color Management（RCM）を使う構成では、Fusionへ渡る画像やMediaOut以降の変換が異なります。色変換を追加したり順序を決めたりする前に、処理がどこで行われるか確認します。

## ノードツリーの後ろに置く理由

公式マニュアルは、Gamut Limiterをノードツリーの**最後に近い位置**へ置くことを推奨しています。

ハードクリップで失った色の差は、後から別の彩度調整を加えても復元できません。色を調整する途中で制限すると、後段の合成・色調整に使えるはずだった情報まで早く捨ててしまいます。色の見た目を整える処理は通常Gamut Limiterの前で行い、最後に必要な制限だけを加えます。

ただし、Limiterより後ろに別のCSTや彩度調整があると、制限後に出力の条件が変わる可能性があります。**ノードの位置だけでQC適合を保証することはできません。**

## Gamut Mapping・Color Space Transformとの違い

| 目的 | 選ぶノード |
| --- | --- |
| 色域の境界を越える値を最終的に切り捨てる | **Gamut Limiter** |
| 境界に近い高彩度の色をなるべくなだらかに収める | [Gamut Mapping](./gamut-mapping) |
| 入力と出力の色空間・ガンマを指定して変換する | [Color Space Transform](./color-space-transform) |
| 色空間の変換、ガンマの除去・付加、リニア化を行う | [Gamut](./gamut) |

Gamut Limiterは色域の制限用であり、**色空間変換やHDR→SDRのTone Mappingを一式実行するものではありません**。カメラLogをRec.709へ変換するならCSTなど、非常に明るいHDR素材をSDRの表示範囲へ収めるならTone Mappingを別途検討します。

先にGamut Mappingで彩度の変化を整え、納品条件に応じてGamut Limiterで境界を制限する構成も考えられます。ただし、不必要な二重処理で色の差を減らしていないかを確認します。

## 問題が起きたとき

- **鮮やかな部分が急に平坦になる**：ハードクリップで色の違いが失われている可能性があります。制限前の調整、Gamut Mapping、Limit Gamutの設定を確認します。
- **有効にしても見た目が変わらない**：元の画像がすでに指定色域内にある場合があります。Current Gamut / GammaとEffect Maskも確認します。
- **想定と違う色味になる**：前段のCST、RCM、MediaIn / Loaderで行われた変換を確認します。Current Gamut / Gammaと実際の入力が一致していない可能性があります。
- **一部分にしかかからない**：Effect Maskの接続と形状を確認します。
- **Viewerと書き出しの色が違う**：Viewer LUT、後段の色変換、書き出し設定、色のメタデータを分けて確認します。

**QC上の注意：** Gamut Limiterは指定色域の制限用で、納品仕様全体を自動検査する機能ではありません。輝度、信号レンジ、書き出しのガンマ、タグなどの確認は別に必要です。Chromaticityスコープの色域三角形も、すべての輝度域での適合を単独で保証するものではありません。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 93「Color Nodes」pp.2141–2142：Gamut Limiterの目的、入力、Inspector、ハードクリップ、最後に近い位置への配置。
- 同Chapter 93 pp.2143–2145：Gamut MappingのTone / Saturation処理との比較。
- 同マニュアルp.3100付近：Chromaticityスコープの色域表示とその限界。

接続例・QCの確認項目はマニュアルに基づく運用例です。DaVinci Resolve 21.1実機での描画・レンダリング、Inspectorメニューの全選択肢や既定値、Free / Studioの差は未検証です。
