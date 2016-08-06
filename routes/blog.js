var express = require('express');
var router = express.Router();
var Blog = require('../models/blog.js');

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/auth/login');
	}
}
router.get('/', ensureAuthenticated, function(req, res, next) {
    Blog.find({}, function (err, blogs) {
          if (err) {
              return console.error(err);
          } else {
              //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
              res.format({
                  //HTML response will render the userlist.jade file in the views folder. We are also setting "userlist" to be an accessible variable in our jade view
                html: function(){
                    for (i = 0; i < blogs.length; i++) {
                        if (blogs[i].content.length > 300){
                            blogs[i].content = blogs[i].content.substring(0, 300)
                        }
                    }
                    res.render('blog/list', {
                          "list" : blogs
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


router.get('/new', function(req, res) {
    console.log('req', req )
    res.render('blog/new', { title: 'New Blog' });
});


router.post('/new', function(req, res) {
    // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
    var title = req.body.title;
    var content = req.body.content;
    var creator = req.user
    //call the create function for our database
    Blog.create({
        title : title,
        content: content,
        created_by: req.user
    }, function (err, blog) {
          if (err) {
              res.send("There was a problem adding the information to the database.", err);
          } else {
              //User has been created
              console.log('POST creating new Blog: ' + blog);
              res.format({
                  //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                html: function(){
                    // If it worked, set the header so the address bar doesn't still say /adduser
                    res.location("blog");
                    // And forward to success page
                    res.redirect("/blog");
                },
                //JSON response will show the newly created user
                json: function(){
                    res.json(blog);
                }
            });
          }
    })
});

router.get('/:id', function(req, res, next) {
    Blog.findById({_id: req.params.id }, function (err, blog) {
          if (err) {
              return console.error(err);
          } else {
              //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
              res.format({
                  //HTML response will render the userlist.jade file in the views folder. We are also setting "userlist" to be an accessible variable in our jade view
                html: function(){
                    res.render('blog/detail', {
                          "detail" : blog
                      });
                },
                //JSON response will show all users in JSON format
                json: function(){
                    res.json(blog);
                }
            });
          }
    });
});
module.exports = router;