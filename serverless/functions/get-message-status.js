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

		let promises = [];
    const expbackoffPath = Runtime.getFunctions()['exponential-backoff'].path;
    const expbackoff = require(expbackoffPath)

    sendResultsArray.map((row) => {
      if(row.messageSid.length > 0){
        console.log(row)
        promises.push(
          expbackoff.expbackoff(async () => {
            {return twilioClient.messages(row.messageSid).fetch()}
          })
        );
        return;
      }
      return;
    })

    let getStatusArray = []

		Promise.allSettled(promises).then((result) => {
      result.forEach((r,index) => {   
        let getStatusObj = {
          error: {}
        } 
        if(promises[index] === "")return;
        if (r.status === "fulfilled") {
          
          getStatusObj["csvRowID"] = sendResultsArray[index].csvRowID
          getStatusObj["status"] = r.value.status
          getStatusObj["error"]["errorMessage"] = r.value.errorMessage
          getStatusObj["error"]["errorCode"] = r.value.errorCode
        }
        else if (r.status === "rejected"){
          getStatusObj["csvRowID"] = sendResultsArray[index].csvRowID
          getStatusObj["status"] = "failed"
          getStatusObj["error"]["errorMessage"] = r.reason.moreInfo
          getStatusObj["error"]["errorCode"] = r.reason.code
        }
        getStatusArray.push(getStatusObj)
  
      })

      console.log(getStatusArray)
      
      response.setBody({
        status: true,
        message: "Getting Statuses done",
        data: {
          getStatusArray: getStatusArray
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