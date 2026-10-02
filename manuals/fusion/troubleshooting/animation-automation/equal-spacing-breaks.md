---
title: 等間隔配置が崩れる
description: index・count・resolution・local offsetを分け、procedural layoutのずれを診断する。
doc_type: diagnostic
verification: partial
aliases: [spacing broken, distribution wrong, 等間隔にならない]
concepts: [expressions, normalized-coordinates, resolution]
patterns: [master-follower-parameters, resolution-aware-positioning]
tasks: [debug, layout, distribute, automate]
symptoms: [uneven-spacing, wrong-distribution]
prerequisites: [normalized-coordinates]
level: intermediate
product_scope: fusion
---

# 等間隔配置が崩れる

## Fast Checks

1. indexは0-basedか1-basedか。
2. countと実際のelement数が一致しているか。
3. start / end / spacingのどれをsource of truthにしているか。
4. normalized valueとpixel spacingを混同していないか。
5. 各elementにlocal offsetが追加されていないか。
6. resolution変更後だけ崩れるか。

## Isolate

まず1軸・3要素だけへ縮めます。

```text
index = 0,1,2
count = 3
```

start / middle / endが期待位置になることを確認します。

## Likely Causes

### index conventionの違い

0-basedと1-basedで式の分母・offsetがずれます。

### count mismatch

element数と式で使うcountが違います。

### pixel / normalized混同

resolution変更でspacingが変わります。

### local correctionの蓄積

各followerへmanual offsetを入れすぎ、master relationが崩れています。

## Fix

1. index conventionを固定する。
2. countを1箇所で管理する。
3. start/end方式かcenter/spacing方式かを選ぶ。
4. resolution-aware conversionを1箇所へ寄せる。
5. local offsetを必要最小限に戻す。

## Why

procedural spacingは各要素の最終値ではなく、少数のmaster parameterから派生させる方が安定します。

→ [複数要素を等間隔に配置する考え方](../../recipes/automation/equal-spacing-by-index)

## Version / Exception Notes

exact Expression syntaxはcurrent Fusion 21.1 manual / host verificationを優先します。

## Related Symptoms

- 4Kにすると間隔が変わる
- 真ん中だけずれる
- element追加後に全体が崩れる
