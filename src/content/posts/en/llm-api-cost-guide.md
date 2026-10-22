---
title: 'How to Estimate LLM API Costs: One Formula, One Example and Five Ways to Save'
description: How input, output and cached tokens are billed, a worked monthly estimate for a support bot, and how much prompt caching, smaller models and output limits actually save.
date: 2026-10-22
category: ai
kind: tutorial
tags: [llm, cost, prompt-caching, api]
tools: [llm-cost-calculator, token-counter, text-chunker]
---

Many teams only discover what their LLM feature costs when the first invoice arrives — and the same feature can cost 40× more or less depending on the model and the prompt. This guide works through one formula and one concrete example, then looks at which savings actually matter.

> Prices are standard-tier list prices checked against each provider’s official pricing page on 2026-10-22, in USD per million tokens. They change often; always confirm on the provider’s site.

## The formula

Almost every LLM API bills per token, with separate prices for input and output:

```text
cost per request = uncached input × input price
                 + cached input   × cache-read price
                 + output         × output price
```

Three things stand out:

1. **Output is much more expensive than input** — typically 4–6× on mainstream models. Making the model say less often saves more than showing it less.
2. **Cache hits are much cheaper.** A repeated prefix (system prompt, fixed documents) that hits the prompt cache is often 1/10 or even 1/20 of the normal input price.
3. **Thinking tokens are billed as output.** With reasoning or extended thinking enabled, the model’s internal reasoning counts as output, so the bill can be several times what the visible answer suggests.

## A worked example: a support bot

Suppose each request to a support bot has:

- 3,000 input tokens: 2,000 of fixed system prompt and product docs, 1,000 of user question and conversation history;
- 400 output tokens;
- 10,000 requests per day.

On Claude Sonnet 5.5 ($2 input, $0.10 cache read, $10 output):

| Item | Tokens | Price per 1M | Cost |
| --- | --- | --- | --- |
| Uncached input | 1,000 | $2 | $0.0020 |
| Cached input | 2,000 | $0.10 | $0.0002 |
| Output | 400 | $10 | $0.0040 |
| **Per request** | | | **$0.0062** |

That’s $62 a day, or about **$1,860 a month** (30 days). Output is only 12% of the tokens but 65% of the cost.

Enter the same numbers into the [LLM API Cost Calculator](/en/llm-cost-calculator/) to compare every model at once.

## Five ways to save

### 1. Use prompt caching

Without caching, the example costs $0.010 per request — **$3,000 a month**. Simply letting the fixed prefix hit the cache saves 38%.

Put everything that doesn’t change (system prompt, tool definitions, reference docs) **first**, and the parts that vary (the user’s message) last. Caches match on prefixes, so a single changed character early on invalidates everything after it. Cache writes usually cost extra, so caching pays off only for prefixes that are read many times.

### 2. Pick the model per task

The same workload on other models:

| Model | Per month (with caching) |
| --- | --- |
| Claude Opus 5.5 | $3,720 |
| Claude Sonnet 5.5 / GPT-6.1 Sol | $1,860 |
| Gemini 3.8 Flash | $720 |
| DeepSeek V4.1 Flash (peak price) | $238 |
| Claude Haiku 5.5 / GPT-6 Luna | $96 |

The spread is almost 40×. A common pattern is **routing**: send classification, extraction and rewriting to a small model, and reserve the large one for hard reasoning. Start with the small model in your evals and upgrade only where quality falls short — not the other way round.

### 3. Limit output

Output is the expensive part, so attack it first:

- Set a sensible `max_tokens` to cap runaway answers;
- Specify format and length in the prompt, e.g. “answer in at most three sentences”;
- When you need data, constrain the output with a JSON Schema so the model doesn’t add explanations;
- Lower the thinking budget on reasoning models for easy tasks.

### 4. Trim the input

- In RAG, include only the most relevant chunks instead of whole documents. Tune chunk sizes with the [RAG Text Chunker](/en/text-chunker/);
- Summarize long conversation histories periodically;
- Mind tokenization: the same content in another language, or under another provider’s tokenizer, can take noticeably more or fewer tokens. Measure your real prompts with the [Token Counter](/en/token-counter/) instead of estimating from word counts.

### 5. Use batch and off-peak pricing

Work that doesn’t need an immediate answer — bulk labeling, offline generation, evals — can go through batch APIs, typically about 50% cheaper. DeepSeek is also 50% off outside peak hours.

## Watch out for long-context tiers

Some models bill the entire request at a higher rate once a single prompt passes a threshold — for example Claude Haiku 5.5 above 100K input tokens and Gemini 3.1 Pro above 200K. Splitting a long document into several requests can be cheaper.

## After launch: check against real usage

Estimates are a starting point. Every API response reports actual usage — for example Anthropic’s `usage.input_tokens`, `output_tokens` and `cache_read_input_tokens`, or the OpenAI Responses API’s `usage.input_tokens`, `output_tokens` and `input_tokens_details.cached_tokens`. Log these per feature and you’ll know exactly where the money goes and what your cache hit rate is.

## Summary

- Cost = uncached input + cached input + output, and output is the most expensive;
- Put fixed content first so caching works;
- Start with a small model and upgrade where needed;
- Cap output length and trim input;
- Send offline work through batch APIs.

Plug your own numbers into the [LLM API Cost Calculator](/en/llm-cost-calculator/) to see a monthly bill for every major model in seconds.
