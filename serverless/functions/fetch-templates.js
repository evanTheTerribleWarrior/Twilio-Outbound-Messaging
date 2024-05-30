const axios = require('axios').default;
const URL = "https://content.twilio.com/v1/Content"

exports.handler = async function(context, event, callback) {

	const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
  const checkAuth = require(checkAuthPath)
  let check = checkAuth.checkAuth(event.request.cookies, context.JWT_SECRET);
  if(!check.allowed)return callback(null,check.response);

  const fetchTemplates = async (url, axios_auth) => {
    let templates = [];

    if(!url || url.length === 0) url = URL;
  
    try {
        const response = await axios.get(url, axios_auth);
        const data = response.data;
        templates = [...data.contents]
        nextPageUrl = data.meta.next_page_url ? data.meta.next_page_url : null;
      
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  
    return {templates: templates, nextPageUrl: nextPageUrl};
  };

	try {

      let templates_array = [];

      let axios_auth = {
        auth: {
          username: context.ACCOUNT_SID,
          password: context.AUTH_TOKEN
        }
      }


		  const {templates, nextPageUrl} = await fetchTemplates(event.nextPageUrl, axios_auth);

      console.log(templates.length)
      console.log(nextPageUrl)

      templates.forEach(t => {

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
              templates_array: templates_array,
              nextPageUrl: nextPageUrl
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