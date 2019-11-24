const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fileupload = require('express-fileupload')
const port = require('./config/server.json').port
const host = require('./config/server.json').host

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

app.listen(port);
console.log('Your API Server Started on : ' + port);