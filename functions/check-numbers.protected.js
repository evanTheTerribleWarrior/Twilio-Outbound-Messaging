
exports.handler = function(context, event, callback) {

    console.log(event)
    
    sentSuccess = 0;
    formatErrors = 0;
    nonmobileNumbers = [];
    invalidNumbers = [];

    const twilioClient = context.getTwilioClient();
    
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');
  
    try {

      if (event.password !== context.PASSWORD){
        response.setStatusCode(401);
        response.setBody({passwordError: "Password is not correct"});
        callback(null, response);
      }
      
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