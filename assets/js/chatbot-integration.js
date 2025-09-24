// CHATBOT INTEGRATION WITH TRAVIQUE FEATURES

class ChatbotIntegration {
    constructor() {
        this.chatbot = null;
        this.init();
    }

    init() {
        // Wait for chatbot to be ready
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.chatbot = window.TraviqueChatbot.getInstance();
                this.setupIntegrations();
            }, 1000);
        });
    }

    setupIntegrations() {
        this.setupTripHelp();
        this.setupNavigationHelp();
        this.setupLocationHelp();
        this.setupErrorHandling();
    }

    // Integration with trip management
    setupTripHelp() {
        // Help button in trip section
        const tripSection = document.getElementById('trip-section');
        if (tripSection) {
            const helpBtn = document.createElement('button');
            helpBtn.className = 'btn glass-btn chatbot-help-btn';
            helpBtn.innerHTML = '<i class="fas fa-robot"></i> Ask AI Assistant';
            helpBtn.style.marginBottom = 'var(--spacing-md)';
            
            helpBtn.addEventListener('click', () => {
                this.chatbot.sendContextualMessage(
                    'I need help with trip planning and management.',
                    'User is in the trip planning section'
                );
            });

            const tripForm = tripSection.querySelector('.trip-form-container');
            if (tripForm) {
                tripForm.insertBefore(helpBtn, tripForm.firstChild);
            }
        }

        // Auto-suggest when trip creation fails
        window.addEventListener('trip-creation-error', (event) => {
            const errorMsg = event.detail.error;
            this.chatbot.sendContextualMessage(
                `I'm having trouble creating a trip. The error was: ${errorMsg}. Can you help me?`,
                'Trip creation failed'
            );
        });
    }

    // Integration with navigation features
    setupNavigationHelp() {
        // Add help button to map section
        const mapSection = document.getElementById('map-section');
        if (mapSection) {
            const mapControls = mapSection.querySelector('.map-controls');
            if (mapControls) {
                const helpBtn = document.createElement('button');
                helpBtn.className = 'btn glass-btn map-help-btn';
                helpBtn.innerHTML = '<i class="fas fa-robot"></i>';
                helpBtn.title = 'Ask AI for navigation help';
                helpBtn.style.marginLeft = 'var(--spacing-sm)';
                
                helpBtn.addEventListener('click', () => {
                    this.chatbot.sendContextualMessage(
                        'I need help with navigation and map features.',
                        'User is in the map/navigation section'
                    );
                });

                mapControls.appendChild(helpBtn);
            }
        }

        // Auto-help for GPS errors
        window.addEventListener('gps-error', (event) => {
            const errorType = event.detail.type;
            let message = 'I\'m having trouble with GPS. ';
            
            switch (errorType) {
                case 'permission_denied':
                    message += 'Location permission was denied.';
                    break;
                case 'position_unavailable':
                    message += 'GPS position is unavailable.';
                    break;
                case 'timeout':
                    message += 'GPS request timed out.';
                    break;
                default:
                    message += 'Unknown GPS error occurred.';
            }
            
            message += ' Can you help me troubleshoot?';
            
            this.chatbot.sendContextualMessage(message, 'GPS Error Occurred');
        });
    }

    // Integration with location features
    setupLocationHelp() {
        // Help with location selection
        const locationBtns = document.querySelectorAll('.location-btn');
        locationBtns.forEach(btn => {
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.chatbot.sendContextualMessage(
                    'I need help with selecting or finding locations.',
                    'User right-clicked location button'
                );
            });
        });
    }

    // Error handling integration
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            // Only handle specific app errors, not all JavaScript errors
            if (event.error && event.error.name === 'TraviqueError') {
                const errorMsg = event.error.message;
                this.chatbot.sendContextualMessage(
                    `I encountered an error: ${errorMsg}. Can you help me resolve this?`,
                    'Application Error'
                );
            }
        });

        // Network error handling
        window.addEventListener('offline', () => {
            this.chatbot.sendContextualMessage(
                'I\'ve lost internet connection. What features can I still use offline?',
                'Network Connectivity Lost'
            );
        });

        window.addEventListener('online', () => {
            this.chatbot.sendContextualMessage(
                'Internet connection is back! Are there any features I should sync or update?',
                'Network Connectivity Restored'
            );
        });
    }

    // Public methods for manual integration
    static askAboutFeature(featureName) {
        const chatbot = window.TraviqueChatbot?.getInstance();
        if (chatbot) {
            chatbot.sendContextualMessage(
                `Tell me about the ${featureName} feature and how to use it.`,
                `User asking about ${featureName}`
            );
        }
    }

    static reportIssue(issueDescription) {
        const chatbot = window.TraviqueChatbot?.getInstance();
        if (chatbot) {
            chatbot.sendContextualMessage(
                `I'm experiencing an issue: ${issueDescription}. Can you help me?`,
                'User Reported Issue'
            );
        }
    }

    static askForHelp(context = '') {
        const chatbot = window.TraviqueChatbot?.getInstance();
        if (chatbot) {
            chatbot.sendContextualMessage(
                'I need help with using the Travique app.',
                context || 'General Help Request'
            );
        }
    }
}

// Enhanced chatbot responses for Travique-specific queries
class TraviqueContextualResponses {
    static getContextualPrompt(userMessage, context) {
        const basePrompt = `You are Travique AI, a specialized assistant for the Travique travel platform.`;
        
        let contextualInfo = '';
        
        switch (context) {
            case 'trip-planning':
                contextualInfo = `
                Trip Planning Context:
                - User is currently in the trip planning section
                - Available features: start/end location selection, companion details, trip purpose
                - Can help with route optimization, companion management, and trip settings
                `;
                break;
                
            case 'navigation':
                contextualInfo = `
                Navigation Context:
                - User is using the map/navigation features
                - Available features: GPS tracking, route display, real-time location
                - Can help with GPS issues, route planning, and location services
                `;
                break;
                
            case 'history':
                contextualInfo = `
                Trip History Context:
                - User is viewing their trip history
                - Available features: past trips, analytics, export data
                - Can help with understanding trip data and analytics
                `;
                break;
                
            case 'error-handling':
                contextualInfo = `
                Error Context:
                - User encountered an error or issue
                - Focus on troubleshooting and providing solutions
                - Offer step-by-step guidance to resolve problems
                `;
                break;
                
            default:
                contextualInfo = `
                General Travique Context:
                - Travique is a comprehensive travel data collection platform
                - Main features: trip planning, GPS tracking, history, analytics
                - Professional interface with dark theme and green accents
                `;
        }
        
        return `${basePrompt}

        ${contextualInfo}

        Key Travique Features to mention when relevant:
        1. Trip Management: Start/stop trips, set destinations, add companions
        2. GPS Tracking: Real-time location tracking with high accuracy
        3. Route Planning: Optimal route suggestions and navigation
        4. Trip History: Detailed analytics and past trip data
        5. Data Export: Export trip data for analysis
        6. Offline Mode: Basic features work without internet

        User Message: ${userMessage}

        Respond as a helpful Travique AI assistant. Be specific about Travique features when applicable.`;
    }
}

// Global functions for easy access
window.ChatbotIntegration = ChatbotIntegration;
window.TraviqueContextualResponses = TraviqueContextualResponses;

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    new ChatbotIntegration();
});

// Helper functions for other scripts to use
window.askChatbot = (message, context) => {
    const chatbot = window.TraviqueChatbot?.getInstance();
    if (chatbot) {
        chatbot.sendContextualMessage(message, context);
    }
};

window.showChatbotHelp = (featureName) => {
    ChatbotIntegration.askAboutFeature(featureName);
};