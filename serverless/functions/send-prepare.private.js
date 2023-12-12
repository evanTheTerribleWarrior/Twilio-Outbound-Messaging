/* This function prepares the data depending on the selections of the user to be passed to SMS API or Broadcast API */

exports.prepareData = (event) => {

    const { 
        channelSelection,
        messageTypeSelection,
        senderTypeSelection, 
        csvData, 
        phoneNumberColumn
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
            if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`
        }
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
        Messages.push(userObj);  
    })

    return {
        ...messageData,
        Messages
    }

}

exports.getCorrectIndex = (csvData, phoneNumberColumn, userNumber) => {

    if(userNumber.startsWith("whatsapp:") || userNumber.startsWith("messenger:")){
      userNumber = userNumber.split(":")[1]
    }
    if(userNumber.startsWith("+")){
      userNumber = userNumber.split("+")[1]
    }
    const match = csvData.findIndex(r => {
      let csvDataUserNumber = ""
      if(r[phoneNumberColumn].startsWith("+")){
        csvDataUserNumber = r[phoneNumberColumn].split("+")[1]
      }
      else {
        csvDataUserNumber = r[phoneNumberColumn]
      }
       return csvDataUserNumber === userNumber
    });
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