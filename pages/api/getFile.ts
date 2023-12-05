import fetch from 'node-fetch';
import stream from 'stream';
import { promisify } from 'util';
import { NextApiRequest, NextApiResponse } from 'next';

const pipeline = promisify(stream.pipeline);

interface TelegramResponse {
  ok?: boolean;
  result?: {
    file_path: string;
  };
}

async function downloadFile(req, res) {
  if (!req.query.file_id) {
    return res.status(400).json({ statusText: 'Bad Request' });
  }

  const downloadUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getFile?file_id=${req.query.file_id}`;
  const fileResponse = await fetch(downloadUrl);
  const jsonResponse: TelegramResponse = await fileResponse.json();

  if (!jsonResponse.ok) {
    return res.status(400).json({ statusText: 'File not found' });
  }

  const filePath = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${jsonResponse.result?.file_path}`;
  const fileSegments = jsonResponse.result?.file_path.split('/');
  const fileDownloadResponse = await fetch(filePath);

  res.setHeader(
    'content-disposition',
    `attachment; filename=${fileSegments.pop()}`,
  );

  return await pipeline(fileDownloadResponse.body, res);
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await downloadFile(req, res);
}
