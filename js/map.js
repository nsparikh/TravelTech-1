// vars
var geocoder;
var map;
var infoWindow;
var R = 6371; // earth's radius in km

var blueMarkersArray = [];
var redMarker;
var curCircle;
var circleCenter;

// hardcoded data
var latlngArray = [[42.3584308,-71.0597732],[52.519171,13.4060912],[39.904214,116.407413],
									 [40.7143528, -74.0059731], [39.7685155, -86.15807359999997], [-14.235004, -51.92527999999999],
									 [-27.9676330451834, 123.85597000000007], [19.090764978079267, 72.87940750000007]];
var names = ['Yuchen', 'Timmy', 'Neena', 'Sam', 'Mike', 'Emily', 'Phil', 'Sarah'];
var startDates = ['June 3rd, 2012','July 14th, 2012','August 1st, 2012','June 15th, 2012','July 26th, 2012',
									'July 30th, 2012','August 15th, 2012','August 17th, 2012'];
var endDates = ['June 16th, 2012','July 18th, 2012','August 5th, 2012','July 29th, 2012','July 30th, 2012',
								'August 13th, 2012','August 19th, 2012','August 29th, 2012'];


// blue marker icon
var blueIcon = "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png";



// map
function initializeMap() {
	var mapOptions = {
		center: new google.maps.LatLng(36.18, -71.13),
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map_container'), mapOptions);

	geocoder = new google.maps.Geocoder();


	// Autocomplete
	var input = document.getElementById('destination_field');
	var autocomplete = new google.maps.places.Autocomplete(input);
		
	// Circle overlay
	circleCenter = new google.maps.LatLng(36.18, -71.13);
	var circleOptions = {
		center: circleCenter,
		fillColor: "gray",
		fillOpacity: 0.3,
		map: map,
		radius: Math.pow(10,6),
		strokeColor: "gray",
		strokeOpacity: 0.3
	}			
	var circle = new google.maps.Circle(circleOptions);
	curCircle = circle;

	// Add new marker
	var marker = new google.maps.Marker({
		map: map,
		position: circleCenter,
		draggable: true,
		clickable: true
	});
	redMarker = marker;			
	addRedMarkerListener(marker);

	
	// Add blue markers for other people
	addOtherPeople();

	
}

function addOtherPeople() {
	for (var i=0; i < latlngArray.length; i++) {
		var marker = new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng(latlngArray[i][0],latlngArray[i][1]),
			draggable: false,
			clickable: true,
			icon: blueIcon
		});
		blueMarkersArray.push(marker);
		addBlueMarkerListener(marker, i);
	} 
}


// Helper functions to clear map overlays
function clearRedMarker() {
	redMarker.setMap(null);			
}
function clearCircle() {
	if (curCircle != null) {
		curCircle.setMap(null);
	}
}
function clearBlueMarker(index) {
	blueMarkersArray[index].setVisible(false);
}
function showBlueMarker(index) {
	blueMarkersArray[index].setVisible(true);
}
function showAll() {
	for (var i=0; i < latlngArray.length; i++) {
		blueMarkersArray[i].setVisible(true);
	}
}



// geocode
function geocodeAddress() {
	var location = $('input[name="destination"]').val();
	
	geocoder.geocode({'address': location}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			circleCenter = results[0].geometry.location;
		
			map.setCenter(results[0].geometry.location);
			map.setZoom(7);

			// Clear old marker
			clearRedMarker();

			// Add new marker
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location,
				draggable: true,
				clickable: true
			}); 
			redMarker = marker;					
			addRedMarkerListener(marker);

			// Reset circle
			clearCircle();
			var circleOptions = {
				center: circleCenter,
				fillColor: "gray",
				fillOpacity: 0.3,
				map: map,
				radius: 200000,
				strokeColor: "gray",
				strokeOpacity: 0.3
			}
			var circle = new google.maps.Circle(circleOptions);
			curCircle = circle;	
			document.getElementById('radius_slider').value = '200';
			document.getElementById('radius_text').innerHTML = '200 km';


		} else {
			console.log("Geocode unsuccessful because of: " + status);
		}	
	});	
}

// Event listener for movable marker
function addRedMarkerListener(marker) {
	google.maps.event.addListener(marker, 'dragend', function() {
		circleCenter = marker.getPosition();
		//map.setCenter(circleCenter);
		var radiusVal = document.getElementById('radius_slider').value;

		// Update circle
		clearCircle();
		var circleOptions = {
			center: circleCenter,
			fillColor: "gray",
			fillOpacity: 0.3,
			map: map,
			radius: radiusVal * 1000,
			strokeColor: "gray",
			strokeOpacity: 0.3
		}
		var circle = new google.maps.Circle(circleOptions);
		curCircle = circle;	


		// Update blue markers
		
		var redLat = marker.getPosition().lat();
		var redLong = marker.getPosition().lng();
		var lat1 = toRad(redLat);

		for (var i=0; i < latlngArray.length; i++) {
			// Compute distance between red marker and each blue marker
			var coord = latlngArray[i]
			var dLat = toRad(redLat - coord[0]);
			var dLon = toRad(redLong - coord[1]);
			var lat2 = toRad(coord[0]);
			var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * 
							Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 	
			var c =	2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 		
			var dist = R * c;
			

			if (dist < newValue) {
				showBlueMarker(i);
			} else {
				clearBlueMarker(i);
			}
		}

	});

	
	google.maps.event.addListener(marker, 'dragstart', function() {
		if(infoWindow) infoWindow.close();
	});

	google.maps.event.addListener(marker, 'click', function() {
		if(infoWindow) infoWindow.close();
		infoWindow = new google.maps.InfoWindow({
			content: 'Location: none'
		});
		geocoder.geocode({'location':marker.getPosition()}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					infoWindow.setContent('Location: ' + results[1].formatted_address + ', '+marker.getPosition().toString());
				}
			}
		});
		
		infoWindow.open(marker.get('map'), marker);
	});
}

// Listener for non draggable markers
function addBlueMarkerListener(marker, index) {
	google.maps.event.addListener(marker, 'click', function() {
		if(infoWindow) infoWindow.close();
		infoWindow = new google.maps.InfoWindow({
			content: 'Location: none'
		});
		geocoder.geocode({'location':marker.getPosition()}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					infoWindow.setContent('<span class="bold"> Name: </span><span>' + names[index] + '</span><br/>' + 
											'<span class="bold"> Dates: </span><span>' + startDates[index]+' - '+endDates[index] + '</span><br/>' +
											'<span class="bold"> Location: </span><span>' + results[1].formatted_address + '</span><br/>' +
											'<span class="bold"> Email: </span><span>example@example.com </span>');
				}
			}
		});
		
		infoWindow.open(marker.get('map'), marker);
	});

}

// Called when radius slider is changed
function changeRadius(newValue) {
	document.getElementById('radius_text').innerHTML = newValue + ' km';
	clearCircle();

	var circleOptions = {
		center: circleCenter,
		fillColor: "gray",
		fillOpacity: 0.3,
		map: map,
		radius: newValue * 1000,
		strokeColor: "gray",
		strokeOpacity: 0.3
	}
	var circle = new google.maps.Circle(circleOptions);
	curCircle = circle;			

	
	// Add/remove appropriate blue markers within radius
	var redLat = redMarker.getPosition().lat();
	var redLong = redMarker.getPosition().lng();
	var lat1 = toRad(redLat);

	for (var i=0; i < latlngArray.length; i++) {
		// Compute distance between red marker and each blue marker
		var coord = latlngArray[i]
		var dLat = toRad(redLat - coord[0]);
		var dLon = toRad(redLong - coord[1]);
		var lat2 = toRad(coord[0]);
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * 
						Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 	
		var c =	2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 		
		var dist = R * c;
		
		if (dist < newValue) {
			showBlueMarker(i);
		} else {
			clearBlueMarker(i);
		}
	}
}

// Converts to radians
function toRad(value) {
	/** Converts numeric degrees to radians */
	return value * Math.PI / 180;
}


