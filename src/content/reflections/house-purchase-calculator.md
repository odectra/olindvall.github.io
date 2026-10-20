---
title: What Is a House Actually Worth? Building a Calculator Before the Bidding Starts
date: 2026-10-20
description: Why I built Husköpskalkyl, a home-buying calculator that separates what a house is worth from what you can afford, and helps you set your limits before bidding.
tags: [finance, building, AI]
---

When you consider buying a home, you get a lot of information and a lot of opinions, but no simple answer to whether a deal actually works. So I built a calculator for it, and later made a general version anyone can use: [Husköpskalkyl](/projects/huskopskalkyl). The tool itself is in Swedish, since it follows Swedish rules for mortgages, taxes and benefits.

When we started looking at what it would cost to buy another home, the usual thing happened. When I dig into something, I dig deep. I wanted a tool where I could change one number and immediately see what happened to everything else. I also wanted to work out what a good deal actually means. Being able to afford a price does not mean the price is right for that particular house. Those are two different questions, and it is easy to let the first one answer the second.

Then I wanted to test the uncomfortable cases. What happens if I, or my wife, or both of us lose our jobs, fall ill or take a big cut in pay, especially soon after buying? More factors found their way in: amortization, interest rate changes, the cost of the move itself, the effect on our savings, and a Monte Carlo simulation of house prices and the stock market over ten years. I built it in a long conversation with Claude, one question at a time. Each new question became a new section.

Three things I learned. First, separate what the house is worth from what you can afford. My first version judged a price as "good" based on what our finances could handle. That was wrong, so the slider at the top is now driven only by what the house is worth, and the finances get their own checklist. Second, make every assumption visible, and call a rule of thumb a rule of thumb. At one point the tool suggested a limit for how much a move "should" cost, and when I asked where the number came from, the honest answer was that it had no source. A rule about mortgage deeds also turned out to be wrong until I questioned it. Today every assumption is an editable field. Third, hide what you do not need right now. The calculator grew past forty input fields, so only the key ones are visible and the rest fold out when needed.

The tool is most useful before the bidding starts. Once you are in the middle of one, emotionally and financially invested, it is easy to get carried away, so it helps to decide your limits in advance. The same goes for renovation: if a house needs more than you were willing to spend, the deal is worse, even if the price looks right compared with similar houses.

The public version is a template with made-up starting values. You fill in the home you are thinking of buying and the one you own, and everything is calculated in your browser, with nothing sent anywhere. It is a simplified model, not financial advice, and your bank and the tax authority have the final say. But as a way to ask the right questions before placing a bid, it has been useful for me. [Try Husköpskalkyl →](/projects/huskopskalkyl)

Back to [Projects](/projects).
