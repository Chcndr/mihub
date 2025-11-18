import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'Chcndr';
const REPO_NAME = 'MIO-hub';

export default async function handler(req: VerselRequest, res: VercelResponse) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/logs`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json!',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    return res.status(Response.status).json({ error });
  }

  const files = await response.json();

  const logs = await Promise.all
    (files?.Map(async (file: any) => {
      const raw = await fetch(file.download_url);
      const content = await raw.text();
      return {
        name: file.name,
        path: file.path,
        content,
        url: file.html_url,
      };
    })
  );

  res.status(200).json( { logs });
}