exports.handler = function(context, event, callback) {

	const twilioClient = context.getTwilioClient();

	const response = new Twilio.Response();

  response.appendHeader('Content-Type', 'application/json');

  const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
  const checkAuth = require(checkAuthPath)
  let check = checkAuth.checkAuth(event.request.cookies, context.JWT_SECRET);
  if(!check.allowed)return callback(null,check.response);

	try {

    const { sendResultsArray, startIndex } = event;

    console.log(sendResultsArray)

		let promises = [];
    const expbackoffPath = Runtime.getFunctions()['exponential-backoff'].path;
    const expbackoff = require(expbackoffPath)

    sendResultsArray.map((row) => {
      if(row.messageSid.length > 0){
        promises.push(
          expbackoff.expbackoff(async () => {
            {return twilioClient.messages(row.messageSid).fetch()}
          })
        );
        return;
      }
      return;
      /*else {
        promises.push("")
        return;
      }*/
    })

		Promise.allSettled(promises).then((result) => {
      result.forEach((r,index) => {    
        if(promises[index] === "")return;
        if (r.status === "fulfilled") {
          sendResultsArray[index]["status"] = r.value.status
          sendResultsArray[index]["error"]["errorMessage"] = r.value.errorMessage
          sendResultsArray[index]["error"]["errorCode"] = r.value.errorCode
          if(!r.value.errorMessage)sendResultsArray[index]["error"]["errorLink"]=""
        }
        else if (r.status === "rejected"){
          sendResultsArray[index]["status"] = "failed"
          sendResultsArray[index]["error"]["errorLink"] = r.reason.moreInfo
          sendResultsArray[index]["error"]["errorCode"] = r.reason.code
        }
  
      })
      
      response.setBody({
        status: true,
        message: "Getting Statuses done",
        data: {
          sendResultsArray: sendResultsArray
        },
      })
      callback(null, response);
       });
    } catch (err) {
      console.log("error:" + err);
      response.setStatusCode(500);
      response.setBody(err);
      callback(null, response);
    }

}