exports.handler = async function(context, event, callback) {
    const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
    const checkAuth = require(checkAuthPath)
    let check = checkAuth.checkAuth(event.request.cookies, context.JWT_SECRET);
    if(!check.allowed)return callback(null,check.response);
    const response = check.response
    
    response.removeCookie('outbound_messaging_jwt');
    response.setBody({cookieRemoved: true})
    return callback(null, response)
}