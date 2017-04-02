const express = require('express')
const app = express()


app.get('/', function(req, res) {

    console.log('Incoming Request!');
    console.log(req.body);

    res.send('Ok');

})

app.listen((process.env.PORT || 8080), function() {
    console.log(`Example app listening on port ${(process.env.PORT || 8080)}!`);
})
