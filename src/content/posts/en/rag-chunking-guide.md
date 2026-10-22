---
title: 'RAG Chunking in Practice: How to Choose Chunk Size, Overlap and Splitting Strategy'
description: Chunking is the first gate of RAG quality. Concrete examples of chunk size, overlap, structure-aware splitting and metadata — and how to validate your choices with data.
date: 2026-09-28
category: ai
kind: tutorial
tags: [rag, embedding, llm]
tools: [text-chunker, token-counter, jsonl-validator]
---

When building RAG (retrieval-augmented generation), most effort goes into picking a model and a vector database. The very first step is often overlooked: **how to split documents into chunks**. If chunking is poor, even perfect retrieval won’t find the right answer.

## Why chunk at all?

1. **Embedding models have an input limit**, so long text doesn’t fit;
2. **One vector can only represent one “topic”**. Squeeze a whole article into one vector and the details get averaged away, making specific questions hard to match;
3. **Context cost**: retrieved content goes into the prompt, so bigger chunks cost more tokens.

Chunking is a balance between two forces: **chunks must be small enough to match precisely, yet large enough to carry the context needed to understand them.**

## Choosing a chunk size

There is no universal best value, but there are sensible starting points:

| Document type | Starting point | Why |
| --- | --- | --- |
| FAQs, short Q&A | 100–300 tokens | Each entry is already a self-contained unit |
| Technical docs, help centres | 300–800 tokens | A subsection is usually one complete idea |
| Long reports, contracts | 500–1000 tokens | Arguments span paragraphs; small chunks lose the logic |

Watch the unit: many frameworks count **characters** by default, while models bill and limit by **tokens**. The character-to-token ratio varies a lot between languages, so “500 characters” of English and of Chinese can differ several-fold in tokens.

## What overlap is for

Overlap means adjacent chunks share a small piece of text. It solves the problem of **key information landing right on a boundary**:

> …the default timeout for this endpoint is 30 seconds. ‖ To change it, set the request header…

Split exactly at “‖” and the second chunk no longer knows *what* is being changed. A little overlap carries the previous sentence along.

A common setting is **10–20% of the chunk size**. Too much overlap wastes storage and fills results with near-duplicate chunks.

## Splitting strategies, from simple to sophisticated

**1. Fixed-length splitting**: cut every N characters. Easy to implement, but it often slices sentences in half. Not recommended on its own.

**2. Recursive splitting**: try paragraph breaks first; if a piece is still too large, split by lines, then sentences, then words. This is the idea behind LangChain’s `RecursiveCharacterTextSplitter` and the most common default today. For CJK text, add full-width punctuation such as `。！？；，` to the separator list.

**3. Structure-aware splitting**: split Markdown by headings, HTML by sections, code by functions. Well-structured documents usually give the best results this way.

**4. Semantic splitting**: compute embedding similarity between neighbouring sentences and split where the topic shifts. Potentially better, but more expensive and harder to debug.

Start with **recursive splitting**; consider fancier methods once you have evaluation data.

## Don’t forget metadata

Each chunk should carry metadata alongside its text, for example:

```json
{
  "text": "The default timeout for this endpoint is 30 seconds…",
  "source": "docs/api/timeout.md",
  "title": "Request timeouts",
  "heading_path": ["API reference", "Common parameters", "Timeouts"],
  "updated_at": "2026-09-01"
}
```

Metadata lets you filter (search only one product line’s docs), cite sources in answers, and prepend the heading path to the text before embedding so even short chunks carry context.

## Validate with data, not gut feeling

The most effective way to tune chunking is a small evaluation set:

1. Collect 30–50 real user questions and mark the document passage that answers each one;
2. Build an index for each combination of chunk size and overlap;
3. Measure how often the correct passage appears in the top 3 / top 5 results.

Store the evaluation set as JSONL, one question per line, and check its format with the [JSONL Validator](/en/jsonl-validator/).

Before tuning anything, paste one of your real documents into the [RAG Text Chunker](/en/text-chunker/) and drag the chunk-size and overlap sliders to see exactly how each setting splits it.

## Summary

- Chunking balances precise matching against preserved context;
- Start with recursive splitting, 300–800 tokens and 10–20% overlap;
- Mind the difference between characters and tokens, especially for non-English text;
- Attach metadata to every chunk;
- Let evaluation data, not intuition, decide the final parameters.
