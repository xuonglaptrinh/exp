'use strict';

var crypto = require('crypto'),
    len = 128,
    iterations = 12000;

module.exports = function() {
    
    var encrypt = function(pwd, salt, fn) {
        fn = salt;
        crypto.randomBytes(len, function(err, salt) {
            if(err) throw err;
            salt = salt.toString('base64');
            
            crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash) {
                if (err) return fn(err);
                fn(null, salt, hash.toString('base64'));
            });
        });
    };
    
    var decrypt = function(pwd, salt, fn) {
        crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash) {
            // if (err) throw err;
            fn(err, hash.toString('base64'));
        });
    };
    
    return {
        encrypt: encrypt,
        decrypt: decrypt
    };
}();
