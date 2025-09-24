// TRAVIQUE AI CHATBOT - GEMINI API INTEGRATION

class TraviqueChatbot {
    constructor() {
        this.apiKey = 'AIzaSyAQxka_UKWT2Eg1UBTG9YLvosp20FSXth4';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        this.quickActions = [
            'How to start a trip?',
            'Track my location',
            'Trip history',
            'Help with navigation',
            'Account settings'
        ];
        
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.setupEventListeners();
        this.loadChatHistory();
        this.showWelcomeMessage();
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <!-- Chatbot Toggle Button -->
            <button class="chatbot-toggle" id="chatbotToggle" aria-label="Toggle AI Assistant">
                <i class="fas fa-robot"></i>
            </button>

            <!-- Chatbot Container -->
            <div class="chatbot-container" id="chatbotContainer" role="dialog" aria-labelledby="chatbotTitle" aria-hidden="true">
                <!-- Header -->
                <div class="chatbot-header">
                    <div class="chatbot-title" id="chatbotTitle">
                        <i class="fas fa-robot"></i>
                        <span>Travique AI Assistant</span>
                    </div>
                    <div class="chatbot-status">
                        <div class="status-indicator"></div>
                        <span>Online</span>
                    </div>
                </div>

                <!-- Messages Area -->
                <div class="chatbot-messages" id="chatbotMessages" role="log" aria-live="polite">
                    <div class="welcome-message">
                        <i class="fas fa-robot"></i>
                        <h3>Welcome to Travique AI</h3>
                        <p>I'm here to help you with your travel planning and navigation needs. Ask me anything!</p>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions" id="quickActions"></div>

                <!-- Input Area -->
                <div class="chatbot-input-area">
                    <textarea 
                        class="chatbot-input" 
                        id="chatbotInput" 
                        placeholder="Type your message..."
                        rows="1"
                        aria-label="Chat message input"
                    ></textarea>
                    <button class="chatbot-send-btn" id="chatbotSend" aria-label="Send message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    setupEventListeners() {
        const toggle = document.getElementById('chatbotToggle');
        const container = document.getElementById('chatbotContainer');
        const input = document.getElementById('chatbotInput');
        const sendBtn = document.getElementById('chatbotSend');

        // Toggle chatbot
        toggle.addEventListener('click', () => this.toggleChatbot());

        // Send message on button click
        sendBtn.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        // Close chatbot when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.chatbot-container') && 
                !e.target.closest('.chatbot-toggle') && 
                this.isOpen) {
                this.closeChatbot();
            }
        });

        // Setup quick actions
        this.setupQuickActions();
    }

    setupQuickActions() {
        const quickActionsContainer = document.getElementById('quickActions');
        
        this.quickActions.forEach(action => {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'quick-action';
            actionBtn.textContent = action;
            actionBtn.addEventListener('click', () => {
                this.sendMessage(action);
            });
            quickActionsContainer.appendChild(actionBtn);
        });
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        const toggle = document.getElementById('chatbotToggle');
        const container = document.getElementById('chatbotContainer');
        
        this.isOpen = true;
        toggle.classList.add('active');
        container.classList.add('active');
        container.setAttribute('aria-hidden', 'false');
        
        // Focus input for accessibility
        setTimeout(() => {
            document.getElementById('chatbotInput').focus();
        }, 300);

        // Analytics
        this.trackEvent('chatbot_opened');
    }

    closeChatbot() {
        const toggle = document.getElementById('chatbotToggle');
        const container = document.getElementById('chatbotContainer');
        
        this.isOpen = false;
        toggle.classList.remove('active');
        container.classList.remove('active');
        container.setAttribute('aria-hidden', 'true');

        // Analytics
        this.trackEvent('chatbot_closed');
    }

    async sendMessage(messageText = null) {
        const input = document.getElementById('chatbotInput');
        const sendBtn = document.getElementById('chatbotSend');
        
        const message = messageText || input.value.trim();
        if (!message) return;

        // Clear input and disable send button
        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;

        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Call Gemini API
            const response = await this.callGeminiAPI(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(response, 'ai');
            
            // Save to history
            this.saveChatHistory();

        } catch (error) {
            console.error('Chatbot error:', error);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Show error message
            this.addMessage(
                "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", 
                'ai'
            );
        } finally {
            // Re-enable send button
            sendBtn.disabled = false;
        }

        // Analytics
        this.trackEvent('message_sent', { message_length: message.length });
    }

    async callGeminiAPI(message) {
        try {
            const contextPrompt = `You are Travique AI, a helpful travel and navigation assistant for the Travique platform. 
            
            Context about Travique:
            - Travique is a smart travel data collection platform
            - It helps users track trips, plan routes, and collect travel data
            - Features include GPS tracking, trip history, route planning, and analytics
            - The platform uses professional dark UI with green accents
            
            Your role:
            - Help users with travel planning and navigation
            - Provide guidance on using Travique features
            - Answer questions about trips, routes, and travel data
            - Be friendly, professional, and concise
            - If asked about features not related to travel/navigation, politely redirect to travel topics
            
            User message: ${message}
            
            Respond in a helpful, conversational tone. Keep responses under 200 words.`;

            const requestBody = {
                contents: [{
                    parts: [{
                        text: contextPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 200,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            };

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                console.error('API Response Error:', response.status, response.statusText);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data); // Debug log
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                return data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                console.error('API Error:', data.error);
                throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
            } else {
                console.error('Invalid API response format:', data);
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            // Return fallback response
            return this.getFallbackResponse(message);
        }
    }

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Travel planning responses
        if (lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('plan')) {
            return "I can help you plan your trips! Use the Trip Planning section to create new trips, add destinations, and track your journey. Would you like me to guide you through starting a new trip?";
        }
        
        // Navigation responses
        if (lowerMessage.includes('navigation') || lowerMessage.includes('route') || lowerMessage.includes('map')) {
            return "For navigation help, you can use our interactive map feature! Click on the Map section to view routes, add markers, and calculate distances. Need help with GPS tracking?";
        }
        
        // Location responses
        if (lowerMessage.includes('location') || lowerMessage.includes('gps') || lowerMessage.includes('track')) {
            return "Travique can track your location during trips! Make sure location permissions are enabled, then start a new trip to begin GPS tracking. Your route will be automatically recorded.";
        }
        
        // History responses
        if (lowerMessage.includes('history') || lowerMessage.includes('past') || lowerMessage.includes('previous')) {
            return "You can view all your past trips in the History section! It shows detailed information about your journeys, including routes taken, duration, and photos captured.";
        }
        
        // Help responses
        if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
            return "I'm here to help with Travique! I can assist with trip planning, navigation, GPS tracking, and viewing your travel history. What specific feature would you like help with?";
        }
        
        // Greeting responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! I'm your Travique AI assistant. I'm here to help you with trip planning, navigation, and making the most of your travel data collection. How can I assist you today?";
        }
        
        // Default response
        return "I'm your Travique AI assistant, ready to help with travel planning, navigation, and trip management! I can guide you through our features like GPS tracking, route planning, and viewing your travel history. What would you like to explore?";
    }

    addMessage(text, type) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        
        // Remove welcome message if it exists
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-avatar ${type}">
                <i class="fas ${type === 'ai' ? 'fa-robot' : 'fa-user'}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble ${type}">
                    ${this.formatMessage(text)}
                </div>
                <div class="message-time">${currentTime}</div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        
        // Store message
        this.messages.push({
            text,
            type,
            timestamp: Date.now()
        });

        // Scroll to bottom
        this.scrollToBottom();
    }

    formatMessage(text) {
        // Basic formatting for AI responses
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai typing-message';
        typingElement.innerHTML = `
            <div class="message-avatar ai">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-indicator">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        this.isTyping = true;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
        this.isTyping = false;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showWelcomeMessage() {
        // Always show a helpful welcome message
        setTimeout(() => {
            const isReturningUser = localStorage.getItem('travique_chatbot_used');
            
            if (isReturningUser) {
                this.addMessage("Welcome back! I'm your Travique AI assistant. How can I help you with your travels today?", 'ai');
            } else {
                this.addMessage("Hello! I'm your Travique AI assistant. I can help you with trip planning, navigation, GPS tracking, and managing your travel data. What would you like to explore first?", 'ai');
            }
        }, 500);
    }

    saveChatHistory() {
        try {
            // Only save last 20 messages to avoid localStorage overflow
            const recentMessages = this.messages.slice(-20);
            localStorage.setItem('travique_chat_history', JSON.stringify(recentMessages));
            localStorage.setItem('travique_chatbot_used', 'true');
        } catch (error) {
            console.warn('Could not save chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const history = localStorage.getItem('travique_chat_history');
            if (history) {
                this.messages = JSON.parse(history);
                
                // Restore last few messages
                const messagesContainer = document.getElementById('chatbotMessages');
                const welcomeMessage = messagesContainer.querySelector('.welcome-message');
                
                if (this.messages.length > 0 && welcomeMessage) {
                    welcomeMessage.remove();
                    
                    // Show last 5 messages
                    const recentMessages = this.messages.slice(-5);
                    recentMessages.forEach(msg => {
                        this.addMessage(msg.text, msg.type);
                    });
                }
            }
        } catch (error) {
            console.warn('Could not load chat history:', error);
        }
    }

    clearChatHistory() {
        this.messages = [];
        localStorage.removeItem('travique_chat_history');
        
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-robot"></i>
                <h3>Welcome to Travique AI</h3>
                <p>I'm here to help you with your travel planning and navigation needs. Ask me anything!</p>
            </div>
        `;
    }

    trackEvent(eventName, properties = {}) {
        // Integration with analytics
        if (window.analytics && typeof window.analytics.track === 'function') {
            window.analytics.track(`Chatbot ${eventName}`, {
                timestamp: new Date().toISOString(),
                ...properties
            });
        }
    }

    // Public methods for integration with main app
    static getInstance() {
        if (!window.traviqueChatbot) {
            window.traviqueChatbot = new TraviqueChatbot();
        }
        return window.traviqueChatbot;
    }

    // Method to send contextual messages from other parts of the app
    sendContextualMessage(message, context = '') {
        if (!this.isOpen) {
            this.openChatbot();
        }
        
        const contextualMessage = context ? `${context}\n\n${message}` : message;
        setTimeout(() => {
            this.sendMessage(contextualMessage);
        }, 500);
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TraviqueChatbot.getInstance();
});

// Export for global access
window.TraviqueChatbot = TraviqueChatbot;