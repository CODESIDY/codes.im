// Generate MCP (Model Context Protocol) server configuration for popular clients.

export interface McpServer {
  name: string;
  transport: 'stdio' | 'http';
  command?: string;
  args?: string[];
  env?: [string, string][];
  url?: string;
  headers?: [string, string][];
}

export type McpClient = 'claude-desktop' | 'claude-code' | 'cursor' | 'vscode' | 'windsurf';

export const clientInfo: Record<McpClient, { label: string; file: string }> = {
  'claude-desktop': {
    label: 'Claude Desktop',
    file: 'macOS: ~/Library/Application Support/Claude/claude_desktop_config.json\nWindows: %APPDATA%\\Claude\\claude_desktop_config.json',
  },
  'claude-code': { label: 'Claude Code', file: 'Run in your terminal (add --scope project to share via .mcp.json)' },
  cursor: { label: 'Cursor', file: 'Project: .cursor/mcp.json   ·   Global: ~/.cursor/mcp.json' },
  vscode: { label: 'VS Code', file: 'Workspace: .vscode/mcp.json' },
  windsurf: { label: 'Windsurf', file: '~/.codeium/windsurf/mcp_config.json' },
};

const obj = (pairs: [string, string][] = []) => Object.fromEntries(pairs.filter(([k]) => k.trim()));

/** Split a command line typed into one box into command + args. */
export function splitCommand(line: string): { command: string; args: string[] } {
  const parts = line.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  const clean = parts.map((p) => p.replace(/^(["'])(.*)\1$/, '$2'));
  return { command: clean[0] ?? '', args: clean.slice(1) };
}

function shellQuote(s: string) {
  return /^[\w@%+=:,./-]+$/.test(s) ? s : `'${s.replace(/'/g, `'\\''`)}'`;
}

function stdioEntry(s: McpServer) {
  const e: Record<string, unknown> = { command: s.command ?? '', args: s.args ?? [] };
  const env = obj(s.env);
  if (Object.keys(env).length) e.env = env;
  return e;
}

export function generateConfig(s: McpServer, client: McpClient): string {
  const name = s.name.trim() || 'my-server';
  const headers = obj(s.headers);
  const hasHeaders = Object.keys(headers).length > 0;

  if (client === 'claude-code') {
    if (s.transport === 'http') {
      const h = Object.entries(headers).map(([k, v]) => ` --header ${shellQuote(`${k}: ${v}`)}`).join('');
      return `claude mcp add --transport http ${shellQuote(name)} ${shellQuote(s.url ?? '')}${h}\n`;
    }
    const env = Object.entries(obj(s.env)).map(([k, v]) => ` -e ${shellQuote(`${k}=${v}`)}`).join('');
    const cmd = [s.command ?? '', ...(s.args ?? [])].map(shellQuote).join(' ');
    return `claude mcp add ${shellQuote(name)}${env} -- ${cmd}\n`;
  }

  let entry: Record<string, unknown>;
  if (s.transport === 'stdio') {
    entry = stdioEntry(s);
    if (client === 'vscode') entry = { type: 'stdio', ...entry };
  } else if (client === 'claude-desktop') {
    // Claude Desktop config files only launch local processes; bridge remote servers with mcp-remote.
    const args = ['-y', 'mcp-remote', s.url ?? ''];
    for (const [k, v] of Object.entries(headers)) args.push('--header', `${k}: ${v}`);
    entry = { command: 'npx', args };
  } else if (client === 'vscode') {
    entry = { type: 'http', url: s.url ?? '' };
    if (hasHeaders) entry.headers = headers;
  } else if (client === 'windsurf') {
    entry = { serverUrl: s.url ?? '' };
    if (hasHeaders) entry.headers = headers;
  } else {
    entry = { url: s.url ?? '' };
    if (hasHeaders) entry.headers = headers;
  }

  const root = client === 'vscode' ? { servers: { [name]: entry } } : { mcpServers: { [name]: entry } };
  return JSON.stringify(root, null, 2) + '\n';
}

export const presets: (McpServer & { label: string })[] = [
  {
    label: 'Filesystem',
    name: 'filesystem',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir'],
  },
  { label: 'Playwright', name: 'playwright', transport: 'stdio', command: 'npx', args: ['@playwright/mcp@latest'] },
  { label: 'Fetch', name: 'fetch', transport: 'stdio', command: 'uvx', args: ['mcp-server-fetch'] },
  {
    label: 'GitHub (remote)',
    name: 'github',
    transport: 'http',
    url: 'https://api.githubcopilot.com/mcp/',
    headers: [['Authorization', 'Bearer YOUR_GITHUB_PAT']],
  },
];
