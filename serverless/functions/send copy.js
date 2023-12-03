exports.handler = function(context, event, callback) {
    
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');

    const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
    const checkAuth = require(checkAuthPath)
    let check = checkAuth.checkAuth(event.request.cookies, context.JWT_SECRET);
    if(!check.allowed)return callback(null,check.response);
   
    try {

      let sentSuccess = 0;
      let sentErrors = 0;
      let errorObj = {};

      const twilioClient = context.getTwilioClient();

      const { startIndex, 
        channelSelection,
        messageTypeSelection,
        senderTypeSelection} = event;
      
      let sender;
      senderTypeSelection === "Messaging Service" ? sender = event.selectedService : sender = event.selectedSingleSender;      

      let messageData;
      
      /*if (typeof event.textmsg === 'undefined' || event.textmsg === null || event.textmsg.length === 0) {
          throw("Message can not be empty");
      } else if (typeof event.sender === 'undefined' || event.sender === null || event.sender.length === 0) {
          throw("Sender can not be empty");
      } else if (typeof event.csvData === 'undefined' || event.csvData === null || event.csvData.length === 0) {
          throw("csvData can not be empty");
      } else {*/
        let template = event.template;
        let results = event.csvData;

        let start = event.start

        let selectedPhoneNumberColumn = event.selectedPhoneNumberColumn

        let promises = [];

        let senderId;
        if (!event.isMsgService){
          senderId = (event.channel === "Whatsapp") ? "whatsapp:" + event.sender : event.sender;
        }
        else {
          senderId = event.sender
        }
        
        console.log(JSON.stringify(event.optOutNumbers))

        results.forEach((msg,index) => {

          console.log(`Comparing with ${msg[selectedPhoneNumberColumn]}`)

          if(event.sendResultsArray[index]["status"] === "delivered"){
            promises.push({})
            return;
          }

          let found;
          if(event.optOutNumbers.length > 0){
            found = event.optOutNumbers.findIndex((number) => {
              if (!msg[selectedPhoneNumberColumn].startsWith('+')){
                return number === '+' + msg[selectedPhoneNumberColumn]
              }
              return number === msg[selectedPhoneNumberColumn] 
            })
            if(found > -1){
              console.log(`${event.optOutNumbers[found]} has opted out, ignore...`)
              promises.push({})
              return;
            }
          }
          
  
          /*let body = template;
          Object.keys(msg).forEach((k) => {
            body = body.replace("{{" + k + "}}", msg[k]);
            
          });*/

          if(event.optOutSwitch){
            body += "\nSTOP: https://" + context.DOMAIN_NAME + "/o?" + base10_to_base64(msg[selectedPhoneNumberColumn])
          }

          let to = (event.channel === "Whatsapp") ? "whatsapp:+" + msg[selectedPhoneNumberColumn] : msg[selectedPhoneNumberColumn]

          let payload = {}
          payload["to"] = to.toString();
          payload["contentSid"] = template.sid;

          if (!event.isMsgService) payload["from"] = senderId.toString()
          else payload["from"] = senderId.toString()
          if(event.mediaURL)payload["mediaUrl"] = [event.mediaURL];

          const { sendASAP, sendDate } = event;
          console.log("Passing date: " + sendASAP + sendDate)
          if(!sendASAP) {
            payload["scheduleType"] = "fixed";
            payload["sendAt"] = sendDate.replace(/ /g, "T") + 'Z';
          }

          console.log(payload)
  
          const expbackoffPath = Runtime.getFunctions()['exponential-backoff'].path;
          const expbackoff = require(expbackoffPath)
          promises.push(
            expbackoff.expbackoff(async () => {return twilioClient.messages.create(payload)})   
          );

        });
  
        Promise.allSettled(promises).then((result) => {
          result.forEach((r,index) => {
            console.log(r)
            if (r.status === "fulfilled"){
              
              if (event.sendResultsArray[index]["status"] !== "delivered")
                sentSuccess++;

              errorObj = {}
              
              if(event.sendResultsArray[index]["sid"] === "" || event.sendResultsArray[index]["status"] !== "delivered"){
                event.sendResultsArray[index]["sid"] = r.value.sid;
                event.sendResultsArray[index]["error"] = errorObj
                event.sendResultsArray[index]["status"] = r.value.status
              }   
              
              
            } 
            else { 
              console.log(`Promise ${index} rejected with reason ${JSON.stringify(r.reason)}`)
              sentErrors++;
              errorObj = {}
              errorObj["errorCode"] = r.reason.code;
              errorObj["errorLink"] = r.reason.moreInfo;
    
              if(event.sendResultsArray[index]["sid"] === "" || event.sendResultsArray[index]["status"] !== "delivered"){
                event.sendResultsArray[index]["error"] = errorObj
                event.sendResultsArray[index]["status"] = "failed"
                event.sendResultsArray[index]["error"]["errorLink"] = r.reason.moreInfo
                event.sendResultsArray[index]["error"]["errorCode"] = r.reason.code
              } 
              
            }

          });
  
          response.setBody({
            status: true,
            message: "Messages Sent",
            data: {
              sentSuccess: sentSuccess,
              sentErrors: sentErrors,
              sendResultsArray: event.sendResultsArray
            },
          })
          callback(null, response);
  
        });
  
      //}
    } catch (err) {
      console.log("error:" + err);
      response.setStatusCode(500);
      response.setBody(err);
      callback(null, response);
    }
    
   
  };

  //number encoding
  function base10_to_base64(num) {
    var order = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
    var base = order.length;
    var str = "", r;
    while (num) {
        r = num % base
        num -= r;
        num /= base;
        str = order.charAt(r) + str;
    }
    return str;
}