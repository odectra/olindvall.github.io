---
title: Finance for Product Managers Who Aren't Finance People
date: 2026-08-24
description: How an Excel template I built for PMs at Mentice became a standalone DCF and sensitivity analysis tool.
tags: [finance, product management, building]
---

At Mentice, product managers were expected to build business cases for new features and products, but most of us weren't trained in finance. Finance wanted the cases to be more rigorous, which was fair, but asking a PM to learn discounted cash flow modeling from scratch before they could even start estimating a market wasn't realistic either.

So I built an Excel template. The goal was to keep the inputs dead simple: price, expected volume, cost to produce. From those, the template generated a full DCF forecast and the charts you'd actually need for a leadership presentation. The point was that a PM's time is best spent making good estimates about the actual business, price, adoption, competition, not learning how a DCF works. The template did the finance mechanics; the PM did the judgment.

That template lived on my laptop and got emailed around for a while. Once I started rebuilding my own tools as standalone web apps, I rebuilt it too, using what I'd learned from the original: a [business case tool](https://odectra.github.io/financial-business-case/?tool=business-case) built with React, TypeScript and Vite, deliberately decoupled from anything specific to Mentice so it's just a general-purpose tool now.

The original already modeled best, base and conservative cases. Sensitivity analysis was the obvious next step once I rebuilt it, since it's a standard technique in this kind of financial modeling, not tied to any one decision I was trying to make at the time. It shows how the outcome moves when you flex the assumptions that are hardest to pin down, price, volume ramp, cost overruns, instead of presenting a single forecast as if it were certain.

I ended up building a related tool the same way, starting from a real decision instead of a workplace template: a [property investment calculator](/reflections/property-investment-claude-code) for evaluating rental property purchases in Sweden. Different starting point, same instinct. If I understand a financial decision well enough to model it properly, it's worth building the tool instead of doing the math by hand every time.

Back to [Projects](/projects).
