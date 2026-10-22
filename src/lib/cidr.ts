// IPv4 subnet (CIDR) calculations.

export function parseIPv4(s: string): number {
  const parts = s.trim().split('.');
  if (parts.length !== 4) throw new Error(`"${s.trim()}" is not an IPv4 address`);
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p) || Number(p) > 255) throw new Error(`"${s.trim()}" is not an IPv4 address`);
    n = n * 256 + Number(p);
  }
  return n >>> 0;
}

export const formatIPv4 = (n: number) => [24, 16, 8, 0].map((b) => (n >>> b) & 255).join('.');

export const prefixToMask = (p: number) => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0);

export function maskToPrefix(mask: number): number {
  const inv = ~mask >>> 0;
  if ((inv & (inv + 1)) !== 0) throw new Error('Subnet mask must be contiguous ones followed by zeros');
  return 32 - Math.log2(inv + 1);
}

export interface Cidr {
  ip: number;
  prefix: number;
}

/** Parse "10.0.0.5/24", "10.0.0.5 255.255.255.0", "10.0.0.5/255.255.255.0" or a bare IP (/32). */
export function parseCidr(s: string): Cidr {
  const t = s.trim();
  const m = /^([\d.]+)\s*(?:[/\s]\s*([\d.]+))?$/.exec(t);
  if (!m) throw new Error(`"${t}" is not a CIDR block`);
  const ip = parseIPv4(m[1]);
  if (m[2] === undefined) return { ip, prefix: 32 };
  if (m[2].includes('.')) return { ip, prefix: maskToPrefix(parseIPv4(m[2])) };
  const prefix = Number(m[2]);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error('Prefix length must be 0–32');
  return { ip, prefix };
}

export type AddressKind = 'private' | 'public' | 'loopback' | 'link-local' | 'cgnat' | 'multicast' | 'reserved' | 'documentation' | 'unspecified';

const RANGES: [string, AddressKind][] = [
  ['0.0.0.0/8', 'unspecified'],
  ['10.0.0.0/8', 'private'],
  ['100.64.0.0/10', 'cgnat'],
  ['127.0.0.0/8', 'loopback'],
  ['169.254.0.0/16', 'link-local'],
  ['172.16.0.0/12', 'private'],
  ['192.0.2.0/24', 'documentation'],
  ['192.168.0.0/16', 'private'],
  ['198.18.0.0/15', 'reserved'],
  ['198.51.100.0/24', 'documentation'],
  ['203.0.113.0/24', 'documentation'],
  ['224.0.0.0/4', 'multicast'],
  ['240.0.0.0/4', 'reserved'],
];

export function contains(block: Cidr, ip: number): boolean {
  const mask = prefixToMask(block.prefix);
  return ((ip & mask) >>> 0) === ((block.ip & mask) >>> 0);
}

export function addressKind(ip: number): AddressKind {
  for (const [r, kind] of RANGES) if (contains(parseCidr(r), ip)) return kind;
  return 'public';
}

export interface SubnetInfo {
  cidr: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  /** Total addresses in the block. */
  total: number;
  /** Usable host addresses (RFC 3021: /31 has 2, /32 has 1). */
  usable: number;
  mask: string;
  wildcard: string;
  prefix: number;
  binaryMask: string;
  binaryIp: string;
  kind: AddressKind;
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E';
}

const bin = (n: number) => [24, 16, 8, 0].map((b) => ((n >>> b) & 255).toString(2).padStart(8, '0')).join('.');

export function subnetInfo(c: Cidr): SubnetInfo {
  const mask = prefixToMask(c.prefix);
  const network = (c.ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - c.prefix);
  const usable = c.prefix >= 31 ? total : total - 2;
  const first = c.prefix >= 31 ? network : network + 1;
  const last = c.prefix >= 31 ? broadcast : broadcast - 1;
  const o1 = c.ip >>> 24;
  return {
    cidr: `${formatIPv4(network)}/${c.prefix}`,
    network: formatIPv4(network),
    broadcast: formatIPv4(broadcast),
    firstHost: formatIPv4(first),
    lastHost: formatIPv4(last),
    total,
    usable,
    mask: formatIPv4(mask),
    wildcard: formatIPv4(~mask >>> 0),
    prefix: c.prefix,
    binaryMask: bin(mask),
    binaryIp: bin(c.ip),
    kind: addressKind(c.ip),
    ipClass: o1 < 128 ? 'A' : o1 < 192 ? 'B' : o1 < 224 ? 'C' : o1 < 240 ? 'D' : 'E',
  };
}

/** Split a block into equal subnets of `newPrefix` (at most `limit` returned). */
export function splitSubnets(c: Cidr, newPrefix: number, limit = 256): { subnets: string[]; count: number } {
  if (newPrefix < c.prefix || newPrefix > 32) throw new Error(`New prefix must be between /${c.prefix} and /32`);
  const network = (c.ip & prefixToMask(c.prefix)) >>> 0;
  const count = 2 ** (newPrefix - c.prefix);
  const size = 2 ** (32 - newPrefix);
  const subnets: string[] = [];
  for (let i = 0; i < Math.min(count, limit); i++) subnets.push(`${formatIPv4(network + i * size)}/${newPrefix}`);
  return { subnets, count };
}

/** Smallest list of CIDR blocks that exactly covers start..end (inclusive). */
export function rangeToCidrs(start: number, end: number): string[] {
  if (end < start) throw new Error('End address must not be before the start address');
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    // Largest block that starts at `cur` (aligned) and does not pass `end`.
    let bits = 0;
    while (bits < 32 && cur % 2 ** (bits + 1) === 0 && cur + 2 ** (bits + 1) - 1 <= end) bits++;
    out.push(`${formatIPv4(cur)}/${32 - bits}`);
    cur += 2 ** bits;
  }
  return out;
}
