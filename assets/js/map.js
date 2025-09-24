// Google Maps API Manager with GTA V Dark Theme
class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.directionsService = null;
        this.directionsRenderer = null;
        this.userLocationMarker = null;
        this.placesService = null;
        this.geocoder = null;
        this.isMapReady = false;
        this.isMarkerMode = false;
        
        // GTA V Dark theme colors
        this.colors = {
            primary: '#00d4ff',
            secondary: '#1a1a1a',
            accent: '#e74c3c',
            success: '#2ecc71',
            warning: '#f39c12',
            background: '#0a0a0a'
        };
        
        // Dark mode map styles
        this.darkMapStyles = [
            { elementType: "geometry", stylers: [{ color: "#212121" }] },
            { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
            {
                featureType: "administrative",
                elementType: "geometry",
                stylers: [{ color: "#757575" }]
            },
            {
                featureType: "administrative.country",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9e9e9e" }]
            },
            {
                featureType: "administrative.land_parcel",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#bdbdbd" }]
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#757575" }]
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#181818" }]
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#616161" }]
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#1b1b1b" }]
            },
            {
                featureType: "road",
                elementType: "geometry.fill",
                stylers: [{ color: "#2c2c2c" }]
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#8a8a8a" }]
            },
            {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#373737" }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#3c3c3c" }]
            },
            {
                featureType: "road.highway.controlled_access",
                elementType: "geometry",
                stylers: [{ color: "#4e4e4e" }]
            },
            {
                featureType: "road.local",
                elementType: "labels.text.fill",
                stylers: [{ color: "#616161" }]
            },
            {
                featureType: "transit",
                elementType: "labels.text.fill",
                stylers: [{ color: "#757575" }]
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#000000" }]
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#3d3d3d" }]
            }
        ];
        
        this.waitForGoogleMaps().then(() => {
            console.log('🗺️ Google Maps API is ready');
        }).catch(error => {
            console.error('❌ Failed to load Google Maps API:', error);
        });
    }

    async waitForGoogleMaps() {
        return new Promise((resolve, reject) => {
            // If Google Maps is already loaded
            if (typeof google !== 'undefined' && google.maps) {
                resolve();
                return;
            }
            
            const checkGoogleMaps = () => {
                if (typeof google !== 'undefined' && google.maps) {
                    resolve();
                } else {
                    setTimeout(checkGoogleMaps, 100);
                }
            };
            checkGoogleMaps();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (typeof google === 'undefined' || !google.maps) {
                    reject(new Error('Google Maps API failed to load - using fallback mode'));
                }
            }, 10000);
        });
    }

    async initializeMap() {
        console.log('🗺️ Initializing Google Maps...');
        
        try {
            await this.waitForGoogleMaps();
            
            const mapContainer = document.getElementById('google-map');
            if (!mapContainer) {
                throw new Error('Map container not found');
            }

            // Initialize Google Map with dark theme
            this.map = new google.maps.Map(mapContainer, {
                zoom: 13,
                center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
                styles: this.darkMapStyles,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: false,
                gestureHandling: 'cooperative'
            });

            // Initialize Google Maps services
            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer({
                map: this.map,
                suppressMarkers: false,
                polylineOptions: {
                    strokeColor: this.colors.primary,
                    strokeWeight: 4,
                    strokeOpacity: 0.8
                }
            });
            
            this.placesService = new google.maps.places.PlacesService(this.map);
            this.geocoder = new google.maps.Geocoder();

            // Set up event listeners
            this.setupMapEventListeners();
            
            // Set up custom controls
            this.setupCustomControls();
            
            // Initialize info panel
            this.updateInfoPanel();
            
            this.isMapReady = true;
            console.log('✅ Google Maps initialized successfully');
            
            // Try to get user location
            this.getUserLocation();
            
        } catch (error) {
            console.error('❌ Failed to initialize Google Maps:', error);
            this.showMapError(error.message);
        }
    }

    setupMapEventListeners() {
        if (!this.map) return;

        // Map click event for adding markers
        this.map.addListener('click', (event) => {
            if (this.isMarkerMode) {
                this.addMarker(event.latLng);
            }
        });

        // Map bounds changed event
        this.map.addListener('bounds_changed', () => {
            this.updateInfoPanel();
        });
    }

    setupCustomControls() {
        if (!this.map) return;

        // Create custom control container
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'map-controls';
        
        // Zoom In button
        const zoomInBtn = this.createControlButton('➕', 'Zoom In', () => {
            this.map.setZoom(this.map.getZoom() + 1);
        });
        
        // Zoom Out button
        const zoomOutBtn = this.createControlButton('➖', 'Zoom Out', () => {
            this.map.setZoom(this.map.getZoom() - 1);
        });
        
        // My Location button
        const locationBtn = this.createControlButton('📍', 'My Location', () => {
            this.getUserLocation();
        });
        
        // Marker Mode button
        const markerBtn = this.createControlButton('📌', 'Add Markers', () => {
            this.toggleMarkerMode();
        });
        
        // Clear button
        const clearBtn = this.createControlButton('🗑️', 'Clear All', () => {
            this.clearAllMarkers();
        });

        controlsDiv.appendChild(zoomInBtn);
        controlsDiv.appendChild(zoomOutBtn);
        controlsDiv.appendChild(locationBtn);
        controlsDiv.appendChild(markerBtn);
        controlsDiv.appendChild(clearBtn);

        this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlsDiv);
    }

    createControlButton(text, title, onClick) {
        const button = document.createElement('button');
        button.className = 'map-control-btn';
        button.textContent = text;
        button.title = title;
        button.addEventListener('click', onClick);
        return button;
    }

    toggleMarkerMode() {
        this.isMarkerMode = !this.isMarkerMode;
        
        if (this.isMarkerMode) {
            this.map.setOptions({ cursor: 'crosshair' });
            this.showNotification('Click on the map to add markers', 'info');
        } else {
            this.map.setOptions({ cursor: 'default' });
            this.showNotification('Marker mode disabled', 'info');
        }
    }

    addMarker(location) {
        try {
            const marker = new google.maps.Marker({
                position: location,
                map: this.map,
                title: 'Custom Marker',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: this.colors.primary,
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                }
            });

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
                content: this.createMarkerInfoContent(location, marker)
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });

            this.markers.push(marker);
            console.log('📍 Marker added at:', location.toString());
            
            // Get address for this location
            this.getAddressFromLocation(location, (address) => {
                marker.setTitle(address);
                infoWindow.setContent(this.createMarkerInfoContent(location, marker, address));
            });
            
        } catch (error) {
            console.error('❌ Error adding marker:', error);
            this.showNotification('Failed to add marker', 'error');
        }
    }

    createMarkerInfoContent(location, marker, address = 'Loading...') {
        const lat = location.lat().toFixed(6);
        const lng = location.lng().toFixed(6);
        
        return `
            <div class="marker-info-window">
                <div class="marker-details">
                    <h4>Custom Marker</h4>
                    <p><strong>Address:</strong> ${address}</p>
                    <p><strong>Coordinates:</strong> ${lat}, ${lng}</p>
                </div>
                <div class="marker-actions">
                    <button class="directions-btn" onclick="mapManager.getDirectionsToMarker(${lat}, ${lng})">
                        <i class="fas fa-route"></i> Directions
                    </button>
                    <button class="remove-marker-btn" onclick="mapManager.removeMarker('${marker.getPosition().toString()}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    }

    removeMarker(positionString) {
        const markerIndex = this.markers.findIndex(marker => 
            marker.getPosition().toString() === positionString
        );
        
        if (markerIndex !== -1) {
            this.markers[markerIndex].setMap(null);
            this.markers.splice(markerIndex, 1);
            console.log('🗑️ Marker removed');
            this.showNotification('Marker removed', 'success');
        }
    }

    clearAllMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
        
        if (this.directionsRenderer) {
            this.directionsRenderer.setMap(null);
            this.directionsRenderer.setMap(this.map);
        }
        
        console.log('🗑️ All markers cleared');
        this.showNotification('All markers cleared', 'success');
    }

    getUserLocation() {
        if (!navigator.geolocation) {
            this.showNotification('Geolocation not supported', 'error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                this.map.setCenter(userLocation);
                this.map.setZoom(15);

                // Remove existing user location marker
                if (this.userLocationMarker) {
                    this.userLocationMarker.setMap(null);
                }

                // Add user location marker
                this.userLocationMarker = new google.maps.Marker({
                    position: userLocation,
                    map: this.map,
                    title: 'Your Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: this.colors.success,
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3
                    },
                    animation: google.maps.Animation.DROP
                });

                this.showNotification('Location found!', 'success');
                console.log('📍 User location found:', userLocation);
            },
            (error) => {
                console.error('❌ Geolocation error:', error);
                this.showNotification('Unable to get your location', 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }

    getDirectionsToMarker(lat, lng) {
        if (!navigator.geolocation) {
            this.showNotification('Geolocation not supported', 'error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const origin = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                const destination = { lat: lat, lng: lng };

                this.calculateRoute(origin, destination);
            },
            (error) => {
                this.showNotification('Unable to get your location for directions', 'error');
            }
        );
    }

    calculateRoute(origin, destination) {
        if (!this.directionsService) return;

        const request = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        };

        this.directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                this.directionsRenderer.setDirections(result);
                
                const route = result.routes[0];
                const distance = route.legs[0].distance.text;
                const duration = route.legs[0].duration.text;
                
                this.showNotification(`Route: ${distance}, ${duration}`, 'success');
                console.log('🗺️ Route calculated:', { distance, duration });
            } else {
                console.error('❌ Directions request failed:', status);
                this.showNotification('Unable to calculate route', 'error');
            }
        });
    }

    getAddressFromLocation(location, callback) {
        if (!this.geocoder) return;

        this.geocoder.geocode({ location: location }, (results, status) => {
            if (status === 'OK' && results[0]) {
                callback(results[0].formatted_address);
            } else {
                callback('Address not found');
            }
        });
    }

    updateInfoPanel() {
        // Update map info panel with current stats
        const totalTripsEl = document.getElementById('total-trips-stat');
        const totalDistanceEl = document.getElementById('total-distance-stat');
        
        if (totalTripsEl) {
            totalTripsEl.textContent = this.markers.length;
        }
    }

    showMapError(message) {
        const mapContainer = document.getElementById('google-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Map Loading Error</h3>
                    <p>${message}</p>
                    <button onclick="mapManager.initializeMap()" class="retry-btn">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `map-notification map-notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to map container
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.appendChild(notification);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 3000);
        }
    }

    // Public methods for external use
    isReady() {
        return this.isMapReady;
    }

    getMap() {
        return this.map;
    }

    reset() {
        if (this.map) {
            this.clearAllMarkers();
            this.map.setCenter({ lat: 40.7128, lng: -74.0060 });
            this.map.setZoom(13);
        }
    }

    destroy() {
        if (this.map) {
            this.clearAllMarkers();
            this.map = null;
        }
        this.isMapReady = false;
    }
}

// Initialize map manager when DOM is ready
let mapManager;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mapManager = new MapManager();
    });
} else {
    mapManager = new MapManager();
}

// Make map manager globally available
window.mapManager = mapManager;

// Global callback function for Google Maps API (if needed)
window.initMap = function() {
    console.log('🗺️ Google Maps API loaded via callback');
};