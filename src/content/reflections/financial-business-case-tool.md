---
title: Finance for Product Managers Who Aren't Finance People
date: 2026-08-24
description: How an Excel template I built for PMs at Mentice became a standalone DCF and sensitivity analysis tool.
tags: [finance, product management, building]
---

This started as an Excel template I built while working as a Product Manager at Mentice, for other PMs who were responsible for building business cases but weren't financially trained. It was built under direction from the CFO's finance team, who wanted business cases to be more financially rigorous.

The design goal was to keep the inputs dead simple: price, expected volume, cost to produce. The template used those to auto-generate DCF forecasts and the graphs needed for presentations, so PMs could focus on making good estimates rather than learning finance mechanics.

I later rebuilt it as a generic, standalone web app, React, TypeScript, Vite, using what I'd learned from the original, deliberately decoupled from anything specific to Mentice, to showcase on my own site. The [business case tool](https://odectra.github.io/financial-business-case/?tool=business-case) already modeled best, base and conservative cases. Sensitivity analysis was a natural next step, since it's a standard, well-established finance technique, not tied to any one specific decision.

I built the [property investment calculator](/reflections/property-investment-claude-code) the same way, starting from what I'd learned building this one.

Back to [Projects](/projects).
