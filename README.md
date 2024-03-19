# 🤖 Stood Bot

A Telegram bot that helps you stay on track with daily updates! All members of a chat can participate and stay in the loop.

## 💡 How to use

1. Add [@stood_bot](https://t.me/stood_bot) to the chats you want to receive updates in.
2. Type `/subscribe` in each of those chats to start receiving updates.

## 🗓️ Schedule

- Reminders to submit updates sent at 10AM EST.
- Updates posted at 11AM EST.

## 🔧 Support

If you're having trouble with the bot, feel free to [create a GitHub issue](https://github.com/alwaysbegrowing/telegram-standup-bot/issues/new/choose).

## 🛠️ Self-Hosting Setup

1. Install Vercel CLI: `yarn global add vercel`
2. Set up the project with Vercel: `vercel deploy` (accept all default settings)
3. Create a Telegram bot with BotFather: https://core.telegram.org/bots#6-botfather
4. Add your Telegram bot API key as an environment variable: `vercel env add TELEGRAM_API_KEY`
5. Create a database instance with MongoDB Atlas (name your database "standup"): https://www.mongodb.com/cloud/atlas
6. Add your MongoDB URI as an environment variable: `vercel env add MONGODB_FULL_URI`
7. Pull down the environment variables as a local `.env` file for local development: `vercel env pull`
8. Set up a webhook to your Vercel standup URL: https://api.telegram.org/bot${TELEGRAM_API_KEY}/setWebhook?url=https://.../api/standup?key=${TELEGRAM_API_KEY}

## 💻 Local Development

```bash
yarn
vercel dev
```

This runs the website at localhost:3000 and runs your Lambda functions in the /api folder on localhost:3000/api. For more information, check out Vercel's Serverless Functions Introduction.

## 🔎 Troubleshooting

If your messages or commands aren't going through, check for any pending updates and read the error. You may have to fix the error, or it will happen again.

```bash
https://api.telegram.org/bot${TELEGRAM_API_KEY}/getWebhookInfo
https://api.telegram.org/bot${TELEGRAM_API_KEY}/deleteWebhook?drop_pending_updates=true
```

To view your function logs in Vercel, log in to Vercel, navigate to your bot, click on your functions, and then view the function logs.

<center>
<a href="https://vercel.com?utm_source=alwaysbegrowing&utm_campaign=oss"><img src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg"/></a>
</center>
