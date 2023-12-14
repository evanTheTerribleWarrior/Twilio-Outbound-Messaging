**Note:** This is the documentation for the updated version of the project that includes the latest Twilio APIs, like Content API and Broadcast API. If you are looking for the old version, please check the [old_version branch](https://github.com/evanTheTerribleWarrior/Twilio-Outbound-Messaging/tree/old_version).

**Note 2:** The repo is still work in progress. This note will be removed once the repo is in a stable state across all functionalities. Currently working on Logs, CampaignTable mostly

---

# Outbound Messaging App

Easily set up and send out messaging campaigns using your Twilio account.

![Application screenshot](https://github.com/evanTheTerribleWarrior/Twilio-Outbound-Messaging/assets/111442118/c436f41e-15b7-45d7-9eff-da0c53ff9911)

## Key features
 * Load data from a CSV file
 * Set custom messages or pre-created templates (via Twilio Content API)
 * Send messages via the standard Messaging API or Broadcast API
 * Supports multiple messaging channels
 * Add/Edit/Delete/Search data directly on the browser
 * Check numbers before sending to identify malformed numbers or non-mobile numbers (via Twilio Lookup API)
 * Logs
 * Basic Graphs for visualising the total message statuses and errors
 * Get Updated Message statuses to understand the final state of messages
 * JWT authentication
 * Exponential Backoff for error 429 "Too Many Requests"
 * Redux store used to save important data across the application locally

## Pre-requisites
1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

## Setup

- Clone the repository and `cd` into it:
```shell
git clone https://github.com/evanTheTerribleWarrior/Twilio-Outbound-Messaging.git

cd Twilio-Outbound-Messaging
```

- Go to `frontend` directory and run `npm install`:
```shell
cd frontend
npm install
```

- Go to `serverless` directory. Run `npm install` and then create .env file and add USERNAME, PASSWORD, JWT_SECRET that are used for authentication. Make them hard to guess if you deploy this! If you deploy locally, you need also to add the AUTH_TOKEN and ACCOUNT_SID with your Twilio credentials, but if you deploy remotely you DO NOT need them
```shell
cd serverless
npm install
cp .env.example .env
```

### Option 1: Build remote (Twilio account)
- Run the `setup-remote.sh` script (if you use other shell, use the equivalent command):
```shell
zsh setup-remote.sh
# View your app at https://[my-runtime-url].twil.io/index.html
```

### Option 2: Build local - same ports for backend and frontend
- Run the `setup-local-same-port.sh` script (if you use other shell, use the equivalent command):
```shell
zsh setup-local-same-port.sh
# View your app at http://localhost:3002/index.html (or set the port you want)
```

### Option 3: Run local - different ports for backend and frontend (easier for changing/testing code)
- Run the `setup-local-diff-port.sh` script (if you use other shell, use the equivalent command):
```shell
zsh setup-local-diff-port.sh
```
This will effectively use `npm run start` to start the frontend on the standard 3000 port and have it runninng in the background.
But in `package.json` we added `proxy: http://localhost:3002/` so that all requests are proxied to the same
port as the functions backend. This way we can use `credentials: 'same-origin'` when authenticating

## Test It!

A sample .csv is included that you can load and play around. It has certain elements like malformed numbers, empty number fields etc in order for you to check and validate the app behaviour

## Considerations

- This is not an official Twilio repository.
- Currently there is no process that saves any data on your twilio account, other than creating logs and the local redux store. So this repository as it stands is for one-off campaigns/sending
- As this is a personal work, updates will be published at non-standard intervals. You are of course free to take the code and shape as you wish

## TODO

- Messenger via Content API templates gets stuck (works fine with normal custom message)
- Scalability: since most of the updates of the rows happen UI-end, it gets more laggy as the csv files grow

## Credits
This repository is built upon the following:
https://github.com/r-lego/CSV-to-SMS