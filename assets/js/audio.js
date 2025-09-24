// Audio Manager for Sound Effects
class AudioManager {
    constructor() {
        this.sounds = {};
        this.isEnabled = true;
        this.volume = 0.3;
        
        this.init();
    }
    
    init() {
        console.log('🔊 Initializing Audio Manager...');
        
        // Create sound effects since we don't have actual files
        this.createSyntheticSounds();
        
        // Load user preferences
        this.loadAudioSettings();
        
        console.log('✅ Audio Manager Ready!');
    }
    
    createSyntheticSounds() {
        // Create synthetic click sound
        this.sounds.click = this.createClickSound();
        
        // Create synthetic hover sound
        this.sounds.hover = this.createHoverSound();
        
        // Create synthetic success sound
        this.sounds.success = this.createSuccessSound();
        
        // Create synthetic error sound
        this.sounds.error = this.createErrorSound();
        
        // Create synthetic notification sound
        this.sounds.notification = this.createNotificationSound();
    }
    
    createClickSound() {
        // Create a short, sharp click sound using Web Audio API
        return () => {
            if (!this.isEnabled) return;
            
            const audioContext = this.getAudioContext();
            if (!audioContext) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.volume * 0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        };
    }
    
    createHoverSound() {
        // Create a subtle hover sound
        return () => {
            if (!this.isEnabled) return;
            
            const audioContext = this.getAudioContext();
            if (!audioContext) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(this.volume * 0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        };
    }
    
    createSuccessSound() {
        // Create an uplifting success sound
        return () => {
            if (!this.isEnabled) return;
            
            const audioContext = this.getAudioContext();
            if (!audioContext) return;
            
            // Create a chord-like success sound
            [523.25, 659.25, 783.99].forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                
                oscillator.start(audioContext.currentTime + index * 0.1);
                oscillator.stop(audioContext.currentTime + 0.4 + index * 0.1);
            });
        };
    }
    
    createErrorSound() {
        // Create a warning/error sound
        return () => {
            if (!this.isEnabled) return;
            
            const audioContext = this.getAudioContext();
            if (!audioContext) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(this.volume * 0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        };
    }
    
    createNotificationSound() {
        // Create a pleasant notification sound
        return () => {
            if (!this.isEnabled) return;
            
            const audioContext = this.getAudioContext();
            if (!audioContext) return;
            
            // Two-tone notification
            [440, 554.37].forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.15);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.05 + index * 0.15);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2 + index * 0.15);
                
                oscillator.start(audioContext.currentTime + index * 0.15);
                oscillator.stop(audioContext.currentTime + 0.2 + index * 0.15);
            });
        };
    }
    
    getAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported');
                return null;
            }
        }
        
        // Resume context if suspended (required by modern browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        return this.audioContext;
    }
    
    // Public Methods
    playClick() {
        if (this.sounds.click) {
            this.sounds.click();
        }
    }
    
    playHover() {
        if (this.sounds.hover) {
            this.sounds.hover();
        }
    }
    
    playSuccess() {
        if (this.sounds.success) {
            this.sounds.success();
        }
    }
    
    playError() {
        if (this.sounds.error) {
            this.sounds.error();
        }
    }
    
    playNotification() {
        if (this.sounds.notification) {
            this.sounds.notification();
        }
    }
    
    // Settings Management
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveAudioSettings();
    }
    
    getVolume() {
        return this.volume;
    }
    
    toggleAudio() {
        this.isEnabled = !this.isEnabled;
        this.saveAudioSettings();
        return this.isEnabled;
    }
    
    isAudioEnabled() {
        return this.isEnabled;
    }
    
    loadAudioSettings() {
        try {
            const settings = localStorage.getItem('travique_audio_settings');
            if (settings) {
                const parsed = JSON.parse(settings);
                this.volume = parsed.volume ?? 0.3;
                this.isEnabled = parsed.enabled ?? true;
            }
        } catch (e) {
            console.warn('Failed to load audio settings:', e);
        }
    }
    
    saveAudioSettings() {
        try {
            const settings = {
                volume: this.volume,
                enabled: this.isEnabled
            };
            localStorage.setItem('travique_audio_settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save audio settings:', e);
        }
    }
    
    // Advanced Sound Effects
    playCustomTone(frequency, duration = 0.1, type = 'sine') {
        if (!this.isEnabled) return;
        
        const audioContext = this.getAudioContext();
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // Cleanup
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.sounds = {};
    }
}

// Auto-initialize user interaction for audio context
document.addEventListener('click', function initAudio() {
    if (window.audioManager) {
        const context = window.audioManager.getAudioContext();
        if (context && context.state === 'suspended') {
            context.resume();
        }
    }
    // Remove this listener after first user interaction
    document.removeEventListener('click', initAudio);
}, { once: true });

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}