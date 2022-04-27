exports.handler = async function(context, event, callback) {

	const twilioClient = context.getTwilioClient();
	const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Content-Type', 'application/json');

	let services_array = [];

	try {

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