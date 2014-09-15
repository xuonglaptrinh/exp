'use strict';

var cr = require('../mahoa');

module.exports = function() {
    var authen = function(name, pass, users, fn) {
        var user = users[name];
        
        if(!user) return fn(new Error('Cannot find user'));
        
        cr.decrypt(pass, user.salt, function(err, hash) {
            if(hash === user.hash) return fn(null, user);
        });
    };
    
    return {
        auth : authen
    };
}();
