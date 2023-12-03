exports.handler = async function(context, event, callback) {

    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    
    const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
    const checkAuth = require(checkAuthPath)
    let check = checkAuth.checkAuth(event.request.cookies, context.JWT_SECRET);
    if(!check.allowed)return callback(null,check.response);

      try {
      sentSuccess = 0;
      formatErrors = 0;
      nonmobileNumbers = [];
      invalidNumbers = [];
      nonmobileNumbers_ID = [];
      invalidNumbers_ID = [];

      const twilioClient = context.getTwilioClient();
      console.log(event);
        
      const {csvData, phoneNumberColumn, startIndex, checkLineType} = event
      if (typeof csvData === 'undefined' || csvData === null || csvData.length === 0) {
        throw("csvData can not be empty");
      } else {  

        
        const expbackoffPath = Runtime.getFunctions()['exponential-backoff'].path;
        const expbackoff = require(expbackoffPath)
        
        let promises = []

        csvData.map((row) => {
          let phoneNumber = row[phoneNumberColumn]
          if(!phoneNumber.startsWith('+'))phoneNumber = `+${phoneNumber}`
          promises.push(
            expbackoff.expbackoff(async () => {
              return twilioClient.lookups.v2.phoneNumbers(phoneNumber)
              .fetch(checkLineType ? {fields: 'line_type_intelligence'} : "")
            })
          );
        })

        console.log(promises.length)

        Promise.allSettled(promises).then(result => {
          result.forEach((r,index) => {
            console.log(r)
            if (r.status === "rejected") {
              if (r.reason.status === 404) {
                invalidNumbers_ID.push(startIndex + index)
                invalidNumbers.push(csvData[index].UniqueID)
                return;
              }            
            }
            else if (r.status === "fulfilled") {
              sentSuccess++
              if (checkLineType){
                if (r.value.lineTypeIntelligence) {
                  if(r.value.lineTypeIntelligence.type !== "mobile"){
                    nonmobileNumbers_ID.push(startIndex + index)
                    nonmobileNumbers.push(csvData[index].UniqueID)
                  }               
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
          return callback(null, response);   
        })
    }
    }
    catch (err) {
      console.log("error:" + err);
      response.setStatusCode(500);
      response.setBody(err);
      return callback(null, response);
    }
   
  }
