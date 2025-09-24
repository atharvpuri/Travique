// Authentication UI Manager
class AuthManager {
    constructor() {
        this.isSignUpMode = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFirebaseAuth();
    }

    setupEventListeners() {
        // Google Sign In buttons
        const googleSignInBtn = document.getElementById('google-signin-btn');
        const modalGoogleSignInBtn = document.getElementById('modal-google-signin');
        
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }
        if (modalGoogleSignInBtn) {
            modalGoogleSignInBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }

        // Email Sign In button
        const emailSignInBtn = document.getElementById('email-signin-btn');
        if (emailSignInBtn) {
            emailSignInBtn.addEventListener('click', () => this.showEmailModal());
        }

        // Modal controls
        const closeModal = document.getElementById('close-modal');
        const modalOverlay = document.getElementById('email-auth-modal');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideEmailModal());
        }
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideEmailModal();
                }
            });
        }

        // Form switching
        const switchToSignUp = document.getElementById('switch-to-signup');
        const switchToSignIn = document.getElementById('switch-to-signin');
        
        if (switchToSignUp) {
            switchToSignUp.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToSignUp();
            });
        }
        if (switchToSignIn) {
            switchToSignIn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToSignIn();
            });
        }

        // Form submissions
        const signInForm = document.getElementById('signin-form');
        const signUpForm = document.getElementById('signup-form');
        
        if (signInForm) {
            signInForm.addEventListener('submit', (e) => this.handleEmailSignIn(e));
        }
        if (signUpForm) {
            signUpForm.addEventListener('submit', (e) => this.handleEmailSignUp(e));
        }

        // User menu controls
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userMenu = document.getElementById('user-menu');
        const signOutBtn = document.getElementById('signout-btn');
        const profileBtn = document.getElementById('profile-btn');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => this.toggleUserMenu());
        }
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => this.handleSignOut());
        }
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.showProfile());
        }
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-section')) {
                this.hideUserMenu();
            }
        });
    }

    setupFirebaseAuth() {
        // Wait for Firebase service to be available
        const checkFirebase = () => {
            if (window.firebaseService) {
                window.firebaseService.onAuthStateChanged((user) => {
                    this.updateAuthUI(user);
                });
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    }

    // Google Sign In
    async handleGoogleSignIn() {
        try {
            this.showLoading('Signing in with Google...');
            await window.firebaseService.signInWithGoogle();
            this.hideEmailModal();
            this.showSuccessMessage('Successfully signed in with Google!');
        } catch (error) {
            console.error('Google sign-in error:', error);
            this.showErrorMessage('Failed to sign in with Google. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    // Email Sign In
    async handleEmailSignIn(e) {
        e.preventDefault();
        
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        
        if (!email || !password) {
            this.showErrorMessage('Please fill in all fields.');
            return;
        }

        try {
            this.showLoading('Signing in...');
            await window.firebaseService.signInWithEmail(email, password);
            this.hideEmailModal();
            this.showSuccessMessage('Successfully signed in!');
        } catch (error) {
            console.error('Email sign-in error:', error);
            let message = 'Failed to sign in. Please check your credentials.';
            
            if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email address.';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Invalid email address format.';
            }
            
            this.showErrorMessage(message);
        } finally {
            this.hideLoading();
        }
    }

    // Email Sign Up
    async handleEmailSignUp(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        
        if (!name || !email || !password || !confirmPassword) {
            this.showErrorMessage('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            this.showErrorMessage('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            this.showErrorMessage('Password must be at least 6 characters long.');
            return;
        }

        try {
            this.showLoading('Creating account...');
            await window.firebaseService.createAccountWithEmail(email, password, name);
            this.hideEmailModal();
            this.showSuccessMessage('Account created successfully! Welcome to Travique!');
        } catch (error) {
            console.error('Email sign-up error:', error);
            let message = 'Failed to create account. Please try again.';
            
            if (error.code === 'auth/email-already-in-use') {
                message = 'An account with this email already exists.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Invalid email address format.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Password is too weak. Please choose a stronger password.';
            }
            
            this.showErrorMessage(message);
        } finally {
            this.hideLoading();
        }
    }

    // Sign Out
    async handleSignOut() {
        try {
            this.showLoading('Signing out...');
            await window.firebaseService.signOut();
            this.hideUserMenu();
            this.showSuccessMessage('Successfully signed out.');
        } catch (error) {
            console.error('Sign-out error:', error);
            this.showErrorMessage('Failed to sign out. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    // UI Management
    updateAuthUI(user) {
        const loginControls = document.getElementById('login-controls');
        const userProfile = document.getElementById('user-profile');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');

        if (user) {
            // User is signed in
            if (loginControls) loginControls.style.display = 'none';
            if (userProfile) userProfile.style.display = 'flex';
            
            if (userName) userName.textContent = user.displayName || 'Traveler';
            if (userEmail) userEmail.textContent = user.email;
            if (userAvatar) {
                userAvatar.src = user.photoURL || 'https://via.placeholder.com/32x32/00d4ff/ffffff?text=' + (user.displayName?.[0] || 'T');
                userAvatar.alt = user.displayName || 'User Avatar';
            }
        } else {
            // User is signed out
            if (loginControls) loginControls.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
            this.hideUserMenu();
        }
    }

    // Modal Management
    showEmailModal() {
        const modal = document.getElementById('email-auth-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Reset to sign-in mode by default
            this.switchToSignIn();
            // Add show class for animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }

    hideEmailModal() {
        const modal = document.getElementById('email-auth-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            this.clearForms();
            this.hideErrorMessage();
        }
    }

    switchToSignUp() {
        this.isSignUpMode = true;
        const signInForm = document.getElementById('signin-form');
        const signUpForm = document.getElementById('signup-form');
        const modalTitle = document.getElementById('modal-title');
        
        if (signInForm) signInForm.style.display = 'none';
        if (signUpForm) signUpForm.style.display = 'block';
        if (modalTitle) modalTitle.textContent = 'Create Account';
        
        this.clearForms();
        this.hideErrorMessage();
    }

    switchToSignIn() {
        this.isSignUpMode = false;
        const signInForm = document.getElementById('signin-form');
        const signUpForm = document.getElementById('signup-form');
        const modalTitle = document.getElementById('modal-title');
        
        if (signInForm) signInForm.style.display = 'block';
        if (signUpForm) signUpForm.style.display = 'none';
        if (modalTitle) modalTitle.textContent = 'Sign In to Travique';
        
        this.clearForms();
        this.hideErrorMessage();
    }

    // User Menu Management
    toggleUserMenu() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            const isVisible = userMenu.style.display === 'block';
            userMenu.style.display = isVisible ? 'none' : 'block';
        }
    }

    hideUserMenu() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }

    showProfile() {
        this.hideUserMenu();
        console.log('Opening user profile...');
        
        if (!this.user) {
            if (window.app) {
                window.app.showNotification('Please sign in to view your profile', 'warning');
            }
            return;
        }
        
        // Remove existing modal if present
        this.removeExistingModal('profile-modal');
        
        // Create profile modal
        const modal = this.createProfileModal();
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Initialize profile functionality
        this.initializeProfileModal();
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    createProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'profile-modal';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <i class="fas fa-user"></i>
                        User Profile
                    </h2>
                    <button class="modal-close" onclick="window.authManager.closeProfileModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.getProfileContent()}
                </div>
            </div>
        `;
        
        // Close modal when clicking overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeProfileModal();
            }
        });
        
        return modal;
    }
    
    getProfileContent() {
        const userData = this.getUserData();
        const stats = this.getUserStats();
        
        return `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar-container">
                            <img class="profile-avatar" src="${userData.photoURL || 'https://via.placeholder.com/120x120/00d4ff/ffffff?text=' + (userData.displayName?.[0] || 'T')}" alt="Profile Picture">
                            <button class="avatar-upload-btn" id="avatar-upload-btn">
                                <i class="fas fa-camera"></i>
                            </button>
                        </div>
                        <div class="profile-basic-info">
                            <h3 class="profile-name">${userData.displayName || 'Travel User'}</h3>
                            <p class="profile-email">${userData.email || 'No email provided'}</p>
                            <div class="profile-stats-summary">
                                <span class="stat-item">
                                    <i class="fas fa-route"></i>
                                    ${stats.totalTrips} Trips
                                </span>
                                <span class="stat-item">
                                    <i class="fas fa-globe"></i>
                                    ${stats.totalDistance.toFixed(1)} km
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-tabs">
                    <button class="profile-tab active" data-tab="personal">
                        <i class="fas fa-user"></i>
                        Personal Info
                    </button>
                    <button class="profile-tab" data-tab="statistics">
                        <i class="fas fa-chart-bar"></i>
                        Statistics
                    </button>
                    <button class="profile-tab" data-tab="preferences">
                        <i class="fas fa-cog"></i>
                        Preferences
                    </button>
                    <button class="profile-tab" data-tab="security">
                        <i class="fas fa-shield-alt"></i>
                        Security
                    </button>
                </div>
                
                <div class="profile-content">
                    <div class="profile-tab-content" id="personal-content">
                        <form class="profile-form" id="personal-info-form">
                            <div class="form-group">
                                <label for="profile-display-name">Display Name</label>
                                <input type="text" id="profile-display-name" value="${userData.displayName || ''}" placeholder="Enter your display name">
                            </div>
                            
                            <div class="form-group">
                                <label for="profile-email">Email Address</label>
                                <input type="email" id="profile-email" value="${userData.email || ''}" disabled>
                                <small class="form-help">Email cannot be changed</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="profile-phone">Phone Number</label>
                                <input type="tel" id="profile-phone" value="${userData.phoneNumber || ''}" placeholder="Enter your phone number">
                            </div>
                            
                            <div class="form-group">
                                <label for="profile-location">Location</label>
                                <input type="text" id="profile-location" value="${userData.location || ''}" placeholder="City, Country">
                            </div>
                            
                            <div class="form-group">
                                <label for="profile-bio">Bio</label>
                                <textarea id="profile-bio" rows="3" placeholder="Tell us about yourself...">${userData.bio || ''}</textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn primary">
                                    <i class="fas fa-save"></i>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="profile-tab-content hidden" id="statistics-content">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-route"></i>
                                </div>
                                <div class="stat-info">
                                    <h4>Total Trips</h4>
                                    <p class="stat-value">${stats.totalTrips}</p>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-road"></i>
                                </div>
                                <div class="stat-info">
                                    <h4>Distance Traveled</h4>
                                    <p class="stat-value">${stats.totalDistance.toFixed(1)} km</p>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-globe"></i>
                                </div>
                                <div class="stat-info">
                                    <h4>Countries Visited</h4>
                                    <p class="stat-value">${stats.countriesVisited}</p>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-city"></i>
                                </div>
                                <div class="stat-info">
                                    <h4>Cities Explored</h4>
                                    <p class="stat-value">${stats.citiesVisited}</p>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="stat-info">
                                    <h4>Total Travel Time</h4>
                                    <p class="stat-value">${this.formatDuration(stats.totalDuration)}</p>
                                </div>
                            </div>
                            
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-tachometer-alt"></i>
                                </div>
                                <div class="stat-info">
                                    <h4>Average Speed</h4>
                                    <p class="stat-value">${stats.averageSpeed.toFixed(1)} km/h</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="recent-activity">
                            <h4>Recent Activity</h4>
                            <div class="activity-list" id="recent-activity-list">
                                ${this.getRecentActivityHTML()}
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-tab-content hidden" id="preferences-content">
                        <div class="preferences-form">
                            <div class="pref-section">
                                <h4>Privacy Settings</h4>
                                <div class="pref-item">
                                    <label class="toggle-label">
                                        <input type="checkbox" id="public-profile" ${userData.preferences?.publicProfile ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                        Make profile public
                                    </label>
                                </div>
                                <div class="pref-item">
                                    <label class="toggle-label">
                                        <input type="checkbox" id="share-stats" ${userData.preferences?.shareStats ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                        Share statistics
                                    </label>
                                </div>
                            </div>
                            
                            <div class="pref-section">
                                <h4>Notification Preferences</h4>
                                <div class="pref-item">
                                    <label class="toggle-label">
                                        <input type="checkbox" id="trip-notifications" ${userData.preferences?.tripNotifications !== false ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                        Trip notifications
                                    </label>
                                </div>
                                <div class="pref-item">
                                    <label class="toggle-label">
                                        <input type="checkbox" id="email-updates" ${userData.preferences?.emailUpdates ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                        Email updates
                                    </label>
                                </div>
                            </div>
                            
                            <div class="pref-section">
                                <h4>Data Collection</h4>
                                <div class="pref-item">
                                    <label class="toggle-label">
                                        <input type="checkbox" id="location-history" ${userData.preferences?.locationHistory !== false ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                        Save location history
                                    </label>
                                </div>
                                <div class="pref-item">
                                    <label class="toggle-label">
                                        <input type="checkbox" id="analytics-data" ${userData.preferences?.analyticsData ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                        Anonymous analytics
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn primary" onclick="window.authManager.savePreferences()">
                                    <i class="fas fa-save"></i>
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-tab-content hidden" id="security-content">
                        <div class="security-section">
                            <h4>Account Security</h4>
                            <div class="security-item">
                                <div class="security-info">
                                    <h5>Password</h5>
                                    <p>Last changed: ${userData.lastPasswordChange || 'Never'}</p>
                                </div>
                                <button class="btn secondary" onclick="window.authManager.changePassword()">
                                    Change Password
                                </button>
                            </div>
                            
                            <div class="security-item">
                                <div class="security-info">
                                    <h5>Two-Factor Authentication</h5>
                                    <p>Add an extra layer of security to your account</p>
                                </div>
                                <button class="btn secondary" onclick="window.authManager.setup2FA()">
                                    Setup 2FA
                                </button>
                            </div>
                            
                            <div class="security-item">
                                <div class="security-info">
                                    <h5>Login Sessions</h5>
                                    <p>Manage your active login sessions</p>
                                </div>
                                <button class="btn secondary" onclick="window.authManager.viewSessions()">
                                    View Sessions
                                </button>
                            </div>
                            
                            <div class="security-item danger">
                                <div class="security-info">
                                    <h5>Delete Account</h5>
                                    <p>Permanently delete your account and all data</p>
                                </div>
                                <button class="btn danger" onclick="window.authManager.deleteAccount()">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getUserData() {
        if (!this.user) return {};
        
        // Combine Firebase user data with local profile data
        const localProfile = JSON.parse(localStorage.getItem('travique_user_profile') || '{}');
        
        return {
            uid: this.user.uid,
            displayName: this.user.displayName || localProfile.displayName,
            email: this.user.email,
            photoURL: this.user.photoURL || localProfile.photoURL,
            phoneNumber: this.user.phoneNumber || localProfile.phoneNumber,
            location: localProfile.location,
            bio: localProfile.bio,
            preferences: localProfile.preferences || {},
            lastPasswordChange: localProfile.lastPasswordChange,
            createdAt: localProfile.createdAt || new Date().toISOString()
        };
    }
    
    getUserStats() {
        try {
            const trips = JSON.parse(localStorage.getItem('travique_trips') || '[]');
            
            return {
                totalTrips: trips.length,
                totalDistance: trips.reduce((sum, trip) => sum + (trip.distance || 0), 0),
                totalDuration: trips.reduce((sum, trip) => sum + (trip.duration || 0), 0),
                countriesVisited: new Set(trips.map(trip => trip.country).filter(Boolean)).size,
                citiesVisited: new Set(trips.map(trip => trip.destinations?.map(d => d.city)).flat().filter(Boolean)).size,
                averageSpeed: trips.length > 0 ? trips.reduce((sum, trip) => sum + (trip.averageSpeed || 0), 0) / trips.length : 0
            };
        } catch (error) {
            console.error('Error calculating user stats:', error);
            return {
                totalTrips: 0,
                totalDistance: 0,
                totalDuration: 0,
                countriesVisited: 0,
                citiesVisited: 0,
                averageSpeed: 0
            };
        }
    }
    
    getRecentActivityHTML() {
        try {
            const trips = JSON.parse(localStorage.getItem('travique_trips') || '[]');
            const recentTrips = trips.slice(-5).reverse();
            
            if (recentTrips.length === 0) {
                return '<p class="no-activity">No recent activity</p>';
            }
            
            return recentTrips.map(trip => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-route"></i>
                    </div>
                    <div class="activity-info">
                        <h5>${trip.origin || 'Unknown'} → ${trip.destination || 'Unknown'}</h5>
                        <p>${new Date(trip.createdAt).toLocaleDateString()} • ${trip.distance?.toFixed(1) || 0} km</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            return '<p class="no-activity">Error loading activity</p>';
        }
    }
    
    formatDuration(minutes) {
        if (!minutes) return '0 min';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }
    
    initializeProfileModal() {
        // Tab switching
        const tabs = document.querySelectorAll('.profile-tab');
        const contents = document.querySelectorAll('.profile-tab-content');
        
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
                }
            });
        });
        
        // Personal info form
        const personalForm = document.getElementById('personal-info-form');
        if (personalForm) {
            personalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePersonalInfo();
            });
        }
        
        // Avatar upload
        const avatarUploadBtn = document.getElementById('avatar-upload-btn');
        if (avatarUploadBtn) {
            avatarUploadBtn.addEventListener('click', () => {
                this.uploadAvatar();
            });
        }
    }
    
    async savePersonalInfo() {
        try {
            const formData = {
                displayName: document.getElementById('profile-display-name')?.value || '',
                phoneNumber: document.getElementById('profile-phone')?.value || '',
                location: document.getElementById('profile-location')?.value || '',
                bio: document.getElementById('profile-bio')?.value || ''
            };
            
            // Update Firebase user profile
            if (window.firebaseService && this.user) {
                await window.firebaseService.updateUserProfile({
                    displayName: formData.displayName
                });
            }
            
            // Save to local storage
            const currentProfile = JSON.parse(localStorage.getItem('travique_user_profile') || '{}');
            const updatedProfile = { ...currentProfile, ...formData, updatedAt: new Date().toISOString() };
            localStorage.setItem('travique_user_profile', JSON.stringify(updatedProfile));
            
            // Sync to Firebase if available
            if (window.firebaseService && window.firebaseService.isAuthenticated()) {
                await window.firebaseService.updateUserProfile(updatedProfile);
            }
            
            if (window.app) {
                window.app.showNotification('Profile updated successfully!', 'success');
            }
            
            // Update UI
            this.updateUserDisplay();
            
        } catch (error) {
            console.error('Error saving profile:', error);
            if (window.app) {
                window.app.showNotification('Failed to update profile', 'error');
            }
        }
    }
    
    savePreferences() {
        try {
            const preferences = {
                publicProfile: document.getElementById('public-profile')?.checked || false,
                shareStats: document.getElementById('share-stats')?.checked || false,
                tripNotifications: document.getElementById('trip-notifications')?.checked || false,
                emailUpdates: document.getElementById('email-updates')?.checked || false,
                locationHistory: document.getElementById('location-history')?.checked || false,
                analyticsData: document.getElementById('analytics-data')?.checked || false
            };
            
            // Save to local storage
            const currentProfile = JSON.parse(localStorage.getItem('travique_user_profile') || '{}');
            currentProfile.preferences = preferences;
            currentProfile.updatedAt = new Date().toISOString();
            localStorage.setItem('travique_user_profile', JSON.stringify(currentProfile));
            
            // Sync to Firebase if available
            if (window.firebaseService && window.firebaseService.isAuthenticated()) {
                window.firebaseService.updateUserProfile({ preferences }).catch(console.warn);
            }
            
            if (window.app) {
                window.app.showNotification('Preferences saved successfully!', 'success');
            }
            
        } catch (error) {
            console.error('Error saving preferences:', error);
            if (window.app) {
                window.app.showNotification('Failed to save preferences', 'error');
            }
        }
    }
    
    uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Basic validation
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                if (window.app) {
                    window.app.showNotification('Image must be smaller than 5MB', 'error');
                }
                return;
            }
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarImg = document.querySelector('.profile-avatar');
                if (avatarImg) {
                    avatarImg.src = e.target.result;
                }
                
                // Save to profile (in a real app, you'd upload to a server)
                const currentProfile = JSON.parse(localStorage.getItem('travique_user_profile') || '{}');
                currentProfile.photoURL = e.target.result;
                currentProfile.updatedAt = new Date().toISOString();
                localStorage.setItem('travique_user_profile', JSON.stringify(currentProfile));
                
                this.updateUserDisplay();
                
                if (window.app) {
                    window.app.showNotification('Avatar updated successfully!', 'success');
                }
            };
            
            reader.readAsDataURL(file);
        };
        
        input.click();
    }
    
    closeProfileModal() {
        const modal = document.getElementById('profile-modal');
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
    
    // Security functions (placeholders for now)
    changePassword() {
        if (window.app) {
            window.app.showNotification('Password change feature coming soon!', 'info');
        }
    }
    
    setup2FA() {
        if (window.app) {
            window.app.showNotification('2FA setup coming soon!', 'info');
        }
    }
    
    viewSessions() {
        if (window.app) {
            window.app.showNotification('Session management coming soon!', 'info');
        }
    }
    
    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            if (confirm('This will permanently delete all your data. Type "DELETE" to confirm.')) {
                // In a real app, this would call the backend
                if (window.app) {
                    window.app.showNotification('Account deletion feature coming soon!', 'info');
                }
            }
        }
    }

    showSettings() {
        this.hideUserMenu();
        console.log('Opening settings...');
        
        // Use the navigation manager's settings modal
        if (window.navigationManager) {
            window.navigationManager.openSettingsModal();
        } else {
            if (window.app) {
                window.app.showNotification('Settings not available', 'warning');
            }
        }
    }

    // Utility Methods
    clearForms() {
        const forms = ['signin-form', 'signup-form'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) form.reset();
        });
    }

    showErrorMessage(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.className = 'error-message';
        }
    }

    showSuccessMessage(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.className = 'success-message';
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                this.hideErrorMessage();
            }, 3000);
        }
    }

    hideErrorMessage() {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    showLoading(message = 'Loading...') {
        // Add loading state to modal if open
        const modal = document.getElementById('email-auth-modal');
        if (modal && modal.style.display === 'flex') {
            const modalContainer = modal.querySelector('.modal-container');
            if (modalContainer) {
                modalContainer.classList.add('auth-loading');
            }
        }
        
        // Show loading message
        this.showErrorMessage(message);
    }

    hideLoading() {
        // Remove loading state
        const modalContainer = document.querySelector('.modal-container');
        if (modalContainer) {
            modalContainer.classList.remove('auth-loading');
        }
    }
}

// Initialize Authentication Manager
let authManager;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        authManager = new AuthManager();
    });
} else {
    authManager = new AuthManager();
}

// Make auth manager globally available
window.authManager = authManager;