---
title: Testing Claude Code With Real Domain Knowledge
date: 2026-08-29
description: Building a Swedish property investment calculator from scratch with Claude Code, comparing private and AB ownership.
tags: [building, AI, finance]
---

I've been interested in property investment for a while and had done these evaluations by hand before, the kind of spreadsheet math where you work out whether a specific property, at a specific price, with a specific mortgage, actually pencils out. I know what matters in that decision. What I wanted to find out was whether I could get that knowledge into a working tool by explaining it, rather than building it feature by feature myself.

The [financial business case tool](/reflections/financial-business-case-tool) I built earlier was basically a port, an Excel model I already understood, translated into a web app. This one was different. I built the [property investment calculator](https://odectra.github.io/financial-business-case/?tool=property) from scratch with Claude Code, explaining the relevant factors as I went rather than starting from a spreadsheet I already had. It was as much a test of what that process could produce, given real domain knowledge instead of a generic prompt, as it was a tool I actually wanted to use.

The core of it is a side-by-side comparison: the same property, valued as a private purchase and as a purchase through an AB, a Swedish limited company. The two paths aren't just taxed differently, they run under different rules entirely. Loan limits differ. Capital gains and rental income are taxed on separate bases. Stamp duty and the annual fastighetsavgift apply differently depending on the structure, and an AB can sell a property by selling the shares in the company instead of the property itself, a structure known as paketering, which changes the tax picture again. Getting that right by hand for one property is doable. Doing it twice, for both structures, and checking a handful of candidate properties against both, is exactly the kind of thing worth building a tool for instead.

It's meant to do two things at once. If you're evaluating a rental property in Sweden, it tells you whether it's worth it and which structure makes more sense, without you rebuilding the model yourself. And if you're curious what's possible building a domain-specific tool this way, it's a working example. You don't need to be a developer, you need to actually understand the problem you're asking the tool to solve.

Back to [Projects](/projects).
