// Navigation Manager for handling navigation interactions
class NavigationManager {
    constructor() {
        this.currentSection = 'home';
        this.navigationHistory = [];
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        console.log('🧭 Initializing Navigation Manager...');
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('✅ Navigation Manager Ready!');
    }
    
    setupEventListeners() {
        // Navigation items
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                this.handleNavItemClick(navItem, e);
            }
            
            const actionBtn = e.target.closest('.action-btn');
            if (actionBtn) {
                this.handleActionClick(actionBtn, e);
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // Browser back/forward
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e);
        });
        
        // Mobile menu toggle
        this.setupMobileNavigation();
    }
    
    handleNavItemClick(navItem, event) {
        event.preventDefault();
        
        const section = navItem.getAttribute('data-section');
        if (section && section !== this.currentSection) {
            this.navigateToSection(section);
        }
        
        // Add ripple effect
        this.addRippleEffect(navItem, event);
    }
    
    handleActionClick(actionBtn, event) {
        event.preventDefault();
        
        const action = actionBtn.getAttribute('data-action');
        if (action) {
            this.handleAction(action);
        }
        
        // Add ripple effect
        this.addRippleEffect(actionBtn, event);
    }
    
    navigateToSection(sectionName) {
        console.log(`🧭 Navigating to: ${sectionName}`);
        
        // Validate section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (!targetSection) {
            console.warn(`Section not found: ${sectionName}`);
            return;
        }
        
        // Add to history
        this.addToHistory(this.currentSection);
        
        // Update active nav item
        this.updateActiveNavItem(sectionName);
        
        // Hide current section
        this.hideCurrentSection();
        
        // Show target section with animation
        setTimeout(() => {
            this.showSection(sectionName);
            this.currentSection = sectionName;
            
            // Update URL without page reload
            this.updateURL(sectionName);
            
            // Initialize section if needed
            this.initializeSection(sectionName);
            
            // Track navigation
            this.trackNavigation(sectionName);
        }, 150);
    }
    
    updateActiveNavItem(sectionName) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            item.classList.remove('nav-item-active');
        });
        
        // Add active class to target nav item
        const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
            targetNavItem.classList.add('nav-item-active');
            
            // Add loading state temporarily
            targetNavItem.classList.add('loading');
            setTimeout(() => {
                targetNavItem.classList.remove('loading');
            }, 300);
        }
    }
    
    hideCurrentSection() {
        const currentSectionElement = document.getElementById(`${this.currentSection}-section`);
        if (currentSectionElement) {
            currentSectionElement.classList.remove('active');
            currentSectionElement.classList.add('page-exit');
            
            setTimeout(() => {
                currentSectionElement.classList.remove('page-exit');
            }, 500);
        }
    }
    
    showSection(sectionName) {
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.classList.add('page-enter');
            
            setTimeout(() => {
                targetSection.classList.remove('page-enter');
            }, 500);
        }
    }
    
    handleAction(action) {
        console.log(`🎯 Handling action: ${action}`);
        
        switch (action) {
            case 'new-trip':
                this.navigateToSection('trip');
                break;
            case 'view-map':
                this.navigateToSection('map');
                break;
            case 'trip-history':
                this.navigateToSection('history');
                break;
            case 'settings':
                this.openSettingsModal();
                break;
            case 'help':
                this.openHelpModal();
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }
    
    initializeSection(sectionName) {
        switch (sectionName) {
            case 'home':
                if (window.app) {
                    window.app.updateDashboardStats();
                }
                break;
            case 'trip':
                if (window.tripManager) {
                    window.tripManager.initializeTripForm();
                }
                break;
            case 'map':
                if (window.mapManager) {
                    window.mapManager.initializeMap();
                }
                break;
            case 'history':
                if (window.app) {
                    window.app.loadTripHistory();
                }
                break;
        }
    }
    
    handleKeyboardNavigation(event) {
        // Only handle navigation if not in form inputs
        if (event.target.tagName === 'INPUT' || 
            event.target.tagName === 'TEXTAREA' || 
            event.target.tagName === 'SELECT') {
            return;
        }
        
        // Alt + Number keys for section navigation
        if (event.altKey) {
            event.preventDefault();
            
            switch (event.key) {
                case '1':
                    this.navigateToSection('home');
                    break;
                case '2':
                    this.navigateToSection('trip');
                    break;
                case '3':
                    this.navigateToSection('map');
                    break;
                case '4':
                    this.navigateToSection('history');
                    break;
            }
        }
        
        // Arrow key navigation between nav items
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            this.navigateWithArrows(event.key);
        }
        
        // Escape to go back
        if (event.key === 'Escape') {
            this.goBack();
        }
    }
    
    navigateWithArrows(direction) {
        const navItems = Array.from(document.querySelectorAll('.nav-item'));
        const currentIndex = navItems.findIndex(item => item.classList.contains('active'));
        
        let nextIndex;
        if (direction === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : navItems.length - 1;
        } else {
            nextIndex = currentIndex < navItems.length - 1 ? currentIndex + 1 : 0;
        }
        
        const nextNavItem = navItems[nextIndex];
        if (nextNavItem) {
            const section = nextNavItem.getAttribute('data-section');
            if (section) {
                this.navigateToSection(section);
            }
        }
    }
    
    addRippleEffect(element, event) {
        // Remove existing ripples
        const existingRipples = element.querySelectorAll('.ripple-effect');
        existingRipples.forEach(ripple => ripple.remove());
        
        // Create ripple
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        // Calculate position
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    setupMobileNavigation() {
        // Create mobile menu toggle if it doesn't exist
        let mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (!mobileToggle) {
            mobileToggle = document.createElement('button');
            mobileToggle.className = 'mobile-menu-toggle';
            mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            
            const navContainer = document.querySelector('.nav-container');
            if (navContainer) {
                navContainer.appendChild(mobileToggle);
            }
        }
        
        // Toggle mobile menu
        mobileToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu && 
                navMenu.classList.contains('mobile-active') && 
                !e.target.closest('.nav-menu') && 
                !e.target.closest('.mobile-menu-toggle')) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (navMenu) {
            navMenu.classList.toggle('mobile-active');
            
            if (mobileToggle) {
                const icon = mobileToggle.querySelector('i');
                if (navMenu.classList.contains('mobile-active')) {
                    icon.className = 'fas fa-times';
                    if (window.audioManager) {
                        window.audioManager.playMenuOpen();
                    }
                } else {
                    icon.className = 'fas fa-bars';
                    if (window.audioManager) {
                        window.audioManager.playMenuClose();
                    }
                }
            }
        }
    }
    
    closeMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (navMenu && navMenu.classList.contains('mobile-active')) {
            navMenu.classList.remove('mobile-active');
            
            if (mobileToggle) {
                const icon = mobileToggle.querySelector('i');
                icon.className = 'fas fa-bars';
            }
            
            if (window.audioManager) {
                window.audioManager.playMenuClose();
            }
        }
    }
    
    addToHistory(section) {
        this.navigationHistory.push(section);
        
        // Limit history size
        if (this.navigationHistory.length > 10) {
            this.navigationHistory.shift();
        }
    }
    
    goBack() {
        if (this.navigationHistory.length > 0) {
            const previousSection = this.navigationHistory.pop();
            this.navigateToSection(previousSection);
        }
    }
    
    updateURL(sectionName) {
        // Update URL without page reload for better UX
        const newURL = `${window.location.origin}${window.location.pathname}#${sectionName}`;
        window.history.pushState({ section: sectionName }, '', newURL);
    }
    
    handlePopState(event) {
        if (event.state && event.state.section) {
            this.navigateToSection(event.state.section);
        } else {
            // Handle direct URL access
            const hash = window.location.hash.slice(1);
            if (hash && hash !== this.currentSection) {
                this.navigateToSection(hash);
            }
        }
    }
    
    trackNavigation(sectionName) {
        // Track navigation for analytics (placeholder)
        console.log(`📊 Navigation tracked: ${sectionName}`);
        
        // You could implement:
        // - Google Analytics
        // - Custom analytics
        // - User behavior tracking
        
        const navigationEvent = {
            timestamp: new Date().toISOString(),
            from: this.navigationHistory[this.navigationHistory.length - 1] || 'none',
            to: sectionName,
            method: 'navigation'
        };
        
        // Store in localStorage for demo
        try {
            let analytics = JSON.parse(localStorage.getItem('travique_analytics')) || [];
            analytics.push(navigationEvent);
            
            // Keep only last 100 events
            if (analytics.length > 100) {
                analytics = analytics.slice(-100);
            }
            
            localStorage.setItem('travique_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.warn('Failed to track navigation:', error);
        }
    }
    
    openSettingsModal() {
        console.log('⚙️ Opening settings modal...');
        
        // Remove existing modal if present
        this.removeExistingModal('settings-modal');
        
        // Create settings modal
        const modal = this.createModal('settings-modal', 'Settings', this.getSettingsContent());
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Initialize settings functionality
        this.initializeSettingsModal();
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    getSettingsContent() {
        const currentSettings = this.getCurrentSettings();
        
        return `
            <div class="settings-container">
                <div class="settings-section">
                    <h3>Appearance</h3>
                    <div class="setting-item">
                        <label for="theme-select">Theme</label>
                        <select id="theme-select" class="setting-input">
                            <option value="dark" ${currentSettings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            <option value="light" ${currentSettings.theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="auto" ${currentSettings.theme === 'auto' ? 'selected' : ''}>Auto</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label for="language-select">Language</label>
                        <select id="language-select" class="setting-input">
                            <option value="en" ${currentSettings.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="es" ${currentSettings.language === 'es' ? 'selected' : ''}>Español</option>
                            <option value="fr" ${currentSettings.language === 'fr' ? 'selected' : ''}>Français</option>
                            <option value="de" ${currentSettings.language === 'de' ? 'selected' : ''}>Deutsch</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Notifications</h3>
                    <div class="setting-item">
                        <label class="toggle-label">
                            <input type="checkbox" id="notifications-enabled" ${currentSettings.notificationsEnabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            Enable Notifications
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="toggle-label">
                            <input type="checkbox" id="sound-enabled" ${currentSettings.soundEnabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            Sound Effects
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="toggle-label">
                            <input type="checkbox" id="trip-reminders" ${currentSettings.tripReminders ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            Trip Reminders
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Privacy & Data</h3>
                    <div class="setting-item">
                        <label class="toggle-label">
                            <input type="checkbox" id="location-tracking" ${currentSettings.locationTracking ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            Location Tracking
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="toggle-label">
                            <input type="checkbox" id="analytics-enabled" ${currentSettings.analyticsEnabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            Usage Analytics
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="toggle-label">
                            <input type="checkbox" id="offline-mode" ${currentSettings.offlineMode ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            Offline Mode
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Map Settings</h3>
                    <div class="setting-item">
                        <label for="map-style-select">Map Style</label>
                        <select id="map-style-select" class="setting-input">
                            <option value="standard" ${currentSettings.mapStyle === 'standard' ? 'selected' : ''}>Standard</option>
                            <option value="satellite" ${currentSettings.mapStyle === 'satellite' ? 'selected' : ''}>Satellite</option>
                            <option value="hybrid" ${currentSettings.mapStyle === 'hybrid' ? 'selected' : ''}>Hybrid</option>
                            <option value="terrain" ${currentSettings.mapStyle === 'terrain' ? 'selected' : ''}>Terrain</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label for="default-zoom">Default Zoom Level</label>
                        <input type="range" id="default-zoom" class="setting-range" min="1" max="20" value="${currentSettings.defaultZoom || 13}">
                        <span class="range-value">${currentSettings.defaultZoom || 13}</span>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Data Management</h3>
                    <div class="setting-item">
                        <button class="setting-btn secondary" id="export-data-btn">
                            <i class="fas fa-download"></i>
                            Export Data
                        </button>
                        <button class="setting-btn secondary" id="import-data-btn">
                            <i class="fas fa-upload"></i>
                            Import Data
                        </button>
                    </div>
                    <div class="setting-item">
                        <button class="setting-btn danger" id="clear-data-btn">
                            <i class="fas fa-trash"></i>
                            Clear All Data
                        </button>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Analytics & Privacy</h3>
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="analytics-enabled" ${currentSettings.analyticsEnabled ? 'checked' : ''}>
                            <span class="setting-title">Enable Usage Analytics</span>
                            <span class="setting-description">Help improve the app by sharing anonymous usage data</span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <button class="setting-btn secondary" id="view-analytics-data-btn">
                            <i class="fas fa-chart-bar"></i>
                            View My Analytics Data
                        </button>
                        <button class="setting-btn secondary" id="export-analytics-btn">
                            <i class="fas fa-file-export"></i>
                            Export Analytics
                        </button>
                    </div>
                    <div class="setting-item">
                        <button class="setting-btn danger" id="clear-analytics-btn">
                            <i class="fas fa-user-shield"></i>
                            Clear Analytics Data
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn secondary" id="cancel-settings">Cancel</button>
                <button class="btn primary" id="save-settings">Save Settings</button>
            </div>
        `;
    }
    
    getCurrentSettings() {
        // Load settings from localStorage or return defaults
        const defaultSettings = {
            theme: 'dark',
            language: 'en',
            notificationsEnabled: true,
            soundEnabled: true,
            tripReminders: true,
            locationTracking: true,
            analyticsEnabled: false,
            offlineMode: false,
            mapStyle: 'standard',
            defaultZoom: 13
        };
        
        try {
            const saved = localStorage.getItem('travique_settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return defaultSettings;
        }
    }
    
    initializeSettingsModal() {
        // Range slider update
        const zoomRange = document.getElementById('default-zoom');
        const zoomValue = document.querySelector('.range-value');
        
        if (zoomRange && zoomValue) {
            zoomRange.addEventListener('input', (e) => {
                zoomValue.textContent = e.target.value;
            });
        }
        
        // Settings change handlers
        document.getElementById('theme-select')?.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
        });
        
        // Action buttons
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('cancel-settings')?.addEventListener('click', () => {
            this.closeModal('settings-modal');
        });
        
        // Data management buttons
        document.getElementById('export-data-btn')?.addEventListener('click', () => {
            this.exportUserData();
        });
        
        document.getElementById('import-data-btn')?.addEventListener('click', () => {
            this.importUserData();
        });
        
        document.getElementById('clear-data-btn')?.addEventListener('click', () => {
            this.confirmClearData();
        });
        
        // Analytics controls
        document.getElementById('view-analytics-data-btn')?.addEventListener('click', () => {
            this.viewAnalyticsData();
        });
        
        document.getElementById('export-analytics-btn')?.addEventListener('click', () => {
            this.exportAnalyticsData();
        });
        
        document.getElementById('clear-analytics-btn')?.addEventListener('click', () => {
            this.confirmClearAnalytics();
        });
        
        // Analytics checkbox handler
        document.getElementById('analytics-enabled')?.addEventListener('change', (e) => {
            this.toggleAnalytics(e.target.checked);
        });
    }
    
    saveSettings() {
        try {
            const settings = {
                theme: document.getElementById('theme-select')?.value || 'dark',
                language: document.getElementById('language-select')?.value || 'en',
                notificationsEnabled: document.getElementById('notifications-enabled')?.checked || false,
                soundEnabled: document.getElementById('sound-enabled')?.checked || false,
                tripReminders: document.getElementById('trip-reminders')?.checked || false,
                locationTracking: document.getElementById('location-tracking')?.checked || false,
                analyticsEnabled: document.getElementById('analytics-enabled')?.checked || false,
                offlineMode: document.getElementById('offline-mode')?.checked || false,
                mapStyle: document.getElementById('map-style-select')?.value || 'standard',
                defaultZoom: parseInt(document.getElementById('default-zoom')?.value) || 13
            };
            
            // Save to localStorage
            localStorage.setItem('travique_settings', JSON.stringify(settings));
            
            // Apply settings
            this.applySettings(settings);
            
            // Close modal
            this.closeModal('settings-modal');
            
            if (window.app) {
                window.app.showNotification('Settings saved successfully!', 'success');
            }
            
            console.log('⚙️ Settings saved:', settings);
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            if (window.app) {
                window.app.showNotification('Failed to save settings', 'error');
            }
        }
    }
    
    applySettings(settings) {
        // Apply theme
        this.applyTheme(settings.theme);
        
        // Apply sound settings
        if (window.audioManager) {
            window.audioManager.setEnabled(settings.soundEnabled);
        }
        
        // Apply map settings
        if (window.mapManager && settings.mapStyle) {
            window.mapManager.setMapType(settings.mapStyle);
        }
        
        // Other settings can be applied as needed
    }
    
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
        } else if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }
    
    exportUserData() {
        try {
            const data = {
                trips: JSON.parse(localStorage.getItem('travique_trips') || '[]'),
                settings: JSON.parse(localStorage.getItem('travique_settings') || '{}'),
                userProfile: JSON.parse(localStorage.getItem('travique_user_profile') || '{}'),
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `travique_data_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            if (window.app) {
                window.app.showNotification('Data exported successfully!', 'success');
            }
            
        } catch (error) {
            console.error('Failed to export data:', error);
            if (window.app) {
                window.app.showNotification('Failed to export data', 'error');
            }
        }
    }
    
    importUserData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (!data.exportDate) {
                        throw new Error('Invalid data format');
                    }
                    
                    // Confirm import
                    if (confirm('This will overwrite your current data. Are you sure?')) {
                        if (data.trips) localStorage.setItem('travique_trips', JSON.stringify(data.trips));
                        if (data.settings) localStorage.setItem('travique_settings', JSON.stringify(data.settings));
                        if (data.userProfile) localStorage.setItem('travique_user_profile', JSON.stringify(data.userProfile));
                        
                        if (window.app) {
                            window.app.showNotification('Data imported successfully! Please refresh the page.', 'success');
                        }
                        
                        // Reload page to apply imported data
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                    
                } catch (error) {
                    console.error('Failed to import data:', error);
                    if (window.app) {
                        window.app.showNotification('Failed to import data. Invalid file format.', 'error');
                    }
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    confirmClearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            if (confirm('This will delete all trips, settings, and user data. Confirm?')) {
                try {
                    localStorage.removeItem('travique_trips');
                    localStorage.removeItem('travique_settings');
                    localStorage.removeItem('travique_user_profile');
                    
                    if (window.app) {
                        window.app.showNotification('All data cleared successfully!', 'success');
                    }
                    
                    // Close modal and reload
                    this.closeModal('settings-modal');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                } catch (error) {
                    console.error('Failed to clear data:', error);
                    if (window.app) {
                        window.app.showNotification('Failed to clear data', 'error');
                    }
                }
            }
        }
    }
    
    openHelpModal() {
        console.log('❓ Opening help modal...');
        
        // Remove existing modal if present
        this.removeExistingModal('help-modal');
        
        // Create help modal
        const modal = this.createModal('help-modal', 'Help & Support', this.getHelpContent());
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Initialize help functionality
        this.initializeHelpModal();
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    getHelpContent() {
        return `
            <div class="help-container">
                <div class="help-navigation">
                    <button class="help-nav-btn active" data-section="getting-started">
                        <i class="fas fa-play"></i> Getting Started
                    </button>
                    <button class="help-nav-btn" data-section="planning-trips">
                        <i class="fas fa-route"></i> Planning Trips
                    </button>
                    <button class="help-nav-btn" data-section="tracking">
                        <i class="fas fa-map-marker-alt"></i> Trip Tracking
                    </button>
                    <button class="help-nav-btn" data-section="maps">
                        <i class="fas fa-map"></i> Using Maps
                    </button>
                    <button class="help-nav-btn" data-section="account">
                        <i class="fas fa-user"></i> Account & Sync
                    </button>
                    <button class="help-nav-btn" data-section="troubleshooting">
                        <i class="fas fa-tools"></i> Troubleshooting
                    </button>
                    <button class="help-nav-btn" data-section="contact">
                        <i class="fas fa-envelope"></i> Contact Support
                    </button>
                </div>
                
                <div class="help-content">
                    <div class="help-section" id="getting-started-content">
                        <h3>Getting Started with Travique</h3>
                        <div class="help-item">
                            <h4><i class="fas fa-user-plus"></i> Create Your Account</h4>
                            <p>Sign up with Google or email to sync your trips across devices and keep your data safe.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-route"></i> Plan Your First Trip</h4>
                            <p>Navigate to the Trip Planning section, enter your origin and destination, select transport mode, and start tracking!</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-map"></i> Explore the Map</h4>
                            <p>Use the interactive map to view your location, add custom markers, and get directions.</p>
                        </div>
                    </div>
                    
                    <div class="help-section hidden" id="planning-trips-content">
                        <h3>Planning Your Trips</h3>
                        <div class="help-item">
                            <h4><i class="fas fa-map-marker-alt"></i> Setting Locations</h4>
                            <p>Click the location buttons next to origin/destination fields to use your current location, or type addresses manually.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-clock"></i> Departure Time</h4>
                            <p>Set your planned departure time for better trip organization and reminders.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-users"></i> Adding Companions</h4>
                            <p>Include companions in your trip for better data collection and shared experiences.</p>
                        </div>
                    </div>
                    
                    <div class="help-section hidden" id="tracking-content">
                        <h3>Trip Tracking Features</h3>
                        <div class="help-item">
                            <h4><i class="fas fa-play"></i> Start Tracking</h4>
                            <p>Once you start a trip, GPS tracking begins automatically to record your route and progress.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-chart-line"></i> Real-time Stats</h4>
                            <p>View distance traveled, current speed, duration, and waypoints in real-time during your trip.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-stop"></i> Stop Tracking</h4>
                            <p>End your trip to save the complete journey with all statistics and route data.</p>
                        </div>
                    </div>
                    
                    <div class="help-section hidden" id="maps-content">
                        <h3>Using the Map Interface</h3>
                        <div class="help-item">
                            <h4><i class="fas fa-search-plus"></i> Map Controls</h4>
                            <p>Use zoom, location, and marker controls on the right side of the map for easy navigation.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-map-pin"></i> Custom Markers</h4>
                            <p>Enable marker mode and click anywhere on the map to add custom location markers with address information.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-directions"></i> Getting Directions</h4>
                            <p>Click on any marker and select "Directions" to get turn-by-turn navigation from your current location.</p>
                        </div>
                    </div>
                    
                    <div class="help-section hidden" id="account-content">
                        <h3>Account & Data Sync</h3>
                        <div class="help-item">
                            <h4><i class="fas fa-cloud"></i> Cloud Sync</h4>
                            <p>Your trips automatically sync to Firebase when you're signed in, keeping data safe across devices.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-chart-bar"></i> Statistics</h4>
                            <p>View your travel statistics including total trips, distance, countries, and cities visited in the dashboard.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-download"></i> Data Export</h4>
                            <p>Export your travel data anytime from Settings > Data Management for backup or analysis.</p>
                        </div>
                    </div>
                    
                    <div class="help-section hidden" id="troubleshooting-content">
                        <h3>Common Issues & Solutions</h3>
                        <div class="help-item">
                            <h4><i class="fas fa-location-arrow"></i> GPS Not Working</h4>
                            <p>Ensure location permissions are enabled in your browser settings. Try refreshing the page if issues persist.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-wifi"></i> Sync Issues</h4>
                            <p>Check your internet connection. Data will sync automatically when connection is restored.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-map"></i> Map Not Loading</h4>
                            <p>Verify your internet connection and try refreshing. Some ad blockers may interfere with map loading.</p>
                        </div>
                    </div>
                    
                    <div class="help-section hidden" id="contact-content">
                        <h3>Contact Support</h3>
                        <div class="help-item">
                            <h4><i class="fas fa-envelope"></i> Email Support</h4>
                            <p>For technical issues or questions: <a href="mailto:support@travique.app">support@travique.app</a></p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-bug"></i> Report a Bug</h4>
                            <p>Found a bug? Please report it with details about what you were doing when it occurred.</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-lightbulb"></i> Feature Requests</h4>
                            <p>Have an idea for improvement? We'd love to hear your suggestions!</p>
                        </div>
                        <div class="help-item">
                            <h4><i class="fas fa-book"></i> Documentation</h4>
                            <p>Visit our online documentation for detailed guides and API information.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn primary" id="close-help">Close</button>
            </div>
        `;
    }
    
    initializeHelpModal() {
        // Help navigation
        const helpNavButtons = document.querySelectorAll('.help-nav-btn');
        const helpSections = document.querySelectorAll('.help-section');
        
        helpNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                const section = button.getAttribute('data-section');
                
                // Update active nav button
                helpNavButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show corresponding section
                helpSections.forEach(sec => sec.classList.add('hidden'));
                const targetSection = document.getElementById(`${section}-content`);
                if (targetSection) {
                    targetSection.classList.remove('hidden');
                }
            });
        });
        
        // Close button
        document.getElementById('close-help')?.addEventListener('click', () => {
            this.closeModal('help-modal');
        });
    }
    
    // Public API
    getCurrentSection() {
        return this.currentSection;
    }
    
    getNavigationHistory() {
        return [...this.navigationHistory];
    }
    
    isValidSection(sectionName) {
        return document.getElementById(`${sectionName}-section`) !== null;
    }
    
    // Initialize from URL hash
    initializeFromURL() {
        const hash = window.location.hash.slice(1);
        if (hash && this.isValidSection(hash)) {
            this.navigateToSection(hash);
        }
    }
    
    // Breadcrumb functionality
    generateBreadcrumb() {
        const breadcrumb = [this.currentSection];
        if (this.navigationHistory.length > 0) {
            breadcrumb.unshift(this.navigationHistory[this.navigationHistory.length - 1]);
        }
        return breadcrumb;
    }
    
    // Quick navigation shortcuts
    goToHome() {
        this.navigateToSection('home');
    }
    
    goToTrip() {
        this.navigateToSection('trip');
    }
    
    goToMap() {
        this.navigateToSection('map');
    }
    
    goToHistory() {
        this.navigateToSection('history');
    }
    
    // Modal utility methods
    createModal(modalId, title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = modalId;
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="window.navigationManager.closeModal('${modalId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Close modal when clicking overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modalId);
            }
        });
        
        return modal;
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
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
    
    // Analytics methods
    toggleAnalytics(enabled) {
        if (window.analyticsService) {
            if (enabled) {
                window.analyticsService.enableAnalytics();
                if (window.app) {
                    window.app.showNotification('Analytics enabled', 'success');
                }
            } else {
                window.analyticsService.disableAnalytics();
                if (window.app) {
                    window.app.showNotification('Analytics disabled', 'info');
                }
            }
        }
    }
    
    viewAnalyticsData() {
        if (!window.analyticsService) {
            if (window.app) {
                window.app.showNotification('Analytics service not available', 'error');
            }
            return;
        }
        
        const insights = window.analyticsService.getUsageInsights();
        if (!insights) {
            if (window.app) {
                window.app.showNotification('No analytics data available. Enable analytics first.', 'info');
            }
            return;
        }
        
        // Create analytics modal
        this.showAnalyticsModal(insights);
    }
    
    showAnalyticsModal(insights) {
        this.removeExistingModal('analytics-modal');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'analytics-modal';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <i class="fas fa-chart-bar"></i>
                        Your Usage Analytics
                    </h2>
                    <button class="modal-close" onclick="document.getElementById('analytics-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="analytics-insights">
                        <div class="insight-grid">
                            <div class="insight-card">
                                <h4>Total Sessions</h4>
                                <div class="insight-value">${insights.totalSessions}</div>
                            </div>
                            <div class="insight-card">
                                <h4>Average Session Time</h4>
                                <div class="insight-value">${Math.round(insights.averageSessionTime / 60)} minutes</div>
                            </div>
                            <div class="insight-card">
                                <h4>Total Trips</h4>
                                <div class="insight-value">${insights.totalTrips}</div>
                            </div>
                            <div class="insight-card">
                                <h4>Trip Completion Rate</h4>
                                <div class="insight-value">${insights.tripCompletionRate.toFixed(1)}%</div>
                            </div>
                        </div>
                        
                        <div class="feature-usage">
                            <h3>Most Used Features</h3>
                            <div class="feature-list">
                                ${insights.mostUsedFeatures.map(feature => `
                                    <div class="feature-item">
                                        <span class="feature-name">${feature.feature}</span>
                                        <span class="feature-count">${feature.count} times</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="data-info">
                            <p><strong>Data collected since:</strong> ${new Date(insights.dataCollectedSince).toLocaleDateString()}</p>
                            <p><strong>Total events:</strong> ${insights.totalEvents}</p>
                            <p class="privacy-note">
                                <i class="fas fa-shield-alt"></i>
                                All analytics data is stored locally on your device and is not shared with third parties.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }
    
    exportAnalyticsData() {
        if (!window.analyticsService) {
            if (window.app) {
                window.app.showNotification('Analytics service not available', 'error');
            }
            return;
        }
        
        const data = window.analyticsService.exportAnalyticsData();
        if (!data) {
            if (window.app) {
                window.app.showNotification('No analytics data to export', 'info');
            }
            return;
        }
        
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `travique-analytics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (window.app) {
                window.app.showNotification('Analytics data exported successfully!', 'success');
            }
        } catch (error) {
            console.error('Failed to export analytics data:', error);
            if (window.app) {
                window.app.showNotification('Failed to export analytics data', 'error');
            }
        }
    }
    
    confirmClearAnalytics() {
        if (confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
            if (window.analyticsService) {
                window.analyticsService.clearAnalyticsData();
                if (window.app) {
                    window.app.showNotification('Analytics data cleared', 'success');
                }
            }
        }
    }
    
    // Cleanup
    destroy() {
        // Remove event listeners and clean up
        this.navigationHistory = [];
        this.isInitialized = false;
    }
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}