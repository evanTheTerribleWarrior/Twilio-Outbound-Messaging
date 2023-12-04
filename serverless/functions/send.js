exports.handler = function(context, event, callback) {
    
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');

    const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
    const checkAuth = require(checkAuthPath)
    let check = checkAuth.checkAuth(event.request.cookies, context.JWT_SECRET);
    if(!check.allowed)return callback(null,check.response);
   
    try {

      const expbackoffPath = Runtime.getFunctions()['exponential-backoff'].path;
      const expbackoff = require(expbackoffPath)
      const sendPreparePath = Runtime.getFunctions()['send-prepare'].path;
      const sendPrepare = require(sendPreparePath)
      let preparedData = sendPrepare.prepareData(event);

      const twilioClient = context.getTwilioClient();

      const { Messages, ...messageData } = preparedData;
      const dataToSend = Messages.map(userObj => ({
        ...userObj,
        ...messageData
      }));

      let promises = []
      dataToSend.map(requestObj => {
        promises.push(
          expbackoff.expbackoff(async () => {
            return twilioClient.messages.create(requestObj)
          })
        );
      })

      let sentSuccess = 0;
      let sentErrors = 0;
      let messageReceiptsArray = []
      let failedReceiptsArray = []

      Promise.allSettled(promises).then((result) => {
        result.forEach((r,index) => {
          if (r.status === "fulfilled"){
              sentSuccess++;
              messageReceiptsArray.push({
                csvRowID: event.csvData[index].UniqueID,
                messageSid: r.value.sid
              })
          } 
          else { 
            sentErrors++;   
            failedReceiptsArray.push({
              csvRowID: event.csvData[index].UniqueID,
              error_code: r.reason.code,
              error_message: r.reason.moreInfo
            })    
          }

        });

        response.setBody({
          status: true,
          message: "Messages Sent",
          data: {
            sentSuccess: sentSuccess,
            sentErrors: sentErrors,
            messageReceiptsArray: messageReceiptsArray,
            failedReceiptsArray: failedReceiptsArray
          },
        })
        return callback(null, response);

      });
     
    }
    catch (err) {
      console.log("error:" + err);
      response.setStatusCode(500);
      response.setBody(err);
      return callback(null, response);
    }
}