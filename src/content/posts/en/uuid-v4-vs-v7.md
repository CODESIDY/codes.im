---
title: 'UUID v4 or v7 for Database Primary Keys? A Clear Answer'
description: The trade-offs of auto-increment IDs, UUID v4 and UUID v7 — why random UUIDs slow down inserts, what v7 fixes, and the storage details that matter.
date: 2026-09-20
category: web
kind: article
tags: [database, uuid, postgresql, mysql]
tools: [uuid-generator, timestamp]
---

Choosing the primary-key type is one of the first decisions in any schema. The three usual candidates are auto-increment integers, UUID v4, and UUID v7, which was standardised in 2024 by RFC 9562.

## Auto-increment IDs first

Auto-increment IDs are simple, compact and ordered — the friendliest option for database indexes. But they have clear downsides:

- **They leak business information**: `/orders/10235` makes your order volume easy to guess and your URLs easy to enumerate;
- **They don’t suit distributed systems**: multiple databases or services generating IDs independently collide, and merging data is painful;
- **You need a database round-trip to get an ID**; clients can’t generate one up front.

UUIDs solve these: 128 bits, practically never duplicated, and generated anywhere without coordination.

## UUID v4: fully random

Apart from a few version bits, v4 is entirely random:

```text
3f6c1e2a-9b4d-4c8e-a1f2-7d5e9c0b2a14
```

The problem shows up in **database indexes**. B-tree indexes like new keys to be appended at the end, but random UUIDs land at random positions:

- old index pages keep getting read back into memory;
- full pages split, leaving fragmentation behind;
- engines that **store rows in primary-key order** (clustered indexes, like MySQL’s InnoDB) are hit especially hard.

You won’t notice on small tables, but at tens of millions of rows the difference in insert throughput and cache hit rate becomes real.

## UUID v7: time-ordered

The first 48 bits of a v7 UUID are a **millisecond Unix timestamp**, followed by random bits:

```text
019a0f3c-7b21-7c4e-9a3d-5f1e2b8c6d40
└─timestamp─┘
```

Because it starts with time, a new ID is always larger than older ones, so inserts land at the end of the index. You get **the global uniqueness of UUIDs with the ordering of auto-increment IDs**. Also:

- sorting by primary key is roughly sorting by creation time;
- you can read the creation time straight from the ID, which helps when debugging.

Generate a batch of v7 IDs in the [UUID Generator](/en/uuid-generator/) and watch the leading digits increase. Convert the first 12 hex digits to decimal and you get a millisecond timestamp you can check in the [Timestamp Converter](/en/timestamp/).

## Downsides of v7

- **It reveals the creation time**: if IDs appear in public URLs and creation time is sensitive, keep this in mind;
- **It depends on clocks**: across machines with skewed clocks, the order is only *roughly* chronological — don’t treat it as a strict timeline;
- The order of IDs generated within the same millisecond depends on the implementation (RFC 9562 describes optional counter methods).

## Storage details

Whichever version you choose, don’t store UUIDs as `VARCHAR(36)`:

- **PostgreSQL**: use the native `uuid` type (16 bytes). PostgreSQL 18 adds a built-in `uuidv7()` function; on older versions, generate IDs in the application;
- **MySQL**: use `BINARY(16)` with `UUID_TO_BIN()` / `BIN_TO_UUID()`. Note that MySQL’s own `UUID()` function generates v1;
- **In the application**: every mainstream language has libraries that support v7, and generating IDs in the app means they are known before the row is written.

## How to choose

| Situation | Recommendation |
| --- | --- |
| Single database, internal system, IDs never exposed | Auto-increment is still simple and reliable |
| IDs exposed externally, distributed generation, large tables | **UUID v7** |
| IDs must not reveal any timing information | UUID v4 (accept some insert-performance cost) |
| Already using v4 everywhere with no performance problems | No need to migrate; consider v7 for new tables |

In one sentence: **when a new project needs UUIDs, default to v7.**
