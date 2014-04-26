var mongoClient = require('mongodb').MongoClient;

function connectToDb(callback) {
    mongoClient.connect('mongodb://127.0.0.1:7275/explainit', function (err, db) {
        if(err) {
            throw err;
        }
        callback(db);
    });
}

exports.insertTag = function (tagName, callback) {
    connectToDb(function (db) {
        var tagsCollection = db.collection('tags');
        tagsCollection.insert({ name: tagName }, function (err, docs) {
            callback(err, docs);
            db.close();
        });
    });
};

exports.retrieveTags = function (callback) {
    connectToDb(function (db) {
        var tagsCollection = db.collection('tags');
        tagsCollection.find().toArray(function (err, results) {
            callback(err, results);
            db.close();
        });
    });
};
