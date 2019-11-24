var express = require('express');
var bodyParser = require('body-parser');
//var controller = require('./controller');
var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// var routes = require('./router/routes');
// routes(app);

app.use('/project', require('./router/project'))
app.use('/user', require('./router/screen'))

app.listen(port);
console.log('Your API Server Started on : ' + port);