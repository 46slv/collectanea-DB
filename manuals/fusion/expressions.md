---
sidebar_position: 4
title: Expressions
---

# Expressions

FusionのExpressionを、何を参照し、どう自動化するかで整理します。

## Expressionを設定する

Inspectorの値を右クリックし、Expressionを選びます。入力欄にはLua式または他ノードへの参照を記述します。

## 他ノードを参照する

ノード名とparameter名をドットでつなぎます。

```lua
OtherTransform.Center
```

### Componentを参照する

PointのX / Yだけを取り出す場合は、参照先の型を確認します。

```lua
OtherTransform.Center.X
```

## 値を連動する

基準値から別の値を計算すると、配置や比率を変更しても関係を維持できます。

### 同じノードの値

```lua
Width * 0.5
```

### 範囲を補間する

複数要素を等間隔にする場合は、最小値、最大値、index、個数を分けて式にします。

```lua
minValue + (maxValue - minValue) * index / (count - 1)
```

## Timeを使う

現在frameを使って周期運動や自動変化を作れます。

```lua
0.5 + math.sin(time * 0.05) * 0.1
```

## Notes

- node renameで参照名が変わる場合があります。
- 型が異なる値同士は直接代入できないことがあります。
- 複雑な式はUser Controlsへ基準値を分離すると保守しやすくなります。
