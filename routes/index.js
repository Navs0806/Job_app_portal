var express = require('express');
var router = express.Router();
var session = require('express-session');
var sess;

router.get('/', function(req, res){
    res.render('index', {style: "/css/home.css"});
});

router.get('/register', function(req, res){
    res.render('register', {style: "/css/register.css"});
});

router.post('/register', function(req, res){
    var info = { firstname: req.body.firstname,
                 lastname: req.body.lastname,
                 username: req.body.username,
                 email: req.body.email,
                 gender: req.body.gender,
                 password: req.body.password
                };
    //form validation
    req.checkBody('firstname', 'First name is required.').notEmpty();
    req.checkBody('lastname', 'Last name is required.').notEmpty();
    req.checkBody('username', 'Username is required.').notEmpty();
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Email is not valid.').isEmail();
    req.checkBody('password', 'Password is required.').notEmpty();
    req.checkBody('re_password', 'Passwords do not match.').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
    	res.render('register', {style: "/css/register.css", errors : errors});
    }
    else{
        var userData = require('../models/userData');
        var flag = true;
        userData.find().then(function(doc){    //checking if the username entered is already taken
          for(var i=0; i<doc.length; i++){
            if(info.username == doc[i].username){
            flag = false;
            }
          }
          if(flag){             //registering user if the username is not already taken
            var user = new userData(info);
            user.save();
            res.render('login', {style: "/css/home.css", string2: "Registration successful! You can now login to your account."});
          }
          else{
            res.render('register', {style: "/css/register.css", errors : [{msg: "This username is already taken. Choose another."}]});
          }
        });      
    }

});

router.get('/login', function(req, res){
    sess = req.session;
    if(sess.name){
      res.redirect('/redirects');  //redirecting to the respective account if session is active
    }
    else{
      res.render('login', {style: "/css/home.css"});
    }
});

router.post('/login', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
   sess = req.session;

    var userData = require('../models/userData');

    userData.find().then(function(doc){
       var i;
       var flag = false;
       for(i=0; i<doc.length; i++){        //checking if a user with the entered credentials exists in the database
        if(doc[i].username == username && doc[i].password == password){  
          sess.name = doc[i]._id;
          flag = true;
        	break;
        }
       }
       if(username == 'admin' && password == 'admin'){
        sess.name = 'admin';     //checking if the user is the admin
        flag = true;
       }
       if(!flag){      //if credentials entered do not belong to any user
        res.render('login', {style: "/css/home.css", string: "Username or password is incorrect."});
       }
       else{
        res.redirect('/redirects');
       }
    });

});
router.get('/logout', function(req, res){
  req.session.destroy(function(err){
    if(err){
      console.log(err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
