const jwt = require('jsonwebtoken');

exports.handler = (context, event, callback) => {

  const { username, password } = event;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (username !== context.USERNAME || password !== context.PASSWORD) {
    response
      .setBody('Username or password is incorrect')
      .setStatusCode(401);

    return callback(null, response);
  }

  const token = jwt.sign(
    {
      sub: 'MessagingApp',
      iss: 'twil.io',
      org: 'twilio',
      perms: ['read'],
    },
    context.JWT_SECRET,
    { expiresIn: '1d' }
  );

  response.setBody({success: true, token: token});

  return callback(null, response);
};