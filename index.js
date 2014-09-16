'use strict';

var express = require('express'),
//    hash = require('./pass').hash,
    bodyParser = require('body-parser'),
    session = require('express-session'),
    config = require('./config'),
    t = require('./mahoa'),
    app =  express(),
    username;



// config
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'Secret key'
}));

// Session-persisted message middleware
app.use(function(req, res, next){
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="alert alert-danger">' + err + '</p>';
    if (msg) res.locals.message = '<p class="alert alert-success">' + msg + '</p>';
    next();
});


t.encrypt('admin', function(err, salt, hash){
    if (err) throw err;
    config.users.nodejsvn.salt = salt;
    config.users.nodejsvn.hash = hash;
    // console.log(config.users);
});


var authen = require('./authen');

function restrict(req, res, next) {
    if (req.session.user) {
        username = req.session.user;
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

app.get('/', function(req, res){
    res.redirect('/login');
});

app.get('/admin', restrict, function(req, res){
    res.send('This is admin area as ' + username.name + ' click to <a href="/logout">logout</a>');
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        res.redirect('/');
    });
});

app.get('/login', function(req, res, next) {
    res.render('login');
});

app.post('/login', function(req, res){
    authen.auth(req.body.username, req.body.password, config.users,function(err, user){
        if (user) {
            
            req.session.regenerate(function(){
                
		req.session.user = user;
                req.session.success = 'Authenticated as ' + user.name
                    + ' click to <a href="/logout">logout</a>. '
                    + ' You may now access <a href="/admin">/admin</a>.';
                res.redirect('back');
            });
        } else {
            // console.log(err);
            req.session.error = 'Authentication failed, please check your '
                + ' username and password.'
                + ' (user "nodejsvn" and "admin")';
            res.redirect('/login');
        }
    });
});

app.listen(config.port, function() {
    console.log('Express started on port ' + config.port);
});
