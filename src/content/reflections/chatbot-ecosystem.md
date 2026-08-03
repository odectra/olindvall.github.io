---
title: Beyond the Chatbot
date: 2026-08-05
description: Building the ecosystem that matters when deploying AI in a business context
tags: [responsible AI, leadership]
---

**Beyond the Chatbot**

I'm going to describe something we're building at work, and explain how I'm thinking about it. It’s about applying AI responsibly. For context, I work at a pharmaceutical company. We can't cut corners on quality. I don’t have all answers. I’m writing to clarify my own thinking and to learn. 

If you open LinkedIn, it seems like most claim to have the answers. But I want to learn as much as possible. We are in an exciting time, and the winners will not be those with most reactions on a LinkedIn post, but those who came out ahead, when the dust settled. I'm genuinely curious whether others see it differently, so please reach out if you want to discuss these topics. 

**Start With the Problem, Not the Tool**

The team I manage supports a large user base with questions about quality systems in pharmaceutical development. Collectively, my team has more than 140 years of experience at AZ. 
When a team builds a reputation for being helpful and responsive, people start coming to them for everything. It can become ineffective. Since we are also in a position where we can trend patterns, we want to free up time to solve the root causes. 
When your team carries deep specialist knowledge and years of hard-won experience, spending their time answering the same informational questions repeatedly is not a good use of what they actually bring. I want that expertise applied to the hard problems. That's the real driver behind building an AI-assisted quality support system. Not because AI is exciting (although it is), but because there's a genuine opportunity to redirect skilled people toward work that actually needs them.

**Let the Data Challenge You**

Before touching any technology, we looked at ticket trend categories for the past year of incoming support requests. Roughly a **quarter** were straightforward enough for a well-designed system to answer directly. Another **~17%** could be AI-augmented — gathering context upfront and pre-informing the specialist before they stepped in. The remaining **majority, well over half,** genuinely required a trained specialist, or someone with higher access authorities. No shortcut.

Something I did not fully anticipate: When we started classifying real tickets, some requests I assumed would be easy AI territory turned out to need expert intervention for a reason that had nothing to do with complexity. _The user didn't know what they needed help with._ They'd mixed up terminology, or had a misunderstanding baked into the question that an experienced person spotted immediately. This may not come as a surprise for someone working with IT support (or for anyone who has helped their grandparents with technology), but it’s interesting to see it in the data.
The question looked simple on the surface. Underneath, it needed someone who could read between the lines, and investigated how this had been resolved. 
That observation reinforced something I was already starting to believe: the value isn't in the chatbot. It's in the ecosystem around it.

**The Ecosystem Is the Real Product**

I would not be surprised, if the specific chatbot we're building will be replaced in a year or two. The pace of AI development makes that almost certain. So if the application is temporary, where does the lasting value come from?

I’m betting on us humans, and the ecosystem around the tools. In our case, concretely: **data governance** - the system draws exclusively from authorised, version-controlled sources, with human sign-off controlling what enters. **Routing logic** - the system needs to answer confidently when it can, ask clarifying questions when the request is ambiguous, and escalate to a subject matter expert with full context when it's out of its depth. A handoff that arrives with conversation history and a structured summary is a fundamentally different experience for the specialist than a cold ticket with a vague subject line. We use **Power Automate** to connect the AI layer to the humans who need to act. And **continuous improvement** - we're classifying historical tickets to build labelled datasets that improve routing and response quality over time.
None of that becomes obsolete when the underlying model changes. It becomes more valuable because it's the infrastructure that lets you adopt the next generation of tools quickly and safely.

Additionally, every human using AI tools must be trained in the AI policies and risks associated with use of AI. This is part of a company-wide bet on AI. Also, the GxP validated systems that we provide support for, cannot be used unless you have the right level of accesses, and to get those accesses you must be trained. It’s like getting a drivers license for AI. 

**The Unglamorous Part: Proactive Quality**

We run automated checks that continuously scan our underlying data for inconsistencies. When something is flagged, it triggers a structured correction workflow. Sometimes the data owner can fix it themselves. Sometimes, where the record's approval status means they lack the system access,  my team steps in with elevated access and asks: _"We've identified this. Shall we correct it on your behalf?"_ The correction only happens with the owner's confirmation.
Over a year, this generated nearly **15% of our total ticket volume** - entirely without a user raising a hand. It doesn't demo well, because data is often assumed to be correct. But if you're serious about deploying AI, you have to be serious about the data it depends on. We're fixing the foundation before it becomes an issue. 

**Guardrails Are a Feature**

In pharmaceutical development the quality systems my team supports exist because our work has potential consequences for patient lives. Quality isn't a constraint on top of the work, it’s for license to operate. That shapes everything about how I think about deploying AI here. By the time something goes live, it must work. Not 'good enough for now' — but reliable, consistent, and operating within clearly defined boundaries. Overly confident LLMs becomes a risk, which is why the ecosystem, carefully designed with Human-in-the-loop is critical.

**The Team Side**

As mentioned before, our company provide AI training. I’ve decided that every member of my team is working toward a higher AI literacy certification regardless of career level or technical background. I also try to lead by example. For example, I did use AI for complex document review with my own judgement as a process expert firmly in the loop, and sharing those learnings openly, we get more comfortable in when to use AI productivity tools – and when not do it. The adoption rate is as important as the technical delivery. People need to see what responsible AI use actually looks like before they feel confident trying it themselves. A few years ago, a person I hired to this team trained a machine learning model that, combined with human review, tagged over a thousand documents in a matter of months. This significantly improved data quality. The model didn't replace the human. Her skills has been a great addition to the team, because she came from a different background and dared to think differently. 

**What I'm Still Figuring Out**

I don't know how fast the technology will move, or whether the ecosystem thinking I've described holds up as tools become more capable. I don't know whether our staged rollout is the right balance between caution and speed. And I genuinely don't know how user behaviour shifts once a capable AI system is available, whether it builds capability over time, or quietly erodes the habit of developing deep knowledge. 

Outside of work, I try to stay close to the technology by experimenting directly rather than just reading about it. This website is part of that. I set it up as a GitHub repository because it's a practical place to collect what I'm building, lets me use tools like Claude Code, I can publish Lovable projects directly onto my site, and honestly also saved me the cost of a domain hotel. You may see some AI slop, at least initially, but at least it’s my thoughts going into this. Getting your hands dirty is the only way I've found to develop genuine intuition for what these tools can and can't do.

So much is happening right now, and plenty of people claim to have the answers. I’m trying to enjoy the ride and learn as much as possible along the way. If you've approached something similar differently I'd genuinely like to hear it.

Oskar Lindvall, August 2026

![Chatbot Agent Ecosystem](/reflections/chatbot-ecosystem/photo1.jpg)
