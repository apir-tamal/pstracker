var map;
var devices = {};


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

function displayData(device) {
    console.log('displayData', device);
    var value = device.data;
    $ul = $('<ul class="displayData">');

    $ul.append($('<li>').html("<strong>Vehicle</strong><span>" + value.vehicle_name + "</span>"));
    $ul.append($('<li>').html("<strong>Device</strong><span>" + value.vehicle_model + "</span>"));
    $ul.append($('<li>').html("<strong>IMEI</strong><span>" + value.device_imei + "</span>"));
    $ul.append($('<li>').html("<strong>SIM</strong><span>" + value.device_mobile + "</span>"));
    $ul.append($('<li>').html("<strong>Mileage</strong><span>" + value.mileage + " km/ltr</span>"));
    $ul.append($('<li>').html("<strong>Status</strong><span>" + (value.gps.speed > 0 ? 'ON' : 'OFF') + "</span>"));
    $ul.append($('<li>').html("<strong>Latitude</strong><span>" + value.gps.latitude + " </span>"));
    $ul.append($('<li>').html("<strong>Longitude</strong><span>" + value.gps.longitude + " </span>"));

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
    if (!!data) {
        console.log('ping', data);

        var device = getDevice(data.uid);
        if (!!device) {

            var position = new google.maps.LatLng(data.latitude, data.longitude);
            device.marker.setPosition(position);

            socket.emit('PONG');
        }
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
