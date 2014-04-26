'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    db = require('./db'),
    app = express();

app.use(bodyParser());

app.post('/tag', function (req, res) {
    var tag = req.body.tag;
    db.insertTag(tag, function (err, docs) {
        if(err) {
            res.send(500);
        } else {
            res.json(docs);   
        }
    });
});


app.get('/tags', function (req, res) {
    res.json({
        'tags': ['analysis', 'algebra', 'numerical analysis', 'system programming', 'OOP']
    });
});

app.get('/videos', function (req, res) {
    var tags = req.query.tags;
    console.log('tags given are ' + JSON.stringify(tags));
    res.json({
        'videos': [
            {
                'url': 'youtube.com/watch?v=s86K-p089R8&feature=kp',
                'id': '1337'
            }, {
                'url': 'www.youtube.com/watch?v=Q8Tiz6INF7I',
                'id': '1338'
            }]
    });
});

app.post('/video', function (req, res) {
    var tags = req.body.tags;
    console.log('tags given are ' + JSON.stringify(tags));
    res.json({
        'url': 'youtube.com/watch?v=s86K-p089R8&feature=kp',
        'id': '1337'
    });
});


app.put('/rating', function (req, res) {
    var rating = req.body.rating,
        videoId = req.body.videoId;

    console.log('posted rating is ' + rating);
    res.json({
        'rating': '4.77',
        'id': videoId
    });
});

app.get('/rating', function (req, res) {
    var videoId = req.query.id;

    res.json({
        'id': videoId,
        'rating': '4.77'
    });
});

app.listen(8080);
