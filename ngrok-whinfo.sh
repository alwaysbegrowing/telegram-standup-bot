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
if ! [ -f .env ]; then
  echo "Error: .env file not found. Please create one and try again."
  exit 1
fi

KEY=$(./node_modules/.bin/dotenv -e .env -p TELEGRAM_API_KEY)

# Check if KEY is not empty
if [ -z "$KEY" ]; then
  echo "Error: TELEGRAM_API_KEY is not set in .env. Please set it and try again."
  exit 1
fi

WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$KEY/getWebhookInfo" | jq)

# Check if WEBHOOK_INFO is not empty
if [ -z "$WEBHOOK_INFO" ]; then
  echo "Error: Unable to get webhook info from the Telegram API. Please check your internet connection and try again."
  exit 1
else
  echo "$WEBHOOK_INFO"
fi

echo "https://api.telegram.org/bot$KEY/deleteWebhook?drop_pending_updates=true"
