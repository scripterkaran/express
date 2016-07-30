var express = require('express');
var router = express.Router();

router.get('/login', function (req, res) {

    // render the page and pass in any flash data if it exists
    res.render('auth/login', {title: 'Login'});
});
router.post('/login', function (req, res) {
    res.redirect('/blog')
});

module.exports = router;