---
title: "Write"
description: "write-on。cursor/caret、persistent prefix等。"
doc_type: node
term_id: "write"
term_short: "Writeは、write-on。cursor/caret、persistent prefix等。"
verification: partial
aliases: ["Write"]
concepts: ["parameter-data"]
nodes: ["Write"]
node_family: "krokodove"
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# Write

write-on。cursor/caret、persistent prefix等。

## 概要

- **種別**: Modifier
- **分類**: Krokodove / Text Modifiers
- **主なデータ領域**: Parameter / control
- **導入・系譜**: 21
- **根拠レベル**: Resolve 21 New Features GuideのKrokodove項目で確認

## 入力と出力

この項目はカタログ上、**Parameter / control**を主なデータ領域として扱います。上のfrontmatterにある入出力は領域を検索するための分類であり、Fusion 21.1の正確な端子数や端子名を断定するものではありません。

実際に組むときはFlow上の端子ラベルとInspectorを確認し、2D Image、Mask、Shape、Particle、Classic 3D、USD、Deep、パラメータ値を取り違えないようにします。

## 主な用途

write-on。cursor/caret、persistent prefix等。

## 使うときの判断

画像を直接処理するノードではなく、別のパラメータへ値を供給するModifierです。接続先の値型と時間範囲を確認します。

## 最小構成

```text
対象パラメータ ← Write
```

## 注意点

- このページはノードを選ぶための役割・データ領域・系譜を先に揃えています。
- exactな内部ID、端子名、初期値、数値範囲、Edition差は、確認できたものだけ今後追記します。
- Krokodove版と標準Fusionの同名・類似ノードを同一仕様として扱わないでください。

## バージョンと検証状況

Resolve 21のBlackmagic Design公式資料で役割を確認しています。Fusion 21.1の実機差、端子名、初期値、範囲は必要に応じて再確認します。

このリファレンスのinventory基準はDaVinci Resolve / Fusion 21.0.4です。Manual全体は21.1基準へ更新中のため、21.1で差がある箇所は現行資料または実機確認後に更新します。
