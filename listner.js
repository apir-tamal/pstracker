const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());


app.all('/', function(req, res) {

    console.log('Incoming Request!', new Date().now());

    res.send('Ok');

});


app.listen((process.env.PORT || 8080), function() {
    console.log(`Example app listening on port ${(process.env.PORT || 8080)}!`);
})
