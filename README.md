# About 
Super simple standup bot brings standup functionality to Telegram. Group members are able to submit updates, and they are all sent to a shared channel at a set time. 

There are many good standup bots for Slack - [GeekBot](https://geekbot.com/), [Standuply](https://standuply.com/), [Polly](https://www.polly.ai/template/daily-standup) but there are not any good alternatives for Telegram. 



# How to use 
1. Send a message to [@SuperSimpleStandupBot](https://t.me/supersimplestandupbot) on telegram.
2. Add [@SuperSimpleStandupBot](https://t.me/supersimplestandupbot) to the group you would like to use it in.
3. Type `/join` in the chat you want the standups to be posted in, and you will be added to the standup group.
4. Make sure each person private messages the bot, or they will not recieve reminders to post their standup.

# Info
Standups are currently posted at 10am est.
Reminders are sent out at 8am est, 9am est, 9:30 est, and 9:45 est if an update has not been submitted. 

# Support
Send a message to [@deephire](https://t.me/deephire) or create a github issue if you are having problems with the bot. 

# Other bots
Details coming soon...


# Self Hosting 
You are also to self-host this bot so no data is sent to our servers. 
To self host:

1. Create a telegram bot with botfather - https://core.telegram.org/bots#6-botfather
2. Create a database instance with mongodb atlas - https://www.mongodb.com/cloud/atlas
3
4. Setup a webhook to your vercel URL https://core.telegram.org/bots/webhooks 


### How to run (first time) 
Make sure you have vercel CLI installed. If you don't install it with 
`yarn global add vercel`

Add your ENV variables to vercel
`vercel env add TELEGRAM_API_KEY` // then enter your TG API get obtained in step 1
`vercel env add MONGODB_FULL_URI`// then enter your mongodb connection URL obtained in step 2

Run the application:
```
yarn
vercel dev 
```

This runs the website at localhost:3000 and runs your lambda functions in the /api folder on localhost:3000/api 
More info on how this works - https://vercel.com/docs/serverless-functions/introduction
