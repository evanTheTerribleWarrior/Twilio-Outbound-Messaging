# Outbound Messaging App

Easily set up and send out messaging campaigns using your Twilio account.

![Application screenshot](https://user-images.githubusercontent.com/54394422/166103466-af5322a3-8b6d-4cb1-8547-cbff3944bd4e.png)

## Key features
 * Load data from a CSV file
 * Embed variables in the message body
 * Supports SMS + Whatsapp
 * Supports Twilio Messaging Services as senders
 * Load your Whatsapp templates directly
 * Edit/Delete data directly on the browser
 * Lookup integration to filter out/fix malformed numbers
 * Enhanced Lookup to check for non-mobile numbers (to avoid sending unnecessary SMS)
 * Logs to understand errors
 * View Message statuses
 * Get Updated Message statuses to understand the final state of messages
 * JWT authentication

Note: The API to load Whatsapp Templates will be deprecated approx H2 2023 in favour of the newer Content API

## Pre-requisites
1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

**Ensure your CSV has one column named "Number" with the users phone numbers to message**

## Setup

3. Clone the repository and `cd` into it:
```shell
https://github.com/evanTheTerribleWarrior/Twilio-Outbound-Messaging.git

cd Twilio-Outbound-Messaging
```

4. Create .env file and set the USERNAME, PASSWORD, JWT_SECRET. Ensure they are not easy to guess:
```shell
cp .env.example .env
```

5. Using Twilio CLI, deploy code to your Twilio account:
```shell
twilio serverless:deploy
# View your app at https://[my-runtime-url].twil.io/index.html
```

## Example

1. First you need to authenticate. Make sure your .env contains strong Username/Password/Secret

2. Load your data in a CSV that will auto generate the relevant columns. Review any rows with empty Numbers value

3. Click "Check Numbers" to view any numbers with wrong structure, for example too many or too few digits
![Check Numbers](https://user-images.githubusercontent.com/54394422/166103472-9bceb7e9-e218-4898-800d-3240777989ad.png)

It is mandatory to fix errors found here, either by removing or editing the row containing the number.
Note: You can also use Advanced Lookup ("Check Carrier Type") to look for non-mobile numbers (e.g. landline). Although it is not mandatory to fix these errors to send the messages, we strongly suggest you clean up as much as possible the set of numbers before sending

4. Once errors are fixed, you can click "Send Numbers" and monitor the progress of your messages
![Send Messages](https://user-images.githubusercontent.com/54394422/166103473-85a9ca7b-eb8f-4769-8717-01b9f29704b1.png)

## Test It!

A sample .csv is included that you can load and play around. It has certain elements like malformed numbers, empty number fields etc in order for you to check and validate the app behaviour

## Considerations

- As above, ensure the secret used to allow the requests and the credentials are not easily guessable

## Credits
This repository is built upon the following:
https://github.com/r-lego/CSV-to-SMS