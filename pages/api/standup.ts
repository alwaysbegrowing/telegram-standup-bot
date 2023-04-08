import { processMessage } from './lib/_init';
import { validateApiKey } from './lib/_validateApiKey';

module.exports = async (req, res) => {
  if (validateApiKey(req)) {
    return res.status(401).json({ status: 'invalid api key' });
  }
  await processMessage(req, res);
};
