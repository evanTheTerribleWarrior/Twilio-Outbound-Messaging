exports.handler = async function(context, event, callback) {

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

      try{
      sentSuccess = 0;
      formatErrors = 0;
      nonmobileNumbers = [];
      invalidNumbers = [];
      nonmobileNumbers_ID = [];
      invalidNumbers_ID = [];

      const twilioClient = context.getTwilioClient();

      let {csvData, carrierSwitch, start} = event
      
      if (typeof event.csvData === 'undefined' || event.csvData === null || event.csvData.length === 0) {
        throw("csvData can not be empty");
      } else {  

      let promises = []

      csvData.forEach((msg) => {
        promises.push(
          twilioClient.lookups.v1.phoneNumbers(msg.Number)
          .fetch(carrierSwitch ? {type: ['carrier']} : "")
        );
      })

      console.log(promises.length)

      Promise.allSettled(promises).then((result) => {
        result.forEach((r,index) => {
          if (r.status === "rejected") {
            if (r.reason.status === 404) {
              invalidNumbers_ID.push(start + index)
              invalidNumbers.push(csvData[index].UniqueID)
              return;
            }            
          }
          else if (r.status === "fulfilled") {
            sentSuccess++
            if (carrierSwitch){
              if (r.value.carrier.type !== 'mobile') {
                nonmobileNumbers_ID.push(start + index)
                nonmobileNumbers.push(csvData[index].UniqueID)
              }

            }
          }
        });    
        response.setBody({
          status: true,
          message: "Lookup done",
          data: {
            checkedSuccess: sentSuccess,
            nonmobileNumbers: nonmobileNumbers,
            invalidNumbers: invalidNumbers,
            nonmobileNumbers_ID: nonmobileNumbers_ID,
            invalidNumbers_ID: invalidNumbers_ID
          },
        })
        callback(null, response);   
      })
    }
    }
    catch (err) {
      console.log("error:" + err);
      response.setStatusCode(500);
      response.setBody(err);
      callback(null, response);
    }
   
  }