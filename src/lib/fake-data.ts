// Deterministic fake data and placeholder text for tests, demos and mockups.
// All values are fictional; US phone numbers use the reserved 555-01xx range.

export type FieldType =
  | 'id'
  | 'uuid'
  | 'name'
  | 'email'
  | 'phone'
  | 'company'
  | 'address'
  | 'city'
  | 'date'
  | 'datetime'
  | 'int'
  | 'price'
  | 'bool'
  | 'ip'
  | 'url'
  | 'sentence';

export const fieldTypes: FieldType[] = ['id', 'uuid', 'name', 'email', 'phone', 'company', 'address', 'city', 'date', 'datetime', 'int', 'price', 'bool', 'ip', 'url', 'sentence'];

export type Locale = 'en' | 'zh';

/** Small, fast seeded PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)];
  return { next, int, pick };
}
type R = ReturnType<typeof rng>;

const EN_FIRST = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah', 'Thomas', 'Karen', 'Daniel', 'Emma', 'Olivia', 'Noah', 'Liam', 'Ava', 'Mia', 'Ethan', 'Lucas', 'Chloe'];
const EN_LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Walker', 'Hall', 'Young', 'King'];
const ZH_SUR = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高', '梁', '郑', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹'];
const ZH_GIVEN = '伟芳娜敏静丽强磊军洋勇艳杰娟涛明超秀霞平刚桂英华慧建国文博宇轩浩然思雨欣怡子涵梓萱一诺晨阳佳琪俊熙'.split('');
const ZH_PINYIN: Record<string, string> = { 王: 'wang', 李: 'li', 张: 'zhang', 刘: 'liu', 陈: 'chen', 杨: 'yang', 黄: 'huang', 赵: 'zhao', 吴: 'wu', 周: 'zhou', 徐: 'xu', 孙: 'sun', 马: 'ma', 朱: 'zhu', 胡: 'hu', 郭: 'guo', 何: 'he', 林: 'lin', 罗: 'luo', 高: 'gao', 梁: 'liang', 郑: 'zheng', 谢: 'xie', 宋: 'song', 唐: 'tang', 许: 'xu', 韩: 'han', 冯: 'feng', 邓: 'deng', 曹: 'cao' };
const EN_CITY: [string, string][] = [
  ['Springfield', 'IL'],
  ['Riverside', 'CA'],
  ['Franklin', 'TN'],
  ['Greenville', 'SC'],
  ['Madison', 'WI'],
  ['Clinton', 'NY'],
  ['Georgetown', 'TX'],
  ['Salem', 'OR'],
  ['Fairview', 'NJ'],
  ['Ashland', 'OH'],
];
const EN_STREET = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine St', 'Elm St', 'Washington Ave', 'Lake Rd', 'Hill St', 'Park Blvd'];
const ZH_CITY: [string, string][] = [
  ['北京市', '朝阳区'],
  ['上海市', '浦东新区'],
  ['广东省深圳市', '南山区'],
  ['浙江省杭州市', '西湖区'],
  ['四川省成都市', '武侯区'],
  ['湖北省武汉市', '洪山区'],
  ['江苏省南京市', '鼓楼区'],
  ['湖南省长沙市', '岳麓区'],
  ['陕西省西安市', '雁塔区'],
  ['广东省广州市', '天河区'],
];
const ZH_ROAD = ['人民路', '解放路', '中山路', '建设路', '和平路', '新华路', '文化路', '科技路', '学府路', '长江路'];
const EN_CO = ['Northwind', 'Contoso', 'Fabrikam', 'Bluepeak', 'Silverleaf', 'Redwood', 'Clearpath', 'Lumen', 'Ironbridge', 'Brightline'];
const EN_CO_SUFFIX = ['Inc.', 'LLC', 'Labs', 'Group', 'Technologies', 'Systems'];
const ZH_CO_PRE = ['星河', '云帆', '启明', '蓝海', '远航', '博远', '睿智', '恒信', '鼎新', '青禾'];
const ZH_CO_IND = ['科技', '信息技术', '网络科技', '数据服务', '软件', '文化传媒'];

const LOREM =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' ',
  );
const ZH_PHRASES =
  '我们 今天 这个 项目 需要 在 系统 中 完成 一次 重要 的 更新 用户 可以 通过 页面 快速 查看 数据 并且 获得 更好 的 体验 团队 正在 持续 优化 性能 与 稳定性 同时 也 关注 设计 细节 和 内容 质量 每个 功能 都 经过 仔细 测试 以 确保 结果 准确 可靠'.split(
    ' ',
  );

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

export function sentence(r: R, locale: Locale, words = r.int(8, 16)): string {
  if (locale === 'zh') {
    let s = '';
    for (let i = 0; i < words; i++) s += r.pick(ZH_PHRASES);
    return s + '。';
  }
  const w = Array.from({ length: words }, () => r.pick(LOREM));
  const s = w.join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

export function paragraphs(seed: number, count: number, locale: Locale, classicStart = true): string[] {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const n = r.int(3, 6);
    let p = Array.from({ length: n }, () => sentence(r, locale)).join(locale === 'zh' ? '' : ' ');
    if (i === 0 && classicStart && locale === 'en') p = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + p;
    return p;
  });
}

function uuid(r: R): string {
  const h = Array.from({ length: 32 }, () => r.int(0, 15).toString(16));
  h[12] = '4';
  h[16] = ((r.int(0, 15) & 0x3) | 0x8).toString(16);
  const s = h.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

function value(type: FieldType, r: R, locale: Locale, row: number, ctx: { first: string; last: string; zh: string }): string | number | boolean {
  switch (type) {
    case 'id':
      return row + 1;
    case 'uuid':
      return uuid(r);
    case 'name':
      return locale === 'zh' ? ctx.zh : `${ctx.first} ${ctx.last}`;
    case 'email': {
      const user = locale === 'zh' ? `${ZH_PINYIN[ctx.zh[0]] ?? 'user'}${r.int(10, 999)}` : `${ctx.first}.${ctx.last}`.toLowerCase();
      return `${user}@example.${r.pick(['com', 'org', 'net'])}`;
    }
    case 'phone':
      return locale === 'zh' ? `1${r.pick(['3', '5', '7', '8', '9'])}${r.int(0, 9)}${pad(r.int(0, 9999), 4)}${pad(r.int(0, 9999), 4)}` : `(${r.int(201, 989)}) 555-01${pad(r.int(0, 99))}`;
    case 'company':
      return locale === 'zh' ? `${r.pick(ZH_CO_PRE)}${r.pick(ZH_CO_IND)}有限公司` : `${r.pick(EN_CO)} ${r.pick(EN_CO_SUFFIX)}`;
    case 'address': {
      if (locale === 'zh') {
        const [c, d] = r.pick(ZH_CITY);
        return `${c}${d}${r.pick(ZH_ROAD)}${r.int(1, 999)}号`;
      }
      const [c, st] = r.pick(EN_CITY);
      return `${r.int(10, 9999)} ${r.pick(EN_STREET)}, ${c}, ${st} ${pad(r.int(10000, 99999), 5)}`;
    }
    case 'city':
      return locale === 'zh' ? r.pick(ZH_CITY)[0] : r.pick(EN_CITY)[0];
    case 'date':
      return `${r.int(2018, 2026)}-${pad(r.int(1, 12))}-${pad(r.int(1, 28))}`;
    case 'datetime':
      return `${r.int(2018, 2026)}-${pad(r.int(1, 12))}-${pad(r.int(1, 28))}T${pad(r.int(0, 23))}:${pad(r.int(0, 59))}:${pad(r.int(0, 59))}Z`;
    case 'int':
      return r.int(0, 1000);
    case 'price':
      return Math.round(r.next() * 100000) / 100;
    case 'bool':
      return r.next() < 0.5;
    case 'ip':
      return `${r.pick([10, 172, 192])}.${r.int(0, 255)}.${r.int(0, 255)}.${r.int(1, 254)}`;
    case 'url':
      return `https://example.${r.pick(['com', 'org', 'net'])}/${r.pick(['posts', 'items', 'users', 'docs'])}/${r.int(1, 9999)}`;
    case 'sentence':
      return sentence(r, locale, r.int(5, 10));
  }
}

export type Row = Record<string, string | number | boolean>;

export function generateRows(seed: number, count: number, fields: { key: string; type: FieldType }[], locale: Locale): Row[] {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const ctx = { first: r.pick(EN_FIRST), last: r.pick(EN_LAST), zh: r.pick(ZH_SUR) + r.pick(ZH_GIVEN) + (r.next() < 0.6 ? r.pick(ZH_GIVEN) : '') };
    const row: Row = {};
    for (const f of fields) row[f.key] = value(f.type, r, locale, i, ctx);
    return row;
  });
}

const csvCell = (v: unknown) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const sqlValue = (v: unknown) => (typeof v === 'number' ? String(v) : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : `'${String(v).replace(/'/g, "''")}'`);

export type OutputFormat = 'json' | 'jsonl' | 'csv' | 'sql';

export function formatRows(rows: Row[], format: OutputFormat, table = 'users'): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  switch (format) {
    case 'json':
      return JSON.stringify(rows, null, 2);
    case 'jsonl':
      return rows.map((r) => JSON.stringify(r)).join('\n');
    case 'csv':
      return [keys.join(','), ...rows.map((r) => keys.map((k) => csvCell(r[k])).join(','))].join('\n');
    case 'sql':
      return `INSERT INTO ${table} (${keys.join(', ')}) VALUES\n` + rows.map((r) => `  (${keys.map((k) => sqlValue(r[k])).join(', ')})`).join(',\n') + ';';
  }
}
