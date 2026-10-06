---
title: 等間隔配置が崩れる
description: index・count・resolution・個別オフセットを分け、procedural 配置のずれを診断する。
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

## まず確認すること

1. indexは0-basedか1-basedか。
2. countと実際のelement数が一致しているか。
3. start / end / spacingのどれを基準となる値にしているか。
4. normalized 値とピクセル spacingを混同していないか。
5. 各elementに個別オフセットが追加されていないか。
6. resolution変更後だけ崩れるか。

## 原因の切り分け

まず1軸・3要素だけへ縮めます。

```text
index = 0,1,2
count = 3
```

start / middle / endが期待位置になることを確認します。

## 主な原因

### index conventionの違い

0-basedと1-basedで式の分母・offsetがずれます。

### count mismatch

element数と式で使うcountが違います。

### ピクセル / normalized混同

resolution変更でspacingが変わります。

### 個別補正の蓄積

各追従要素（Follower）へ手動オフセットを入れすぎ、master 関係が崩れています。

## 修正方法

1. index conventionを固定する。
2. countを1箇所で管理する。
3. start/end方式かcenter/spacing方式かを選ぶ。
4. resolution-aware conversionを1箇所へ寄せる。
5. 個別オフセットを必要最小限に戻す。

## なぜ起きるか

procedural spacingは各要素の最終値ではなく、少数のmaster パラメータから派生させる方が安定します。

→ [複数要素を等間隔に配置する考え方](../../recipes/automation/equal-spacing-by-index)

## バージョン・例外

正確な Expression syntaxは現在の Fusion 21.1 manual / ホスト上での確認を優先します。

## 関連する症状

- 4Kにすると間隔が変わる
- 真ん中だけずれる
- element追加後に全体が崩れる
