// Dashboard Manager - User Profile and Statistics
class DashboardManager {
    constructor() {
        this.userProfile = null;
        this.userStats = null;
        this.init();
    }

    init() {
        this.setupFirebaseListeners();
        this.setupActionButtons();
    }

    setupFirebaseListeners() {
        // Wait for Firebase service to be available
        const checkFirebase = () => {
            if (window.firebaseService) {
                window.firebaseService.onAuthStateChanged((user) => {
                    if (user) {
                        this.loadUserProfile();
                        this.loadUserStats();
                    } else {
                        this.clearDashboard();
                    }
                });
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    }

    setupActionButtons() {
        // Quick action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    async loadUserProfile() {
        try {
            this.userProfile = await window.firebaseService.getUserProfile();
            this.updateProfileDisplay();
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    async loadUserStats() {
        try {
            // Get fresh user trips to calculate stats
            const trips = await window.firebaseService.getUserTrips();
            await this.calculateAndUpdateStats(trips);
        } catch (error) {
            console.error('Error loading user stats:', error);
            // Show default stats if error
            this.showDefaultStats();
        }
    }

    async calculateAndUpdateStats(trips) {
        const stats = {
            totalTrips: trips.length,
            totalDistance: 0,
            countriesVisited: new Set(),
            citiesVisited: new Set()
        };

        // Calculate statistics from trips
        trips.forEach(trip => {
            // Add distance if available
            if (trip.distance) {
                stats.totalDistance += trip.distance;
            }

            // Add countries and cities
            if (trip.country) {
                stats.countriesVisited.add(trip.country);
            }

            if (trip.destinations) {
                trip.destinations.forEach(dest => {
                    if (dest.city) {
                        stats.citiesVisited.add(dest.city);
                    }
                    if (dest.country) {
                        stats.countriesVisited.add(dest.country);
                    }
                });
            }

            // Extract cities from origin and destination names
            if (trip.origin) {
                const originCity = this.extractCityFromLocation(trip.origin);
                if (originCity) stats.citiesVisited.add(originCity);
            }
            if (trip.destination) {
                const destCity = this.extractCityFromLocation(trip.destination);
                if (destCity) stats.citiesVisited.add(destCity);
            }
        });

        // Convert sets to counts
        const finalStats = {
            totalTrips: stats.totalTrips,
            totalDistance: Math.round(stats.totalDistance * 100) / 100, // Round to 2 decimal places
            countriesVisited: stats.countriesVisited.size,
            citiesVisited: stats.citiesVisited.size
        };

        this.userStats = finalStats;
        this.updateStatsDisplay(finalStats);

        // Update stats in Firestore
        try {
            await window.firebaseService.updateUserStats();
        } catch (error) {
            console.error('Error updating stats in Firestore:', error);
        }
    }

    extractCityFromLocation(locationString) {
        // Simple city extraction - can be improved with geocoding
        if (!locationString) return null;
        
        // Split by comma and take the first part (usually city)
        const parts = locationString.split(',');
        if (parts.length > 0) {
            return parts[0].trim();
        }
        
        return locationString.trim();
    }

    updateProfileDisplay() {
        if (!this.userProfile) return;

        // Update any profile-specific UI elements
        // This could include greeting messages, preferences, etc.
        const greeting = this.getTimeBasedGreeting();
        const userName = this.userProfile.displayName || 'Traveler';
        
        // Update section subtitle with personalized greeting
        const subtitle = document.querySelector('.dashboard-header .section-subtitle');
        if (subtitle) {
            subtitle.textContent = `${greeting}, ${userName}! Monitor and manage your travel data collection`;
        }
    }

    updateStatsDisplay(stats) {
        // Update total trips
        const totalTripsEl = document.getElementById('total-trips-stat');
        if (totalTripsEl) {
            totalTripsEl.textContent = stats.totalTrips.toLocaleString();
        }

        // Update total distance
        const totalDistanceEl = document.getElementById('total-distance-stat');
        if (totalDistanceEl) {
            if (stats.totalDistance >= 1000) {
                totalDistanceEl.textContent = `${(stats.totalDistance / 1000).toFixed(1)} km`;
            } else {
                totalDistanceEl.textContent = `${stats.totalDistance.toFixed(1)} km`;
            }
        }

        // Update countries visited
        const countriesEl = document.getElementById('countries-visited-stat');
        if (countriesEl) {
            countriesEl.textContent = stats.countriesVisited.toLocaleString();
        }

        // Update cities visited
        const citiesEl = document.getElementById('cities-visited-stat');
        if (citiesEl) {
            citiesEl.textContent = stats.citiesVisited.toLocaleString();
        }

        // Add animation to updated stats
        this.animateStats();
    }

    showDefaultStats() {
        const defaultStats = {
            totalTrips: 0,
            totalDistance: 0,
            countriesVisited: 0,
            citiesVisited: 0
        };
        this.updateStatsDisplay(defaultStats);
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            stat.style.transform = 'scale(1.1)';
            stat.style.color = 'var(--accent-primary)';
            
            setTimeout(() => {
                stat.style.transform = 'scale(1)';
                stat.style.color = '';
            }, 300);
        });
    }

    clearDashboard() {
        // Reset to default state when user signs out
        this.userProfile = null;
        this.userStats = null;
        this.showDefaultStats();
        
        // Reset subtitle
        const subtitle = document.querySelector('.dashboard-header .section-subtitle');
        if (subtitle) {
            subtitle.textContent = 'Monitor and manage your travel data collection';
        }
    }

    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        
        if (hour < 12) {
            return 'Good morning';
        } else if (hour < 17) {
            return 'Good afternoon';
        } else {
            return 'Good evening';
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'new-trip':
                this.startNewTrip();
                break;
            case 'view-map':
                this.viewMap();
                break;
            case 'trip-history':
                this.viewTripHistory();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    startNewTrip() {
        // Switch to trip planning section
        if (window.navigationManager) {
            window.navigationManager.showSection('trip');
        }
        
        // Clear any existing trip form data
        const tripForm = document.getElementById('trip-form');
        if (tripForm) {
            tripForm.reset();
        }
        
        // Focus on the origin input
        const originInput = document.getElementById('trip-origin');
        if (originInput) {
            setTimeout(() => originInput.focus(), 100);
        }
    }

    viewMap() {
        // Switch to map section
        if (window.navigationManager) {
            window.navigationManager.showSection('map');
        }
    }

    viewTripHistory() {
        // Switch to history section
        if (window.navigationManager) {
            window.navigationManager.showSection('history');
        }
        
        // Trigger history refresh if available
        if (window.historyManager) {
            window.historyManager.refreshHistory();
        }
    }

    // Public method to refresh dashboard data
    async refreshDashboard() {
        if (window.firebaseService && window.firebaseService.isAuthenticated()) {
            await this.loadUserProfile();
            await this.loadUserStats();
        }
    }

    // Public method to update stats after a new trip is saved
    async updateStatsAfterTrip() {
        if (window.firebaseService && window.firebaseService.isAuthenticated()) {
            await this.loadUserStats();
        }
    }
}

// Initialize Dashboard Manager
let dashboardManager;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dashboardManager = new DashboardManager();
    });
} else {
    dashboardManager = new DashboardManager();
}

// Make dashboard manager globally available
window.dashboardManager = dashboardManager;