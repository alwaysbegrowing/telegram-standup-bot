if curl -s --head --request GET http://localhost:4040 | grep "302 Found" >/dev/null; then
    KEY=$(./node_modules/.bin/dotenv -e .env.local -p TELEGRAM_API_KEY)
    URL=$(curl -s localhost:4040/api/tunnels | jq -r ".tunnels[0].public_url")

    curl -s "https://api.telegram.org/bot$KEY/setWebhook?url=$URL/api/standup?key=$KEY" | jq -r "."
else
    echo "run 'yarn ngrok' first"
fi
