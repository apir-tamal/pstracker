const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.text());

app.all('/', function(req, res) {

    console.log('Incoming Request!', Date.now(), req.body);

    res.send('Ok');

});


app.listen((process.env.PORT || 8080), function() {
    console.log(`Example app listening on port ${(process.env.PORT || 8080)}!`);
})
