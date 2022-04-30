const jwt = require('jsonwebtoken');
exports.checkAuth = (tokenHeader, secret) => {

  const authHeader = tokenHeader;

  if (!authHeader) return {allowed: false};

  const [authType, authToken] = authHeader.split(' ');
  if (authType.toLowerCase() !== 'bearer')
  return {allowed: false};

  try{
    jwt.verify(authToken, secret);

  }catch (error) {
  return {allowed: false};
  }
  return {allowed:true}
};