
exports.handler = function(context, event, callback) {
    
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');

    const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
    const checkAuth = require(checkAuthPath)

    let check = checkAuth.checkAuth(event.request.headers.authorization, context.JWT_SECRET);
    if(!check.allowed){
      response
      .setBody('Unauthorized')
      .setStatusCode(401)
      .appendHeader(
        'WWW-Authenticate',
        'Bearer realm="Access to the app"'
      );
      return callback(null,response);
    }
   
    try {

      const twilioClient = context.getTwilioClient();

      console.log(`Array before sending ${JSON.stringify(event.sendResultsArray)}`)

      sentSuccess = 0;
      sentErrors = 0;
      let errorObj = {};

      if (typeof event.textmsg === 'undefined' || event.textmsg === null || event.textmsg.length === 0) {
          throw("Message can not be empty");
      } else if (typeof event.sender === 'undefined' || event.sender === null || event.sender.length === 0) {
          throw("Sender can not be empty");
      } else if (typeof event.csvData === 'undefined' || event.csvData === null || event.csvData.length === 0) {
          throw("csvData can not be empty");
      } else {
        let msgTemplate = event.textmsg;
        let results = event.csvData;

        let start = event.start

        let promises = [];

        let senderId;
        if (!event.isMsgService){
          senderId = (event.channel === "Whatsapp") ? "whatsapp:" + event.sender : event.sender;
        }
        else {
          senderId = event.sender
        }
  
        results.forEach((msg,index) => {

          if(event.sendResultsArray[index]["status"] === "delivered"){
            console.log(`Position ${index}: Already delivered`);
            promises.push({})
            return;
          }
          
  
          let body = msgTemplate;
          Object.keys(msg).forEach((k) => {
            body = body.replace("[" + k + "]", msg[k]);
          });

          let to = (event.channel === "Whatsapp") ? "whatsapp:" + msg.Number : msg.Number

          let payload = {}
          payload["to"] = to.toString();
          payload["body"] = body.toString();
          if (!event.isMsgService) payload["from"] = senderId.toString()
          else payload["messagingServiceSid"] = senderId.toString()
  
          promises.push(
            twilioClient.messages.create(payload)
          );

        });
  
        Promise.allSettled(promises).then((result) => {
          result.forEach((r,index) => {
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
  
      }
    } catch (err) {
      console.log("error:" + err);
      response.setStatusCode(500);
      response.setBody(err);
      callback(null, response);
    }
    
   
  };