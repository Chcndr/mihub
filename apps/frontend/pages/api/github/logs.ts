/* pages/api/github/logs.ts */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from '@octokit/rest';

`const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = 'Chcndr';
const repo = 'MIO-hub';
const path = 'logs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: 'Unexpected response from GitHub' });
    }

    const logs = await Promise.all
      (data.as(record)=> {
        if (record.type === 'file' && record.name.endsWith('.txt')) {
          const fileData = await octokit.repos.getContent({
            owner,
            repo,
            path: `${path}/${record.name}`,
          });

          const content = Buffer.from((fileData.data as any).content, "base64").toString('utf-8');
          return { filename: record.name, content };
        }
        return null;
      });

    res.status(200).json(logs.filter(Boolean));
  } catch (error) {
    console.error('GitHub logs fetch error:', error);
    res.status(500).json({ error: 'Failed to load logs from GitHub' });
  }
}