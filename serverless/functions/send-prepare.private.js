/* This function prepares the data depending on the selections of the user to be passed to SMS API or Broadcast API */
const normalizePhoneNumber = (phoneNumber) => {
  let cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (!cleanedNumber.startsWith('+')) {
        cleanedNumber = '+' + cleanedNumber;
    }
    return cleanedNumber;
}

exports.prepareData = (event, sendType) => {

    const { 
        channelSelection,
        messageTypeSelection,
        senderTypeSelection, 
        csvData, 
        phoneNumberColumn,
        isSchedulingEnabled
    } = event;
    
    let sender;
    senderTypeSelection === "Messaging Service" ? sender = event.selectedService : sender = event.selectedSingleSender;      
    
    let messageData = {
        from: sender
    };
    if (messageTypeSelection === "Template"){
        messageData['contentSid'] = event.selectedTemplate.sid
    }
    else if (messageTypeSelection === "Custom") {
        if (event.customMediaURL) messageData['mediaUrl'] = [event.customMediaURL]
    }

    let Messages = [];

    csvData.map((row) => {

        let userObj = {}

        let phoneNumber = row[phoneNumberColumn]
        if(channelSelection === "SMS" || channelSelection === "Whatsapp"){
          phoneNumber = normalizePhoneNumber(phoneNumber)
        }
        console.log(phoneNumber)
        userObj['to'] = ""
        switch (channelSelection){
            case "Whatsapp":
                userObj['to'] = `whatsapp:${phoneNumber}`
                break;
            case "FBM":
                userObj['to'] = `messenger:${phoneNumber}`
                break;
            case "SMS":
                userObj['to'] = `${phoneNumber}`
                break;
        }

        if(messageTypeSelection === "Custom") {
          let body = event.customMessage;
          Object.keys(row).forEach((col) => {
            body = body.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
              return row[key] || match;
            });
          });
          userObj['body'] = body
        }
        else {
          const contentVariables = buildContentVariables(event.templateVariables, row);
          userObj['contentVariables'] = contentVariables;
        } 

        if (isSchedulingEnabled && sendType === "simple") {
          const scheduledDate = event.scheduledDate
          userObj['scheduleType'] = 'fixed';
          userObj['sendAt'] = scheduledDate;
        }

        Messages.push(userObj);  
    })

    if (isSchedulingEnabled && sendType === "broadcast") {
      const scheduledDate = event.scheduledDate
      messageData['scheduleType'] = 'fixed';
      messageData['sendAt'] = scheduledDate
    }

    return {
        ...messageData,
        Messages
    }

}

exports.getCorrectIndex = (csvData, phoneNumberColumn, userNumber) => {

    if(userNumber.startsWith("whatsapp:") || userNumber.startsWith("messenger:")){
      userNumber = userNumber.split(":")[1]
    }
    userNumber = normalizePhoneNumber(userNumber)
    const match = csvData.findIndex(r => {
      let csvDataUserNumber = normalizePhoneNumber(r[phoneNumberColumn])
      console.log(`usernumber: ${userNumber}, csvnumber:${csvDataUserNumber}`)
       return csvDataUserNumber === userNumber
    });
    console.log(match)
    return match;
  }


const buildContentVariables = (templateVariables, csvRow) => {
    let contentVariables = {};
  
    for (let key in templateVariables) {
        if (templateVariables.hasOwnProperty(key)) {
            const csvColumnName = templateVariables[key];
            contentVariables[key] = csvRow[csvColumnName] || '';
        }
    }
  
    return contentVariables;
  };