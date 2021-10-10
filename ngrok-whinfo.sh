KEY=$(./node_modules/.bin/dotenv -e .env.local -p TELEGRAM_API_KEY)

curl -s "https://api.telegram.org/bot$KEY/getWebhookInfo" | jq

echo "https://api.telegram.org/bot$KEY/deleteWebhook?drop_pending_updates=true"
