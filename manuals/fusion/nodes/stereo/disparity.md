---
title: "Disparity"
description: "左右のステレオ画像を比較して水平・垂直方向の視差を求め、画像の補助チャンネルへ記録するNode。"
doc_type: node
term_id: "disparity"
term_short: "Disparityは、左右画像の同じ部分が何画素ずれているかを解析して、視差を付加するNode。"
verification: partial
aliases: ["Disparity", "Dis"]
concepts: ["image-data"]
nodes: ["Disparity"]
node_family: "stereo"
controls: ["Proxy (for Tracking)", "Smoothness", "Edges", "Match Weight", "Mismatch Penalty", "Warp Count", "Iteration Count", "Filtering", "Stack Mode", "Swap Eyes"]
inputs: ["image"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Disparity

Disparity [Dis]は、**左眼用と右眼用の2枚の画像で、同じ被写体がそれぞれどこに写っているかを比較し、位置の差を計算する**Nodeです。その差を**視差（Disparity）**と呼びます。

たとえば同じ人物の顔が左眼画像では画面中央、右眼画像では少し左に写っている場合、Disparityは色や輪郭の変化を手掛かりに対応箇所を探し、横方向・縦方向に何画素ずれているかを調べます。計算結果はカラー画像を置き換えず、画像の**Disparity補助チャンネル**へ追加されます。

視差は左右画像の位置差であり、被写体までの距離をメートル単位で直接測定した結果ではありません。Z深度が必要なら、視差を求めたあとに[Disparity To Z](./disparity-to-z.md)を使います。**DaVinci Resolve Studio／Fusion Studio限定**です。

## 役割

Disparityは次の2種類のずれを求めます。

- **X方向の視差**：左右画像で同じ被写体が横に離れて写る量。立体映像の奥行きに関わる主要な情報です。
- **Y方向の視差**：同じ被写体が上下にずれて写る量。大きな縦ずれは立体視の見づらさにつながるため、通常は小さい方が望まれます。

計算は左眼→右眼、右眼→左眼の両方向で行われます。左眼画像には左→右、右眼画像には右→左の視差が補助チャンネルとして記録されます。左右の結果は対応する向きが異なります。

**Disparityは奥行き画像をRGBAへ直接描き込むNodeではありません。** Viewerで元のカラー映像が普通に見えても、補助チャンネルには別の解析結果が付加されています。

## 入力

| 端子 | データ | 接続するもの |
| --- | --- | --- |
| **Left Input**（オレンジ） | 2D Image | 左眼画像、または左右を1枚にまとめた画像。 |
| **Right Input**（緑） | 2D Image | 右眼画像。**Stack Mode: Separate**のときだけ表示されます。 |

左右が別々のファイルなら、同じ時刻のフレームを2入力へ接続してStack Modeを**Separate**にします。左右が横・縦に並んだ1枚の素材を扱う場合は、素材の並び方とStack Modeを合わせます。

入力は[画像（Image）](../../learn/02-data/image.md)です。Camera 3Dや3D Sceneそのものを接続する端子ではありません。

## 出力

| 端子 | データ | 内容 |
| --- | --- | --- |
| **Left Output** | 2D Image＋Disparity補助チャンネル | 左眼画像と左→右の視差。Stack Modeによっては左右をまとめた画像。 |
| **Right Output** | 2D Image＋Disparity補助チャンネル | 右眼画像と右→左の視差。**Separateのときだけ表示**されます。 |

後段へ渡すのは、通常の2D画像データに視差を付けたものです。RGBを見ただけでは視差の品質は分からないため、ViewerでX・Yの視差を表示して確認します。

Manualでは、左右をまとめるStack Modeでは左右出力が同じ画像になると説明されています。一方、Right OutputはSeparate時のみ表示されるという端子の説明もあるため、実際の配線は選んだStack Modeで現れる端子に従ってください。

この段階ではZ深度チャンネルは作られません。[Disparity To Z](./disparity-to-z.md)が別に必要です。

## 主な設定項目

### Proxy (for Tracking)：計算用の解像度

視差を計算する際だけ元の画像を縮小し、縮小画像で求めた視差を元の解像度へ拡大します。出力画像のサイズを変えるための設定ではなく、解析速度と細部の精度を調整するための設定です。

Manualでは計算時間がおおむね画素数に比例するとし、2:1のProxyで約4倍、3:1で約9倍の高速化を目安に挙げています。処理時間全体が必ずその倍率になるという保証ではありません。

1:1では細かい視差を拾いやすい一方、ノイズやフィルムグレインが多い素材では、細かい模様を誤って追跡する場合があります。高解像度だから常に1:1が有利とは限りません。

### Advanced：視差の滑らかさ・対応の仕方・計算回数

通常は既定設定から始め、輪郭が乱れる、細部が消える、処理が長すぎるといった問題があるときに調整します。

| 設定 | 動作と調整の目安 |
| --- | --- |
| **Smoothness** | 視差の滑らかさを調整します。高いほどノイズを抑えやすく、低いほど細部が残りやすくなります。 |
| **Edges** | 視差の境界をカラー画像の輪郭へ合わせる度合いです。低いと滑らかですが輪郭を越えて広がりやすく、高すぎると色の模様が視差へ混入します。 |
| **Match Weight** | 大きな色の構造と細かな色変化のどちらを重視して対応を探すかを調整します。高いほど細かな変化を重視します。Manualは通常の目安として**0.7～0.9**を挙げています。初期値・許容範囲の断定ではありません。 |
| **Mismatch Penalty** | 一致しない領域に対する評価を調整します。低い値はQuadratic寄り、高い値はLinear寄りです。低いと小さなランダム変動が出やすく、高いと滑らかになりやすいと説明されています。 |
| **Warp Count** | 左画像を右画像へ段階的に合わせる変形回数。減らすと速くなりますが、対応が十分に収束しないと品質が落ちます。 |
| **Iteration Count** | 対応の計算を繰り返す回数。減らすと速くなりますが、減らしすぎると視差の品質が落ちます。 |
| **Filtering** | 解析中の補間方法。Manualには**Catmull-Rom**は品質改善が期待できるものの計算時間が大きく増えると記載されています。 |

たとえば人物の髪や木の枝の視差が失われる場合は、Proxy・Smoothness・Edgesを比較します。解析結果は良いが時間がかかりすぎる場合は、Warp CountやIteration Countを少しずつ下げ、輪郭が乱れないかを確認します。

**Manualは全項目の初期値・数値範囲、Filteringの全候補名を列挙していません。** 確認できないControlは補っていません。

### Stack Mode／Swap Eyes：左右の受け渡し

**Stack Mode**は左右を独立した画像として扱うか、1枚へまとめた状態で扱うかを指定します。**Separate**ではRight InputとRight Outputが表示されます。

**Swap Eyes**は左右眼の割り当てを交換します。逆に接続された左右画像への対処に使えますが、位置合わせや視差品質の改善を自動で行う機能ではありません。

## 主な用途

- **立体映像の位置合わせ**：同じ人物や建物が左右の画像でどの程度ずれているかを計算し、後段の[Stereo Align](./stereo-align.md)へ渡します。
- **視差からの奥行き生成**：視差付き画像を[Disparity To Z](./disparity-to-z.md)へ渡し、被写界深度やフォグで使用するZデータを作ります。
- **左右の撮影状態の確認**：X方向・Y方向の視差を別々に表示し、縦ずれや推定に失敗した輪郭を調べます。

## 運用例：2台のカメラで撮った人物の視差を求める

左右眼が別々の素材である場合の流れです。

~~~text
左眼画像 ──┐                 ┌─ 左眼画像 ───┐               ┌─ 左眼画像＋視差
           ├─ Global Align ─┤              ├─ Disparity ──┤
右眼画像 ──┘                 └─ 右眼画像 ───┘               └─ 右眼画像＋視差
~~~

上図のGlobal Align出力には、まだ新しい視差は付いていません。実際には**Global Alignの左右出力をDisparityの左右入力へ個別に接続**し、Disparityから出る左右の視差付き画像を後段へ渡します。

1. 同じ時刻の左右画像を用意します。左右で色や明るさが違う場合は、Disparityの前に近づけます。
2. 黒帯がある場合は取り除き、画像全体に大きな縦ずれや回転差があれば[Global Align](./global-align.md)で補正します。
3. Disparityを追加し、**Stack Mode: Separate**にして左右の画像を接続します。
4. まずProxyを使って解析負荷を抑えます。Viewerの視差表示を**X成分とY成分それぞれのグレースケール**に切り替え、輪郭の乱れを調べます。ManualはXYを赤と緑で合成した表示より、各成分を単独で見た方が細部を判断しやすいと説明しています。
5. ノイズ・細部の欠け・時間方向のちらつきを確認し、必要な範囲でProxyやAdvancedを調整します。
6. 出力を[Stereo Align](./stereo-align.md)へ渡して縦ずれや輻輳位置を調整します。Stereo Alignの後段でも視差が必要な場合は、**再びDisparityで計算し直します**。

## 挙動と注意点

- **左右の色と明るさ**：解析は色とその勾配に基づくため、左右の差が大きいと誤対応が増えます。事前の色合わせが推奨されています。
- **黒帯と大きな縦ずれ**：Manualは黒い縁を除去し、数画素を超える縦ずれがあれば前段で位置合わせすることを勧めています。大きなずれは細部の追跡を難しくします。
- **レンズ歪み**：歪みを残したまま計算すると、視差にレンズ歪み由来の位置差も含まれます。歪み補正や縦位置合わせとの順序を検討してください。
- **ちらつき**：連続フレームの視差が不安定な場合、Manualは別のSmoothMotion Nodeで視差チャンネルを滑らかにする方法を挙げています。DisparityのInspector項目ではありません。
- **RoI／DoD非対応**：DisparityはRegion of InterestとDomain of DefinitionをサポートしないとManualに明記されています。部分領域だけの評価による高速化には頼れません。
- **視差とZは異なる**：Disparity単体の出力を正確な空間距離とはみなさないでください。必要ならカメラ情報を考慮するDisparity To Zへ渡します。
- **補助チャンネルの引き継ぎ**：後段のNodeによっては視差が破棄されます。Stereo Alignは再計算する手順がManualに示されています。

## 関連するNode

- [Global Align](./global-align.md)：左右の画像全体のずれを解析前に補正。
- [Stereo Align](./stereo-align.md)：視差を使って縦ずれ・輻輳位置・眼間距離を調整。
- [Disparity To Z](./disparity-to-z.md)：視差からZ深度チャンネルを作成。
- [Combiner](./combiner.md)／[Splitter](./splitter.md)：左右画像の結合・分離。視差解析とは別処理。
- [Stereo 3Dノード一覧](./index.md)：Stereo Familyの役割一覧。

## バージョンと検証状況

**一次資料：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月8日公開）、Chapter 118「Stereo Nodes」、Disparity [Dis]、pp.2777–2780。** 入出力、Disparity補助チャンネル、Proxy、Advancedの各Control、Stack Mode、Swap Eyes、Studio限定、RoI／DoD非対応はこの資料に基づきます。

**verification: partial**：21.1実機でのREGID、初期値・数値範囲、Stack ModeやFilteringの全選択肢、処理速度・視差の品質は未確認です。接続例はManualに基づくもので、実機レンダリング済みとは扱いません。
