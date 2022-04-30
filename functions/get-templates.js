const axios = require('axios').default;
const URL = "https://messaging.twilio.com/v1/Channels/WhatsApp/Templates"

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

      let templates_array = [];

      let axios_auth = {
        auth: {
          username: context.ACCOUNT_SID,
          password: context.AUTH_TOKEN
        }
      }

		  const templates = await axios.get(URL, axios_auth);
      if(templates.status !== 200){
        throw("Could not load templates")
      }

      templates.data.whatsapp_templates.forEach(t => {

        let language;
        let content;

        for(let i = 0; i < t.languages.length; i++){
          if(t.languages[i].status === "approved"){
            language = t.languages[i].language;
            content = t.languages[i].content
            templates_array.push(
              {
                'name': t.template_name + " - HT..." + t.sid.slice(-4),
                'content': content,
                'language': language,
                'sid': t.sid
              }
            )
          }
        }

      	
      });
        response.setBody({
            status: true,
            message: "Getting Templates done",
            data: {
              templates_array: templates_array
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