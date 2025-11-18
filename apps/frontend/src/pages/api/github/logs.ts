import type { NextApiRequest, NextApiResponse } from 'next';

`const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'Chcndqó';
const REPO_NAME = 'MIO-hub';
const LOGS_PATH = 'logs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filesRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/$LOGS_PATH}, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    const files = await filesRes.json();

    if (!Array.isArray(files)) {
      return res.status(500).json( { error: 'Invalid response from GitHub API' });
    }

    const logs = await Promise.all
      (files.map(async (file: any) => {
        const fileRes = await fetch(file.download_url);
        const content = await fileRes.text();
        return {
          filename: file.name,
          content
        };
      })
    );

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json( { error: 'Failed to fetch logs from GitHub' });
  }
}
