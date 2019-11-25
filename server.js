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

app.use('/project', require('./router/project'))
app.use('/user', require('./router/screen'))
app.use('/user', require('./router/user'))
app.use('/role', require('./router/role'))
app.use('/document', require('./router/document'))
app.use('/generateToken', require('./router/generatetoken'))
app.use('/signUp', require('./router/signup'))
app.use('/verification', require('./router/verification'))
app.use('/signIn', require('./router/signin'))

app.listen(port);
console.log('Your API Server Started on : ' + port);