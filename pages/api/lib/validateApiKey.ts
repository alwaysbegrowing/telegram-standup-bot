import { VercelRequest } from '@vercel/node';

export const validateApiKey = (req: VercelRequest) => {
  const apiKey = req.query.key;
  return (
    process.env.NODE_ENV === 'production' &&
    apiKey !== process.env.TELEGRAM_API_KEY
  );
};
