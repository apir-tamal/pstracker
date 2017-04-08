var map;
var devices = {}


function initialize(latLng) {
    var mapOptions = {
        center: latLng,
        zoom: 11
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
}


google.maps.event.addDomListener(window, 'load', function() {

});

function displayData(data) {
    console.log('displayData', data);
    $ul = $('<ul>');
    $.each(data, function(index, value) {
        $ul.append($('<li>').html("<strong>" + index + "</strong><span>" + value + "</span>"));
    });

    $(".data").html($ul);
}

function getDevice(uid) {
    return devices[uid] || null;
}

function checkIfMapExists(latLng) {
    if (!map) {
        initialize(latLng);
    }
}

function addDevice(data, latLng) {
    var uid = data.gps.uid;
    checkIfMapExists(latLng);

    var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        animation: google.maps.Animation.DROP,
        title: 'UID: ' + uid,
        uid: uid

    });

    marker.setMap(map);

    google.maps.event.addListener(marker, 'click', function() {
        var deviceData = getDevice(this.uid);
        displayData(deviceData);
    });

    devices[uid] = {
        data: data,
        marker: marker,
        path: null
    }

    return devices[uid];
}

function checkIfDeviceExists(data) {
    var uid = data.gps.uid;

    if (typeof devices[uid] == "undefined") {
        return addDevice(data, new google.maps.LatLng(data.gps.latitude, data.gps.longitude));
    }

    return devices[uid];
}

var socket = io.connect(window.location.host);
socket.on('ping', function(data) {
    console.log('ping', data);
    var device = getDevice(data.uid);
    if (!!device) {

        var position = new google.maps.LatLng(data.latitude, data.longitude);
        device.marker.setPosition(position);

        socket.emit('PONG');
    }
});

socket.on('positions', function(data) {
    var device;

    console.log('positions', data);

    $.each(data, function(index, value) {
        if (!!value.gps) {
            device = checkIfDeviceExists(value);
            var position = new google.maps.LatLng(value.gps.latitude, value.gps.longitude);
            device.marker.setPosition(position);
        }
    });

});
