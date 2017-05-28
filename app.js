var express = require('express');
var app = express();
var path = require('path');
var hbs = require('express-handlebars');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({secret:'dvnsda£($&%hvjfnvcs)($$f', saveUninitialized: true, resave: true}));

var mongoose = require('mongoose');

app.set('views', __dirname + '/views/');
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('view engine', 'hbs');

var index = require('./routes/index');
var redirects = require('./routes/redirects');
var admin = require('./routes/admin');

app.use(express.static(path.join(__dirname, 'public')));

app.listen(1337, function(){
    console.log('listening');
});

app.use('/', index);
app.use('/redirects/admin', admin);
app.use('/redirects', redirects);

