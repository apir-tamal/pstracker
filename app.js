const express = require('express')
const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs')

app.get('/', function(req, res) {


    function ddlat(lat) {
        let deg = lat.toString().slice(0, 2);
        let min = lat.toString().slice(2) / 60;
        let d = parseFloat(deg) + parseFloat(min);
        return d.toFixed(4);

    }
    // Convert dddmm.mmmm to degrees decimal
    function dddlong(long) {
        let deg = long.toString().slice(0, 3);
        let min = long.toString().slice(3) / 60;
        let e = parseFloat(deg) + parseFloat(min);
        return e.toFixed(4);
    }

    let lat = '2234.0297';
    let long = '11405.9101';

    // console.log('lat', ddlat(lat), );
    // console.log('long', dddlong(long));


    res.render('index', {
        lat: ddlat(lat),
        long: dddlong(long)
    });
})

app.listen((process.env.PORT || 5000), function() {
    console.log(`Example app listening on port ${(process.env.PORT || 5000)}!`);
})
