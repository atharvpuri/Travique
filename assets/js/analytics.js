/**
 * Travique Analytics Service
 * Optional analytics tracking for navigation patterns and app usage
 * Respects user privacy and consent preferences
 */

class AnalyticsService {
    constructor() {
        this.isEnabled = false;
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            pageViews: [],
            tripActions: [],
            interactions: [],
            errors: []
        };
        
        this.initializeService();
    }
    
    initializeService() {
        // Check user consent for analytics
        const consent = localStorage.getItem('travique_analytics_consent');
        this.isEnabled = consent === 'accepted';
        
        if (this.isEnabled) {
            this.startSession();
            this.setupEventListeners();
        }
        
        console.log('Analytics Service initialized. Enabled:', this.isEnabled);
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    startSession() {
        this.trackEvent('session', 'start', {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        });
    }
    
    setupEventListeners() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('session', document.hidden ? 'background' : 'foreground', {
                timestamp: new Date().toISOString()
            });
        });
        
        // Track unload for session end
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
        
        // Track errors
        window.addEventListener('error', (event) => {
            this.trackError('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
        
        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError('promise_rejection', {
                reason: event.reason?.toString(),
                stack: event.reason?.stack
            });
        });
    }
    
    // Public methods for tracking specific events
    trackPageView(page, additionalData = {}) {
        if (!this.isEnabled) return;
        
        const pageViewData = {
            page: page,
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
            url: window.location.href,
            ...additionalData
        };
        
        this.sessionData.pageViews.push(pageViewData);
        this.trackEvent('navigation', 'page_view', pageViewData);
    }
    
    trackTripAction(action, tripData = {}) {
        if (!this.isEnabled) return;
        
        const actionData = {
            action: action, // 'start', 'pause', 'resume', 'complete', 'cancel'
            timestamp: new Date().toISOString(),
            tripId: tripData.id,
            transportMode: tripData.transportMode,
            duration: tripData.duration,
            distance: tripData.distance,
            waypoints: tripData.waypoints?.length || 0
        };
        
        this.sessionData.tripActions.push(actionData);
        this.trackEvent('trip', action, actionData);
    }
    
    trackUserInteraction(element, action, details = {}) {
        if (!this.isEnabled) return;
        
        const interactionData = {
            element: element,
            action: action, // 'click', 'scroll', 'input', 'focus'
            timestamp: new Date().toISOString(),
            ...details
        };
        
        this.sessionData.interactions.push(interactionData);
        this.trackEvent('interaction', action, interactionData);
    }
    
    trackMapUsage(action, mapData = {}) {
        if (!this.isEnabled) return;
        
        this.trackEvent('map', action, {
            action: action, // 'marker_placed', 'route_calculated', 'zoom_changed', 'map_moved'
            timestamp: new Date().toISOString(),
            ...mapData
        });
    }
    
    trackFeatureUsage(feature, action = 'used', details = {}) {
        if (!this.isEnabled) return;
        
        this.trackEvent('feature', action, {
            feature: feature, // 'settings', 'profile', 'history', 'help', etc.
            action: action,
            timestamp: new Date().toISOString(),
            ...details
        });
    }
    
    trackPerformance(metric, value, details = {}) {
        if (!this.isEnabled) return;
        
        this.trackEvent('performance', metric, {
            metric: metric, // 'page_load_time', 'api_response_time', 'gps_accuracy'
            value: value,
            timestamp: new Date().toISOString(),
            ...details
        });
    }
    
    trackError(type, errorData) {
        if (!this.isEnabled) return;
        
        const errorEvent = {
            type: type,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionData.sessionId,
            ...errorData
        };
        
        this.sessionData.errors.push(errorEvent);
        this.trackEvent('error', type, errorEvent);
    }
    
    // Core tracking method
    trackEvent(category, action, data = {}) {
        if (!this.isEnabled) return;
        
        const event = {
            category: category,
            action: action,
            data: data,
            sessionId: this.sessionData.sessionId,
            timestamp: new Date().toISOString(),
            userId: this.getUserId()
        };
        
        // Store locally (for privacy-first approach)
        this.storeEventLocally(event);
        
        // Optional: Send to analytics service (with explicit user consent)
        this.sendEventToService(event);
        
        console.log('Analytics Event:', event);
    }
    
    storeEventLocally(event) {
        try {
            let localEvents = JSON.parse(localStorage.getItem('travique_analytics_events') || '[]');
            localEvents.push(event);
            
            // Keep only last 1000 events to prevent storage bloat
            if (localEvents.length > 1000) {
                localEvents = localEvents.slice(-1000);
            }
            
            localStorage.setItem('travique_analytics_events', JSON.stringify(localEvents));
        } catch (error) {
            console.warn('Failed to store analytics event locally:', error);
        }
    }
    
    sendEventToService(event) {
        // Only send if user has explicitly enabled remote analytics
        const remoteAnalytics = localStorage.getItem('travique_remote_analytics');
        if (remoteAnalytics !== 'enabled') return;
        
        // Implementation for sending to analytics service
        // This would typically be Google Analytics, Firebase Analytics, etc.
        // For now, we'll just log it as we're focused on privacy
        console.log('Would send to remote analytics:', event);
    }
    
    getUserId() {
        let userId = localStorage.getItem('travique_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('travique_user_id', userId);
        }
        return userId;
    }
    
    // Session management
    endSession() {
        if (!this.isEnabled) return;
        
        this.trackEvent('session', 'end', {
            duration: Date.now() - this.sessionData.startTime,
            pageViews: this.sessionData.pageViews.length,
            tripActions: this.sessionData.tripActions.length,
            interactions: this.sessionData.interactions.length,
            errors: this.sessionData.errors.length,
            timestamp: new Date().toISOString()
        });
        
        // Store session summary
        this.storeSessionSummary();
    }
    
    storeSessionSummary() {
        try {
            const sessionSummary = {
                sessionId: this.sessionData.sessionId,
                startTime: this.sessionData.startTime,
                endTime: Date.now(),
                duration: Date.now() - this.sessionData.startTime,
                pageViews: this.sessionData.pageViews.length,
                tripActions: this.sessionData.tripActions.length,
                interactions: this.sessionData.interactions.length,
                errors: this.sessionData.errors.length
            };
            
            let sessions = JSON.parse(localStorage.getItem('travique_analytics_sessions') || '[]');
            sessions.push(sessionSummary);
            
            // Keep only last 30 sessions
            if (sessions.length > 30) {
                sessions = sessions.slice(-30);
            }
            
            localStorage.setItem('travique_analytics_sessions', JSON.stringify(sessions));
        } catch (error) {
            console.warn('Failed to store session summary:', error);
        }
    }
    
    // Analytics management methods
    enableAnalytics() {
        this.isEnabled = true;
        localStorage.setItem('travique_analytics_consent', 'accepted');
        this.setupEventListeners();
        this.trackEvent('analytics', 'enabled', { timestamp: new Date().toISOString() });
        console.log('Analytics enabled');
    }
    
    disableAnalytics() {
        this.isEnabled = false;
        localStorage.setItem('travique_analytics_consent', 'declined');
        this.trackEvent('analytics', 'disabled', { timestamp: new Date().toISOString() });
        console.log('Analytics disabled');
    }
    
    clearAnalyticsData() {
        localStorage.removeItem('travique_analytics_events');
        localStorage.removeItem('travique_analytics_sessions');
        localStorage.removeItem('travique_user_id');
        console.log('Analytics data cleared');
    }
    
    // Data export for user transparency
    exportAnalyticsData() {
        if (!this.isEnabled) return null;
        
        return {
            events: JSON.parse(localStorage.getItem('travique_analytics_events') || '[]'),
            sessions: JSON.parse(localStorage.getItem('travique_analytics_sessions') || '[]'),
            userId: this.getUserId(),
            consent: localStorage.getItem('travique_analytics_consent'),
            exportedAt: new Date().toISOString()
        };
    }
    
    // Analytics insights for the user
    getUsageInsights() {
        if (!this.isEnabled) return null;
        
        const events = JSON.parse(localStorage.getItem('travique_analytics_events') || '[]');
        const sessions = JSON.parse(localStorage.getItem('travique_analytics_sessions') || '[]');
        
        // Calculate insights
        const totalSessions = sessions.length;
        const totalSessionTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
        const averageSessionTime = totalSessions > 0 ? totalSessionTime / totalSessions : 0;
        
        const tripEvents = events.filter(e => e.category === 'trip');
        const totalTrips = tripEvents.filter(e => e.action === 'start').length;
        const completedTrips = tripEvents.filter(e => e.action === 'complete').length;
        
        const featureUsage = {};
        events.filter(e => e.category === 'feature').forEach(e => {
            featureUsage[e.data.feature] = (featureUsage[e.data.feature] || 0) + 1;
        });
        
        return {
            totalSessions,
            averageSessionTime: Math.round(averageSessionTime / 1000), // Convert to seconds
            totalTrips,
            completedTrips,
            tripCompletionRate: totalTrips > 0 ? (completedTrips / totalTrips * 100) : 0,
            mostUsedFeatures: Object.entries(featureUsage)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([feature, count]) => ({ feature, count })),
            totalEvents: events.length,
            dataCollectedSince: sessions[0]?.startTime || Date.now()
        };
    }
}

// Initialize analytics service
window.analyticsService = new AnalyticsService();

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsService;
}