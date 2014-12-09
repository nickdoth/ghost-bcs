// Baidu BCS support
// Author: nickdoth (nick.doth@gmail.com)

var _       = require('lodash'),
    express = require('express'),
    fs      = require('fs-extra'),
    path    = require('path'),
    util    = require('util'),
    utils   = require('../utils'),
    Promise = require('bluebird'),
    config = require('../config'),
    errors  = require('../errors'),
    baseStore   = require('./base'),
    crypto = require('crypto'),

    BCS        = require('baidu-bcs'),
    bcsConfig  = config.storage;

var bcs = BCS.createClient({
    accessKey: bcsConfig.ACCESS_KEY,
    secretKey: bcsConfig.SECRET_KEY
});

var putObject = bcs.putObject.bind(bcs);

function BcsStore () {
    
}

util.inherits(BcsStore, baseStore);

BcsStore.prototype.save = function (image) {
    var md5sum = crypto.createHash('md5'),
        ext = path.extname(image.name),
        targetDirRoot = bcsConfig.root,
        targetFilename;
        // key;
        // extra = new qiniu.io.PutExtra();

    

    var savedpath = path.join(config.paths.imagesPath, image.name);

    return Promise.promisify(fs.copy)(image.path, savedpath).then(function(){
        return Promise.promisify(fs.readFile)(savedpath);
    }).then(function(data){
        md5 = md5sum.update(data).digest('hex');

        targetFilename = path.join(targetDirRoot, md5.replace(/^(\w{1})(\w{2})(\w+)$/, '$1/$2/$3')) + ext;
        targetFilename = targetFilename.replace(/\\/g, '/');

        return Promise.promisify(putObject)({
            bucket: bcsConfig.bucketname,
            object: targetFilename,
            // acl: 'public-read'
            source: data,
            headers: {
                'x-bs-acl': 'public-read'
            }
        });
    }).then(function() {
        // Remove temp file
        return Promise.promisify(fs.unlink)(savedpath);
    }).then(function () {
        // prefix + bucketname + targetFilename
        var fullUrl = bcsConfig.prefix + bcsConfig.bucketname + '/' + targetFilename;
        
        // generate MBO Sign
        var sign = bcs.generateSign({
            method: 'GET',
            bucket: bcsConfig.bucketname,
            object: '/' + targetFilename
        });

        console.log('fullUrl:', fullUrl + '?sign=' + sign)
        return fullUrl + '?sign=' + sign;
    }).catch(function (e) {
        errors.logError(e);
        return Promise.reject(e);
    });
};

BcsStore.prototype.exists = function (filename) {
    return new Promise(function (resolve) {
        fs.exists(filename, function (exists) {
            resolve(exists);
        });
    });
};

BcsStore.prototype.serve = function (){
    // For some reason send divides the max age number by 1000
    return express['static'](config.paths.imagesPath, {maxAge: utils.ONE_YEAR_MS});
};

module.exports = BcsStore;