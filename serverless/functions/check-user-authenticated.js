exports.handler = async function(context, event, callback) {
    const checkAuthPath = Runtime.getFunctions()['check-auth'].path;
    const checkAuth = require(checkAuthPath)
    console.log(event.request.cookies)
    let check = checkAuth.checkAuth(event.request.cookies, context.JWT_SECRET);
    if(!check.allowed)return callback(null,check.response);
    const response = check.response
    
    response.setBody({isAuthenticated: true})
    return callback(null, response)
}