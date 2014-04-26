'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    exec = require('child_process').exec,
    fs = require('fs'),
    uuid = require('node-uuid'),
    db = require('./db'),
    app = express();

app.use(bodyParser());

app.post('/tags', function (req, res) {
    var tags = JSON.parse(req.body.tags);
    db.insertTags(tags, function (err, tags) {
        if(err) {
            res.send(500);
        } else {
            res.json(tags);
        }
    });
});

app.get('/tags', function (req, res) {
    db.retrieveTags(function (err, tags) {
        if(err) {
            res.send(500);
        } else {
            res.json(tags);
        }
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
    //form data mapping with video key corresponding to the video file should be sent
    var tags = JSON.parse(req.body.tags),
        file = req.files.video,
        filePath = file.path,
        title = req.body.title,
        description = req.body.description,
        questions = JSON.parse(req.body.questions),
        tmpFile = getTempFilePath();

    fs.readFile(filePath, function(err, data) {
        fs.writeFile(tmpFile, data, function (err) {
            if(err) {
                console.dir(err);
                res.send(500);
            } else {
                uploadVideo(tmpFile, title, description, tags.join(','), function (err, stdout, stderr) {
                    if(err) {
                        console.dir(err);
                        res.send(500);
                    } else {
                        var output = stdout.replace(/\n/g, ''),
                            index = output.indexOf('video id: '),
                            id = output.substring(index + 'video id: '.length, output.indexOf(')', index));

                        db.insertVideo({
                            url: 'https://youtube.com/watch?v=' + id,
                            title: title,
                            description: description,
                            tags: tags,
                            questions: questions
                        }, function (err, video) {
                            if(err) {
                                console.dir(err);
                                res.send(500);
                            } else {
                                res.json(video);
                            }
                        });
                    }
                });
            }
        });
    });
});

app.put('/rating', function (req, res) {
    var rating = req.body.rating,
        videoId = req.body.videoId;

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

function getTempFilePath() {
    return './tmp/' + uuid.v1() + '.mp4';
}

function uploadVideo(file, title, description, tags, callback) {
    exec('python upload_video.py --file="' + file + '" --title="' + title + '" --description="' + description + '" --keywords="' + tags.join(',') + '" --category="22" --privacyStatus="public"', callback);
}

app.listen(8080);
