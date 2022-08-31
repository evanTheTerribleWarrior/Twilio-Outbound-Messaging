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

    try {
        const syncServiceSid = context.TWILIO_SYNC_SERVICE_SID || 'default';
        const syncListName = context.SYNC_LIST_NAME || 'optout-list';
        const syncClient = Runtime.getSync({ serviceName: syncServiceSid });
  
        let optOutData = await syncClient.maps(syncListName).syncMapItems.list()
        let optOutNumbers = [];

        if(optOutData){
            optOutData.forEach(item => optOutNumbers.push(item.key))
        }

        response.setBody({
            data: {
                optOutNumbers: optOutNumbers
            },
        })
          
        callback(null, response)
      }
      catch (err) {
        console.log("error:" + err);
        response.setStatusCode(500);
        response.setBody(err);
        callback(null, response);
      }



}