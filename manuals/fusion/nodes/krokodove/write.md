---
title: Write
description: Krokodoveの文字表示用Write modifierで、タイプ入力風の出現、カーソル、消えない接頭文字列を作る考え方と確認手順。
doc_type: node
term_id: write
term_short: 文字を打ち込んでいるように順次表示し、末尾のカーソルや常時表示する接頭文字列も扱うKrokodoveのText Modifier。
verification: partial
aliases: [Write]
concepts: [parameter-data]
nodes: [Write]
node_family: krokodove
inputs: [parameter]
outputs: [parameter]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-21'
---

# Write（Krokodove）

**Writeは、文字が少しずつ打ち込まれていくような表示を作る、KrokodoveのText Modifier（文字用モディファイア）**です。DaVinci Resolve 21.1 Reference Manualには、タイプ入力風のWrite On動作に加え、文末のカーソル（caret）と、書き出しの進行に左右されず表示し続けるPrefix（接頭文字列）を扱えると記されています。

例えば「STATUS > 」という見出しは最初から表示し、その後ろの「CONNECTING...」だけを入力中のように出す演出が考えられます。Writeは画像を右から切り抜くエフェクトではなく、**表示される文字列の変化を扱う**ものとして捉えると、ほかのノードと混同しにくくなります。

## Text Modifierとは

FusionのText+は、文字列・フォント・配置などの情報から文字の画像を作ります。一方、Modifierは、ノードの設定項目に結び付いて、その**項目に入る値を決めたり時間とともに変化させたりする仕組み**です。Writeは21.1 Manualの「Text Modifiers」に掲載されています。

このため、画像用のMediaInとWriteとMediaOutを横一列に接続する説明は適切ではありません。基本的な考え方は次のとおりです。

    Text+ の Styled Text（文字列を扱う項目）
          └─ Write：表示する文字を時間に応じて変える
    Text+ の画像出力 → Merge（Foreground） → MediaOut
    背景映像 ──────────→ Merge（Background）

図の上段は**項目とModifierの関係**であり、Writeという画像ノードの接続線を表しているわけではありません。Text+で文字が画像として描かれてから、Mergeなどの通常の画像合成へ進みます。

標準のText+では、Styled Text欄の右クリックメニューから文字用Modifierを追加し、InspectorのModifiersタブで操作する仕組みが公式マニュアルに説明されています。Krokodove版Writeが実機でどのメニュー名・位置に表示されるかまでは、この資料だけでは確定できません。

## 何が起こるか

### 入力中のように文字を見せる

「CONNECTING...」という文章を最初から一度に表示する代わりに、入力が進んでいるように内容を出現させます。ManualはこれをWrite Onスタイルと表現しています。ただし、**一度に現れる単位が必ず1文字か、区切りをどう扱うか、出現範囲をどの設定で指定するか**は、掲載された短い説明では確認できません。

### カーソルを文末へ付ける

Writeには、タイプ入力中のように見せるため、文字列の末尾にcursor/caretを追加する選択肢があります。テキストエディタや端末画面を模したグラフィックに向きます。カーソルの具体的な形、点滅の有無、色、長さなどを変更できるかは未確認です。

### Prefixを表示し続ける

Prefixは本文の前に付ける文字列です。21.1 Manualでは、PrefixがWrite On効果の対象にならず、**常に見えている**ことが明記されています。

例えば「LOG > 」をPrefix、「RENDER COMPLETE」を変化させたい本文にすれば、行頭だけを固定し、続く文字だけが増えていく表現を検討できます。「Prefixまで一緒に現れる」動作として説明してはいけません。

## 入力・出力とデータの境界

| 対象 | 役割 | 根拠・確認状況 |
| --- | --- | --- |
| 文字列を扱う項目 | Writeの作用先として想定するText+のStyled Text | Text+の一般的なModifier操作は21.1 Manualで確認済み |
| Writeの処理 | タイプ入力風の文字表示、末尾カーソル、常時表示のPrefix | 21.1 ManualのWrite個別説明で確認済み |
| 描画される文字 | Text+などの文字生成側が画像に変換する | FusionのText+とModifierの役割の区別 |
| 正式なWriteの入力・出力端子 | ポート名・数・内部のデータ型は未確認 | 個別説明には記載なし |

Frontmatterの inputs / outputs に記した parameter は、**この項目が文字用の設定値を扱うModifierであることを整理するための分類**です。Writeの正式な入力ポート名や、Flow上で独立した画像入力・出力を持つことを示すものではありません。

また、Writeは文字列を「ファイルに書き出す」機能という意味ではありません。名前だけからテキストファイルの保存や画像への描画経路を推測しないでください。

## 主な用途

### 端末・機器のステータス表示

「REC > 」「STATUS: 」など固定したラベルのあとに状態メッセージを順次表示する用途です。固定ラベルをPrefixへ分けると、装飾の一部を常時残しながら本文だけを変化させる意図を表しやすくなります。

### MV・タイトルの文字演出

歌詞の一節や章タイトルを、一度に表示せず順次現すために使えます。画面の位置や文字サイズを変えるのはText+や後段のTransformの担当であり、Write自体に移動・拡大縮小の機能があるとは確認されていません。

### UIモック・通知文

ソフトウェア画面を模した映像で、ラベルと入力結果の見え方を分けたいときにも候補になります。複数行や日本語の句読点、全角文字について、出現順やカーソル位置が期待どおりになるかは実機で確かめます。

## 制作例：固定ラベルの後ろにメッセージを表示する

次は**効果の見え方を確認するための構成案**です。21.1実機で確認済みのプリセット値や、公式の完成チュートリアルではありません。

1. Text+で「CONNECTING...」のような短い文字列を扱い、背景映像とは別の系統に置きます。最初はフォントと文字サイズを固定します。
2. Styled Text欄のModifier追加操作を調べ、使用中の環境でKrokodoveのWriteが選択可能か確認します。適用後、InspectorのModifiersタブにどの項目が現れるか確かめます。
3. Writeの表示変化をタイムライン上の数フレームで比較します。何も変化しなければ、実際に必要な時間設定やアニメーション操作をInspectorで確認します。存在を確認していない項目名や数値は指定しません。
4. Prefixに相当する設定が見つかれば「STATUS > 」を指定し、本文の表示が変わっている途中でもラベルが残るか確かめます。Prefixが通常の本文と同じように出現する場合は、意図した設定になっていない可能性があります。
5. cursor/caretに相当する機能を有効にできたら、文字列の末尾との位置関係を確認します。点滅や縦棒の形は、実機で見える結果として記録します。
6. Text+の画像出力をMergeのForegroundへ、背景映像をBackgroundへ接続します。文字の出現と背景映像の合成を分けて確認し、最後にMediaOutへ送ります。

同じフレームで、Prefixだけ・本文だけ・カーソルを付けた状態を順に比較すると、それぞれの役割が判断しやすくなります。文字の見え方を変える作業と、合成位置を調整する作業を一度に行わない方が、原因を追いやすくなります。

## 近い機能との違い

| 機能 | 21.1 Manualで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Write（Krokodove）** | タイプ入力風の出現、末尾カーソル、常時表示Prefix | 入力中の文字列や端末風の演出 |
| [From File](./from-file) | txtファイルまたは手入力から、行単位で固定・任意の時間表示 | 複数行の文章を順に切り替える |
| [Juggle](./juggle) | 文字をランダムに混ぜる | 文字の並びが不規則に変わる演出 |
| [Text+](../generators/text-plus)と標準Follower | 文字ごとにアニメーションを遅延させる | 文字の移動・変形・シェーディングを連続的に動かす |

Writeは「文字が入力されていく見え方」、From Fileは「表示する行の切り替え」、Juggleは「文字のランダムな混合」に注目すると違いが分かります。ただし、これらを同じStyled Text項目へ重ねて適用できるか、適用順がどうなるかは本資料では確認できません。

## 注意点・未確認事項

- **操作位置**：Text+のModifier追加とModifiersタブは公式資料で確認できますが、Krokodove Write固有のメニュー表記や登録先は未確認です。通常の画像ノードとしてFlowに置けると断定しません。
- **時間の制御**：開始時刻・終了時刻・速度・ループ・キーフレームの正式な項目名、既定値、範囲は未確認です。
- **文字の単位**：全角文字、結合文字、改行、複数行テキストでの表示単位や文字送りの規則は未確認です。日本語の素材で確認します。
- **カーソル**：見た目・点滅・長さ・タイミングなどの具体的な制御項目は未確認です。
- **製品差**：DaVinci Resolve 21.1 Reference Manualには掲載されていますが、Resolve Free / Studio / Fusion Studioそれぞれでの可用性、内部REGID、追加インストールの要否は実機で未確認です。
- **Text+との関係**：本文の構成は一般的なText+のModifier操作とKrokodove Writeの用途を組み合わせた検証案です。Text 3DやMultiTextでも同じ操作が可能とは確認していません。

## バージョンと出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、**Chapter 105「Krokodove Nodes」p.2438「Text Modifiers / Write」**。タイプ入力風のWrite On、カーソル／caret、常時表示Prefixの機能を確認しました。

Text+へのModifierの一般的な追加方法とInspectorの場所は、同Manualの**Chapter 103「Generator Nodes」p.2395「Text+ Modifiers」**で確認しました。標準Followerについてはp.2396を参照しています。これらを根拠にした記事ですが、Krokodove Writeの正確なUI設定や実機操作を検証したわけではないため、verification: partialを維持します。

ほかのKrokodoveツールは[カテゴリ概要](./)から確認できます。
