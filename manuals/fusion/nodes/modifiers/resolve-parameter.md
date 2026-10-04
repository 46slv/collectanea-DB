---
title: Resolve Parameter
description: Fusion transition template内のparameterをEdit / Cut pageのtransition durationへ自動連動させるModifier。
doc_type: node
term_id: resolve-parameter
verification: partial
aliases: [Resolve Parameter]
concepts: [template, modifiers, time]
nodes: [Resolve Parameter]
node_family: modifiers
outputs: [parameter]
tasks: [transition-template, modifier, edit-page]
product_scope: fusion
suite_surfaces: [fusion, edit, cut]
updated: "2026-10-05"
---

# Resolve Parameter

Resolve Parameterは、Fusionで作るtransition templateのparameterを、Edit / Cut page上のtransition durationへ自動連動させるModifierです。

transitionをtrimして長さを変えても、parameter animationをtemplate durationへ合わせられます。

## 典型構成

Manualの例ではDissolveのBackground/Foreground parameterへResolve Parameterを付け、Macroとして2 input / 1 outputを公開し、Fusion Transitionとして保存します。

## 使う判断

通常のFusion comp内animationを作るModifierではなく、Resolve Edit / Cut pageへ公開するtransition template integrationが主用途です。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 124 p.3025で、transition template、Dissolve例、Macro公開とEdit / Cut page連動を確認しました。
