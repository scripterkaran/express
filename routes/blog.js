var express = require('express');
var router = express.Router();
var Blog = require('../models/blog.js');
var User = require('../models/user');
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/auth/login');
    }
}
router.get('/',ensureAuthenticated, function (req, res, next) {
    Blog.find({}).populate('created_by').exec(function (err, blogs) {
        if (err) {
            return console.error(err);
        } else {
            //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
            res.format({
                //HTML response will render the userlist.jade file in the views folder. We are also setting "userlist" to be an accessible variable in our jade view
                html: function () {
                    for (i = 0; i < blogs.length; i++) {
                        if (blogs[i].content.length > 300) {
                            blogs[i].content = blogs[i].content.substring(0, 300)
                        }
                    }


                    res.render('blog/list', {
                        "list": blogs
                    });
                },
                //JSON response will show all users in JSON format
                json: function () {
                    res.json(infophotos);
                }
            });
        }
    });
});


router.get('/new',ensureAuthenticated, function (req, res) {
    console.log('req', req);
    res.render('blog/new', {title: 'New Blog'});
});


router.post('/new',ensureAuthenticated, function (req, res) {
    // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
    var title = req.body.title;
    var content = req.body.content;
    var creator = req.user;
    //call the create function for our database
    req.checkBody('title', 'Title is required.').notEmpty();
    req.checkBody('content', 'Content is required.').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('blog/new', {
            errors: errors
        });
    } else {
        Blog.create({
            title: title,
            content: content,
            created_by: req.user
        }, function (err, blog) {
            if (err) {
                res.send("There was a problem adding the information to the database.", err);
            } else {
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function () {
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("blog");
                        // And forward to success page
                        res.redirect("/blog");
                    },
                    //JSON response will show the newly created user
                    json: function () {
                        res.json(blog);
                    }
                });
            }
        })
    }


});

router.get('/:id',ensureAuthenticated, function (req, res, next) {
    Blog.findById({_id: req.params.id}).populate('created_by').exec(function (err, blog) {
        if (err) {
            return console.error(err);
        } else {
            //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
            res.format({
                //HTML response will render the userlist.jade file in the views folder. We are also setting "userlist" to be an accessible variable in our jade view
                html: function () {
                    res.render('blog/detail', {
                        "detail": blog
                    });
                },
                //JSON response will show all users in JSON format
                json: function () {
                    res.json(blog);
                }
            });
        }
    });
});

router.get('/:id/edit',ensureAuthenticated, function (req, res, next) {
    Blog.findById({_id: req.params.id}).populate('created_by').exec(function (err, blog) {
        if (err) {
            return console.error(err);
        } else {
            //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('blog/edit', {
                          blog : blog
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(blog);
                 }
            });
        }
    });
});

//POST to update a blog by ID
router.post('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var title = req.body.title;
    var content = req.body.content;

   //find the document by ID
        Blog.findById({_id: req.params.id}).populate('created_by').exec(function (err, blog) {
            if (err) {
                return console.error(err);
            } else {
                //update it
                blog.update({
                    title: title,
                    content: content
                }, function (err) {
                    if (err) {
                        res.send("There was a problem updating the information to the database: " + err);
                    }
                    else {
                        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                        res.format({
                            html: function () {
                                res.redirect("/blog/" + blog._id);
                            },
                            //JSON responds showing the updated values
                            json: function () {
                                res.json(blog);
                            }
                        });
                    }
                })
            }
        });
});

module.exports = router;