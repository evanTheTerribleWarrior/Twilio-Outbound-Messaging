# Outbound Messaging App

Easily set up and send out messaging campaigns using your Twilio account.

![Application screenshot](https://user-images.githubusercontent.com/54394422/167257651-1da0ffc6-fcbe-466e-8277-51d35f922378.png)

## Key features
 * Load data from a CSV file
 * Embed variables in the message body
 * Supports SMS + Whatsapp
 * Supports Media (Whatsapp Media + MMS)
 * Supports Twilio Messaging Services as senders
 * Load your Whatsapp templates directly
 * Add/Edit/Delete/Search data directly on the browser
 * Pagination that allows to load large amount of data
 * Lookup integration to filter out/fix malformed numbers
 * Enhanced Lookup to check for non-mobile numbers (to avoid sending unnecessary SMS)
 * Logs
 * Basic Graphs for visualising the total message statuses and errors
 * Get Updated Message statuses to understand the final state of messages
 * JWT authentication
 * Exponential Backoff for error 429 "Too Many Requests"

Note: The API to load Whatsapp Templates will be deprecated approx H2 2023 in favour of the newer Content API

Note 2: Exponential Backoff settings currently are based on personal tests of loading about 10,000 numbers. I would advise that you do your own tests and realise the performance in order to adjust the settings. I have left this item on the TODO list to keep revising it.

## Pre-requisites
1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

**Ensure your CSV has one column named "Number" with the users phone numbers to message**

## Setup

3. Clone the repository and `cd` into it:
```shell
git clone https://github.com/evanTheTerribleWarrior/Twilio-Outbound-Messaging.git

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
![Authenticate](https://user-images.githubusercontent.com/54394422/167253609-c6776b61-3439-4a00-a484-8f4c7d3205d7.png)

2. Load your data in a CSV that will auto generate the relevant columns. Review any rows with empty Numbers value

3. Click "Check Numbers" to view any numbers with wrong structure, for example too many or too few digits
![Check Numbers](https://user-images.githubusercontent.com/54394422/167253613-636acfa1-9a42-4743-aace-7e76a24fb740.png)

It is mandatory to fix errors found here, either by removing or editing the row containing the number.
Note: You can also use Advanced Lookup ("Check Carrier Type") to look for non-mobile numbers (e.g. landline). Although it is not mandatory to fix these errors to send the messages, we strongly suggest you clean up as much as possible the set of numbers before sending

4. Once errors are fixed, you can click "Send Numbers" and monitor the progress of your messages
![Send Messages](https://user-images.githubusercontent.com/54394422/167253614-44ee6dcb-3f1e-4c57-9303-bec270c08893.png)

5. After the messages are sent, you can use "Get Status" button to see how your messages change status over time (until they reach a final status). You can visualise this by viewing the basic graphs provided - Total Message statuses and Total Errors
![Graphs](https://user-images.githubusercontent.com/54394422/167257651-1da0ffc6-fcbe-466e-8277-51d35f922378.png)

## Test It!

A sample .csv is included that you can load and play around. It has certain elements like malformed numbers, empty number fields etc in order for you to check and validate the app behaviour

## Considerations

- This is not an official Twilio repository.
- Currently there is no process that saves any data on your twilio account, other than creating logs. Which means if you restart the browser, the current progress disappears. So this repository as it stands is for one-off campaigns/sending
- As this is a personal work, updates will be published at non-standard intervals. You are of course free to take the code and shape as you wish

## TODO

- Exponential Backoff more testing
- Better promises rejection handling
- A version using Twilio Sync for persistent queueing

## Credits
This repository is built upon the following:
https://github.com/r-lego/CSV-to-SMS