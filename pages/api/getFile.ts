import { VercelRequest, VercelResponse } from '@vercel/node';
import { checkSignature } from '@/pages/api/_helpers';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  let file_path = '';
  if (!req.query.file_id) {
    return res.status(400).json({ statusText: 'Bad Request' });
  }

  var download_url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getFile?file_id=${req.query.file_id}`;
  const file = await fetch(download_url);
  const json = await file.json();
  if (json?.ok) {
    file_path = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${json?.result?.file_path}`;
  }

  var tmp = json?.result?.file_path.split('/');
  const response = await fetch(file_path);

  res.setHeader('content-disposition', `attachment; filename=${tmp.pop()}`);

  // @ts-ignore - pipeline weird issue
  await pipeline(response.body, res);
};
