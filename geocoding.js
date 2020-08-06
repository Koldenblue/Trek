var address;
var zip;
var city;
var state;
var queryURL;
var exampleURL = "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyB_ShRmKvw0k00jVd4WofFQVbEtdjV4T0c";
var startLatLong; // latitude and longitude calculated upon submittal of address
var endLatLong;   // put into local storage? 
var startAddress = true;


/** Main controller function. Gets stored addresses and puts them into input fields.
 * Then adds event listeners to the address submittal buttons. */
function main() {
    getStartAddress();
    getEndAddress();
    addLocationButtonEventListeners();
}
$(document).ready(main);


/** adds event listeners to the address submittal buttons, as well as the get travel time button */
function addLocationButtonEventListeners() {
    // Upon button click, store new address. Set query url to the address. Make the ajax call for that address.
    $("#start-btn").on("click", function(event) {
        event.preventDefault()
        address = $("#address").val();
        zip = $("#zip").val();
        city = $("#city").val();
        state = $("#state").val();
        localStorage.setItem("startAddressObj", JSON.stringify({address, zip, city, state}));
        // this also works without the zip field
        queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "," + city + "," + state + "," + zip + "&key=AIzaSyB_ShRmKvw0k00jVd4WofFQVbEtdjV4T0c";
        // have to only set startLatLong once the call is actually returned. Instead of doing this true / false flag
        startAddress = true;
        makeCall();
    });    

    // Button for end location address. Set query url to the address. Make the ajax call for that address.
    $("#end-btn").on("click", function(event) {
        event.preventDefault()
        address = $("#end-address").val();
        zip = $("#end-zip").val();
        city = $("#end-city").val();
        state = $("#end-state").val();
        localStorage.setItem("endAddressObj", JSON.stringify({address, zip, city, state}));
        // this also works without the zip field
        queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "," + city + "," + state + "," + zip + "&key=AIzaSyB_ShRmKvw0k00jVd4WofFQVbEtdjV4T0c";
        startAddress = false;
        makeCall();
    });

    $("#travel-time").on("click", function(event) {
        $("#travel-time-para").text(getTravelTime(startLatLong, endLatLong));
    })
}


/** Makes ajax call to convert an address to latitude/longitude */
function makeCall() {
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        console.log("latitude is " + response.results[0].geometry.location.lat)
        console.log("longitude is " + response.results[0].geometry.location.lng)
        var latitude = response.results[0].geometry.location.lat;
        var longitude = response.results[0].geometry.location.lng;
        var latLongObj = {
            latitude,
            longitude
        }
        // Return won't be successful because of the promised nature of this function
        // console.log(latLongObj)
        // return latLongObj;

        if (startAddress) {
            startLatLong = latLongObj;
        }
        else {
            endLatLong = latLongObj;
        }
    });
}


/** After both start and end addresses have been submitted, can calculate the distance and travel time between them. */
function getTravelTime(startLatLong, endLatLong) {

    var exampleURL = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=40.6655101,-73.89188969999998&destinations=40.6905615%2C-73.9976592%7C40.6905615%2C-73.9976592&key=AIzaSyB_ShRmKvw0k00jVd4WofFQVbEtdjV4T0c"
    // defaulting to imperial units
    var queryURL = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + startLatLong.latitude + "%2C" + startLatLong.longitude + "&destinations=" + endLatLong.latitude + "%2C" + endLatLong.longitude + "&key=AIzaSyB_ShRmKvw0k00jVd4WofFQVbEtdjV4T0c"
    
    // ajax call returns information such as distance and travel time.
    const DEST = 0;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        console.log(response);
        console.log(`destination ${DEST} is ${response.destination_addresses[DEST]}`);
        console.log("distance to " + response.destination_addresses[DEST] + " is " + response.rows[0].elements[DEST].distance.text);
        console.log("number of destinations is " + response.destination_addresses.length);
        console.log("origin address is " + response.origin_addresses[0]);
        console.log(`duration to destination ${DEST} is ${response.rows[0].elements[DEST].duration.text}`);
    });
    // travel mode is driving by default
    var otherTravelMode = false;
    var travelMode;
    var transit_mode;
    // travel mode can be set to these other options:
    // mode = transit; transit_mode = bus, subway, train, tram, rail
    // mode = driving, walking, bicycling
    if (otherTravelMode) {
        travelMode = $("#travel-mode").val();
        if (travelMode === "transit") {
            transit_mode = $("transit-mode").val();
        }
    }

}


/** Get previously entered start address from local storage */
function getStartAddress() {
    var storedAddress = localStorage.getItem("startAddressObj");
    if (storedAddress === null) {
        console.log("null")
        storedAddress = {
            address: "",
            zip: "",
            city: "",
            state: ""
        }
    }
    else {
        storedAddress = JSON.parse(storedAddress);
    }
    address = storedAddress.address;
    zip = storedAddress.zip;
    city = storedAddress.city;
    state = storedAddress.state;

    // Enter stored address into text fields
    $("#address").val(address);
    $("#zip").val(zip);
    $("#city").val(city);
    $("#state").val(state);
}


/** Get end location address from storage */
function getEndAddress() {
    var storedEndAddress = localStorage.getItem("endAddressObj");
    if (storedEndAddress === null) {
        storedEndAddress= {
            address: "",
            zip: "",
            city: "",
            state: ""
        }
    }
    else {
        storedEndAddress = JSON.parse(storedEndAddress);
    }
    endAddress = storedEndAddress.address;
    endZip = storedEndAddress.zip;
    endCity = storedEndAddress.city;
    endState = storedEndAddress.state;

    $("#end-address").val(endAddress);
    $("#end-zip").val(endZip);
    $("#end-city").val(endCity);
    $("#end-state").val(endState);
}
