// Wait for the DOM to fully load
window.addEventListener('DOMContentLoaded', function() {
    (function () {
        // Variables for autocomplete
        var placeSearch, autocomplete;
        
        // Component mapping for address fields
        var componentForm = {
            street_number: 'short_name',
            route: 'long_name',
            locality: 'long_name',
            administrative_area_level_1: 'short_name',
            country: 'long_name',
            postal_code: 'short_name'
        };

        // Crossform mapping for Gravity Forms
        var crossform = [
            { i: "final_address", c: 'street-address' },
            { i: "locality", c: 'city' },
            { i: "administrative_area_level_1", c: 'state' },
            { i: "postal_code", c: 'postal-code' },
            { i: "customer_category", c: 'customer-category' }
        ];

        // Initialize the Google Places Autocomplete
        function initAutocomplete() {
            autocomplete = new google.maps.places.Autocomplete(
                /** @type {!HTMLInputElement} */ (document.getElementById('autocomplete')), 
                { types: ['geocode'] }
            );
            autocomplete.addListener('place_changed', fillInAddress);
        }

        // Fill in the address fields
        function fillInAddress() {
            var place = autocomplete.getPlace();
            try {
                // Clear existing values
                for (var component in componentForm) {
                    document.getElementById(component).value = '';
                    document.getElementById(component).disabled = false;
                }

                // Populate fields with the place details
                for (var i = 0; i < place.address_components.length; i++) {
                    var addressType = place.address_components[i].types[0];
                    if (componentForm[addressType] || addressType === "neighborhood") {
                        if (addressType === "locality" && document.getElementById('locality').value) {
                            continue;
                        } else if (addressType === "neighborhood") {
                            addressType = 'locality';
                        }
                        var val = place.address_components[i][componentForm[addressType]];
                        if (val !== null) document.getElementById(addressType).value = val;
                    }
                }
            } catch (e) {
                console.log('Problem populating values', e);
            }

            // Create the final address
            var number = document.getElementById('street_number').value;
            var street = document.getElementById('route').value;
            var address = number + ' ' + street;
            document.getElementById("final_address").value = address;

            // Crossform field population
            try {
                for (var i = 0; i < crossform.length; i++) {
                    var _id = crossform[i].i;
                    var _cl = crossform[i].c;
                    var v = document.getElementById(_id).value;
                    var e = jQuery('.aa-' + _cl).find('input');
                    e.val(v);
                }
            } catch (e) {
                console.log('Could not find the correct aa-* classes in gravity form.', e);
            }
        }

        // Geolocate the user
        function geolocate() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var geolocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    var circle = new google.maps.Circle({
                        center: geolocation,
                        radius: position.coords.accuracy
                    });
                    autocomplete.setBounds(circle.getBounds());
                });
            }
        }

        // Initialize autocomplete on window load
        window.onload = initAutocomplete;
    }());
});

// Loader icon activation
var activateLoaderIcon = function() {
    var gf5 = document.getElementById('gform_5');
    if (!gf5) return;

    // Function to display the loader
    var displayLoader = function() {
        document.styleSheets[0].addRule('#gform_5::after', 'display: block !important;');
    }
    gf5.onsubmit = displayLoader;
}

// Activate loader icon on window load
window.addEventListener('load', activateLoaderIcon);