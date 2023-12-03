exports.handler = async function(context, event, callback) {

	const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

	const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
  const checkAuth = require(checkAuthPath)
  let check = checkAuth.checkAuth(event.request.cookies, context.JWT_SECRET);
  if(!check.allowed)return callback(null,check.response);

	try {
    const twilioClient = context.getTwilioClient();
    let services_array = [];
		let services = await twilioClient.messaging.v1.services.list()
        services.forEach(s => {

        	services_array.push(
        		{
        			'name': s.friendlyName + " - MG..." + s.sid.slice(-4),
        			'sid': s.sid
        		}
        	)
        });
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