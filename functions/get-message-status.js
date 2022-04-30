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


		let myPromises = [];

		event.sendResultsArray.forEach(m =>  {

      if(m.sid !== "")
			myPromises.push(
        twilioClient.messages(m.sid).fetch()
      );
      else{
        myPromises.push("")
      }
					
		})

		Promise.allSettled(myPromises).then((result) => {
          result.forEach((r,index) => {
            console.log(r)   
            let status_obj = {}       
            if(myPromises[index] === "")return;
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
          
  
        	console.log(`After statuses check: ${JSON.stringify(event.sendResultsArray)}`)
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