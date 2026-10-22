---
title: MCP 入门：10 分钟给 Claude、Cursor 接上第一个 MCP 服务器
description: MCP 是什么、和 Function Calling 有什么区别、本地和远程服务器怎么配置，以及最常见的 5 个报错怎么排查。
date: 2026-10-18
category: ai
kind: tutorial
cover: ../images/mcp-quickstart.png
coverAlt: MCP 客户端通过协议连接多个工具服务器的示意图
tags: [mcp, claude, cursor, agent]
tools: [mcp-config-generator, json-formatter]
---

如果你用过 Claude Desktop、Cursor 或 VS Code 里的 AI 助手，大概率已经见过“MCP 服务器”这个词。这篇文章用最短的路径讲清楚：它是什么、怎么接上第一个服务器、出问题时怎么查。

## MCP 是什么

MCP（Model Context Protocol，模型上下文协议）是一个开放协议，用来规定 **AI 应用如何连接外部的工具和数据**。

可以把它理解成 AI 世界的 USB 接口：

- **客户端**：Claude Desktop、Claude Code、Cursor、VS Code 等 AI 应用；
- **服务器**：一个个独立的小程序，比如“读写本地文件”“操作浏览器”“查询数据库”“访问 GitHub”；
- **协议**：两者之间约定好的通信格式，客户端可以列出服务器提供了哪些**工具（tools）**、**资源（resources）** 和 **提示模板（prompts）**，并在需要时调用。

## 它和 Function Calling 有什么区别

Function Calling（工具调用）是**模型 API 层面**的能力：你在请求里描述一组函数，模型决定调用哪个、传什么参数，然后由**你的代码**去执行。

MCP 是在它之上的**应用层标准**：工具不再写死在某个应用的代码里，而是做成独立的服务器。同一个 MCP 服务器，可以同时被 Claude Desktop、Cursor 和你自己写的 agent 使用，不需要为每个应用各写一遍集成。

## 两种服务器：本地和远程

| 类型 | 运行方式 | 适合场景 |
| --- | --- | --- |
| 本地（stdio） | 客户端在你电脑上启动一个进程，通过标准输入输出通信 | 访问本地文件、本地数据库、命令行工具 |
| 远程（HTTP） | 服务器部署在云端，客户端通过 URL 连接 | SaaS 服务（GitHub、Notion 等）、团队共享的工具 |

本地服务器通常用 `npx`（Node.js）或 `uvx`（Python）启动，所以电脑上需要先装好对应的运行环境。

## 实战：接上文件系统服务器

下面以官方的文件系统服务器为例，它可以让 AI 读写你指定目录里的文件。

**Claude Desktop**：打开设置里的开发者选项，编辑配置文件 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/Documents/notes"]
    }
  }
}
```

保存后**完全退出并重新打开** Claude Desktop，在对话框的工具列表里就能看到它了。

**Claude Code**：一条命令即可：

```bash
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem ~/Documents/notes
```

**Cursor**：在项目根目录创建 `.cursor/mcp.json`，内容格式和 Claude Desktop 的 `mcpServers` 相同。

不同客户端的配置文件位置和字段名略有差异（比如 VS Code 用的是 `servers` 而不是 `mcpServers`），记不住的话可以用 [MCP 配置生成器](/zh/mcp-config-generator/) 填一次，切换客户端直接复制。

## 最常见的 5 个问题

1. **改了配置没生效**：大多数客户端只在启动时读取配置，需要完全退出（不只是关窗口）后重开。
2. **`npx: command not found`**：图形界面应用可能读不到你在终端里配置的 PATH。把 `command` 改成 `npx` 的绝对路径（终端里运行 `which npx` 查看）。
3. **JSON 格式错误**：一个多余的逗号就会导致整个配置文件加载失败。粘贴到 [JSON 格式化](/zh/json-formatter/) 里检查一下。
4. **路径不对**：文件系统服务器只能访问参数里列出的目录，路径要写绝对路径。
5. **需要密钥的服务器**：API Key 放在 `env` 字段里，不要直接写进 `args`，也不要把配置文件提交到公开仓库。

## 安全提醒

MCP 服务器能在你的电脑上执行操作，相当于给 AI 开了一扇门：

- 只安装**来源可信**的服务器，优先使用官方或知名维护者发布的版本；
- 文件系统类服务器只开放**必要的目录**，不要直接给整个用户目录；
- 留意 AI 发起的工具调用请求，敏感操作前看清楚参数再批准。

## 小结

MCP 把“给 AI 接工具”这件事标准化了：服务器写一次，到处可用。先从文件系统、浏览器自动化这类本地服务器开始体验，熟悉之后再接入远程服务，或者自己写一个。
