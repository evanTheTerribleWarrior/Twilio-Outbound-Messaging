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

      sentSuccess = 0;
      formatErrors = 0;
      nonmobileNumbers = [];
      invalidNumbers = [];

      const twilioClient = context.getTwilioClient();
      
      if (typeof event.csvData === 'undefined' || event.csvData === null || event.csvData.length === 0) {
          throw("csvData can not be empty");
      } else {

        let results = event.csvData;
  
        let myPromises = [];
  
        results.forEach((msg) => {
  
          myPromises.push(
            twilioClient.lookups.v1.phoneNumbers(msg.Number)
            .fetch(event.carrierSwitch ? {type: ['carrier']} : "")
          );
  
          console.log("CHECKING : " + msg.Number);
        });
  
        Promise.allSettled(myPromises).then((result) => {
          result.forEach((r,index) => {
            console.log(r)
            if (r.status === "rejected") {
              if (r.reason.status === 404) {
                invalidNumbers.push(index)
                formatErrors++;
                return;
              }            
            }
            else if (r.status === "fulfilled") {
              sentSuccess++
              if (event.carrierSwitch){
                if (r.value.carrier.type !== 'mobile') nonmobileNumbers.push(index)

              }
            }
          });
  
          response.setBody({
            status: true,
            message: "Lookup done",
            data: {
              checkedSuccess: sentSuccess,
              formatErrors: formatErrors,
              nonmobileNumbers: nonmobileNumbers,
              invalidNumbers: invalidNumbers
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