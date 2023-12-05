#!/bin/bash

# Check if curl is installed
if ! command -v curl &>/dev/null; then
    echo "Error: curl is not installed. Please install it and try again."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &>/dev/null; then
    echo "Error: jq is not installed. Please install it and try again."
    exit 1
fi

# Check if dotenv is installed
if ! [ -x "./node_modules/.bin/dotenv" ]; then
    echo "Error: dotenv is not installed. Please install it and try again."
    exit 1
fi

# Ensure .env file exists
if ! [ -f .env ] && ! [ -f .env.local ]; then
    echo "Error: .env file not found. Please create one and try again."
    exit 1
fi

if curl -s --head --request GET http://localhost:4040 | grep "302 Found" >/dev/null; then
    KEY=$(./node_modules/.bin/dotenv -e .env -e .env.local -p TELEGRAM_API_KEY)
    URL=$(curl -s localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto == "https") | .public_url')

    # Check if KEY is not empty
    if [ -z "$KEY" ]; then
        echo "Error: TELEGRAM_API_KEY is not set in .env. Please set it and try again."
        exit 1
    fi

    # Check if URL is not empty
    if [ -z "$URL" ]; then
        echo "Error: Unable to get public URL from ngrok. Please ensure ngrok is running and try again."
        exit 1
    fi

    RESPONSE=$(curl -s "https://api.telegram.org/bot$KEY/setWebhook?url=$URL/api/standup?key=$KEY" | jq -r ".")

    # Check if RESPONSE is not empty
    if [ -z "$RESPONSE" ]; then
        echo "Error: Unable to get a response from the Telegram API. Please check your internet connection and try again."
        exit 1
    else
        echo "$RESPONSE"
    fi
else
    echo "run 'yarn ngrok' first"
fi
