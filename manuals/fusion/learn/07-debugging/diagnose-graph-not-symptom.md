---
title: 症状ではなくGraphを診断する
description: Fusionの不具合を、見た目の症状からNode・connection・data・parameterの観察可能な原因へ変換する。
doc_type: concept
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

## Question

「黒い」「ずれる」「Maskが効かない」「重い」のような症状から、推測ではなく再現可能な診断へどう移ればよいでしょうか。

## Mental Model

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

## Minimum Example

「Mergeしたら何も見えない」を次の順へ変換します。

1. Background単体は見えるか。
2. Foreground単体は見えるか。
3. Mergeのinput roleは正しいか。
4. Maskなしでは見えるか。
5. Alphaは意図した状態か。
6. Merge outputをViewerで見ているか。

これで症状を複数の小さい質問へ分解できます。

## Invariants

- observation before mutation。
- 1回に1つだけ条件を変える。
- data domainが違う問題をparameter調整で直そうとしない。
- last-known-good / first-known-badを作る。
- current frame / Viewer target / branchを明示する。
- Node固有のexact behaviorが必要になった時点でReferenceへ移る。

## Change One Thing

問題を再現した状態で、1本のconnectionまたは1つのNodeだけを一時的に外します。

結果が変わったら、その境界を次の調査対象にします。変わらなければ別branchへ移ります。

## Transfer

### Visual symptoms

黒い、透明、切れる、ずれる、といった見た目をGraph地点へ変換します。

### Animation symptoms

「動かない」を、current time・keyframe・parameter source・Expression / Modifierへ分解します。

### Performance symptoms

「重い」を、広いDoD、重いbranch、3D / particle / temporal処理などの候補へ分け、まずどのstageで負荷が増えるか観察します。

## Predict

初見のfailureでも、次の順序を選べます。

1. reproduce
2. locate
3. classify data
4. isolate branch
5. inspect node-specific behavior
6. repair one cause
7. re-check original symptom

## Common Misread

**似た症状の過去解決策をそのまま適用すること。**

同じ「何も出ない」でも、Viewer target、data domain、Mask、alpha、DoD、timeなど原因は異なります。症状名はroutingに使い、修正理由には使いません。

## Related Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Node Reference

Node固有の検証へ進む場合は [Node Reference](../../nodes/) を使います。

## Next

基礎Conceptの学習経路はここで一周します。

次は:
- [Patterns](../../patterns/) で再利用構造を見る
- [Node Reference](../../nodes/) で個別Nodeを引く
- [Troubleshooting](../../troubleshooting) で具体的な症状から診断する

---

Verification note: このページは特定Nodeの仕様ではなく、前章までのConceptを統合した診断methodです。個別仕様の真偽はcurrent Reference / host evidenceを優先します。
