'use strict';

var express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    t = require('./mahoa'),
    app =  express(),
    config = require('./config');

// config view engine
app.set('view engine', 'ejs');

//
app.use(express.static(__dirname + '/public'));

// middleware config
app.use(bodyParser.urlencoded({ extended: false}));

// Using session base on session
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'Scecret key'
}));


app.use(function(req, res, next) {
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    
    res.locals.message = '';
    
    if(err) res.locals.message = '<p class="alert alert-danger">' + err + '</p>';
    if(msg) res.locals.message = '<p class="alert alert-success">' + msg + '</p>';
    
    next();
    
});

t.encrypt('admin', function(err, salt, hash) {
    if(err) throw err;
    
    config.users.nodejsvn.salt = salt;
    config.users.nodejsvn.hash = hash;
    
    // console.log(config.users);
    
    // console.log('salt is: ' + salt);
    // console.log('hash is:  ' + hash );
});


var authen = require('./authen');

app.get('/login', function(req, res, next) {
    res.render('login');
});

app.post('/login', function(req, res){
    authen.auth(req.body.username,req.body.password,config.users, function(err, user) {
        if(user) {
            req.session.regenerate(function()  {
                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.name
                + ' click to <a href="/logout"> logout</a>. '
                + ' You may now access <a href="/admin">/admin</a>.';
                res.redirect('back');
            });
        } else {
            req.session.error = 'Authentication failed, please check your '
            + 'username and password. '
            + ' (user "nodejsvn" and pass "admin")';
            res.redirect('/login');
        }
    });
});

app.get('/logout', function(req, res) {
    req.session.destroy(function() {
        res.redirect('/');
    });
});

app.listen(config.port, function() {
    console.log('Express started on port ' + config.port);
});
