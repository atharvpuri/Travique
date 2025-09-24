// CHATBOT ADMIN UTILITIES

class ChatbotAdmin {
    constructor() {
        this.isAdminMode = false;
        this.setupAdminPanel();
    }

    setupAdminPanel() {
        // Create admin panel (hidden by default)
        const adminPanel = document.createElement('div');
        adminPanel.id = 'chatbot-admin-panel';
        adminPanel.className = 'chatbot-admin-panel';
        adminPanel.style.display = 'none';
        
        adminPanel.innerHTML = `
            <div class="admin-panel-content">
                <h3>Chatbot Admin Panel</h3>
                <div class="admin-controls">
                    <button id="clearChatHistory" class="admin-btn">Clear Chat History</button>
                    <button id="exportChatData" class="admin-btn">Export Chat Data</button>
                    <button id="toggleDebugMode" class="admin-btn">Toggle Debug Mode</button>
                    <button id="viewAnalytics" class="admin-btn">View Analytics</button>
                </div>
                <div class="admin-stats" id="adminStats"></div>
                <button id="closeAdminPanel" class="admin-btn close-btn">Close</button>
            </div>
        `;
        
        document.body.appendChild(adminPanel);
        this.setupAdminEvents();
    }

    setupAdminEvents() {
        // Secret key combination to open admin panel (Ctrl+Shift+A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                this.toggleAdminPanel();
            }
        });

        // Admin panel controls
        document.getElementById('clearChatHistory')?.addEventListener('click', () => {
            this.clearChatHistory();
        });

        document.getElementById('exportChatData')?.addEventListener('click', () => {
            this.exportChatData();
        });

        document.getElementById('toggleDebugMode')?.addEventListener('click', () => {
            this.toggleDebugMode();
        });

        document.getElementById('viewAnalytics')?.addEventListener('click', () => {
            this.showAnalytics();
        });

        document.getElementById('closeAdminPanel')?.addEventListener('click', () => {
            this.hideAdminPanel();
        });
    }

    toggleAdminPanel() {
        const panel = document.getElementById('chatbot-admin-panel');
        if (panel.style.display === 'none') {
            this.showAdminPanel();
        } else {
            this.hideAdminPanel();
        }
    }

    showAdminPanel() {
        const panel = document.getElementById('chatbot-admin-panel');
        panel.style.display = 'block';
        this.isAdminMode = true;
        this.updateAdminStats();
    }

    hideAdminPanel() {
        const panel = document.getElementById('chatbot-admin-panel');
        panel.style.display = 'none';
        this.isAdminMode = false;
    }

    clearChatHistory() {
        if (confirm('Are you sure you want to clear all chat history?')) {
            const chatbot = window.TraviqueChatbot?.getInstance();
            if (chatbot) {
                chatbot.clearChatHistory();
                alert('Chat history cleared successfully!');
                this.updateAdminStats();
            }
        }
    }

    exportChatData() {
        try {
            const chatHistory = localStorage.getItem('travique_chat_history');
            const analyticsData = localStorage.getItem('travique_chatbot_analytics');
            
            const exportData = {
                chatHistory: chatHistory ? JSON.parse(chatHistory) : [],
                analytics: analyticsData ? JSON.parse(analyticsData) : {},
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `travique-chatbot-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            alert('Chat data exported successfully!');
        } catch (error) {
            alert('Error exporting chat data: ' + error.message);
        }
    }

    toggleDebugMode() {
        const isDebug = localStorage.getItem('travique_chatbot_debug') === 'true';
        localStorage.setItem('travique_chatbot_debug', (!isDebug).toString());
        alert(`Debug mode ${!isDebug ? 'enabled' : 'disabled'}!`);
    }

    showAnalytics() {
        try {
            const analyticsData = localStorage.getItem('travique_chatbot_analytics');
            const stats = analyticsData ? JSON.parse(analyticsData) : {};
            
            const analyticsWindow = window.open('', '_blank', 'width=600,height=400');
            analyticsWindow.document.write(`
                <html>
                    <head><title>Chatbot Analytics</title></head>
                    <body style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Travique Chatbot Analytics</h2>
                        <pre>${JSON.stringify(stats, null, 2)}</pre>
                    </body>
                </html>
            `);
        } catch (error) {
            alert('Error viewing analytics: ' + error.message);
        }
    }

    updateAdminStats() {
        const statsContainer = document.getElementById('adminStats');
        if (!statsContainer) return;

        try {
            const chatHistory = localStorage.getItem('travique_chat_history');
            const messages = chatHistory ? JSON.parse(chatHistory) : [];
            const isDebug = localStorage.getItem('travique_chatbot_debug') === 'true';
            
            const stats = {
                totalMessages: messages.length,
                userMessages: messages.filter(m => m.type === 'user').length,
                aiMessages: messages.filter(m => m.type === 'ai').length,
                debugMode: isDebug,
                lastActivity: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toLocaleString() : 'No activity'
            };

            statsContainer.innerHTML = `
                <h4>Current Statistics</h4>
                <p><strong>Total Messages:</strong> ${stats.totalMessages}</p>
                <p><strong>User Messages:</strong> ${stats.userMessages}</p>
                <p><strong>AI Messages:</strong> ${stats.aiMessages}</p>
                <p><strong>Debug Mode:</strong> ${stats.debugMode ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Last Activity:</strong> ${stats.lastActivity}</p>
            `;
        } catch (error) {
            statsContainer.innerHTML = '<p>Error loading statistics</p>';
        }
    }
}

// CSS for admin panel
const adminPanelCSS = `
    .chatbot-admin-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        background: var(--glass-bg);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-xl);
        backdrop-filter: blur(30px) saturate(180%);
        box-shadow: var(--shadow-xl);
        z-index: 20000;
        padding: var(--spacing-xl);
        color: var(--primary-text);
    }

    .admin-panel-content h3 {
        color: var(--neon-green);
        margin-bottom: var(--spacing-lg);
        text-align: center;
        font-family: 'Poppins', sans-serif;
    }

    .admin-controls {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
    }

    .admin-btn {
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--glass-bg);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-md);
        color: var(--primary-text);
        cursor: pointer;
        transition: all var(--transition-normal);
        font-size: 0.9rem;
    }

    .admin-btn:hover {
        background: var(--glass-hover);
        border-color: var(--neon-green);
        transform: translateY(-2px);
    }

    .admin-btn.close-btn {
        background: linear-gradient(135deg, var(--danger), #e74c3c);
        border: none;
        color: white;
        margin-top: var(--spacing-lg);
    }

    .admin-stats {
        background: var(--secondary-bg);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        font-size: 0.85rem;
        line-height: 1.4;
    }

    .admin-stats h4 {
        color: var(--neon-green);
        margin-bottom: var(--spacing-sm);
    }

    .admin-stats p {
        margin-bottom: var(--spacing-xs);
    }
`;

// Inject admin panel CSS
const adminStyleSheet = document.createElement('style');
adminStyleSheet.textContent = adminPanelCSS;
document.head.appendChild(adminStyleSheet);

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    new ChatbotAdmin();
});

window.ChatbotAdmin = ChatbotAdmin;