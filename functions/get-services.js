exports.handler = async function(context, event, callback) {

	const twilioClient = context.getTwilioClient();
	const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  const headerCheckPath = Runtime.getFunctions()['check-headers'].path;
  const headerCheck = require(headerCheckPath);

	let services_array = [];

	try {

    if(headerCheck.checkHeader(event.request.headers.origin, "https://" + context.DOMAIN_NAME)){
        response.setStatusCode(401);
        response.setBody({accessError: "You can't access this endpoint"});
        callback(null, response);
      }

		let services = await twilioClient.messaging.services.list()
        services.forEach(s => {

        	services_array.push(
        		{
        			'name': s.friendlyName + " - MG..." + s.sid.slice(-4),
        			'sid': s.sid
        		}
        	)
        });
        console.log(services_array)
        response.setBody({
            status: true,
            message: "Getting Services done",
            data: {
              services_array: services_array
            },
          })
          callback(null, response);
    } catch (err) {
      console.log("error:" + err);
      response.setStatusCode(500);
      response.setBody(err);
      callback(null, response);
    }

}