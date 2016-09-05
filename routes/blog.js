var express = require('express');
var router = express.Router();
var Blog = require('../models/blog');
var User = require('../models/user');
var multer = require('multer');
var Comment = require('../models/comment')
function fullUrl(req) {
    return req.protocol + '://' + req.get('host');
}


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/auth/login');
    }
}
router.get('/', function (req, res, next) {
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
                    for (i = 0; i < blogs.length; i++) {
                        if (blogs[i].cover) {
                            var array = blogs[i].cover.split('/'); // hack, to make it work right now.
                            var _simplified_array = array.shift();
                            console.log('array', array);
                            blogs[i].cover = fullUrl(req) + '/' + array.join('/')
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


router.get('/new', ensureAuthenticated, function (req, res) {
    res.render('blog/new', {title: 'New Blog'});
});


router.post('/new',ensureAuthenticated, multer({dest: './public/blog/cover', keepExtensions: true}).single('cover'), function (req, res) {
    // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
    var title = req.body.title;
    var content = req.body.content;
    var creator = req.user;
    console.log(req.file); //form files
    //call the create function for our database
    req.checkBody('title', 'Title is required.').notEmpty();
    req.checkBody('content', 'Content is required.').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('blog/new', {
            errors: errors
        });
    } else {
        var file = req.file.path;
        Blog.create({
            title: title,
            content: content,
            created_by: req.user,
            cover: file // this is fked up! Express has no auto handling here, not that I could find.
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

router.get('/:id', ensureAuthenticated, function (req, res, next) {
    Blog.findById({_id: req.params.id}).populate('created_by').exec(function (err, blog) {
        if (err) {
            return console.error(err);
        } else {
            //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
            Comment.find({blog: blog}).populate('created_by').exec(function (err, comments) {
                if (err) {
                    console.log('error at detail', err)
                } else {
                    res.format({
                        //HTML response will render the userlist.jade file in the views folder. We are also setting "userlist" to be an accessible variable in our jade view
                        html: function () {
                            res.render('blog/detail', {
                                "detail": blog,
                                "comments": comments
                            });
                        },
                        //JSON response will show all users in JSON format
                        json: function () {
                            res.json(blog);
                        }
                    });
                }
            })


        }
    });
});


function createComment(req, slug, blog, res) {
    Comment.create({
        slug: slug,
        created_by: req.user,
        blog: blog
    }, function (err, comment) {
        if (err) {
            console.log(err)
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
                    res.json(comment);
                }
            });
        }
    })


}
router.post('/:id/comments', function (req, res, next) {
    var slug = req.body.slug;
    var creator = req.user;
    var blog_id = req.params.id
    //call the create function for our database
    req.checkBody('slug', 'Comment is required.').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.render('blog-detail', { // how to pass ID here?
            errors: errors
        });
    } else {
        Blog.findById({_id: blog_id}).exec(function (err, blog) {
            if (err) {
                return console.error(err);
            } else {
                createComment(req, slug, blog, res)

            }
        })


    }


});

router.get('/:id/edit', function (req, res, next) {
    Blog.findById({_id: req.params.id}).populate('created_by').exec(function (err, blog) {
        if (err) {
            return console.error(err);
        } else {
            //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function () {
                    res.render('blog/edit', {
                        blog: blog
                    });
                },
                //JSON response will return the JSON output
                json: function () {
                    res.json(blog);
                }
            });
        }
    });
});

//POST to update a blog by ID
router.post('/:id/edit', function (req, res) {
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