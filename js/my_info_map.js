// vars
var geocoder;
var map;
var curCircle;
var circleCenter;

var redMarker;
var markersArray = [];
var nearbyTrips = [];


var R = 6371; // earth's radius in km


//hardcoded markers
var latLongArray = [[42.3584308,-71.0597732],[52.519171,13.4060912],[39.904214,116.407413]];
//hardcoded locations
var locations = ['Boston, MA','Berlin, Germany','Beijing, China'];
//hardcoded dates
var startDates = ['June 3rd, 2012','July 14th, 2012','August 1st, 2012'];
var endDates = ['June 16th, 2012','July 18th, 2012','August 5th, 2012'];
//hardcoded overlapping trips
var overlappingTrips = [[[42,-71],[42.7,-71.3]],[[52,13.3],[52.6,13.1]],[[40,116.6],[39.7,116.2]]];
//hardcoded trip dates
var overlappingStartDates = [['June 3rd, 2012','June 5th, 2012'],['July 14th, 2012','July 15th, 2012'],['August 2nd, 2012','August 4th, 2012']];
var overlappingEndDates = [['June 10th, 2012','June 12th, 2012'],['July 15th, 2012','July 22nd, 2012'],['August 6th, 2012','August 10th, 2012']];
//hardcoded names
var names = ['Sam','Mike','Emily','Phil','Sarah','Timmy','Yuchen','Neena'];
//hardcoded email address
var emails = ['soccerstar@gmail.com','cooldude@gmail.com','ponies@gmail.com','pacman@gmail.com'];
var tripsText = ['Trip 1: Boston, MA', 'Trip 2: Berlin, Germany', 'Trip 3: Beijing, China'];


//current variables
var tripNumber;
var infoWindow;

//add hardcoded markers
function addMarkers() {
	
	for(var i=0; i < latLongArray.length; i++ ) {
		var marker = new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng(latLongArray[i][0],latLongArray[i][1]),
			draggable: false,
			clickable: true
		});
		markersArray.push(marker);
		marker.setTitle('Trip ' + (i+1));
		addMarkerListener(marker,i+1);
	}
}

function addMarkerListener(marker,i) {
	google.maps.event.addListener(marker, 'click', function() {
		editTripDetails(markersArray[i-1].getTitle());
	});
}

function addNearbyListener(marker) {
	google.maps.event.addListener(marker, 'click', function() {
		if(infoWindow) infoWindow.close();
		infoWindow = new google.maps.InfoWindow({
			content: 'Location: none'
		});

		geocoder.geocode({'location':marker.getPosition()}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					infoWindow.setContent('<span class="bold"> Name: </span><span>' + names[parseInt(Math.random()*names.length)] + 
						'</span><br/><span class="bold"> Dates: </span><span>' + 
						overlappingStartDates[tripNumber][parseInt(Math.random()*overlappingStartDates[tripNumber].length)] + ' - ' + 
						overlappingEndDates[tripNumber][parseInt(Math.random()*overlappingEndDates[tripNumber].length)] + 
						'</span><br/><span class="bold"> Location: </span><span>' + results[1].formatted_address + 
						'</span><br/><span class="bold"> Email: </span><span>example@example.com </span>');
				}
			}
		});

		infoWindow.open(marker.get('map'), marker);
	});

}

//editing trip details after a marker is clicked
function editTripDetails(tripString) {

	tripNumber = tripString.substring(tripString.indexOf(' ') + 1,tripString.length) - 1;

	map.setCenter(new google.maps.LatLng(latLongArray[tripNumber][0],latLongArray[tripNumber][1]));
	map.setZoom(7);
	removeNearbyTrips();
	addNearbyTrips();
	updateCircle();

	$('#trip_label').text('Trip ' + (tripNumber+1));
	$('#trip_details_location').text('Location: ' + locations[tripNumber]);
	$('#trip_details_start').text('Start Date: ' + startDates[tripNumber]);
	$('#trip_details_end').text('End Date: ' + endDates[tripNumber]);
	$('#edit_button').toggle(true);
	$('#delete_button').toggle(true);
	$('#traveltech_button').toggle(true);
}

function removeNearbyTrips() {
	if (nearbyTrips) {
		for (var i=0;i<nearbyTrips.length;i++) nearbyTrips[i].setMap(null);
	}
}

function addNearbyTrips() {
	var blueIcon = "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png";
	for(var i = 0; i < overlappingTrips[tripNumber].length; i++ ) {
		var marker = new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(overlappingTrips[tripNumber][i][0],overlappingTrips[tripNumber][i][1]),
				draggable: false,
				clickable: true,
				icon: blueIcon
			});
		nearbyTrips.push(marker);
		addNearbyListener(marker);
	}
}

function clearCircle(i) {
	if (curCircle != null) {
		curCircle.setMap(null);
	}
	if( i != 1) {
		$('#slider_container_2').fadeOut(0);
		$('#my_trips').animate({height:'100%'},1000);
	} else {
	
	
	}
}

function updateCircle() {
	
	circleCenter = map.getCenter();
	clearCircle(1);
	$('#my_trips').animate({height:'93%'},600);
	$('#slider_container_2').fadeIn(1000);
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
}

// Called when radius slider is changed
function changeRadius(newValue) {
	document.getElementById('radius_text').innerHTML = newValue + ' km';
	clearCircle(1);

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
	var redLat = circleCenter.lat();
	var redLong = circleCenter.lng();
	var lat1 = toRad(redLat);

	for (var i=0; i < nearbyTrips.length; i++) {
		// Compute distance between red marker and each blue marker
		var coord = nearbyTrips[i].getPosition();
		var dLat = toRad(redLat - coord.lat());
		var dLon = toRad(redLong - coord.lng());
	
		var lat2 = toRad(coord.lat());
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

function showBlueMarker(index) {
	nearbyTrips[index].setVisible(true);
}
function clearBlueMarker(index) {
	nearbyTrips[index].setVisible(false);
}

// Displays all nearby trips when clicking show all button
function showAll() {
	for (var i=0; i < nearbyTrips.length; i++) {
		nearbyTrips[i].setVisible(true);
	}
}


// Converts to radians
function toRad(value) {
	/** Converts numeric degrees to radians */
	return value * Math.PI / 180;
}


function initialize() {
	initializeMap();
	
	$("#delete_button").click(function(evt) {
		$('#trip_details_location').text('');
		$('#trip_details_start').text('');
		$('#trip_details_end').text('');
		$('#edit_button').toggle();
		$('#delete_button').toggle();
		$('#traveltech_button').toggle();
		markersArray[tripNumber].setMap(null);
		markersArray[tripNumber] = 'NOTRIP';
		tripsText[tripNumber] = null;
		removeNearbyTrips();
		map.setCenter(new google.maps.LatLng(0,0));
		clearCircle();
		map.setZoom(1);

		var text = '';
		for (var i=0; i < tripsText.length; i++) if (tripsText[i]!=null) text+=tripsText[i]+'<br/>';
		$('#trip_label').html(text);

	});

}


// map
function initializeMap() {
	var mapOptions = {
		center: new google.maps.LatLng(0,0),
		zoom: 1,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('my_trips'), mapOptions);

	geocoder = new google.maps.Geocoder();
	
	//add markers
	addMarkers();

}

