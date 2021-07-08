# About
Super simple standup bot brings standup functionality to Telegram. Group members are able to submit updates, and they are all sent to a shared channel at a set time.

There are many good standup bots for Slack - [GeekBot](https://geekbot.com/), [Standuply](https://standuply.com/), [Polly](https://www.polly.ai/template/daily-standup) but there are not any good alternatives for Telegram.



# How to use
1. Send a message to [@SuperSimpleStandupBot](https://t.me/supersimplestandupbot) on telegram.
2. Add [@SuperSimpleStandupBot](https://t.me/supersimplestandupbot) to the group you would like to use it in.
3. Type `/add` in the chat you want the standups to be posted in, and you will be added to the standup group.
4. Make sure each person private messages the bot, or they will not receive reminders to post their standup.

# Info
Standups are currently posted at 10am est.
Reminders are sent out at 8am est, 9am est, 9:30 est, and 9:45 est if an update has not been submitted.

# Support
Send a message to [@russeii](https://t.me/russeii) or create a github issue if you are having problems with the bot.

# Other bots
Details coming soon...


# Self Hosting
You are also to self-host this bot so no data is sent to our servers.


### Self Hosting Setup

1. Install Vercel CLI
```yarn global add vercel```

2. Setup the project with vercel
`vercel deploy` // accept all the default settings

3. Create a telegram bot with botfather - https://core.telegram.org/bots#6-botfather

4. Add your telegram bot API key as an env variable
`vercel env add TELEGRAM_API_KEY` // then enter your TG API get obtained in step 3

5. Create a database instance with mongodb atlas. Name your database `standup` - https://www.mongodb.com/cloud/atlas

6. Add your MONGODB URI as an env variable
`vercel env add MONGODB_FULL_URI`// then enter your mongodb connection URL obtained in step 2

7. Pull down the env variables as a local .env file for local development
`vercel env pull`

8. Setup a webhook to your vercel standup URL https://core.telegram.org/bots/webhooks (example URL: `https://bla-vercel.com/api/standup`).

```https://api.telegram.org/bot1889131854:AAHP3BzcY9VeVnXpD3bxRLP0t5w_FJSVwWU/setWebhook?url=https://6886fb9abb1c.ngrok.io/api/standup```

This is how your bot will know when events happen inside of telegram

### Run the application:
```
yarn
vercel dev
```

This runs the website at localhost:3000 and runs your lambda functions in the /api folder on localhost:3000/api
More info on how this works - https://vercel.com/docs/serverless-functions/introduction


### Self hosting not working? Debugging steps
1. View your function logs in vercel
(Go to vercel.com, login, navigate to your bot, click on your functions, then view the function logs)

2. Ensure your database is named `standup`

3. Ensure your webhooks are being sent to the correct URL. Make sure not to use the base URL only. The URL needs to be the `/api/standup` url

### How can I test this application locally ???
1. https://core.telegram.org/bots/webhooks - You can use these example webhooks to test your bot locally with curl or postman.
2. If you want to see the exact format of your webhooks - you can set your webhook url to http://webhook.site/ for testing.
3. If you wanted to test your bot fully locally, you can run the application with `vercel dev` then setup ngrok on the deployment URL - https://ngrok.com/docs then setup your webhooks to go to the ngrok url. (Note, ngrok has rate limiting, so some webhooks may be delayed or not sent)


