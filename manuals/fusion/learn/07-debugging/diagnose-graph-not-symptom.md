---
title: 症状ではなくGraphを診断する
description: Fusionの不具合を、見た目の症状からNode・connection・data・パラメータの観察可能な原因へ変換する。
doc_type: concept
term_id: diagnose-graph-not-symptom
term_short: 見た目の症状をNode・connection・data・parameterの観察可能な原因へ分解する診断方法。
verification: partial
aliases: [debugging workflow, graph diagnosis]
concepts: [debugging, observation, node-graph]
tasks: [debug, isolate, diagnose]
prerequisites: [data-domain, branch-isolation, alpha, domain-of-definition]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---
# 症状ではなくGraphを診断する

## このページで分かること

「黒い」「ずれる」「<Term id="mask">Mask</Term>が効かない」「重い」といった症状を、再現可能な診断へつなげる手順を説明します。

## 基本の考え方

症状は入口であり、原因ではありません。

Fusionでは症状を次の観察可能な層へ変換します。

```text
symptom
  ↓
which graph stage?
  ↓
which data domain?
  ↓
which connection / branch?
  ↓
which parameter / time / alpha / domain behavior?
  ↓
minimal repair
```

「何を触れば直るか」ではなく、「どこから期待と観測が分かれたか」を探します。

## 最小例

「<Term id="merge">Merge</Term>したら何も見えない」を次の順へ変換します。

1. Background単体は見えるか。
2. Foreground単体は見えるか。
3. Mergeのinput 役割は正しいか。
4. Maskなしでは見えるか。
5. Alphaは意図した状態か。
6. Merge outputをViewerで見ているか。

これで症状を複数の小さい質問へ分解できます。

## 共通ルール

- observation before mutation。
- 1回に1つだけ条件を変える。
- データ領域（data domain）が違う問題をパラメータ調整で直そうとしない。
- last-known-good / first-known-badを作る。
- 現在の フレーム / Viewer 対象 / 分岐を明示する。
- Node固有の正確な 挙動が必要になった時点でReferenceへ移る。

## 1つずつ変えて確認する

問題を再現した状態で、1本のconnectionまたは1つのNodeだけを一時的に外します。

結果が変わったら、その境界を次の調査対象にします。変わらなければ別分岐へ移ります。

## 他のNodeにも応用する

### Visual symptoms

黒い、透明、切れる、ずれる、といった見た目をGraph地点へ変換します。

### アニメーション symptoms

「動かない」を、現在の time・keyframe・パラメータの供給元・Expression / Modifierへ分解します。

### 性能 symptoms

「重い」を、広いDoD、重い分岐、3D / particle / temporal処理などの候補へ分け、まずどの段階で負荷が増えるか観察します。

## 初見のNodeを読む

初見のfailureでも、次の順序を選べます。

1. reproduce
2. locate
3. classify data
4. isolate 分岐
5. inspect node-specific 挙動
6. repair one cause
7. re-check original symptom

## よくある誤解

**似た症状の過去解決策をそのまま適用すること。**

同じ「何も出ない」でも、Viewer 対象、データ領域（data domain）、Mask、alpha、DoD、timeなど原因は異なります。症状名はroutingに使い、修正理由には使いません。

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

Node固有の検証へ進む場合は [Node Reference](../../nodes/) を使います。

## 次に読む

基礎Conceptの学習経路はここで一周します。

次は:
- [Patterns](../../patterns/) で再利用構造を見る
- [Node Reference](../../nodes/) で個別Nodeを引く
- [Troubleshooting](../../troubleshooting) で具体的な症状から診断する

---
検証メモ: このページは特定Nodeの仕様ではなく、前章までのConceptを統合した診断methodです。個別仕様の真偽は現在の Reference / host evidenceを優先します。
