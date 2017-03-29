const express = require('express')
const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
    res.render('index');
})

app.listen((process.env.PORT || 5000), function() {
    console.log(`Example app listening on port ${(process.env.PORT || 5000)}!`);
})
