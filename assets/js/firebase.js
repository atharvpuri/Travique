// Firebase Service Module - Authentication and Firestore Database
class FirebaseService {
    constructor() {
        this.auth = null;
        this.db = null;
        this.user = null;
        this.authStateListeners = [];
        this.init();
    }

    // Initialize Firebase services
    async init() {
        // Wait for Firebase to be available
        while (!window.firebaseAuth || !window.firebaseDB) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDB;
        
        // Set up auth state listener
        this.setupAuthStateListener();
        
        console.log('Firebase Service initialized');
    }

    // Authentication State Management
    setupAuthStateListener() {
        if (!this.auth) return;
        
        window.onAuthStateChanged(this.auth, (user) => {
            this.user = user;
            this.notifyAuthStateListeners(user);
            
            if (user) {
                console.log('User signed in:', user.email);
                this.syncUserData();
            } else {
                console.log('User signed out');
                this.clearLocalData();
            }
        });
    }

    // Add auth state listener
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        
        // Call immediately if user is already set
        if (this.user !== null) {
            callback(this.user);
        }
    }

    // Notify all auth state listeners
    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => callback(user));
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new window.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            const result = await window.signInWithPopup(this.auth, provider);
            const user = result.user;
            
            // Create user profile in Firestore
            await this.createUserProfile(user);
            
            return user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    }

    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            const result = await window.signInWithEmailAndPassword(this.auth, email, password);
            return result.user;
        } catch (error) {
            console.error('Email sign-in error:', error);
            throw error;
        }
    }

    // Create account with email and password
    async createAccountWithEmail(email, password, displayName) {
        try {
            const result = await window.createUserWithEmailAndPassword(this.auth, email, password);
            const user = result.user;
            
            // Update profile with display name
            await window.updateProfile(user, { displayName });
            
            // Create user profile in Firestore
            await this.createUserProfile(user);
            
            return user;
        } catch (error) {
            console.error('Account creation error:', error);
            throw error;
        }
    }

    // Sign out
    async signOut() {
        try {
            await window.signOut(this.auth);
        } catch (error) {
            console.error('Sign-out error:', error);
            throw error;
        }
    }

    // Firestore Database Operations
    async createUserProfile(user) {
        try {
            const userRef = window.doc(this.db, 'users', user.uid);
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Traveler',
                photoURL: user.photoURL || null,
                createdAt: window.serverTimestamp(),
                lastLogin: window.serverTimestamp(),
                preferences: {
                    theme: 'dark',
                    units: 'metric',
                    language: 'en'
                },
                stats: {
                    totalTrips: 0,
                    totalDistance: 0,
                    countriesVisited: 0,
                    citiesVisited: 0
                }
            };
            
            await window.setDoc(userRef, userData, { merge: true });
            console.log('User profile created/updated');
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    // Get user profile data
    async getUserProfile(userId = null) {
        try {
            const uid = userId || this.user?.uid;
            if (!uid) return null;
            
            const userRef = window.doc(this.db, 'users', uid);
            const userSnap = await window.getDoc(userRef);
            
            if (userSnap.exists()) {
                return userSnap.data();
            } else {
                console.log('No user profile found');
                return null;
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    // Save trip to Firestore
    async saveTrip(tripData) {
        try {
            if (!this.user) throw new Error('User not authenticated');
            
            const trip = {
                ...tripData,
                userId: this.user.uid,
                createdAt: window.serverTimestamp(),
                updatedAt: window.serverTimestamp()
            };
            
            const docRef = await window.addDoc(window.collection(this.db, 'trips'), trip);
            console.log('Trip saved with ID:', docRef.id);
            
            // Update user stats
            await this.updateUserStats();
            
            return docRef.id;
        } catch (error) {
            console.error('Error saving trip:', error);
            throw error;
        }
    }

    // Get user trips
    async getUserTrips() {
        try {
            if (!this.user) return [];
            
            const tripsRef = window.collection(this.db, 'trips');
            const q = window.query(
                tripsRef,
                window.where('userId', '==', this.user.uid),
                window.orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await window.getDocs(q);
            const trips = [];
            
            querySnapshot.forEach((doc) => {
                trips.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return trips;
        } catch (error) {
            console.error('Error getting user trips:', error);
            throw error;
        }
    }

    // Update trip
    async updateTrip(tripId, updates) {
        try {
            if (!this.user) throw new Error('User not authenticated');
            
            const tripRef = window.doc(this.db, 'trips', tripId);
            await window.updateDoc(tripRef, {
                ...updates,
                updatedAt: window.serverTimestamp()
            });
            
            console.log('Trip updated:', tripId);
        } catch (error) {
            console.error('Error updating trip:', error);
            throw error;
        }
    }

    // Delete trip
    async deleteTrip(tripId) {
        try {
            if (!this.user) throw new Error('User not authenticated');
            
            const tripRef = window.doc(this.db, 'trips', tripId);
            await window.deleteDoc(tripRef);
            
            console.log('Trip deleted:', tripId);
            await this.updateUserStats();
        } catch (error) {
            console.error('Error deleting trip:', error);
            throw error;
        }
    }

    // Save user preferences
    async saveUserPreferences(preferences) {
        try {
            if (!this.user) throw new Error('User not authenticated');
            
            const userRef = window.doc(this.db, 'users', this.user.uid);
            await window.updateDoc(userRef, {
                preferences: preferences
            });
            
            console.log('User preferences saved');
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw error;
        }
    }

    // Update user statistics
    async updateUserStats() {
        try {
            if (!this.user) return;
            
            const trips = await this.getUserTrips();
            const stats = {
                totalTrips: trips.length,
                totalDistance: trips.reduce((total, trip) => total + (trip.distance || 0), 0),
                countriesVisited: new Set(trips.map(trip => trip.country).filter(Boolean)).size,
                citiesVisited: new Set(trips.map(trip => trip.destinations?.map(d => d.city)).flat().filter(Boolean)).size
            };
            
            const userRef = window.doc(this.db, 'users', this.user.uid);
            await window.updateDoc(userRef, { stats });
            
            console.log('User stats updated:', stats);
        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    }

    // Data Synchronization
    async syncUserData() {
        try {
            if (!this.user) return;
            
            // Get local data
            const localTrips = JSON.parse(localStorage.getItem('travique_trips') || '[]');
            const localMarkers = JSON.parse(localStorage.getItem('travique_markers') || '[]');
            
            // Sync local trips to Firestore
            for (const trip of localTrips) {
                if (!trip.synced) {
                    const tripId = await this.saveTrip(trip);
                    trip.id = tripId;
                    trip.synced = true;
                }
            }
            
            // Update local storage
            localStorage.setItem('travique_trips', JSON.stringify(localTrips));
            
            // Get cloud data and merge
            const cloudTrips = await this.getUserTrips();
            const mergedTrips = this.mergeTripsData(localTrips, cloudTrips);
            
            // Update local storage with merged data
            localStorage.setItem('travique_trips', JSON.stringify(mergedTrips));
            
            console.log('User data synchronized');
        } catch (error) {
            console.error('Error syncing user data:', error);
        }
    }

    // Merge local and cloud trip data
    mergeTripsData(localTrips, cloudTrips) {
        const merged = [...cloudTrips];
        
        localTrips.forEach(localTrip => {
            const existingIndex = merged.findIndex(cloudTrip => 
                cloudTrip.id === localTrip.id || 
                (cloudTrip.name === localTrip.name && 
                 cloudTrip.createdAt === localTrip.createdAt)
            );
            
            if (existingIndex === -1) {
                merged.push(localTrip);
            } else {
                // Use the most recently updated version
                const cloudTrip = merged[existingIndex];
                const localUpdated = new Date(localTrip.updatedAt || localTrip.createdAt);
                const cloudUpdated = new Date(cloudTrip.updatedAt?.seconds * 1000 || cloudTrip.createdAt?.seconds * 1000);
                
                if (localUpdated > cloudUpdated) {
                    merged[existingIndex] = localTrip;
                }
            }
        });
        
        return merged;
    }

    // Clear local data on sign out
    clearLocalData() {
        // Keep some data for offline use, but mark as unsynced
        const trips = JSON.parse(localStorage.getItem('travique_trips') || '[]');
        trips.forEach(trip => trip.synced = false);
        localStorage.setItem('travique_trips', JSON.stringify(trips));
    }

    // Utility methods
    isAuthenticated() {
        return !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    getUserId() {
        return this.user?.uid || null;
    }

    getUserEmail() {
        return this.user?.email || null;
    }

    getUserDisplayName() {
        return this.user?.displayName || 'Traveler';
    }

    getUserPhotoURL() {
        return this.user?.photoURL || null;
    }
}

// Initialize Firebase Service
const firebaseService = new FirebaseService();

// Make it globally available
window.firebaseService = firebaseService;