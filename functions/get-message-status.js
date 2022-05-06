exports.handler = function(context, event, callback) {

	const twilioClient = context.getTwilioClient();

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


		let promises = [];

		event.sendResultsArray.forEach(m =>  {

      if(m.sid !== "")
			promises.push(
        twilioClient.messages(m.sid).fetch()
      );
      else{
        promises.push("")
      }
					
		})

		Promise.allSettled(promises).then((result) => {
      result.forEach((r,index) => {
        let status_obj = {}       
        if(promises[index] === "")return;
        if (r.status === "fulfilled") {
          event.sendResultsArray[index]["status"] = r.value.status
          event.sendResultsArray[index]["error"]["errorMessage"] = r.value.errorMessage
          event.sendResultsArray[index]["error"]["errorCode"] = r.value.errorCode
          if(!r.value.errorMessage)event.sendResultsArray[index]["error"]["errorLink"]=""
        }
        else if (r.status === "rejected"){
          event.sendResultsArray[index]["status"] = r.reason.status
          event.sendResultsArray[index]["error"]["errorLink"] = r.reason.moreInfo
          event.sendResultsArray[index]["error"]["errorCode"] = r.reason.code
        }
  
      })
      
      response.setBody({
        status: true,
        message: "Getting Statuses done",
        data: {
          sendResultsArray: event.sendResultsArray
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