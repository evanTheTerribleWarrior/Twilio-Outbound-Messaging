const axios = require('axios').default;
const URL = "https://content.twilio.com/v1/Content"

exports.handler = async function(context, event, callback) {

	const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
  const checkAuth = require(checkAuthPath)
  let check = checkAuth.checkAuth(event.request.cookies, context.JWT_SECRET);
  if(!check.allowed)return callback(null,check.response);

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
      console.log(templates.data.contents)

      templates.data.contents.forEach(t => {

          const templateData = {
            'name': t.friendly_name + " - HX..." + t.sid.slice(-4),
            'language': t.language,
            'content': t.types,
            'sid': t.sid,
            'variables': t.variables
          }

          if(event.channelSelection === "SMS"){
            if ('twilio/text' in t.types || 'twilio/media' in t.types){
              templates_array.push(templateData)
            }
          }
          else {
            templates_array.push(templateData)
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