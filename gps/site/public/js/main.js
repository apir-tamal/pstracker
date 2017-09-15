var map;
var devices = {};
var bounds;


function initialize(latLng) {
  var mapOptions = {
    center: latLng,
    zoom: 11
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
  bounds = new google.maps.LatLngBounds();
}

function autocenter(loc) {
  if (Object.keys(devices).length > 1) {
    bounds.extend(loc);
    map.fitBounds(bounds);
    map.panToBounds(bounds);
  } else {
    map.setZoom(15);
  }
}


google.maps.event.addDomListener(window, 'load', function() {

});

function displayData(device) {

  console.log('displayData', device);

  var value = device.data;

  var geocoder = new google.maps.Geocoder;
  geocoder.geocode({
    'location': {
      lat: parseFloat(value.gps.latitude),
      lng: parseFloat(value.gps.longitude)
    }
  }, function(results, status) {
    if (status === 'OK') {
      if (results[1]) {

        console.log(results[1].formatted_address);

        $ul = $('<ul class="displayData">');
        $ul.append($('<li>').html("<strong>Vehicle</strong><span>" + value.vehicle_name + " </span>"));
        $ul.append($('<li>').html("<strong>Device</strong><span>" + value.vehicle_model + " </span>"));
        $ul.append($('<li>').html("<strong>IMEI</strong><span>" + value.device_imei + " </span>"));
        $ul.append($('<li>').html("<strong>SIM</strong><span>" + value.device_mobile + " </span>"));
        $ul.append($('<li>').html("<strong>Mileage</strong><span>" + value.mileage + " km/ltr </span>"));
        $ul.append($('<li>').html("<strong>Status</strong><span>" + (value.gps.speed > 0 ? 'ON' : 'OFF') + "</span>"));
        $ul.append($('<li>').html("<strong>Latitude</strong><span>" + value.gps.latitude + " </span>"));
        $ul.append($('<li>').html("<strong>Longitude</strong><span>" + value.gps.longitude + " </span>"));
        $ul.append($('<li>').html("<strong>Address</strong><span>" + results[1].formatted_address + " </span>"));
        $ul.append($('<li>').html("<strong>Last Updated</strong><span>" + value.gps.updated_ist + " </span>"));
        $(".data").html($ul);

      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });

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
    title: data.vehicle_name + '\nUID: ' + uid,
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
      autocenter(position);

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
      autocenter(position);
    }
  });

});
