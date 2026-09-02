---
title: Testing Claude Code With Real Domain Knowledge
date: 2026-08-29
description: Building a Swedish property investment calculator from scratch with Claude Code, comparing private and AB ownership.
tags: [building, AI, finance]
---

I've had a personal interest in property investment for a while, and had done these evaluations manually before. This tool was partly a test of what Claude Code could do when fed real domain knowledge, built from scratch with AI by explaining the relevant factors, rather than porting an existing spreadsheet like I did with the [business case tool](/reflections/financial-business-case-tool).

The core of the [property investment calculator](https://odectra.github.io/financial-business-case/?tool=property) is a side-by-side comparison: the same property, valued as a private purchase and as a purchase through an AB, a Swedish limited company. Swedish rules differ meaningfully between the two on loan limits and tax treatment, so the tool lets you check whether a specific property is worth it, and under which structure, without rebuilding the calculation from scratch each time.

It serves two purposes. It's genuinely useful if you're evaluating a rental property purchase in Sweden. And it's a demonstration of what's possible building a domain-specific tool with Claude Code from your own know-how, so others don't have to build the underlying model themselves.

Back to [Projects](/projects).
