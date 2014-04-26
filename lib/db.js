var mongoClient = require('mongodb').MongoClient,
    _ = require('underscore');

function connectToDb(callback) {
    mongoClient.connect('mongodb://127.0.0.1:7275/explainit', function (err, db) {
        if(err) {
            throw err;
        }
        callback(db);
    });
}

exports.insertTags = function (tags, callback) {
    var tagsLeft = tags.length;
    connectToDb(function (db) {
        var tagsCollection = db.collection('tags');
        tags.forEach(function (tag) {
            tagsCollection.insert({ name: tag }, function (err, tags) {
                --tagsLeft;
                if(!tagsLeft) {
                    callback(err, tags);
                    db.close();
                }
            });
        });
    });
};

exports.insertVideo = function (video, callback) {
    connectToDb(function (db) {
        var videosCollection = db.collection('videos');
        videosCollection.insert(video, function (err, video) {
            callback(err, video);
            db.close();
        });
    });
};

exports.retrieveVideos = function (tags, callback) {
    connectToDb(function (db) {
        var videosCollection = db.collection('videos'),
            result = [];
        videosCollection.find({tags: { $in : tags }}).toArray(function (err, videos){
            callback(err, videos);
        });
    });
};

exports.retrieveTags = function (callback) {
    connectToDb(function (db) {
        var tagsCollection = db.collection('tags');
        tagsCollection.find().toArray(function (err, tags) {
            callback(err, { tags: tags });
            db.close();
        });
    });
};

exports.updateRating = function (url, rating, callback) {
    connectToDb(function (db) {
        var videosCollection = db.collection('videos'),
            video = videosCollection.findOne({url: url}, function (err, video) {
                var ratees = video.ratees,
                    currentRating = video.rating,
                    newRating = ratees/(ratees + 1) * currentRating + 1/(ratees+1) * rating;

                videosCollection.update({ url: url }, {$set: {rating: newRating, ratees: ratees + 1}}, function (err, updated) {
                    if(err) {
                        callback(err, updated);
                    } else {
                        videosCollection.findOne({url: url}, function (err, video) {
                            callback(err, video);
                        });
                    }
                });
            });
    });
};
