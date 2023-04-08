import { processMessage } from './lib/_init';

module.exports = async (req, res) => {
  if (req.query.key !== process.env.TELEGRAM_API_KEY) {
    return res.status(401).json({ status: 'invalid api key' });
  }
  await processMessage(req, res);
};
