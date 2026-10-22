---
title: 'Cron Expression Cheat Sheet: Common Patterns, Time-Zone Traps and Platform Differences'
description: What the five fields mean, a quick-reference table of common schedules, the special day-of-month / day-of-week rule, and how Linux, Kubernetes, GitHub Actions and Spring differ.
date: 2026-09-12
category: tools
kind: tutorial
tags: [cron, devops, linux]
tools: [cron-parser, timestamp]
---

Nearly every back-end developer has written a cron expression, yet few get every detail right the first time. Here is a cheat sheet worth bookmarking, followed by the most common traps.

## The five fields

A standard cron expression has five space-separated fields:

```text
┌───────── minute (0–59)
│ ┌─────── hour (0–23)
│ │ ┌───── day of month (1–31)
│ │ │ ┌─── month (1–12 or JAN–DEC)
│ │ │ │ ┌─ day of week (0–7, both 0 and 7 are Sunday, or SUN–SAT)
│ │ │ │ │
* * * * *
```

Each field accepts:

| Symbol | Meaning | Example |
| --- | --- | --- |
| `*` | any value | `*` in the hour field means every hour |
| `,` | list | `1,15` means the 1st and the 15th |
| `-` | range | `9-17` means 9:00 to 17:00 |
| `/` | step | `*/15` means every 15 units |

## Common schedules

| Expression | Meaning |
| --- | --- |
| `* * * * *` | every minute |
| `*/5 * * * *` | every 5 minutes |
| `0 * * * *` | every hour, on the hour |
| `0 */2 * * *` | every 2 hours |
| `0 0 * * *` | every day at midnight |
| `30 8 * * *` | every day at 8:30 |
| `0 9 * * 1-5` | weekdays at 9:00 |
| `0 9,18 * * 1-5` | weekdays at 9:00 and 18:00 |
| `*/10 9-18 * * 1-5` | every 10 minutes between 9:00 and 18:59 on weekdays |
| `0 0 * * 0` | every Sunday at midnight |
| `0 3 * * 6` | every Saturday at 3:00 |
| `0 0 1 * *` | the 1st of every month at midnight |
| `0 0 1,15 * *` | the 1st and 15th of every month |
| `0 0 1 */3 *` | the first day of every quarter |
| `0 0 1 1 *` | every 1 January |
| `@daily` | same as `0 0 * * *` |
| `@weekly` | same as `0 0 * * 0` |
| `@monthly` | same as `0 0 1 * *` |

Not sure you got it right? Paste it into the [Cron Expression Parser](/en/cron-parser/) for a plain-English description and the next 10 run times.

## Trap 1: day of month and day of week are OR’ed

```text
0 0 1 * 1
```

Many people read this as “the 1st of the month, if it’s a Monday”. In standard cron, though, **when neither day field is `*`, the job runs if either one matches**: it runs on the 1st of every month *and* on every Monday.

## Trap 2: time zones

cron runs in the **time zone of the machine (or platform) executing it**:

- Cloud servers and containers often default to **UTC**. If you write `0 9 * * *` meaning 9:00 in New York, on a UTC machine it fires at 4:00 or 5:00 a.m. New York time, depending on daylight saving;
- GitHub Actions `schedule` uses **UTC** by default;
- Kubernetes CronJobs support a `timeZone` field, such as `America/New_York`.

To convert between UTC and local time, use the [Timestamp Converter](/en/timestamp/).

## Trap 3: platform dialects

| Platform | Fields | Notes |
| --- | --- | --- |
| Linux crontab | 5 | Standard syntax |
| Kubernetes CronJob | 5 | Standard syntax; set the zone with `timeZone` |
| GitHub Actions | 5 | UTC by default; may be delayed at busy times; minimum interval 5 minutes |
| Spring `@Scheduled` | 6 | The first field is **seconds** |
| Quartz | 6–7 | Seconds plus optional year; one of the day fields must be `?`; supports `L`, `W`, `#` |

`L` (last day), `W` (nearest weekday) and `#` (nth weekday of the month) only exist in Quartz and some other implementations — standard crontab **does not support them**. “Last day of the month”, for example, can’t be expressed directly in standard cron; the usual workaround is to run daily and have the script check whether tomorrow is the 1st.

## Trap 4: overlapping runs and silent failures

- If a job can take longer than its interval, the next run starts before the previous one finishes. Add a lock (for example with `flock`) or configure the platform’s concurrency policy;
- cron doesn’t notify you of failures by default. Redirect output to a log and set up alerts for important jobs.

## Summary

- Five fields: minute, hour, day of month, month, day of week;
- When both day fields are set, they are OR’ed;
- Check the time zone of the environment first;
- When copying expressions between platforms, watch for seconds fields and extended syntax.
