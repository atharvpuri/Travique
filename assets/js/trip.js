// Trip Manager for handling trip planning and management
class TripManager {
    constructor() {
        this.currentTrip = null;
        this.companions = [];
        this.isFormInitialized = false;
        
        this.init();
    }
    
    init() {
        console.log('🗺️ Initializing Trip Manager...');
        this.setupEventListeners();
        console.log('✅ Trip Manager Ready!');
    }
    
    setupEventListeners() {
        // Wait for form to be available
        if (document.getElementById('trip-form')) {
            this.initializeTripForm();
        } else {
            // Set up mutation observer to wait for form
            const observer = new MutationObserver(() => {
                if (document.getElementById('trip-form')) {
                    this.initializeTripForm();
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    
    initializeTripForm() {
        if (this.isFormInitialized) return;
        
        console.log('📝 Initializing trip form...');
        
        const form = document.getElementById('trip-form');
        const companionsInput = document.getElementById('companions');
        const companionDetails = document.getElementById('companion-details');
        const locationButtons = document.querySelectorAll('.location-btn');
        
        if (!form) return;
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTripSubmission();
        });
        
        // Save draft button
        const saveDraftBtn = document.getElementById('save-draft');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                this.saveDraftTrip();
            });
        }
        
        // Companions input change
        if (companionsInput) {
            companionsInput.addEventListener('change', (e) => {
                const count = parseInt(e.target.value) || 0;
                this.updateCompanionFields(count);
            });
        }
        
        // Location buttons
        locationButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLocationSelection(button);
            });
        });
        
        // Auto-populate current date/time
        const departureTimeInput = document.getElementById('departure-time');
        if (departureTimeInput && !departureTimeInput.value) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            departureTimeInput.value = now.toISOString().slice(0, 16);
        }
        
        this.isFormInitialized = true;
        console.log('✅ Trip form initialized!');
    }
    
    updateCompanionFields(count) {
        const companionDetails = document.getElementById('companion-details');
        const companionList = document.getElementById('companion-list');
        
        if (!companionDetails || !companionList) return;
        
        if (count > 0) {
            companionDetails.style.display = 'block';
            this.renderCompanionFields(count);
        } else {
            companionDetails.style.display = 'none';
            companionList.innerHTML = '';
        }
    }
    
    renderCompanionFields(count) {
        const companionList = document.getElementById('companion-list');
        if (!companionList) return;
        
        companionList.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const companionItem = document.createElement('div');
            companionItem.className = 'companion-item';
            companionItem.innerHTML = `
                <div class="form-group">
                    <label for="companion-name-${i}">Name</label>
                    <input type="text" id="companion-name-${i}" name="companionName[]" placeholder="Companion name">
                </div>
                <div class="form-group">
                    <label for="companion-relation-${i}">Relation</label>
                    <select id="companion-relation-${i}" name="companionRelation[]">
                        <option value="">Select relation</option>
                        <option value="family">Family</option>
                        <option value="friend">Friend</option>
                        <option value="colleague">Colleague</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <button type="button" class="remove-companion" data-index="${i}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            companionList.appendChild(companionItem);
        }
        
        // Add event listeners to remove buttons
        companionList.querySelectorAll('.remove-companion').forEach(button => {
            button.addEventListener('click', (e) => {
                this.removeCompanion(parseInt(button.getAttribute('data-index')));
            });
        });
    }
    
    removeCompanion(index) {
        const companionsInput = document.getElementById('companions');
        if (companionsInput) {
            const currentCount = parseInt(companionsInput.value) || 0;
            if (currentCount > 0) {
                companionsInput.value = currentCount - 1;
                this.updateCompanionFields(currentCount - 1);
            }
        }
    }
    
    handleLocationSelection(button) {
        const field = button.getAttribute('data-field');
        const input = document.getElementById(`trip-${field}`);
        
        if (!input) return;
        
        // Play location pin sound
        if (window.audioManager) {
            window.audioManager.playCustomTone(880, 0.05);
        }
        
        if (navigator.geolocation) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            button.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Reverse geocoding (simplified for demo)
                    input.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    
                    // You would typically use a geocoding service here
                    this.reverseGeocode(latitude, longitude)
                        .then(address => {
                            if (address) {
                                input.value = address;
                            }
                        })
                        .catch(console.warn);
                    
                    button.innerHTML = field === 'origin' ? '<i class="fas fa-map-marker-alt"></i>' : '<i class="fas fa-flag-checkered"></i>';
                    button.disabled = false;
                    
                    if (window.app) {
                        window.app.showNotification(`Location captured for ${field}`, 'success');
                    }
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    
                    button.innerHTML = field === 'origin' ? '<i class="fas fa-map-marker-alt"></i>' : '<i class="fas fa-flag-checkered"></i>';
                    button.disabled = false;
                    
                    if (window.app) {
                        window.app.showNotification('Could not get location. Please enter manually.', 'warning');
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        } else {
            if (window.app) {
                window.app.showNotification('Geolocation not supported by this browser', 'error');
            }
        }
    }
    
    async reverseGeocode(lat, lng) {
        // This is a simplified reverse geocoding
        // In a real app, you would use Google Maps API, OpenStreetMap, etc.
        try {
            // For demo purposes, return coordinates
            return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            return null;
        }
    }
    
    async handleTripSubmission() {
        console.log('📋 Processing trip submission...');
        
        const formData = this.collectFormData();
        
        if (!this.validateTripData(formData)) {
            return;
        }
        
        // Create trip object
        const trip = {
            id: this.generateTripId(),
            ...formData,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save trip
        await this.saveTrip(trip);
        
        // Start trip tracking (placeholder)
        this.startTripTracking(trip);
        
        // Show success message
        if (window.app) {
            window.app.showNotification('Trip started successfully! Safe travels!', 'success');
        }
        
        // Play success sound
        if (window.audioManager) {
            window.audioManager.playSuccess();
        }
        
        // Navigate to map or dashboard
        setTimeout(() => {
            if (window.app) {
                window.app.navigateToSection('map');
            }
        }, 2000);
    }
    
    collectFormData() {
        const form = document.getElementById('trip-form');
        if (!form) return null;
        
        const formData = new FormData(form);
        const data = {};
        
        // Basic trip data
        data.origin = formData.get('origin') || '';
        data.destination = formData.get('destination') || '';
        data.departureTime = formData.get('departureTime') || '';
        data.transportMode = formData.get('transportMode') || '';
        data.tripPurpose = formData.get('tripPurpose') || '';
        data.companions = parseInt(formData.get('companions')) || 0;
        
        // Companion details
        data.companionDetails = [];
        const companionNames = formData.getAll('companionName[]');
        const companionRelations = formData.getAll('companionRelation[]');
        
        for (let i = 0; i < companionNames.length; i++) {
            if (companionNames[i] && companionNames[i].trim()) {
                data.companionDetails.push({
                    name: companionNames[i].trim(),
                    relation: companionRelations[i] || 'other'
                });
            }
        }
        
        return data;
    }
    
    validateTripData(data) {
        const errors = [];
        
        if (!data.origin || data.origin.trim() === '') {
            errors.push('Origin location is required');
        }
        
        if (!data.destination || data.destination.trim() === '') {
            errors.push('Destination is required');
        }
        
        if (!data.departureTime) {
            errors.push('Departure time is required');
        }
        
        if (!data.transportMode) {
            errors.push('Transport mode is required');
        }
        
        if (data.companions > 0 && data.companionDetails.length === 0) {
            errors.push('Please provide companion details or set companions to 0');
        }
        
        if (errors.length > 0) {
            if (window.app) {
                window.app.showNotification(`Validation errors: ${errors.join(', ')}`, 'error');
            }
            
            if (window.audioManager) {
                window.audioManager.playError();
            }
            
            return false;
        }
        
        return true;
    }
    
    async saveTrip(trip) {
        try {
            // Save to Firebase if user is authenticated
            if (window.firebaseService && window.firebaseService.isAuthenticated()) {
                console.log('💾 Saving trip to Firebase...');
                
                const tripData = {
                    ...trip,
                    synced: true
                };
                
                const tripId = await window.firebaseService.saveTrip(tripData);
                trip.id = tripId;
                trip.synced = true;
                
                console.log('✅ Trip saved to Firebase with ID:', tripId);
                
                // Update dashboard stats
                if (window.dashboardManager) {
                    window.dashboardManager.updateStatsAfterTrip();
                }
            } else {
                // Save locally if not authenticated
                console.log('💾 Saving trip locally (not authenticated)...');
                trip.synced = false;
            }
            
            // Always save to localStorage as backup/cache
            let trips = [];
            const existingTrips = localStorage.getItem('travique_trips');
            
            if (existingTrips) {
                trips = JSON.parse(existingTrips);
            }
            
            trips.push(trip);
            localStorage.setItem('travique_trips', JSON.stringify(trips));
            
            this.currentTrip = trip;
            
            console.log('💾 Trip saved successfully:', trip);
            
        } catch (error) {
            console.error('Failed to save trip:', error);
            
            // Fallback to localStorage only
            try {
                let trips = [];
                const existingTrips = localStorage.getItem('travique_trips');
                
                if (existingTrips) {
                    trips = JSON.parse(existingTrips);
                }
                
                trip.synced = false;
                trips.push(trip);
                localStorage.setItem('travique_trips', JSON.stringify(trips));
                
                this.currentTrip = trip;
                
                console.log('💾 Trip saved to localStorage as fallback');
                
                if (window.app) {
                    window.app.showNotification('Trip saved locally. Will sync when you sign in.', 'warning');
                }
            } catch (localError) {
                console.error('Failed to save trip locally:', localError);
                if (window.app) {
                    window.app.showNotification('Failed to save trip data', 'error');
                }
            }
        }
    }
    
    saveDraftTrip() {
        console.log('📝 Saving draft trip...');
        
        const formData = this.collectFormData();
        if (!formData) return;
        
        const draft = {
            id: `draft_${Date.now()}`,
            ...formData,
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('travique_draft_trip', JSON.stringify(draft));
            
            if (window.app) {
                window.app.showNotification('Trip draft saved successfully', 'success');
            }
            
            console.log('💾 Draft saved:', draft);
            
        } catch (error) {
            console.error('Failed to save draft:', error);
            if (window.app) {
                window.app.showNotification('Failed to save draft', 'error');
            }
        }
    }
    
    loadDraftTrip() {
        try {
            const draft = localStorage.getItem('travique_draft_trip');
            if (draft) {
                const draftData = JSON.parse(draft);
                this.populateForm(draftData);
                
                if (window.app) {
                    window.app.showNotification('Draft trip loaded', 'info');
                }
                
                return draftData;
            }
        } catch (error) {
            console.error('Failed to load draft:', error);
        }
        
        return null;
    }
    
    populateForm(tripData) {
        console.log('📝 Populating form with trip data:', tripData);
        
        // Basic fields
        const fields = ['origin', 'destination', 'departureTime', 'transportMode', 'tripPurpose', 'companions'];
        
        fields.forEach(field => {
            const input = document.getElementById(`trip-${field}`) || document.getElementById(field);
            if (input && tripData[field] !== undefined) {
                input.value = tripData[field];
            }
        });
        
        // Update companion fields if needed
        if (tripData.companions > 0) {
            setTimeout(() => {
                this.updateCompanionFields(tripData.companions);
                
                // Populate companion details
                if (tripData.companionDetails && tripData.companionDetails.length > 0) {
                    setTimeout(() => {
                        tripData.companionDetails.forEach((companion, index) => {
                            const nameInput = document.getElementById(`companion-name-${index}`);
                            const relationSelect = document.getElementById(`companion-relation-${index}`);
                            
                            if (nameInput) nameInput.value = companion.name || '';
                            if (relationSelect) relationSelect.value = companion.relation || '';
                        });
                    }, 100);
                }
            }, 100);
        }
    }
    
    startTripTracking(trip) {
        console.log('🚀 Starting real-time trip tracking for:', trip.id);
        
        // Track trip start analytics
        if (window.analyticsService) {
            window.analyticsService.trackTripAction('start', {
                id: trip.id,
                transportMode: trip.transportMode,
                companions: trip.companions || 0,
                hasPlannedRoute: !!trip.route
            });
        }
        
        this.currentTrip = trip;
        this.trackingData = {
            waypoints: [],
            startTime: new Date(),
            totalDistance: 0,
            currentSpeed: 0,
            averageSpeed: 0,
            isTracking: true
        };
        
        // Initialize trip tracking
        trip.startTime = new Date().toISOString();
        trip.trackingActive = true;
        trip.status = 'in-progress';
        trip.trackingData = this.trackingData;
        
        // Start GPS tracking if geolocation is available
        if (navigator.geolocation) {
            this.startGPSTracking();
        } else {
            console.warn('⚠️ Geolocation not available, tracking limited functionality');
            if (window.app) {
                window.app.showNotification('GPS not available. Limited tracking functionality.', 'warning');
            }
        }
        
        // Start tracking timers
        this.startTrackingTimers();
        
        // Update UI to show tracking status
        this.updateTrackingUI();
        
        // Update trip in storage
        this.updateTripInStorage(trip);
        
        console.log('✅ Trip tracking started successfully');
    }
    
    startGPSTracking() {
        if (!navigator.geolocation) return;
        
        console.log('📍 Starting GPS tracking...');
        
        // High accuracy GPS tracking options
        const options = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 5000
        };
        
        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.handleLocationUpdate(position);
            },
            (error) => {
                console.error('❌ Initial GPS position error:', error);
                this.handleLocationError(error);
            },
            options
        );
        
        // Start continuous position tracking
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.handleLocationUpdate(position);
            },
            (error) => {
                console.error('❌ GPS tracking error:', error);
                this.handleLocationError(error);
            },
            options
        );
        
        console.log('✅ GPS tracking started with watch ID:', this.watchId);
    }
    
    handleLocationUpdate(position) {
        if (!this.trackingData || !this.trackingData.isTracking) return;
        
        const { latitude, longitude, accuracy, speed, heading, timestamp } = position.coords;
        
        const waypoint = {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy,
            speed: speed || 0,
            heading: heading || 0,
            timestamp: timestamp || Date.now(),
            recorded: new Date().toISOString()
        };
        
        // Add waypoint to tracking data
        this.trackingData.waypoints.push(waypoint);
        
        // Calculate distance if we have previous waypoint
        if (this.trackingData.waypoints.length > 1) {
            const previousWaypoint = this.trackingData.waypoints[this.trackingData.waypoints.length - 2];
            const distance = this.calculateDistance(
                previousWaypoint.lat, previousWaypoint.lng,
                waypoint.lat, waypoint.lng
            );
            
            this.trackingData.totalDistance += distance;
            waypoint.segmentDistance = distance;
        }
        
        // Update current speed
        this.trackingData.currentSpeed = speed ? speed * 3.6 : 0; // Convert m/s to km/h
        
        // Calculate average speed
        const elapsed = (Date.now() - this.trackingData.startTime.getTime()) / 1000 / 3600; // hours
        this.trackingData.averageSpeed = elapsed > 0 ? this.trackingData.totalDistance / elapsed : 0;
        
        // Update map if available
        if (window.mapManager && window.mapManager.isReady()) {
            this.updateTripOnMap(waypoint);
        }
        
        // Update tracking UI
        this.updateTrackingUI();
        
        // Auto-save tracking data every 10 waypoints
        if (this.trackingData.waypoints.length % 10 === 0) {
            this.saveTrackingProgress();
        }
        
        console.log('📍 Location updated:', waypoint);
    }
    
    handleLocationError(error) {
        let message = 'GPS tracking error';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'GPS permission denied. Please enable location access.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'GPS position unavailable.';
                break;
            case error.TIMEOUT:
                message = 'GPS timeout. Retrying...';
                // Retry after timeout
                setTimeout(() => {
                    if (this.trackingData && this.trackingData.isTracking) {
                        this.startGPSTracking();
                    }
                }, 5000);
                return;
        }
        
        console.warn('⚠️ GPS Error:', message);
        
        if (window.app) {
            window.app.showNotification(message, 'warning');
        }
    }
    
    calculateDistance(lat1, lng1, lat2, lng2) {
        // Haversine formula for calculating distance between two points
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLng = this.degreesToRadians(lng2 - lng1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance; // Distance in kilometers
    }
    
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    updateTripOnMap(waypoint) {
        if (!window.mapManager || !window.mapManager.isReady()) return;
        
        const map = window.mapManager.getMap();
        if (!map) return;
        
        // Center map on current location
        const position = { lat: waypoint.lat, lng: waypoint.lng };
        map.setCenter(position);
        
        // Add marker for current position if not exists
        if (!this.currentLocationMarker) {
            this.currentLocationMarker = new google.maps.Marker({
                position: position,
                map: map,
                title: 'Current Location',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#00ff00',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                },
                animation: google.maps.Animation.BOUNCE
            });
        } else {
            this.currentLocationMarker.setPosition(position);
        }
        
        // Draw route path
        if (!this.routePath) {
            this.routePath = new google.maps.Polyline({
                path: [],
                geodesic: true,
                strokeColor: '#00d4ff',
                strokeOpacity: 1.0,
                strokeWeight: 3,
                map: map
            });
        }
        
        // Add current position to route path
        const path = this.routePath.getPath();
        path.push(new google.maps.LatLng(waypoint.lat, waypoint.lng));
    }
    
    startTrackingTimers() {
        // Update tracking UI every 5 seconds
        this.uiUpdateInterval = setInterval(() => {
            if (this.trackingData && this.trackingData.isTracking) {
                this.updateTrackingUI();
            }
        }, 5000);
        
        // Auto-save progress every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.trackingData && this.trackingData.isTracking) {
                this.saveTrackingProgress();
            }
        }, 30000);
    }
    
    updateTrackingUI() {
        // Update tracking status in UI
        const trackingStatus = document.getElementById('tracking-status');
        if (trackingStatus && this.trackingData) {
            const elapsed = Math.floor((Date.now() - this.trackingData.startTime.getTime()) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            
            trackingStatus.innerHTML = `
                <div class="tracking-info">
                    <div class="tracking-stat">
                        <span class="stat-label">Duration</span>
                        <span class="stat-value">${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</span>
                    </div>
                    <div class="tracking-stat">
                        <span class="stat-label">Distance</span>
                        <span class="stat-value">${this.trackingData.totalDistance.toFixed(2)} km</span>
                    </div>
                    <div class="tracking-stat">
                        <span class="stat-label">Speed</span>
                        <span class="stat-value">${this.trackingData.currentSpeed.toFixed(1)} km/h</span>
                    </div>
                    <div class="tracking-stat">
                        <span class="stat-label">Waypoints</span>
                        <span class="stat-value">${this.trackingData.waypoints.length}</span>
                    </div>
                </div>
                <button class="stop-tracking-btn" onclick="window.tripManager.stopTripTracking()">
                    <i class="fas fa-stop"></i> Stop Tracking
                </button>
            `;
        }
        
        // Update dashboard if available
        if (window.dashboardManager) {
            window.dashboardManager.updateActiveTrip(this.currentTrip, this.trackingData);
        }
    }
    
    saveTrackingProgress() {
        if (!this.currentTrip || !this.trackingData) return;
        
        try {
            // Update current trip with latest tracking data
            this.currentTrip.trackingData = { ...this.trackingData };
            this.currentTrip.distance = this.trackingData.totalDistance;
            this.currentTrip.updatedAt = new Date().toISOString();
            
            // Save to storage
            this.updateTripInStorage(this.currentTrip);
            
            // Sync to Firebase if authenticated
            if (window.firebaseService && window.firebaseService.isAuthenticated()) {
                window.firebaseService.updateTrip(this.currentTrip.id, {
                    trackingData: this.trackingData,
                    distance: this.trackingData.totalDistance,
                    updatedAt: this.currentTrip.updatedAt
                }).catch(error => {
                    console.warn('Failed to sync tracking data to Firebase:', error);
                });
            }
            
            console.log('💾 Tracking progress saved');
        } catch (error) {
            console.error('Failed to save tracking progress:', error);
        }
    }
    
    stopTripTracking() {
        if (!this.currentTrip) return;
        
        console.log('🛑 Stopping trip tracking for:', this.currentTrip.id);
        
        // Stop GPS tracking
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        
        // Stop tracking timers
        if (this.uiUpdateInterval) {
            clearInterval(this.uiUpdateInterval);
            this.uiUpdateInterval = null;
        }
        
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        // Mark tracking as stopped
        if (this.trackingData) {
            this.trackingData.isTracking = false;
            this.trackingData.endTime = new Date();
        }
        
        this.currentTrip.endTime = new Date().toISOString();
        this.currentTrip.trackingActive = false;
        this.currentTrip.status = 'completed';
        
        // Calculate final trip duration
        if (this.currentTrip.startTime) {
            const start = new Date(this.currentTrip.startTime);
            const end = new Date(this.currentTrip.endTime);
            this.currentTrip.duration = Math.round((end - start) / 60000); // minutes
        }
        
        // Save final tracking data
        if (this.trackingData) {
            this.currentTrip.finalDistance = this.trackingData.totalDistance;
            this.currentTrip.averageSpeed = this.trackingData.averageSpeed;
            this.currentTrip.waypointCount = this.trackingData.waypoints.length;
        }
        
        // Track trip completion analytics
        if (window.analyticsService) {
            window.analyticsService.trackTripAction('complete', {
                id: this.currentTrip.id,
                transportMode: this.currentTrip.transportMode,
                duration: this.currentTrip.duration,
                distance: this.currentTrip.finalDistance || 0,
                waypoints: this.currentTrip.waypointCount || 0,
                averageSpeed: this.currentTrip.averageSpeed || 0
            });
        }
        
        // Final save
        this.saveTrackingProgress();
        
        // Clean up map elements
        if (this.currentLocationMarker) {
            this.currentLocationMarker.setMap(null);
            this.currentLocationMarker = null;
        }
        
        if (this.routePath) {
            this.routePath.setMap(null);
            this.routePath = null;
        }
        
        // Update UI
        const trackingStatus = document.getElementById('tracking-status');
        if (trackingStatus) {
            trackingStatus.innerHTML = `
                <div class="trip-completed">
                    <i class="fas fa-check-circle"></i>
                    <h3>Trip Completed!</h3>
                    <p>Duration: ${this.currentTrip.duration || 0} minutes</p>
                    <p>Distance: ${this.currentTrip.finalDistance?.toFixed(2) || 0} km</p>
                </div>
            `;
        }
        
        if (window.app) {
            window.app.showNotification('Trip completed successfully!', 'success');
        }
        
        if (window.audioManager) {
            window.audioManager.playSuccess();
        }
        
        // Reset current trip
        this.currentTrip = null;
        this.trackingData = null;
        
        console.log('✅ Trip tracking stopped and saved');
    }
    
    updateTripInStorage(trip) {
        try {
            let trips = JSON.parse(localStorage.getItem('travique_trips')) || [];
            const index = trips.findIndex(t => t.id === trip.id);
            
            if (index >= 0) {
                trips[index] = { ...trips[index], ...trip };
            } else {
                trips.push(trip);
            }
            
            localStorage.setItem('travique_trips', JSON.stringify(trips));
            
        } catch (error) {
            console.error('Failed to update trip in storage:', error);
        }
    }
    
    generateTripId() {
        return `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Utility Methods
    getCurrentTrip() {
        return this.currentTrip;
    }
    
    getAllTrips() {
        try {
            const trips = localStorage.getItem('travique_trips');
            return trips ? JSON.parse(trips) : [];
        } catch (error) {
            console.error('Failed to get trips:', error);
            return [];
        }
    }
    
    getTripById(id) {
        const trips = this.getAllTrips();
        return trips.find(trip => trip.id === id);
    }
    
    deleteTrip(id) {
        try {
            let trips = this.getAllTrips();
            trips = trips.filter(trip => trip.id !== id);
            localStorage.setItem('travique_trips', JSON.stringify(trips));
            return true;
        } catch (error) {
            console.error('Failed to delete trip:', error);
            return false;
        }
    }
    
    clearForm() {
        const form = document.getElementById('trip-form');
        if (form) {
            form.reset();
            
            // Reset companion fields
            const companionDetails = document.getElementById('companion-details');
            if (companionDetails) {
                companionDetails.style.display = 'none';
            }
            
            // Reset current date/time
            const departureTimeInput = document.getElementById('departure-time');
            if (departureTimeInput) {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                departureTimeInput.value = now.toISOString().slice(0, 16);
            }
        }
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TripManager;
}