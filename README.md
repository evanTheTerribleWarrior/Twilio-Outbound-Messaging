# Outbound Messaging App
Easily set up and send out messaging campaigns using your Twilio account.

![Application screenshot](https://user-images.githubusercontent.com/2404879/160084852-95b796f5-fa2b-4ce2-a5cb-ef9023258db2.png)

## Key features
 * Loading data from a CSV file
 * Embeds variables in the message body
 * Supports SMS + Whatsapp
 * Supports Twilio Messaging Services as senders
 * Edit/Delete data directly on the browser
 * Logs
 * View Message statuses
 * Get Updated Message statuses to understand the final state of messages

## Pre-requisites
1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started):

## Setup

3. Clone the repository and `cd` into it:
```shell
git clone https://github.com/r-lego/CSV-to-SMS.git

cd CSV-to-SMS
```

4. Using Twilio CLI, deploy code to your Twilio account:
```shell
twilio serverless:deploy
# View your app at https://[my-runtime-url].twil.io/index.html
```

## Credits
This repository is built upon the following:
https://github.com/r-lego/CSV-to-SMS