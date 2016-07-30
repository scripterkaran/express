var express = require('express');
var router = express.Router();
var Blog = require('../models/blog.js');


router.get('/', function(req, res, next) {
    Blog.find({}, function (err, blogs) {
          if (err) {
              return console.error(err);
          } else {
              //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
              res.format({
                  //HTML response will render the userlist.jade file in the views folder. We are also setting "userlist" to be an accessible variable in our jade view
                html: function(){
                    res.render('bloglist', {
                          "bloglist" : blogs
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

module.exports = router