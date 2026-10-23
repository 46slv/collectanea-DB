---
title: Beat
description: 拍の間隔をフレーム数またはBPMで指定し、数値パラメータの時間変化を作るKrokodoveのModifier。
doc_type: node
term_id: beat
term_short: 拍の間隔をフレーム数またはBPMで指定してアニメーションを制御するKrokodoveのModifier。
verification: partial
aliases: [Beat]
concepts: [parameter-data]
nodes: [Beat]
node_family: krokodove
controls: ["Frames per Beat", "Beats per Minute", "Attack", "Decay", "Sustain", "Release"]
inputs: [parameter]
outputs: [parameter]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# Beat

**Beat**は、音楽の拍（ビート）に合わせてアニメーションを動かしたいときに使う、Krokodoveの**Modifier**です。拍と拍の間隔をフレーム数、または1分間の拍数（BPM）で指定し、時間とともに変わる値をパラメータへ与えるための調整項目を追加します。

たとえば、音楽の拍に合わせて図形の大きさを変えたい場面が考えられます。ただし、Beatが楽曲の音声を解析して拍を自動検出する機能だとは、21.1 Manualからは確認できません。テンポを自分で設定して動作を確かめるためのModifierとして考えるのが安全です。

## 役割と入力・出力

Beatは画像を受け取って色や形を加工するNodeではなく、**別のNodeのパラメータを時間に応じて動かすためのModifier**です。たとえばTransformのSizeに割り当てられる環境なら、動かす対象は画像そのものではなく、画像を拡大・縮小する数値です。

~~~text
拍の間隔（Frames per Beat または Beats per Minute）
      + 開始・終了時刻 + ADSRの調整
                      ↓
                 Beat（Modifier）
                      ↓
          対象のパラメータ（例：Size）
                      ↓
                 画像の見た目が変わる
~~~

これは処理の関係を示す**概念図**です。Flow上で「画像 → Beat → 画像」と配線する図ではありません。既存のCOLLECTANEAカタログの入力・出力分類は「parameter」ですが、**Beatの正式なポート名や内部データ型は未確認**です。Modifierによる制御と、画像用Nodeの入力・出力を混同しないでください。

数値パラメータとModifierの一般的な関係は[パラメータのデータ](../../learn/02-data/parameter-data)と[Modifierの役割](../../learn/05-time/modifier-parameter-sources)で説明しています。

## 主な設定項目

21.1 Reference ManualのKrokodove Nodes一覧には、次の種類の調整項目が明記されています。ただし、この一覧は各項目の**正確なInspectorラベル、数値範囲、初期値、単位、内部処理**までは掲載していません。

| 項目 | 何を決めるか | 確認上の注意 |
| --- | --- | --- |
| Frames per Beat | 1拍を何フレームとして扱うかを指定するための項目 | 小数フレームや端数の処理は未確認。 |
| Beats per Minute | 1分間に何拍あるかというテンポを指定するための項目 | 「BPM」と略すが、正式なUIラベルは実機確認が必要。 |
| Start / End time | アニメーションの開始・終了時刻に関係する項目 | 各値の単位や境界フレームでの動作は未確認。 |
| Attack / Decay / Sustain / Release | 拍に合わせた値の変化を調整する項目 | Beat固有の曲線、適用単位、値の範囲は未確認。 |

Attack、Decay、Sustain、Releaseは一般に**ADSR**と呼ばれるまとまりです。一般的なADSRでは、値が立ち上がる区間（Attack）、ピーク後に変化する区間（Decay）、維持する段階（Sustain）、戻っていく区間（Release）を区別します。**これは用語の一般的な説明**であり、Beatが必ず同じ形の波形を出す、Sustainが特定の値を表す、という実機確認ではありません。

## BPMとフレーム数の読み替え

一定テンポの曲で、1拍が何フレームに相当するかを考えると設定を選びやすくなります。

~~~text
1拍の秒数 = 60 ÷ BPM
1拍のフレーム数 = フレームレート × 60 ÷ BPM
~~~

たとえば**30 fps・120 BPM**なら、1拍は0.5秒、つまり**15フレーム**です。30 fpsのタイムラインでは、15フレームごとに拍が来る計算になります。これはテンポとフレームレートの一般的な換算であり、**Beatがその値をどのように丸めて評価するかを保証するものではありません**。

29.97 fpsなどでは1拍が整数フレームにならない場合があります。また、曲の開始位置とFusion Compositionの時間原点が一致するとも限りません。数字が合っていても映像と音がずれて見える場合は、開始フレームとテンポの両方を確認します。

## 最小構成と実機での確認

次は**仕様から考えた検証用の構成案**です。KrokodoveのBeatをResolve 21.1上で実際に割り当て、動作確認した結果ではありません。

~~~text
Background → Transform → MediaOut
                └─ SizeをBeatで制御する想定
~~~

1. FusionでBackgroundとTransformをつなぎ、Viewerに結果を表示します。大きさの変化を見分けやすいよう、必要ならBackgroundへEllipse Maskをつないで円形にします。
2. TransformのSizeなど、変化を確認しやすい**数値パラメータ**を選びます。
3. 標準のFusion Modifierは、Inspectorの対象パラメータを右クリックして「Modify With」から追加する方式があります。ただし、**Beatがこのメニューに表示されるか、どの型のパラメータを受け付けるかは未確認**です。まず導入済み環境のメニューとModifier一覧で存在を確認します。
4. Beatを割り当てられた場合、テンポを120 BPM相当に設定し、30 fpsのTimelineで約15フレーム間隔の表示を比べます。開始・終了時刻とADSRの値は、一度に一つずつ変えて観察します。
5. 値が動かなければ、Beatがそのパラメータに適用されているか、表示しているのが変更後のNodeか、開始・終了時刻が評価区間を含むかを確認します。

**この構成の目的は、拍に同期する値が対象パラメータへどう作用するかを観察すること**です。特定のキーフレームや数値が必ず生成される、といった結果はまだ確定していません。

## 主な用途

**拍に合わせたスケール変化**：音楽に合わせて円やタイトルの大きさを変えたいとき、SizeへBeatを割り当てられるか調べる候補になります。大きくなる向きや変化幅は実機で確かめます。

**明滅するグラフィック**：透明度やBlendのような数値を制御できれば、拍ごとに図形の見え方を変える表現を検討できます。Beatがすべての数値Controlへ適用できるとは断定しません。

**複数要素のタイミング合わせ**：テンポを共通の基準にして、異なる要素の動きを設計する際に役立つ考え方です。ただし、一つのBeatから複数のパラメータへ接続する正式な仕組みは確認できていません。

## 似たModifierとの違い

| Modifier | どんな変化を狙うか |
| --- | --- |
| **Beat** | 拍の間隔や開始・終了時刻を基準にした変化を調整する。 |
| [Random](./random) | 指定した範囲でランダム値を作り、一定のフレーム範囲で値を変える。 |
| [Perturb](../modifiers/perturb) | Perlinノイズによる滑らかな揺れを加える。拍への同期を目的とする説明ではない。 |
| [Anim Curves](../modifiers/anim-curves) | アニメーション曲線を使って時間変化を制御する標準Modifier。 |

「テンポに沿わせたい」のか、「一定範囲で不規則に変えたい」のか、「自分で曲線を設計したい」のかで使い分けます。

## 注意点と確認範囲

- **オーディオ解析ではない**：21.1 Manualに音声入力や自動BPM検出の説明はありません。拍の位置を自動で認識する機能としては紹介しません。
- **画像を直接出力しない**：BeatはKrokodoveの「Modifiers」に分類されています。画像用Nodeを直列につなぐ構成図を流用しません。
- **対応パラメータと割り当て手順**：具体的な型、メニュー位置、Modifierの出力範囲、ADSRの単位、曲線形状は未確認です。
- **ホスト・Edition差**：Resolve Free / Studio / Fusion Studioでの提供範囲、内部REGID、保存後の再現性について、このページでは実機確認をしていません。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2438「Modifiers — Beat」。Frames per Beat / Beats per Minute、Start / End time、Attack / Decay / Sustain / Releaseを備えたModifierであることを確認しています。

**追加参照**：同ManualのChapter 124「Modifiers」（例：pp.2994、2998）は、標準ModifierをInspectorの数値項目へ割り当て、Modifiersタブで調整する一般的な操作を説明しています。ただし、**そこにBeatの追加手順が掲載されているわけではありません**。

入出力の「parameter」分類は既存のCOLLECTANEAのメタデータに基づきます。BPMの換算式と制作例は説明・検証案であり、Beat固有の動作保証ではありません。正確なUIと実機結果が未確認のため、verification: partialを維持します。
