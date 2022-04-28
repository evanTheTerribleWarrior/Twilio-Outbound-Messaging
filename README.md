# Outbound Messaging App

Easily set up and send out messaging campaigns using your Twilio account.

![Application screenshot](https://user-images.githubusercontent.com/54394422/165508349-b0958eed-9f1e-4b49-be5d-68eeec2915ad.png)

## Key features
 * Load data from a CSV file
 * Embed variables in the message body
 * Supports SMS + Whatsapp
 * Supports Twilio Messaging Services as senders
 * Edit/Delete data directly on the browser
 * Logs
 * View Message statuses
 * Get Updated Message statuses to understand the final state of messages

## Pre-requisites
1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

**Ensure your CSV has one column named "Numbers" with the users phone numbers to message**

## Setup

3. Clone the repository and `cd` into it:
```shell
https://github.com/evanTheTerribleWarrior/Twilio-Outbound-Messaging.git

cd Twilio-Outbound-Messaging
```

4. Create .env file and set the password:
```shell
cp .env.example .env
```

5. Using Twilio CLI, deploy code to your Twilio account:
```shell
twilio serverless:deploy
# View your app at https://[my-runtime-url].twil.io/index.html
```

## Examples

1. Load your data in a CSV that will auto generate the relevant columns. Review any rows with empty Numbers value

2. Click "Check Numbers" (including the Password you have set) to view any numbers with wrong structure, for example too many or too few digits
![Check Numbers](https://user-images.githubusercontent.com/54394422/165508332-2bfa1915-067b-4d7e-857d-1c3e33a76547.png)

3. Once errors are fixed, you can click "Send Numbers" and monitor the progress of your messages
![Send Messages](https://user-images.githubusercontent.com/54394422/165508345-90c4e9c4-9437-44a2-a542-2239cb8bb101.png)

## Test It!

A sample .csv is included that you can load and play around. It has certain elements like malformed numbers, empty number fields etc in order for you to check and validate the app behaviour

## Credits
This repository is built upon the following:
https://github.com/r-lego/CSV-to-SMS
