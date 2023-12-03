/* Here we set the Twilio response headers - which can be expanded/changed.
Also we check if the Auth Header is valid and return appropriate response (401 if not) */

const jwt = require('jsonwebtoken');
exports.checkAuth = (cookies, secret) => {
  if (!cookies.outbound_messaging_jwt) return setResponse(false, setTwilioResponseHeaders())
  
  try{
    jwt.verify(cookies.outbound_messaging_jwt, secret);
  } catch (error) {
    return setResponse(false, setTwilioResponseHeaders())
  }
  
  return setResponse(true, setTwilioResponseHeaders())
};

const setResponse = (allowed, response) => {

  if(!allowed) {
    response.setBody('Unauthorized').setStatusCode(401)
            .appendHeader(
            'WWW-Authenticate',
            'Bearer realm="Access to the app"'
            )
  }
  return ( {
    allowed: allowed,
    response: response
  })
  
}

const setTwilioResponseHeaders = () => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Methods', 'POST');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Credentials', true)
  return response
}