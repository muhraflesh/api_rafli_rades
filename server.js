const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fileupload = require('express-fileupload')
const port = process.env.PORT || 3000;

app.use(require('sanitize').middleware);
app.use(fileupload())
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/storage'));

// var routes = require('./router/routes');
// routes(app);

app.use('/v2/project', require('./router/project'))
app.use('/v2/screening', require('./router/screen'))
app.use('/v2/user', require('./router/user'))
app.use('/v2/role', require('./router/role'))
app.use('/v2/document', require('./router/document'))
app.use('/v2/generateToken', require('./router/generatetoken'))
app.use('/v2/signUp', require('./router/signup'))
app.use('/v2/verification', require('./router/verification'))
app.use('/v2/signIn', require('./router/signin'))
app.use('/v2/signOut', require('./router/signout'))

app.listen(port);
console.log('Your API Server Started on : ' + port);