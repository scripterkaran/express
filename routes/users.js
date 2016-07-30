var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
//var User = require('.models/user')
var User = require('../models/user.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    //retrieve all users from Monogo
        User.find({}, function (err, users) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the userlist.jade file in the views folder. We are also setting "userlist" to be an accessible variable in our jade view
                    html: function(){
                        res.render('userlist', {
                              "userlist" : users
                          });
                    },
                    //JSON response will show all users in JSON format
                    json: function(){
                        res.json(infophotos);
                    }
                });
              }
        });
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

router.get(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function(req, res){
  var from = req.params[0];
  var to = req.params[1] || 'HEAD';
  res.send('commit range ' + from + '..' + to);
});

router.route('/users/:name').all(function(req, res, next) {
  // runs for all HTTP verbs first
  // think of it as route specific middleware!
  res.send('hello ' + req.params.name + '!');
  next();
})
.get(function(req, res, next) {
  res.json(req.user);
});

router.post('/adduser', function(req, res) {
    // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
    var name = req.body.name;
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    var password = req.body.userpassword;
    //call the create function for our database
    User.create({
        name : name,
        username: userName,
        email: userEmail,
        password: password
    }, function (err, user) {
          if (err) {
              res.send("There was a problem adding the information to the database.", err);
          } else {
              //User has been created
              console.log('POST creating new user: ' + user);
              res.format({
                  //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                html: function(){
                    // If it worked, set the header so the address bar doesn't still say /adduser
                    res.location("users");
                    // And forward to success page
                    res.redirect("/users");
                },
                //JSON response will show the newly created user
                json: function(){
                    res.json(user);
                }
            });
          }
    })
});

module.exports = router;
