---
title: 'What Exactly Is a Token? Why Some Languages Cost More, and How to Estimate Usage'
description: How tokenizers work, how tokens relate to words, why non-English text often uses more tokens, what counts toward the context window, and practical ways to cut token usage.
date: 2026-10-12
category: ai
kind: article
tags: [llm, token, tokenizer]
tools: [token-counter, text-chunker, markdown-cleaner]
---

When you call an LLM API, pricing, context length and rate limits are almost all measured in **tokens**. Yet a token is neither a character nor a word, and many developers only have a fuzzy idea of what it is. Let’s fix that.

## Where tokens come from

Models don’t read text directly; they read sequences of numbers. The component that cuts text into pieces and maps each piece to a number is the **tokenizer**, and each piece is a token.

Most mainstream models use **BPE (byte-pair encoding)** or a close relative: text is first split into bytes, then the most frequent combinations in the training data are repeatedly merged into single tokens. The result:

- Common English words are often a single token (`the`, `function`);
- Rarer words are split into several pieces (`tokenization` might become `token` + `ization`);
- Spaces, punctuation and line breaks use tokens too.

## Why some languages cost more

A tokenizer’s vocabulary is learned from its training data. When that data is mostly English, English combinations get merged aggressively while other scripts — Chinese, Japanese, Korean, Arabic and many more — get fewer merges, so each character costs more tokens on average.

Tokenizers differ a lot. Take OpenAI’s two generations: the newer `o200k_base` (used by GPT-4o and later models) has a much larger vocabulary and handles many non-English languages noticeably more efficiently than the older `cl100k_base` (used by GPT-4 and GPT-3.5).

The most reliable approach is to measure your own text. Paste it into the [Token Counter](/en/token-counter/), switch between the two tokenizers, and you’ll see the difference — including exactly how your text is split.

## Token counts aren’t comparable across models

Claude, Gemini, DeepSeek, Qwen and others each use their own tokenizer, so the same text produces different token counts in different models. That means:

- A count from OpenAI’s tokenizer is only a **rough estimate** for other models;
- When you need exact numbers, use the provider’s token-counting endpoint or read the `usage` field in API responses;
- When comparing prices across models, measure **the same real text** on each one instead of comparing only the per-million-token price.

## Context window: input and output share it

A model’s context window (128K, 200K…) is the **total number of tokens one request can handle**. It usually includes:

- the system prompt;
- the entire conversation history;
- tool definitions (the JSON Schema of functions and tools counts too);
- retrieved documents;
- and the output the model is about to generate.

So the longer a conversation gets, the bigger each turn’s input becomes. The cost of a multi-turn chat **grows with every turn** rather than staying flat.

## Ways to reduce token usage

1. **Trim the system prompt**: remove repetition and pleasantries. It is sent with every request, so savings multiply.
2. **Clean up input formatting**: text copied from web pages or AI answers often carries lots of Markdown symbols and blank lines. Run it through the [AI Markdown Cleaner](/en/markdown-cleaner/) first.
3. **Limit conversation history**: keep only the last few turns, or summarise older ones.
4. **Retrieve instead of stuffing**: split long documents into chunks and retrieve what’s relevant (RAG) rather than pasting everything. The [RAG Text Chunker](/en/text-chunker/) lets you preview different chunk sizes.
5. **Use prompt caching**: OpenAI, Anthropic and others offer prompt caching. Put the long, unchanging prefix (system prompt, tool definitions, reference docs) first to cut the cost and latency of the repeated part. Check each provider’s docs for the exact rules.
6. **Cap the output**: set a sensible `max_tokens` and ask for concise answers. Output tokens are usually priced higher than input tokens.

## Summary

- A token is a piece produced by a tokenizer, not a character or a word;
- Different models use different tokenizers, so counts don’t convert directly;
- The context window covers both input and output, and multi-turn costs accumulate;
- The most reliable way to estimate usage is to measure real data.
