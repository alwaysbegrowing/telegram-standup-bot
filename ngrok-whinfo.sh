KEY=$(./node_modules/.bin/dotenv -e .env.local -p TELEGRAM_API_KEY)

curl -s "https://api.telegram.org/bot$KEY/getWebhookInfo" | jq
