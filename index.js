'use strict';

var express = require('express'),
    app =  express();

// config view engine
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));


app.get('/login', function(req, res, next) {
    res.render('login');
});

app.post('/login', function(req, res){
    
});

app.listen(8008, function() {
    console.log('Express started on port ' + 8008);
});
