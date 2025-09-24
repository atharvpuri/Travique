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
                    reject(new Error('Google Maps API failed to load'));
                }
            }, 10000);
        });
    }
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
        
        console.log('🗺️ Google Maps Manager initialized, waiting for API load...');
    }
    
    initializeMap() {
        console.log('🗺️ Initializing Google Maps...');
        
        const mapContainer = document.getElementById('google-map');
        if (!mapContainer) {
            console.error('❌ Map container not found!');
            return;
        }
        
        // Initialize Google Map with dark theme
        this.map = new google.maps.Map(mapContainer, {
            center: { lat: 40.7128, lng: -74.0060 }, // New York City
            zoom: 10,
            styles: this.darkMapStyles,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false, // We'll use custom controls
            gestureHandling: 'cooperative',
            backgroundColor: this.colors.background
        });
        
        // Initialize Google Maps services
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: this.colors.primary,
                strokeWeight: 4,
                strokeOpacity: 0.8
            }
        });
        this.directionsRenderer.setMap(this.map);
        
        this.placesService = new google.maps.places.PlacesService(this.map);
        this.geocoder = new google.maps.Geocoder();
        
        // Setup controls and event listeners
        this.setupControls();
        this.setupEventListeners();
        
        this.isMapReady = true;
        console.log('✅ Google Maps Ready!');
        
        // Initialize info panel
        this.updateMapInfo();
    }
    
    setupControls() {
        // Setup button event listeners
        this.setupButtonControls();
        
        // Add custom zoom controls
        this.addCustomZoomControls();
    }
    
    setupButtonControls() {
        // Locate user button
        const locateBtn = document.getElementById('locate-user');
        if (locateBtn) {
            locateBtn.addEventListener('click', () => {
                this.locateUser();
                this.playClickSound();
            });
        }
        
        // Clear markers button
        const clearBtn = document.getElementById('clear-markers');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearMarkers();
                this.playClickSound();
            });
        }
        
        // Add marker button (toggle mode)
        const addMarkerBtn = document.getElementById('add-marker');
        if (addMarkerBtn) {
            addMarkerBtn.addEventListener('click', () => {
                this.toggleMarkerMode();
                this.playClickSound();
            });
        }
        
        // Calculate route button
        const routeBtn = document.getElementById('calculate-route');
        if (routeBtn) {
            routeBtn.addEventListener('click', () => {
                this.calculateRoute();
                this.playClickSound();
            });
        }
    }
    
    addCustomZoomControls() {
        // Create custom zoom in control
        const zoomInButton = document.createElement('div');
        zoomInButton.className = 'custom-zoom-control zoom-in';
        zoomInButton.innerHTML = '<i class="fas fa-plus"></i>';
        zoomInButton.addEventListener('click', () => {
            this.map.setZoom(this.map.getZoom() + 1);
            this.playClickSound();
        });
        
        // Create custom zoom out control
        const zoomOutButton = document.createElement('div');
        zoomOutButton.className = 'custom-zoom-control zoom-out';
        zoomOutButton.innerHTML = '<i class="fas fa-minus"></i>';
        zoomOutButton.addEventListener('click', () => {
            this.map.setZoom(this.map.getZoom() - 1);
            this.playClickSound();
        });
        
        // Add controls to map
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(zoomInButton);
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(zoomOutButton);
    }
    
    setupEventListeners() {
        // Map click event for adding markers
        this.map.addListener('click', (event) => {
            if (this.isMarkerMode) {
                this.addMarker(event.latLng);
            }
        });
        
        // Map idle event (when map is ready/loaded)
        this.map.addListener('idle', () => {
            this.updateMapInfo();
        });
    }
    
    locateUser() {
        if (!navigator.geolocation) {
            this.showNotification('Geolocation is not supported by this browser', 'error');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Remove existing user location marker
                if (this.userLocationMarker) {
                    this.userLocationMarker.setMap(null);
                }
                
                // Create custom user location marker
                this.userLocationMarker = new google.maps.Marker({
                    position: userLocation,
                    map: this.map,
                    title: 'Your Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: this.colors.primary,
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3,
                        scale: 8
                    },
                    animation: google.maps.Animation.BOUNCE
                });
                
                // Stop bouncing after 2 seconds
                setTimeout(() => {
                    this.userLocationMarker.setAnimation(null);
                }, 2000);
                
                // Center map on user location
                this.map.setCenter(userLocation);
                this.map.setZoom(15);
                
                this.showNotification('Location found!', 'success');
            },
            (error) => {
                let message = 'Unable to get your location';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                this.showNotification(message, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }
    
    addMarker(position, title = null) {
        // Create custom marker
        const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: title || `Marker ${this.markers.length + 1}`,
            icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                fillColor: this.colors.accent,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 6,
                rotation: 180
            },
            animation: google.maps.Animation.DROP
        });
        
        // Add info window with location details
        this.addMarkerInfoWindow(marker, position, title);
        
        // Store marker
        this.markers.push(marker);
        
        // Update info panel
        this.updateMapInfo();
        
        // Auto-calculate route if we have 2+ markers
        if (this.markers.length >= 2) {
            this.calculateRoute();
        }
        
        return marker;
    }
    
    addMarkerInfoWindow(marker, position, title) {
        // Create info window content
        const contentString = `
            <div class="marker-info-window">
                <div class="marker-details">
                    <h4>${title || 'Location Marker'}</h4>
                    <p><strong>Coordinates:</strong><br>
                    Lat: ${position.lat().toFixed(6)}<br>
                    Lng: ${position.lng().toFixed(6)}</p>
                    <div class="marker-actions">
                        <button onclick="window.mapManager.removeMarker(${this.markers.length})" class="remove-marker-btn">
                            <i class="fas fa-trash"></i> Remove Marker
                        </button>
                        <button onclick="window.mapManager.getDirectionsToMarker(${this.markers.length})" class="directions-btn">
                            <i class="fas fa-directions"></i> Directions
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const infoWindow = new google.maps.InfoWindow({
            content: contentString
        });
        
        // Add click listener to show info window
        marker.addListener('click', () => {
            // Close other info windows
            this.markers.forEach(m => {
                if (m.infoWindow) {
                    m.infoWindow.close();
                }
            });
            
            infoWindow.open(this.map, marker);
        });
        
        // Store info window reference
        marker.infoWindow = infoWindow;
        
        // Try to get address using reverse geocoding
        this.reverseGeocode(position, (address) => {
            if (address) {
                const updatedContent = `
                    <div class="marker-info-window">
                        <div class="marker-details">
                            <h4>${address.formatted_address || 'Location'}</h4>
                            <p><strong>Coordinates:</strong><br>
                            Lat: ${position.lat().toFixed(6)}<br>
                            Lng: ${position.lng().toFixed(6)}</p>
                            <div class="marker-actions">
                                <button onclick="window.mapManager.removeMarker(${this.markers.length})" class="remove-marker-btn">
                                    <i class="fas fa-trash"></i> Remove Marker
                                </button>
                                <button onclick="window.mapManager.getDirectionsToMarker(${this.markers.length})" class="directions-btn">
                                    <i class="fas fa-directions"></i> Directions
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                infoWindow.setContent(updatedContent);
            }
        });
    }
    
    reverseGeocode(position, callback) {
        this.geocoder.geocode({ location: position }, (results, status) => {
            if (status === 'OK' && results[0]) {
                callback(results[0]);
            } else {
                console.log('Geocoder failed:', status);
                callback(null);
            }
        });
    }
    
    removeMarker(markerIndex) {
        const index = markerIndex - 1; // Adjust for 0-based array
        if (index >= 0 && index < this.markers.length) {
            // Remove marker from map
            this.markers[index].setMap(null);
            
            // Remove from array
            this.markers.splice(index, 1);
            
            // Update info and recalculate route
            this.updateMapInfo();
            if (this.markers.length >= 2) {
                this.calculateRoute();
            } else {
                this.clearRoute();
            }
            
            this.showNotification('Marker removed', 'success');
        }
    }
    
    clearMarkers() {
        // Remove all markers from map
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        
        // Clear markers array
        this.markers = [];
        
        // Clear route
        this.clearRoute();
        
        // Update info panel
        this.updateMapInfo();
        
        this.showNotification('All markers cleared', 'success');
    }
    
    toggleMarkerMode() {
        this.isMarkerMode = !this.isMarkerMode;
        
        const addMarkerBtn = document.getElementById('add-marker');
        if (addMarkerBtn) {
            if (this.isMarkerMode) {
                addMarkerBtn.classList.add('active');
                addMarkerBtn.title = 'Exit Marker Mode';
                this.map.setOptions({ cursor: 'crosshair' });
                this.showNotification('Click on map to add markers', 'info');
            } else {
                addMarkerBtn.classList.remove('active');
                addMarkerBtn.title = 'Add Marker';
                this.map.setOptions({ cursor: 'default' });
            }
        }
    }
    
    calculateRoute() {
        if (this.markers.length < 2) {
            this.showNotification('Add at least 2 markers to calculate route', 'warning');
            return;
        }
        
        // Clear existing route
        this.clearRoute();
        
        // Prepare waypoints for directions
        const origin = this.markers[0].getPosition();
        const destination = this.markers[this.markers.length - 1].getPosition();
        const waypoints = [];
        
        // Add intermediate markers as waypoints
        for (let i = 1; i < this.markers.length - 1; i++) {
            waypoints.push({
                location: this.markers[i].getPosition(),
                stopover: true
            });
        }
        
        const request = {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        };
        
        this.directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                this.directionsRenderer.setDirections(result);
                
                // Calculate total distance and duration
                let totalDistance = 0;
                let totalDuration = 0;
                
                result.routes[0].legs.forEach(leg => {
                    totalDistance += leg.distance.value;
                    totalDuration += leg.duration.value;
                });
                
                // Update info panel
                const distanceKm = (totalDistance / 1000).toFixed(2);
                const durationMin = Math.round(totalDuration / 60);
                
                document.getElementById('route-distance').textContent = `${distanceKm} km`;
                document.getElementById('estimated-time').textContent = `${durationMin} min`;
                
                this.showNotification(`Route calculated: ${distanceKm} km, ${durationMin} min`, 'success');
            } else {
                console.error('Directions request failed:', status);
                this.showNotification('Could not calculate route', 'error');
            }
        });
    }
    
    clearRoute() {
        this.directionsRenderer.setDirections({ routes: [] });
        
        // Reset route info
        document.getElementById('route-distance').textContent = '0 km';
        document.getElementById('estimated-time').textContent = '0 min';
    }
    
    getDirectionsToMarker(markerIndex) {
        const index = markerIndex - 1;
        if (index >= 0 && index < this.markers.length) {
            const destination = this.markers[index].getPosition();
            
            // Try to get user's current location for directions
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const origin = new google.maps.LatLng(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    
                    const directionsUrl = `https://www.google.com/maps/dir/${origin.lat()},${origin.lng()}/${destination.lat()},${destination.lng()}`;
                    window.open(directionsUrl, '_blank');
                });
            } else {
                // Fallback: just show the destination
                const directionsUrl = `https://www.google.com/maps/place/${destination.lat()},${destination.lng()}`;
                window.open(directionsUrl, '_blank');
            }
        }
    }
    
    updateMapInfo() {
        const markerCount = this.markers.length;
        document.getElementById('marker-count').textContent = 
            `${markerCount} marker${markerCount !== 1 ? 's' : ''}`;
    }
    
    showNotification(message, type = 'info') {
        // Use the app's notification system if available
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    playClickSound() {
        if (window.audioManager && typeof window.audioManager.playClick === 'function') {
            window.audioManager.playClick();
        }
    }
    
    // Public methods for integration with trip planning
    getMarkers() {
        return this.markers.map(marker => ({
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng()
        }));
    }
    
    setMarkers(locations) {
        this.clearMarkers();
        locations.forEach(location => {
            this.addMarker(new google.maps.LatLng(location.lat, location.lng));
        });
    }
    
    centerOnLocation(lat, lng, zoom = 15) {
        if (this.map) {
            this.map.setCenter({ lat, lng });
            this.map.setZoom(zoom);
        }
    }
    
    handleResize() {
        if (this.map) {
            setTimeout(() => {
                google.maps.event.trigger(this.map, 'resize');
            }, 100);
        }
    }
    
    // Cleanup
    destroy() {
        if (this.map) {
            this.clearMarkers();
            this.map = null;
        }
        this.isMapReady = false;
    }
}

// Global callback function for Google Maps API
function initMap() {
    console.log('🗺️ Google Maps API loaded');
    // The MapManager will be initialized when the map section is activated
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapManager;
}