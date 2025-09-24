// Main Application Controller
class TraviqueApp {
    constructor() {
        this.currentSection = 'home';
        this.isIntroActive = true;
        this.tripData = [];
        this.currentTrip = null;
        this.userLocation = null;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Travique App Initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }
    
    setupApp() {
        console.log('🎯 Setting up Travique App...');
        
        // Track app initialization
        if (window.analyticsService) {
            window.analyticsService.trackEvent('app', 'initialize', {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
        }
        
        // Initialize components
        this.setupIntroScreen();
        this.setupNavigation();
        this.setupEventListeners();
        this.setupAnimations();
        this.loadUserData();
        
        // Initialize modules
        console.log('🔧 Initializing managers...');
        window.authManager = new AuthManager();
        console.log('✅ AuthManager initialized');
        window.navigationManager = new NavigationManager();
        console.log('✅ NavigationManager initialized');
        window.historyManager = new HistoryManager();
        console.log('✅ HistoryManager initialized');
        window.tripManager = new TripManager();
        console.log('✅ TripManager initialized');
        window.mapManager = new MapManager();
        console.log('✅ MapManager initialized');
        window.audioManager = new AudioManager();
        console.log('✅ AudioManager initialized');
        
        // Track page view
        if (window.analyticsService) {
            window.analyticsService.trackPageView('intro');
        }
        
        console.log('✅ Travique App Ready!');
    }
    
    setupIntroScreen() {
        const enterButton = document.getElementById('enter-app');
        if (enterButton) {
            enterButton.addEventListener('click', () => {
                this.playClickSound();
                this.transitionToMainApp();
            });
        }
    }
    
    transitionToMainApp() {
        console.log('🎬 Transitioning to main application...');
        
        const introScreen = document.getElementById('intro-screen');
        const mainApp = document.getElementById('main-app');
        
        if (introScreen && mainApp) {
            // Add transition classes
            introScreen.classList.add('hidden');
            
            // Wait for intro to fade out, then show main app
            setTimeout(() => {
                introScreen.style.display = 'none';
                mainApp.classList.add('active');
                this.isIntroActive = false;
                
                // Initialize location services
                this.requestLocationPermission();
                
                // Show welcome notification
                this.showNotification('Welcome to Travique!', 'success');
            }, 1000);
        }
    }
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const actionButtons = document.querySelectorAll('.action-btn');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.playClickSound();
                
                const section = item.getAttribute('data-section');
                if (section && window.navigationManager) {
                    window.navigationManager.navigateToSection(section);
                }
            });
            
            // Add hover sound effect
            item.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });
        
        // Handle action buttons
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.playClickSound();
                
                const action = button.getAttribute('data-action');
                if (window.navigationManager) {
                    window.navigationManager.handleAction(action);
                }
            });
            
            button.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });
    }
    
    navigateToSection(sectionName) {
        console.log(`🧭 Navigating to: ${sectionName}`);
        
        // Track navigation
        if (window.analyticsService) {
            window.analyticsService.trackPageView(sectionName, {
                previousSection: this.currentSection,
                navigationMethod: 'nav_click'
            });
        }
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Section-specific initialization
            this.initializeSection(sectionName);
        }
    }
    
    initializeSection(sectionName) {
        switch (sectionName) {
            case 'home':
                this.updateDashboardStats();
                break;
            case 'trip':
                window.tripManager?.initializeTripForm();
                break;
            case 'map':
                window.mapManager?.initializeMap();
                break;
            case 'history':
                this.loadTripHistory();
                break;
        }
    }
    
    updateDashboardStats() {
        const stats = this.calculateTripStats();
        
        // Update stat numbers with animation
        this.animateStatNumber('.stats-card:nth-child(1) .stat-number', stats.activeTrips);
        this.animateStatNumber('.stats-card:nth-child(2) .stat-number', stats.totalDuration);
        this.animateStatNumber('.stats-card:nth-child(3) .stat-number', stats.companions);
        this.animateStatNumber('.stats-card:nth-child(4) .stat-number', stats.transportModes);
    }
    
    calculateTripStats() {
        const trips = this.getTripData();
        
        return {
            activeTrips: trips.filter(trip => trip.status === 'active').length,
            totalDuration: trips.reduce((total, trip) => total + (trip.duration || 0), 0),
            companions: trips.reduce((total, trip) => total + (trip.companions || 0), 0),
            transportModes: new Set(trips.map(trip => trip.transportMode)).size
        };
    }
    
    animateStatNumber(selector, targetValue) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    setupEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Window resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Visibility change handling
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Feedback button event listener
        const feedbackBtn = document.getElementById('feedbackBtn');
        if (feedbackBtn) {
            feedbackBtn.addEventListener('click', () => {
                this.openFeedbackForm();
            });
        }
        
        // Floating feedback button event listener
        const floatingFeedback = document.getElementById('floatingFeedback');
        if (floatingFeedback) {
            floatingFeedback.addEventListener('click', () => {
                this.openFeedbackForm();
            });
        }
    }
    
    handleKeyboardShortcuts(e) {
        if (this.isIntroActive) return;
        
        // Alt + Number keys for navigation
        if (e.altKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.navigateToSection('home');
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateToSection('trip');
                    break;
                case '3':
                    e.preventDefault();
                    this.navigateToSection('history');
                    break;
                case '4':
                    e.preventDefault();
                    this.navigateToSection('map');
                    break;
            }
        }
        
        // Escape key
        if (e.key === 'Escape') {
            this.closeModals();
        }
    }
    
    handleResize() {
        // Responsive adjustments
        if (window.mapManager) {
            window.mapManager.handleResize();
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // App is hidden, pause animations
            console.log('🛏️ App hidden, pausing animations');
        } else {
            // App is visible, resume animations
            console.log('👁️ App visible, resuming animations');
        }
    }
    
    setupAnimations() {
        // Add animation classes to elements
        this.addAnimationClasses();
        
        // Setup intersection observer for reveal animations
        this.setupRevealAnimations();
    }
    
    addAnimationClasses() {
        // Add stagger animation to dashboard cards
        const statsCards = document.querySelectorAll('.stats-card');
        statsCards.forEach((card, index) => {
            card.classList.add('stagger-item', 'reveal-scale');
            card.style.animationDelay = `${index * 0.1}s`;
        });
        
        // Add hover effects to interactive elements
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.classList.add('hover-lift', 'ripple');
        });
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.add('hover-glow');
        });
    }
    
    setupRevealAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-once');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Feedback System
    openFeedbackForm() {
        const feedbackUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdTjUXNzD6VLPEUZYcUbJHiPFJXAyUQvtz9L-MR7xC5wWZsHg/viewform?usp=header';
        
        // Show notification
        this.showNotification('Opening feedback form...', 'info', 2000);
        
        // Track feedback button click
        if (window.analyticsService) {
            window.analyticsService.trackEvent('feedback', 'button_click', {
                source: 'feedback_button',
                timestamp: new Date().toISOString()
            });
        }
        
        // Add visual feedback to buttons
        const feedbackBtn = document.getElementById('feedbackBtn');
        const floatingFeedback = document.getElementById('floatingFeedback');
        
        if (feedbackBtn) {
            feedbackBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                feedbackBtn.style.transform = '';
            }, 150);
        }
        
        if (floatingFeedback) {
            floatingFeedback.style.transform = 'translateY(-6px) scale(1.02)';
            setTimeout(() => {
                floatingFeedback.style.transform = '';
            }, 200);
        }
        
        // Open Google Form in new tab
        setTimeout(() => {
            window.open(feedbackUrl, '_blank', 'noopener,noreferrer');
        }, 300);
    }
    
    // Location Services
    requestLocationPermission() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('📍 Location acquired:', this.userLocation);
                },
                (error) => {
                    console.warn('📍 Location access denied:', error.message);
                    this.showNotification('Location access denied. Some features may be limited.', 'warning');
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
            );
        }
    }
    
    // Data Management
    getTripData() {
        const saved = localStorage.getItem('travique_trips');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveTripData(trips) {
        localStorage.setItem('travique_trips', JSON.stringify(trips));
        this.tripData = trips;
    }
    
    loadUserData() {
        this.tripData = this.getTripData();
        console.log(`📊 Loaded ${this.tripData.length} trips from storage`);
    }
    
    loadTripHistory() {
        const historyList = document.querySelector('.history-list');
        if (!historyList) return;
        
        const trips = this.getTripData();
        
        if (trips.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-route"></i>
                    <h3>No trips recorded yet</h3>
                    <p>Start planning your first trip to see data here</p>
                    <button class="primary-btn" data-action="new-trip">
                        <i class="fas fa-plus"></i>
                        Plan First Trip
                    </button>
                </div>
            `;
        } else {
            this.renderTripHistory(trips);
        }
    }
    
    renderTripHistory(trips) {
        const historyList = document.querySelector('.history-list');
        if (!historyList) return;
        
        historyList.innerHTML = trips.map(trip => `
            <div class="trip-item" data-trip-id="${trip.id}">
                <div class="trip-item-header">
                    <div class="trip-route">${trip.origin} → ${trip.destination}</div>
                    <div class="trip-date">${this.formatDate(trip.date)}</div>
                </div>
                <div class="trip-details">
                    <div class="trip-detail">
                        <i class="fas fa-clock"></i>
                        <span>${trip.duration || 'N/A'}</span>
                    </div>
                    <div class="trip-detail">
                        <i class="fas fa-car"></i>
                        <span>${trip.transportMode || 'N/A'}</span>
                    </div>
                    <div class="trip-detail">
                        <i class="fas fa-users"></i>
                        <span>${trip.companions || 0} companions</span>
                    </div>
                    <div class="trip-detail">
                        <i class="fas fa-flag"></i>
                        <span>${trip.purpose || 'N/A'}</span>
                    </div>
                </div>
                <div class="trip-actions">
                    <button class="trip-action-btn" data-action="view" data-trip-id="${trip.id}">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="trip-action-btn" data-action="duplicate" data-trip-id="${trip.id}">
                        <i class="fas fa-copy"></i>
                        Duplicate
                    </button>
                    <button class="trip-action-btn" data-action="delete" data-trip-id="${trip.id}">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to action buttons
        historyList.querySelectorAll('.trip-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playClickSound();
                
                const action = btn.getAttribute('data-action');
                const tripId = btn.getAttribute('data-trip-id');
                this.handleTripAction(action, tripId);
            });
        });
    }
    
    handleTripAction(action, tripId) {
        const trip = this.tripData.find(t => t.id === tripId);
        if (!trip) return;
        
        switch (action) {
            case 'view':
                this.viewTrip(trip);
                break;
            case 'duplicate':
                this.duplicateTrip(trip);
                break;
            case 'delete':
                this.deleteTrip(tripId);
                break;
        }
    }
    
    viewTrip(trip) {
        // Navigate to trip section and populate form
        this.navigateToSection('trip');
        setTimeout(() => {
            window.tripManager?.populateForm(trip);
        }, 100);
    }
    
    duplicateTrip(trip) {
        const newTrip = { ...trip, id: this.generateId(), date: new Date().toISOString() };
        this.navigateToSection('trip');
        setTimeout(() => {
            window.tripManager?.populateForm(newTrip);
        }, 100);
    }
    
    deleteTrip(tripId) {
        if (confirm('Are you sure you want to delete this trip?')) {
            this.tripData = this.tripData.filter(trip => trip.id !== tripId);
            this.saveTripData(this.tripData);
            this.loadTripHistory();
            this.showNotification('Trip deleted successfully', 'success');
        }
    }
    
    // Utility Functions
    generateId() {
        return 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Audio Methods
    playClickSound() {
        if (window.audioManager) {
            window.audioManager.playClick();
        }
    }
    
    playHoverSound() {
        if (window.audioManager) {
            window.audioManager.playHover();
        }
    }
    
    // Notification System
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} notification-enter`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.add('notification-exit');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('notification-exit');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }
    
    closeModals() {
        // Close any open modals or panels
        document.querySelectorAll('.modal, .dropdown, .panel').forEach(el => {
            el.classList.remove('active');
        });
    }
}

// Initialize the application
window.app = new TraviqueApp();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TraviqueApp;
}