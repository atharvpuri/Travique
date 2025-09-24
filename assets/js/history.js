// History Manager - Display and manage trip history
class HistoryManager {
    constructor() {
        this.trips = [];
        this.filteredTrips = [];
        this.currentFilter = {
            dateRange: 'all',
            transportMode: 'all'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFirebaseListeners();
    }

    setupEventListeners() {
        // Filter controls
        const dateFilter = document.getElementById('date-filter');
        const modeFilter = document.getElementById('mode-filter');
        
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.currentFilter.dateRange = e.target.value;
                this.applyFilters();
            });
        }
        
        if (modeFilter) {
            modeFilter.addEventListener('change', (e) => {
                this.currentFilter.transportMode = e.target.value;
                this.applyFilters();
            });
        }

        // New trip button in empty state
        const newTripBtns = document.querySelectorAll('[data-action="new-trip"]');
        newTripBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.navigationManager) {
                    window.navigationManager.showSection('trip');
                }
            });
        });
    }

    setupFirebaseListeners() {
        // Wait for Firebase service to be available
        const checkFirebase = () => {
            if (window.firebaseService) {
                window.firebaseService.onAuthStateChanged((user) => {
                    if (user) {
                        this.loadTripHistory();
                    } else {
                        this.clearHistory();
                    }
                });
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    }

    async loadTripHistory() {
        try {
            console.log('📊 Loading trip history...');
            
            // Load from Firebase if authenticated
            if (window.firebaseService && window.firebaseService.isAuthenticated()) {
                this.trips = await window.firebaseService.getUserTrips();
                console.log('✅ Loaded trips from Firebase:', this.trips.length);
            } else {
                // Fallback to localStorage
                this.loadFromLocalStorage();
            }
            
            this.applyFilters();
            this.displayHistory();
            
        } catch (error) {
            console.error('Error loading trip history:', error);
            // Fallback to localStorage on error
            this.loadFromLocalStorage();
            this.applyFilters();
            this.displayHistory();
        }
    }

    loadFromLocalStorage() {
        try {
            const storedTrips = localStorage.getItem('travique_trips');
            if (storedTrips) {
                this.trips = JSON.parse(storedTrips);
                console.log('📱 Loaded trips from localStorage:', this.trips.length);
            } else {
                this.trips = [];
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.trips = [];
        }
    }

    applyFilters() {
        this.filteredTrips = this.trips.filter(trip => {
            // Date filter
            if (this.currentFilter.dateRange !== 'all') {
                const tripDate = new Date(trip.createdAt || trip.createdAt?.seconds * 1000);
                const now = new Date();
                let cutoffDate = new Date();
                
                switch (this.currentFilter.dateRange) {
                    case 'week':
                        cutoffDate.setDate(now.getDate() - 7);
                        break;
                    case 'month':
                        cutoffDate.setMonth(now.getMonth() - 1);
                        break;
                    case 'quarter':
                        cutoffDate.setMonth(now.getMonth() - 3);
                        break;
                    case 'year':
                        cutoffDate.setFullYear(now.getFullYear() - 1);
                        break;
                }
                
                if (tripDate < cutoffDate) {
                    return false;
                }
            }
            
            // Transport mode filter
            if (this.currentFilter.transportMode !== 'all') {
                if (trip.transportMode !== this.currentFilter.transportMode) {
                    return false;
                }
            }
            
            return true;
        });

        // Sort by date (newest first)
        this.filteredTrips.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.createdAt?.seconds * 1000);
            const dateB = new Date(b.createdAt || b.createdAt?.seconds * 1000);
            return dateB - dateA;
        });
    }

    displayHistory() {
        const historyList = document.querySelector('.history-list');
        if (!historyList) return;

        if (this.filteredTrips.length === 0) {
            this.showEmptyState();
            return;
        }

        // Clear existing content
        historyList.innerHTML = '';

        // Create trip cards
        this.filteredTrips.forEach(trip => {
            const tripCard = this.createTripCard(trip);
            historyList.appendChild(tripCard);
        });
    }

    createTripCard(trip) {
        const card = document.createElement('div');
        card.className = 'trip-card';
        card.setAttribute('data-trip-id', trip.id);

        const tripDate = new Date(trip.createdAt || trip.createdAt?.seconds * 1000);
        const formattedDate = this.formatDate(tripDate);
        const formattedTime = this.formatTime(tripDate);

        const transportIcon = this.getTransportIcon(trip.transportMode);
        const statusClass = this.getStatusClass(trip.status);
        const statusText = this.getStatusText(trip.status);

        card.innerHTML = `
            <div class="trip-card-header">
                <div class="trip-info">
                    <div class="trip-route">
                        <span class="origin">${trip.origin || 'Unknown Origin'}</span>
                        <i class="fas fa-arrow-right"></i>
                        <span class="destination">${trip.destination || 'Unknown Destination'}</span>
                    </div>
                    <div class="trip-meta">
                        <span class="trip-date">${formattedDate}</span>
                        <span class="trip-time">${formattedTime}</span>
                    </div>
                </div>
                <div class="trip-status ${statusClass}">
                    <span>${statusText}</span>
                </div>
            </div>
            
            <div class="trip-card-body">
                <div class="trip-details">
                    <div class="detail-item">
                        <i class="${transportIcon}"></i>
                        <span>${trip.transportMode || 'Unknown'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-bullseye"></i>
                        <span>${trip.tripPurpose || 'No purpose specified'}</span>
                    </div>
                    ${trip.companions > 0 ? `
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span>${trip.companions} companion${trip.companions > 1 ? 's' : ''}</span>
                        </div>
                    ` : ''}
                    ${trip.distance ? `
                        <div class="detail-item">
                            <i class="fas fa-road"></i>
                            <span>${trip.distance.toFixed(1)} km</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="trip-card-actions">
                <button class="action-btn secondary" onclick="historyManager.viewTripDetails('${trip.id}')">
                    <i class="fas fa-eye"></i>
                    <span>View Details</span>
                </button>
                <button class="action-btn secondary" onclick="historyManager.editTrip('${trip.id}')">
                    <i class="fas fa-edit"></i>
                    <span>Edit</span>
                </button>
                <button class="action-btn danger" onclick="historyManager.deleteTrip('${trip.id}')">
                    <i class="fas fa-trash"></i>
                    <span>Delete</span>
                </button>
            </div>
        `;

        return card;
    }

    showEmptyState() {
        const historyList = document.querySelector('.history-list');
        if (!historyList) return;

        const isAuthenticated = window.firebaseService && window.firebaseService.isAuthenticated();
        
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-route"></i>
                <h3>${isAuthenticated ? 'No trips recorded yet' : 'Sign in to view your trip history'}</h3>
                <p>${isAuthenticated ? 'Start planning your first trip to see data here' : 'Your trip history will appear here after you sign in'}</p>
                ${isAuthenticated ? `
                    <button class="primary-btn" data-action="new-trip">
                        <i class="fas fa-plus"></i>
                        Plan First Trip
                    </button>
                ` : ''}
            </div>
        `;

        // Re-add event listener for new trip button
        const newTripBtn = historyList.querySelector('[data-action="new-trip"]');
        if (newTripBtn) {
            newTripBtn.addEventListener('click', () => {
                if (window.navigationManager) {
                    window.navigationManager.showSection('trip');
                }
            });
        }
    }

    // Trip Actions
    viewTripDetails(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;

        console.log('Opening trip details for:', trip.id);
        
        // Remove existing modal if present
        this.removeExistingModal('trip-details-modal');
        
        // Create trip details modal
        const modal = this.createTripDetailsModal(trip);
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Initialize modal functionality
        this.initializeTripDetailsModal(trip);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    createTripDetailsModal(trip) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'trip-details-modal';
        modal.innerHTML = `
            <div class="modal-container trip-details-container">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <i class="fas fa-route"></i>
                        Trip Details
                    </h2>
                    <button class="modal-close" onclick="window.historyManager.closeTripDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.getTripDetailsContent(trip)}
                </div>
            </div>
        `;
        
        // Close modal when clicking overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeTripDetailsModal();
            }
        });
        
        return modal;
    }
    
    getTripDetailsContent(trip) {
        const startDate = new Date(trip.createdAt || trip.startTime || Date.now());
        const endDate = trip.endTime ? new Date(trip.endTime) : null;
        const duration = trip.duration || 0;
        const distance = trip.distance || trip.finalDistance || 0;
        const waypoints = trip.trackingData?.waypoints || [];
        
        return `
            <div class="trip-details-content">
                <div class="trip-overview">
                    <div class="trip-route">
                        <div class="route-point origin">
                            <div class="route-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="route-info">
                                <h4>Origin</h4>
                                <p>${trip.origin || 'Unknown location'}</p>
                            </div>
                        </div>
                        
                        <div class="route-line">
                            <div class="route-progress" style="width: 100%"></div>
                        </div>
                        
                        <div class="route-point destination">
                            <div class="route-icon">
                                <i class="fas fa-flag-checkered"></i>
                            </div>
                            <div class="route-info">
                                <h4>Destination</h4>
                                <p>${trip.destination || 'Unknown location'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="trip-summary-stats">
                        <div class="summary-stat">
                            <div class="stat-icon">
                                <i class="fas fa-calendar"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Date</h4>
                                <p>${startDate.toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div class="summary-stat">
                            <div class="stat-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Duration</h4>
                                <p>${this.formatDuration(duration)}</p>
                            </div>
                        </div>
                        
                        <div class="summary-stat">
                            <div class="stat-icon">
                                <i class="fas fa-road"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Distance</h4>
                                <p>${distance.toFixed(2)} km</p>
                            </div>
                        </div>
                        
                        <div class="summary-stat">
                            <div class="stat-icon">
                                <i class="fas fa-${this.getTransportIcon(trip.transportMode)}"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Transport</h4>
                                <p>${this.formatTransportMode(trip.transportMode)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="trip-details-tabs">
                    <button class="details-tab active" data-tab="info">
                        <i class="fas fa-info-circle"></i>
                        Information
                    </button>
                    <button class="details-tab" data-tab="tracking">
                        <i class="fas fa-route"></i>
                        Tracking Data
                    </button>
                    <button class="details-tab" data-tab="map">
                        <i class="fas fa-map"></i>
                        Route Map
                    </button>
                    <button class="details-tab" data-tab="analysis">
                        <i class="fas fa-chart-line"></i>
                        Analysis
                    </button>
                </div>
                
                <div class="trip-details-content-area">
                    <div class="details-tab-content" id="info-content">
                        <div class="info-grid">
                            <div class="info-section">
                                <h4>Trip Information</h4>
                                <div class="info-list">
                                    <div class="info-item">
                                        <span class="info-label">Purpose:</span>
                                        <span class="info-value">${this.formatTripPurpose(trip.tripPurpose)}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Departure Time:</span>
                                        <span class="info-value">${trip.departureTime ? new Date(trip.departureTime).toLocaleString() : 'Not specified'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Start Time:</span>
                                        <span class="info-value">${startDate.toLocaleString()}</span>
                                    </div>
                                    ${endDate ? `
                                    <div class="info-item">
                                        <span class="info-label">End Time:</span>
                                        <span class="info-value">${endDate.toLocaleString()}</span>
                                    </div>
                                    ` : ''}
                                    <div class="info-item">
                                        <span class="info-label">Status:</span>
                                        <span class="info-value status-${trip.status || 'unknown'}">${this.formatStatus(trip.status)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${trip.companions > 0 ? `
                            <div class="info-section">
                                <h4>Companions (${trip.companions})</h4>
                                <div class="companions-list">
                                    ${trip.companionDetails ? trip.companionDetails.map(companion => `
                                        <div class="companion-item">
                                            <i class="fas fa-user"></i>
                                            <span>${companion.name} (${companion.relation})</span>
                                        </div>
                                    `).join('') : `<p>No detailed companion information</p>`}
                                </div>
                            </div>
                            ` : ''}
                            
                            <div class="info-section">
                                <h4>Trip Statistics</h4>
                                <div class="info-list">
                                    <div class="info-item">
                                        <span class="info-label">Average Speed:</span>
                                        <span class="info-value">${trip.averageSpeed?.toFixed(1) || 0} km/h</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Waypoints Recorded:</span>
                                        <span class="info-value">${waypoints.length}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Data Quality:</span>
                                        <span class="info-value">${this.getDataQuality(trip)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="details-tab-content hidden" id="tracking-content">
                        <div class="tracking-data">
                            ${waypoints.length > 0 ? `
                                <div class="waypoints-summary">
                                    <h4>GPS Tracking Summary</h4>
                                    <div class="tracking-stats">
                                        <div class="tracking-stat">
                                            <span class="stat-label">Total Waypoints:</span>
                                            <span class="stat-value">${waypoints.length}</span>
                                        </div>
                                        <div class="tracking-stat">
                                            <span class="stat-label">Recording Frequency:</span>
                                            <span class="stat-value">${this.getRecordingFrequency(waypoints)}</span>
                                        </div>
                                        <div class="tracking-stat">
                                            <span class="stat-label">GPS Accuracy:</span>
                                            <span class="stat-value">${this.getAverageAccuracy(waypoints)} m</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="waypoints-list">
                                    <h4>Recent Waypoints</h4>
                                    <div class="waypoints-table">
                                        <div class="waypoint-header">
                                            <span>Time</span>
                                            <span>Location</span>
                                            <span>Speed</span>
                                            <span>Accuracy</span>
                                        </div>
                                        ${waypoints.slice(-10).reverse().map(waypoint => `
                                            <div class="waypoint-row">
                                                <span>${new Date(waypoint.recorded).toLocaleTimeString()}</span>
                                                <span>${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)}</span>
                                                <span>${(waypoint.speed * 3.6).toFixed(1)} km/h</span>
                                                <span>${waypoint.accuracy?.toFixed(0) || 'N/A'} m</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : `
                                <div class="no-tracking-data">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <h4>No Tracking Data</h4>
                                    <p>This trip was created without GPS tracking or the data was not saved.</p>
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <div class="details-tab-content hidden" id="map-content">
                        <div class="route-map-container">
                            <div id="trip-details-map" class="trip-details-map">
                                <div class="map-loading">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <p>Loading route map...</p>
                                </div>
                            </div>
                            <div class="map-controls">
                                <button class="map-control-btn" onclick="window.historyManager.centerMapOnRoute()">
                                    <i class="fas fa-crosshairs"></i>
                                    Center Route
                                </button>
                                <button class="map-control-btn" onclick="window.historyManager.exportRoute()">
                                    <i class="fas fa-download"></i>
                                    Export Route
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="details-tab-content hidden" id="analysis-content">
                        <div class="analysis-grid">
                            <div class="analysis-chart">
                                <h4>Speed Analysis</h4>
                                <div class="chart-placeholder">
                                    <i class="fas fa-chart-line"></i>
                                    <p>Speed over time chart would be displayed here</p>
                                </div>
                            </div>
                            
                            <div class="analysis-insights">
                                <h4>Trip Insights</h4>
                                <div class="insights-list">
                                    ${this.getTripInsights(trip)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="trip-actions">
                    <button class="btn secondary" onclick="window.historyManager.editTrip('${trip.id}')">
                        <i class="fas fa-edit"></i>
                        Edit Trip
                    </button>
                    <button class="btn secondary" onclick="window.historyManager.shareTrip('${trip.id}')">
                        <i class="fas fa-share"></i>
                        Share
                    </button>
                    <button class="btn secondary" onclick="window.historyManager.exportTrip('${trip.id}')">
                        <i class="fas fa-download"></i>
                        Export
                    </button>
                    <button class="btn danger" onclick="window.historyManager.deleteTrip('${trip.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }
    
    initializeTripDetailsModal(trip) {
        // Tab switching
        const tabs = document.querySelectorAll('.details-tab');
        const contents = document.querySelectorAll('.details-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                contents.forEach(content => content.classList.add('hidden'));
                const targetContent = document.getElementById(`${tabName}-content`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    
                    // Initialize map if map tab is selected
                    if (tabName === 'map') {
                        this.initializeTripMap(trip);
                    }
                }
            });
        });
    }
    
    initializeTripMap(trip) {
        const mapContainer = document.getElementById('trip-details-map');
        if (!mapContainer || !window.google) return;
        
        try {
            // Clear loading message
            mapContainer.innerHTML = '';
            
            // Create map
            const map = new google.maps.Map(mapContainer, {
                zoom: 13,
                center: { lat: 0, lng: 0 },
                styles: this.getMapStyles()
            });
            
            // Add route if waypoints exist
            const waypoints = trip.trackingData?.waypoints || [];
            if (waypoints.length > 0) {
                const path = waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }));
                
                // Create polyline for route
                const routePath = new google.maps.Polyline({
                    path: path,
                    geodesic: true,
                    strokeColor: '#00d4ff',
                    strokeOpacity: 1.0,
                    strokeWeight: 3,
                    map: map
                });
                
                // Add start marker
                new google.maps.Marker({
                    position: path[0],
                    map: map,
                    title: 'Start',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#00ff00',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                    }
                });
                
                // Add end marker
                new google.maps.Marker({
                    position: path[path.length - 1],
                    map: map,
                    title: 'End',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#ff0000',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                    }
                });
                
                // Fit map to route bounds
                const bounds = new google.maps.LatLngBounds();
                path.forEach(point => bounds.extend(point));
                map.fitBounds(bounds);
                
                // Store map reference for controls
                this.tripDetailsMap = { map, routePath, bounds };
            } else {
                // No waypoints, show message
                mapContainer.innerHTML = `
                    <div class="no-map-data">
                        <i class="fas fa-map"></i>
                        <h4>No Route Data</h4>
                        <p>This trip doesn't have GPS tracking data to display on the map.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error initializing trip map:', error);
            mapContainer.innerHTML = `
                <div class="map-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Map Error</h4>
                    <p>Unable to load the route map.</p>
                </div>
            `;
        }
    }
    
    // Utility methods for trip details
    formatDuration(minutes) {
        if (!minutes) return '0 min';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }
    
    formatTransportMode(mode) {
        const modes = {
            car: 'Private Car',
            bus: 'Bus',
            train: 'Train',
            metro: 'Metro',
            taxi: 'Taxi/Cab',
            bike: 'Bicycle',
            walk: 'Walking',
            motorcycle: 'Motorcycle',
            auto: 'Auto Rickshaw',
            other: 'Other'
        };
        return modes[mode] || mode || 'Not specified';
    }
    
    formatTripPurpose(purpose) {
        const purposes = {
            work: 'Work/Business',
            education: 'Education',
            shopping: 'Shopping',
            medical: 'Medical',
            recreation: 'Recreation',
            social: 'Social/Family',
            personal: 'Personal',
            other: 'Other'
        };
        return purposes[purpose] || purpose || 'Not specified';
    }
    
    formatStatus(status) {
        const statuses = {
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'draft': 'Draft'
        };
        return statuses[status] || status || 'Unknown';
    }
    
    getTransportIcon(mode) {
        const icons = {
            car: 'car',
            bus: 'bus',
            train: 'train',
            metro: 'subway',
            taxi: 'taxi',
            bike: 'bicycle',
            walk: 'walking',
            motorcycle: 'motorcycle',
            auto: 'taxi',
            other: 'question'
        };
        return icons[mode] || 'question';
    }
    
    getDataQuality(trip) {
        const waypoints = trip.trackingData?.waypoints || [];
        if (waypoints.length === 0) return 'No GPS data';
        if (waypoints.length < 10) return 'Limited';
        if (waypoints.length < 50) return 'Good';
        return 'Excellent';
    }
    
    getRecordingFrequency(waypoints) {
        if (waypoints.length < 2) return 'N/A';
        
        const intervals = [];
        for (let i = 1; i < waypoints.length; i++) {
            const prev = new Date(waypoints[i-1].recorded);
            const curr = new Date(waypoints[i].recorded);
            intervals.push((curr - prev) / 1000); // seconds
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return `${avgInterval.toFixed(1)}s`;
    }
    
    getAverageAccuracy(waypoints) {
        const accuracies = waypoints.filter(wp => wp.accuracy).map(wp => wp.accuracy);
        if (accuracies.length === 0) return 'N/A';
        
        const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
        return avg.toFixed(0);
    }
    
    getTripInsights(trip) {
        const insights = [];
        const waypoints = trip.trackingData?.waypoints || [];
        
        if (waypoints.length > 0) {
            insights.push(`
                <div class="insight-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Recorded ${waypoints.length} GPS waypoints during the trip</span>
                </div>
            `);
        }
        
        if (trip.averageSpeed > 0) {
            const speedCategory = trip.averageSpeed > 50 ? 'High speed' : trip.averageSpeed > 25 ? 'Moderate speed' : 'Low speed';
            insights.push(`
                <div class="insight-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>${speedCategory} trip with average of ${trip.averageSpeed.toFixed(1)} km/h</span>
                </div>
            `);
        }
        
        if (trip.distance > 0) {
            const distanceCategory = trip.distance > 50 ? 'Long distance' : trip.distance > 10 ? 'Medium distance' : 'Short distance';
            insights.push(`
                <div class="insight-item">
                    <i class="fas fa-road"></i>
                    <span>${distanceCategory} journey covering ${trip.distance.toFixed(1)} km</span>
                </div>
            `);
        }
        
        if (insights.length === 0) {
            insights.push(`
                <div class="insight-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Limited trip data available for analysis</span>
                </div>
            `);
        }
        
        return insights.join('');
    }
    
    getMapStyles() {
        return [
            {
                "elementType": "geometry",
                "stylers": [{"color": "#1d2c4d"}]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#8ec3b9"}]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#1a3646"}]
            }
        ];
    }
    
    centerMapOnRoute() {
        if (this.tripDetailsMap && this.tripDetailsMap.bounds) {
            this.tripDetailsMap.map.fitBounds(this.tripDetailsMap.bounds);
        }
    }
    
    exportRoute() {
        if (window.app) {
            window.app.showNotification('Route export feature coming soon!', 'info');
        }
    }
    
    shareTrip(tripId) {
        if (window.app) {
            window.app.showNotification('Trip sharing feature coming soon!', 'info');
        }
    }
    
    exportTrip(tripId) {
        try {
            const trip = this.trips.find(t => t.id === tripId);
            if (!trip) return;
            
            const data = {
                trip: trip,
                exportDate: new Date().toISOString(),
                exportedBy: 'Travique App'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `trip_${trip.id}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            if (window.app) {
                window.app.showNotification('Trip exported successfully!', 'success');
            }
        } catch (error) {
            console.error('Error exporting trip:', error);
            if (window.app) {
                window.app.showNotification('Failed to export trip', 'error');
            }
        }
    }
    
    closeTripDetailsModal() {
        const modal = document.getElementById('trip-details-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentElement) {
                    modal.parentElement.removeChild(modal);
                }
            }, 300);
        }
    }
    
    removeExistingModal(modalId) {
        const existing = document.getElementById(modalId);
        if (existing) {
            existing.remove();
        }
    }
    
    editTrip(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;

        console.log('Opening trip editor for:', trip.id);
        
        // Remove existing modal if present
        this.removeExistingModal('trip-edit-modal');
        
        // Create trip edit modal
        const modal = this.createTripEditModal(trip);
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Initialize edit functionality
        this.initializeTripEditModal(trip);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    createTripEditModal(trip) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'trip-edit-modal';
        modal.innerHTML = `
            <div class="modal-container trip-edit-container">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <i class="fas fa-edit"></i>
                        Edit Trip
                    </h2>
                    <button class="modal-close" onclick="window.historyManager.closeTripEditModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.getTripEditContent(trip)}
                </div>
            </div>
        `;
        
        // Close modal when clicking overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeTripEditModal();
            }
        });
        
        return modal;
    }
    
    getTripEditContent(trip) {
        const startDate = new Date(trip.createdAt || trip.startTime || Date.now());
        
        return `
            <div class="trip-edit-content">
                <form class="trip-edit-form" id="trip-edit-form">
                    <div class="edit-section">
                        <h3>Basic Information</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="edit-origin">Origin Location</label>
                                <input type="text" id="edit-origin" name="origin" value="${trip.origin || ''}" placeholder="Enter starting location" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-destination">Destination</label>
                                <input type="text" id="edit-destination" name="destination" value="${trip.destination || ''}" placeholder="Enter destination" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-departure-time">Departure Time</label>
                                <input type="datetime-local" id="edit-departure-time" name="departureTime" value="${trip.departureTime ? new Date(trip.departureTime).toISOString().slice(0, 16) : ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-transport-mode">Transport Mode</label>
                                <select id="edit-transport-mode" name="transportMode">
                                    <option value="">Select transport mode</option>
                                    <option value="car" ${trip.transportMode === 'car' ? 'selected' : ''}>Private Car</option>
                                    <option value="bus" ${trip.transportMode === 'bus' ? 'selected' : ''}>Bus</option>
                                    <option value="train" ${trip.transportMode === 'train' ? 'selected' : ''}>Train</option>
                                    <option value="metro" ${trip.transportMode === 'metro' ? 'selected' : ''}>Metro</option>
                                    <option value="taxi" ${trip.transportMode === 'taxi' ? 'selected' : ''}>Taxi/Cab</option>
                                    <option value="bike" ${trip.transportMode === 'bike' ? 'selected' : ''}>Bicycle</option>
                                    <option value="walk" ${trip.transportMode === 'walk' ? 'selected' : ''}>Walking</option>
                                    <option value="motorcycle" ${trip.transportMode === 'motorcycle' ? 'selected' : ''}>Motorcycle</option>
                                    <option value="auto" ${trip.transportMode === 'auto' ? 'selected' : ''}>Auto Rickshaw</option>
                                    <option value="other" ${trip.transportMode === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-trip-purpose">Trip Purpose</label>
                                <select id="edit-trip-purpose" name="tripPurpose">
                                    <option value="">Select purpose</option>
                                    <option value="work" ${trip.tripPurpose === 'work' ? 'selected' : ''}>Work/Business</option>
                                    <option value="education" ${trip.tripPurpose === 'education' ? 'selected' : ''}>Education</option>
                                    <option value="shopping" ${trip.tripPurpose === 'shopping' ? 'selected' : ''}>Shopping</option>
                                    <option value="medical" ${trip.tripPurpose === 'medical' ? 'selected' : ''}>Medical</option>
                                    <option value="recreation" ${trip.tripPurpose === 'recreation' ? 'selected' : ''}>Recreation</option>
                                    <option value="social" ${trip.tripPurpose === 'social' ? 'selected' : ''}>Social/Family</option>
                                    <option value="personal" ${trip.tripPurpose === 'personal' ? 'selected' : ''}>Personal</option>
                                    <option value="other" ${trip.tripPurpose === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-status">Trip Status</label>
                                <select id="edit-status" name="status">
                                    <option value="draft" ${trip.status === 'draft' ? 'selected' : ''}>Draft</option>
                                    <option value="in-progress" ${trip.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="completed" ${trip.status === 'completed' ? 'selected' : ''}>Completed</option>
                                    <option value="cancelled" ${trip.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="edit-section">
                        <h3>Companions</h3>
                        <div class="form-group">
                            <label for="edit-companions">Number of Companions</label>
                            <input type="number" id="edit-companions" name="companions" min="0" value="${trip.companions || 0}">
                        </div>
                        
                        <div class="companion-details" id="edit-companion-details" ${(trip.companions || 0) === 0 ? 'style="display: none;"' : ''}>
                            <h4>Companion Details</h4>
                            <div id="edit-companion-list">
                                ${this.getCompanionEditHTML(trip.companionDetails || [])}
                            </div>
                        </div>
                    </div>
                    
                    <div class="edit-section">
                        <h3>Trip Statistics</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="edit-distance">Distance (km)</label>
                                <input type="number" id="edit-distance" name="distance" step="0.01" value="${trip.distance || trip.finalDistance || 0}" placeholder="0.00">
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-duration">Duration (minutes)</label>
                                <input type="number" id="edit-duration" name="duration" value="${trip.duration || 0}" placeholder="0">
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-average-speed">Average Speed (km/h)</label>
                                <input type="number" id="edit-average-speed" name="averageSpeed" step="0.1" value="${trip.averageSpeed || 0}" placeholder="0.0">
                            </div>
                        </div>
                    </div>
                    
                    <div class="edit-section">
                        <h3>Additional Notes</h3>
                        <div class="form-group">
                            <label for="edit-notes">Notes</label>
                            <textarea id="edit-notes" name="notes" rows="3" placeholder="Add any additional notes about this trip...">${trip.notes || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn secondary" onclick="window.historyManager.closeTripEditModal()">
                            Cancel
                        </button>
                        <button type="submit" class="btn primary">
                            <i class="fas fa-save"></i>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    getCompanionEditHTML(companions) {
        return companions.map((companion, index) => `
            <div class="companion-edit-item" data-index="${index}">
                <div class="companion-edit-fields">
                    <div class="form-group">
                        <label for="edit-companion-name-${index}">Name</label>
                        <input type="text" id="edit-companion-name-${index}" name="companionName[]" value="${companion.name || ''}" placeholder="Companion name">
                    </div>
                    <div class="form-group">
                        <label for="edit-companion-relation-${index}">Relation</label>
                        <select id="edit-companion-relation-${index}" name="companionRelation[]">
                            <option value="">Select relation</option>
                            <option value="family" ${companion.relation === 'family' ? 'selected' : ''}>Family</option>
                            <option value="friend" ${companion.relation === 'friend' ? 'selected' : ''}>Friend</option>
                            <option value="colleague" ${companion.relation === 'colleague' ? 'selected' : ''}>Colleague</option>
                            <option value="other" ${companion.relation === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                <button type="button" class="remove-companion-btn" onclick="window.historyManager.removeEditCompanion(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
    
    initializeTripEditModal(trip) {
        // Form submission
        const form = document.getElementById('trip-edit-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTripChanges(trip.id);
            });
        }
        
        // Companions count change
        const companionsInput = document.getElementById('edit-companions');
        if (companionsInput) {
            companionsInput.addEventListener('change', (e) => {
                this.updateEditCompanionFields(parseInt(e.target.value) || 0);
            });
        }
    }
    
    updateEditCompanionFields(count) {
        const companionDetails = document.getElementById('edit-companion-details');
        const companionList = document.getElementById('edit-companion-list');
        
        if (!companionDetails || !companionList) return;
        
        if (count > 0) {
            companionDetails.style.display = 'block';
            
            // Get current companions
            const currentCompanions = [];
            const existingItems = companionList.querySelectorAll('.companion-edit-item');
            existingItems.forEach((item, index) => {
                const nameInput = item.querySelector(`#edit-companion-name-${index}`);
                const relationSelect = item.querySelector(`#edit-companion-relation-${index}`);
                
                if (nameInput && relationSelect) {
                    currentCompanions.push({
                        name: nameInput.value,
                        relation: relationSelect.value
                    });
                }
            });
            
            // Adjust array to match count
            while (currentCompanions.length < count) {
                currentCompanions.push({ name: '', relation: '' });
            }
            currentCompanions.splice(count);
            
            // Re-render
            companionList.innerHTML = this.getCompanionEditHTML(currentCompanions);
        } else {
            companionDetails.style.display = 'none';
            companionList.innerHTML = '';
        }
    }
    
    removeEditCompanion(index) {
        const companionsInput = document.getElementById('edit-companions');
        if (companionsInput) {
            const currentCount = parseInt(companionsInput.value) || 0;
            if (currentCount > 0) {
                companionsInput.value = currentCount - 1;
                this.updateEditCompanionFields(currentCount - 1);
            }
        }
    }
    
    async saveTripChanges(tripId) {
        try {
            const form = document.getElementById('trip-edit-form');
            const formData = new FormData(form);
            
            // Collect form data
            const updates = {
                origin: formData.get('origin') || '',
                destination: formData.get('destination') || '',
                departureTime: formData.get('departureTime') || '',
                transportMode: formData.get('transportMode') || '',
                tripPurpose: formData.get('tripPurpose') || '',
                status: formData.get('status') || '',
                companions: parseInt(formData.get('companions')) || 0,
                distance: parseFloat(formData.get('distance')) || 0,
                duration: parseInt(formData.get('duration')) || 0,
                averageSpeed: parseFloat(formData.get('averageSpeed')) || 0,
                notes: formData.get('notes') || '',
                updatedAt: new Date().toISOString()
            };
            
            // Collect companion details
            updates.companionDetails = [];
            const companionNames = formData.getAll('companionName[]');
            const companionRelations = formData.getAll('companionRelation[]');
            
            for (let i = 0; i < companionNames.length; i++) {
                if (companionNames[i] && companionNames[i].trim()) {
                    updates.companionDetails.push({
                        name: companionNames[i].trim(),
                        relation: companionRelations[i] || 'other'
                    });
                }
            }
            
            // Validate data
            if (!updates.origin.trim() || !updates.destination.trim()) {
                if (window.app) {
                    window.app.showNotification('Origin and destination are required', 'error');
                }
                return;
            }
            
            // Find and update trip in local storage
            let trips = JSON.parse(localStorage.getItem('travique_trips') || '[]');
            const tripIndex = trips.findIndex(t => t.id === tripId);
            
            if (tripIndex === -1) {
                if (window.app) {
                    window.app.showNotification('Trip not found', 'error');
                }
                return;
            }
            
            // Update trip
            trips[tripIndex] = { ...trips[tripIndex], ...updates };
            localStorage.setItem('travique_trips', JSON.stringify(trips));
            
            // Update Firebase if authenticated
            if (window.firebaseService && window.firebaseService.isAuthenticated()) {
                try {
                    await window.firebaseService.updateTrip(tripId, updates);
                    console.log('Trip synced to Firebase');
                } catch (error) {
                    console.warn('Failed to sync to Firebase:', error);
                }
            }
            
            // Update local trips array
            this.trips = trips;
            
            // Refresh display
            this.renderTrips();
            
            // Close modal
            this.closeTripEditModal();
            
            if (window.app) {
                window.app.showNotification('Trip updated successfully!', 'success');
            }
            
            // Update dashboard if available
            if (window.dashboardManager) {
                window.dashboardManager.refreshStats();
            }
            
            console.log('Trip updated:', updates);
            
        } catch (error) {
            console.error('Error saving trip changes:', error);
            if (window.app) {
                window.app.showNotification('Failed to update trip', 'error');
            }
        }
    }
    
    closeTripEditModal() {
        const modal = document.getElementById('trip-edit-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentElement) {
                    modal.parentElement.removeChild(modal);
                }
            }, 300);
        }
    }

    async deleteTrip(tripId) {
        if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            return;
        }

        try {
            // Delete from Firebase if authenticated
            if (window.firebaseService && window.firebaseService.isAuthenticated()) {
                await window.firebaseService.deleteTrip(tripId);
                console.log('✅ Trip deleted from Firebase');
            }

            // Remove from local array
            this.trips = this.trips.filter(t => t.id !== tripId);

            // Update localStorage
            localStorage.setItem('travique_trips', JSON.stringify(this.trips));

            // Refresh display
            this.applyFilters();
            this.displayHistory();

            // Update dashboard stats
            if (window.dashboardManager) {
                window.dashboardManager.updateStatsAfterTrip();
            }

            // Show success message
            if (window.app) {
                window.app.showNotification('Trip deleted successfully', 'success');
            }

        } catch (error) {
            console.error('Error deleting trip:', error);
            if (window.app) {
                window.app.showNotification('Failed to delete trip', 'error');
            }
        }
    }

    // Utility Methods
    getTransportIcon(mode) {
        const icons = {
            car: 'fas fa-car',
            bus: 'fas fa-bus',
            train: 'fas fa-train',
            metro: 'fas fa-subway',
            taxi: 'fas fa-taxi',
            bike: 'fas fa-bicycle',
            walk: 'fas fa-walking',
            plane: 'fas fa-plane',
            boat: 'fas fa-ship'
        };
        return icons[mode] || 'fas fa-question-circle';
    }

    getStatusClass(status) {
        const classes = {
            active: 'status-active',
            completed: 'status-completed',
            cancelled: 'status-cancelled',
            draft: 'status-draft'
        };
        return classes[status] || 'status-unknown';
    }

    getStatusText(status) {
        const texts = {
            active: 'Active',
            completed: 'Completed',
            cancelled: 'Cancelled',
            draft: 'Draft'
        };
        return texts[status] || 'Unknown';
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    clearHistory() {
        this.trips = [];
        this.filteredTrips = [];
        this.displayHistory();
    }

    // Public methods
    async refreshHistory() {
        await this.loadTripHistory();
    }

    getCurrentTrips() {
        return this.filteredTrips;
    }

    getTripById(id) {
        return this.trips.find(trip => trip.id === id);
    }
}

// Initialize History Manager
let historyManager;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        historyManager = new HistoryManager();
    });
} else {
    historyManager = new HistoryManager();
}

// Make history manager globally available
window.historyManager = historyManager;