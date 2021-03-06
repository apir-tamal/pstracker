var gps = require("gps-tracking");
var express = require('express');
var app = express();
var server = app.listen(8080);
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var moment = require('moment-timezone');

var mongourl = 'mongodb://localhost:27017/gps_server';

var options = {
    'debug': false, //We don't want to debug info automatically. We are going to log everything manually so you can check what happens everywhere
    'port': 10066,
    'device_adapter': "TK103"
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('site/public'));
app.set('view engine', 'ejs')


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/site/index.html');
});

app.get('/add-device', function(req, res) {
    res.sendFile(__dirname + '/site/add-device.html');
});

function toIST(date) {
    var kdate = moment.tz(date, "Asia/Kolkata");
    return kdate.format('DD-MM-YYYY hh:mm a');
}

MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to mongo DB server");

    var collection = db.collection('devices');

    io.on('connection', function(socket) {
        collection.find({}).toArray(function(err, docs) {
            assert.equal(err, null);
            socket.emit('positions', docs);
        });
    });

    // Post
    app.post('/add-device', function(req, res) {
        if (!!req.body && req.body.device_mobile.match('[0-9]{10}')) {

            collection.insert(req.body, function(err, result) {
                if (err) {
                    if (err.code === 11000) {
                        res.status(200).json({
                            message: 'Duplicate device imei!'
                        });
                    } else {
                        res.status(200).json({
                            message: 'Server Error!'
                        });
                    }

                } else {
                    res.status(200).json({
                        message: `!!!Device successfully added!!! \n Send following SMS to +91${req.body.device_mobile}: \n "begin123456" \n "apn123456airtelgprs.com" \n "ip139.59.94.153port10066" \n "number${req.body.device_mobile}" \n "web123456" \n "tracker123456"`
                    });
                }
            });
        }
    });

    app.get('/active-device', function(req, res) {
        collection.find({}).toArray(function(err, result) {
            if (err) {
                return console.log(err);
            }
            // renders index.ejs
            res.render(__dirname + '/site/active-device.ejs', {
                device: result
            })
        })
    });

    // Server

    var server = gps.server(options, function(device, connection) {

        device.on("connected", function(data) {

            console.log("I'm a new device connected");
            return data;

        });

        device.on("login_request", function(device_id, msg_parts) {

            console.log('Hey! I want to start transmiting my position. Please accept me. My name is ' + device_id);

            this.login_authorized(true);

            console.log("Ok, " + device_id + ", you're accepted!");

        });


        device.on("ping", function(data) {
            // parse data
            data.updated_ist = toIST(data.inserted);
            data.uid = this.getUID().replace(/[^0-9 ]/g, "");
            data.uid = data.uid.replace(/^0+/, '');

            io.emit('ping', data);

            // this = device
            console.log("I'm here: " + data.latitude + ", " + data.longitude + " > " + data.uid + " (" + this.getUID() + ")");

            var gpsData = data;

            collection.updateOne({
                device_imei: gpsData.uid
            }, {
                $set: {
                    gps: gpsData
                }
            }, function(err, result) {
                // console.log(err, result);
            });

            //Look what informations the device sends to you (maybe velocity, gas level, etc)
            //console.log(data);
            return data;

        });

        device.on("alarm", function(alarm_code, alarm_data, msg_data) {
            console.log("Help! Something happend: " + alarm_code + " (" + alarm_data.msg + ")");
        });

        //Also, you can listen on the native connection object
        connection.on('data', function(data) {
            //echo raw data package
            //console.log(data.toString());
        })

    });
});
