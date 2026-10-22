import { config } from '../config';

// Your open-source projects, shown on /projects/.
// Add an entry for each project; `featured` ones are listed first.

export interface Project {
  name: string;
  /** GitHub (or other) repository URL. */
  repo: string;
  /** Live site or package page, optional. */
  url?: string;
  description: { en: string; zh: string };
  tags: string[];
  status: 'active' | 'beta' | 'archived';
  featured?: boolean;
  /** Slug of a blog post that introduces the project, optional. */
  post?: string;
}

export const projects: Project[] = [
  {
    name: 'codes.im',
    repo: config.repo,
    url: 'https://codes.im',
    description: {
      en: 'Privacy-first developer and LLM tools that run entirely in the browser. Built with Astro, TypeScript and Tailwind CSS.',
      zh: '数据不出浏览器的开发者与大模型工具箱，基于 Astro、TypeScript 和 Tailwind CSS 构建。',
    },
    tags: ['astro', 'typescript', 'llm', 'devtools'],
    status: 'active',
    featured: true,
  },
  // {
  //   name: 'your-next-project',
  //   repo: 'https://github.com/YOUR_GITHUB/your-next-project',
  //   description: { en: 'One sentence about what it does.', zh: '一句话介绍它做什么。' },
  //   tags: ['cli'],
  //   status: 'beta',
  // },
];
