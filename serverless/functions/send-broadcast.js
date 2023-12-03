const axios = require('axios');

exports.handler = async function(context, event, callback) {
    
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

      const url = 'https://preview.messaging.twilio.com/v1/Messages';
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(context.ACCOUNT_SID + ':' + context.AUTH_TOKEN).toString('base64')
        }
      };

      let promises = [];
      promises.push(expbackoff.expbackoff(async () => {
        return axios.post(url, preparedData, config)
      }))

      let messageReceiptsArray = []
      let sentSuccess = 0;
      let sentErrors = 0;

      Promise.allSettled(promises).then((result) => {
        result.forEach((r,index) => {
          if (r.status === "fulfilled"){
              sentSuccess++;
              r.value.data.message_receipts.map(receipt => {
                messageReceiptsArray.push({
                  csvRowID: event.csvData[index].UniqueID,
                  messageSid: receipt.sid
                })
              })
          } 
          else { 
            sentErrors++;       
          }

        });

        response.setBody({
          status: true,
          message: "Messages Sent",
          data: {
            sentSuccess: sentSuccess,
            sentErrors: sentErrors,
            messageReceiptsArray: messageReceiptsArray
          }
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