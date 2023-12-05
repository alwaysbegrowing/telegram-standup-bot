import type { NextApiRequest, NextApiResponse } from 'next';
import { processMessage } from './lib/_init';
import { validateApiKey } from './lib/_validateApiKey';

type ResponseData = {
  status: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (validateApiKey(req)) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  return await processMessage(req, res);
}
