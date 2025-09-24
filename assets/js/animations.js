// Animation Controller for Travique App
class AnimationController {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.observers = [];
        
        this.init();
    }
    
    init() {
        console.log('🎬 Initializing Animation Controller...');
        this.setupIntersectionObservers();
        this.setupAnimationClasses();
        this.startAnimationLoop();
        console.log('✅ Animation Controller Ready!');
    }
    
    setupIntersectionObservers() {
        // Fade in animation observer
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    entry.target.classList.remove('fade-out');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Slide in animation observer
        const slideObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('slide-in');
                }
            });
        }, {
            threshold: 0.2
        });
        
        // Scale animation observer
        const scaleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scale-in');
                }
            });
        }, {
            threshold: 0.3
        });
        
        this.observers = [fadeObserver, slideObserver, scaleObserver];
        
        // Observe elements with animation classes
        this.observeElements();
    }
    
    observeElements() {
        // Fade animations
        document.querySelectorAll('.animate-fade').forEach(el => {
            this.observers[0].observe(el);
        });
        
        // Slide animations
        document.querySelectorAll('.animate-slide').forEach(el => {
            this.observers[1].observe(el);
        });
        
        // Scale animations
        document.querySelectorAll('.animate-scale').forEach(el => {
            this.observers[2].observe(el);
        });
    }
    
    setupAnimationClasses() {
        // Add CSS for animations if not already present
        if (!document.getElementById('travique-animations')) {
            const style = document.createElement('style');
            style.id = 'travique-animations';
            style.textContent = this.getAnimationCSS();
            document.head.appendChild(style);
        }
    }
    
    getAnimationCSS() {
        return `
            /* Fade Animations */
            .animate-fade {
                opacity: 0;
                transition: opacity 0.6s ease-in-out;
            }
            
            .animate-fade.fade-in {
                opacity: 1;
            }
            
            .animate-fade.fade-out {
                opacity: 0;
            }
            
            /* Slide Animations */
            .animate-slide {
                transform: translateY(30px);
                opacity: 0;
                transition: transform 0.6s ease-out, opacity 0.6s ease-out;
            }
            
            .animate-slide.slide-in {
                transform: translateY(0);
                opacity: 1;
            }
            
            .animate-slide-left {
                transform: translateX(-30px);
                opacity: 0;
                transition: transform 0.6s ease-out, opacity 0.6s ease-out;
            }
            
            .animate-slide-left.slide-in {
                transform: translateX(0);
                opacity: 1;
            }
            
            .animate-slide-right {
                transform: translateX(30px);
                opacity: 0;
                transition: transform 0.6s ease-out, opacity 0.6s ease-out;
            }
            
            .animate-slide-right.slide-in {
                transform: translateX(0);
                opacity: 1;
            }
            
            /* Scale Animations */
            .animate-scale {
                transform: scale(0.8);
                opacity: 0;
                transition: transform 0.6s ease-out, opacity 0.6s ease-out;
            }
            
            .animate-scale.scale-in {
                transform: scale(1);
                opacity: 1;
            }
            
            /* Rotation Animations */
            .animate-rotate {
                transform: rotate(-10deg);
                opacity: 0;
                transition: transform 0.6s ease-out, opacity 0.6s ease-out;
            }
            
            .animate-rotate.rotate-in {
                transform: rotate(0);
                opacity: 1;
            }
            
            /* Bounce Animations */
            .animate-bounce {
                animation: bounce 2s infinite;
            }
            
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
                    transform: translate3d(0,0,0);
                }
                40%, 43% {
                    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                    transform: translate3d(0, -30px, 0);
                }
                70% {
                    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                    transform: translate3d(0, -15px, 0);
                }
                90% {
                    transform: translate3d(0,-4px,0);
                }
            }
            
            /* Pulse Animations */
            .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: .5;
                }
            }
            
            /* Glow Animations */
            .animate-glow {
                animation: glow 2s ease-in-out infinite alternate;
            }
            
            @keyframes glow {
                from {
                    box-shadow: 0 0 5px var(--accent-color, #00d4ff);
                }
                to {
                    box-shadow: 0 0 20px var(--accent-color, #00d4ff), 0 0 30px var(--accent-color, #00d4ff);
                }
            }
            
            /* Shake Animation */
            .animate-shake {
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% {
                    transform: translateX(0);
                }
                10%, 30%, 50%, 70%, 90% {
                    transform: translateX(-10px);
                }
                20%, 40%, 60%, 80% {
                    transform: translateX(10px);
                }
            }
            
            /* Flip Animation */
            .animate-flip {
                animation: flip 1s ease-in-out;
            }
            
            @keyframes flip {
                0% {
                    transform: perspective(400px) rotateY(0);
                }
                40% {
                    transform: perspective(400px) rotateY(-90deg);
                }
                60% {
                    transform: perspective(400px) rotateY(-90deg);
                }
                100% {
                    transform: perspective(400px) rotateY(0);
                }
            }
            
            /* Slide Down Animation */
            .slide-down {
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            /* Slide Up Animation */
            .slide-up {
                animation: slideUp 0.3s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            /* Zoom In Animation */
            .zoom-in {
                animation: zoomIn 0.3s ease-out;
            }
            
            @keyframes zoomIn {
                from {
                    transform: scale(0);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            /* Page Transitions */
            .page-enter {
                animation: pageEnter 0.5s ease-out;
            }
            
            @keyframes pageEnter {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .page-exit {
                animation: pageExit 0.5s ease-out;
            }
            
            @keyframes pageExit {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-100%);
                    opacity: 0;
                }
            }
            
            /* Loading Animations */
            .loading-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
            
            .loading-dots::after {
                content: '';
                animation: dots 1.5s infinite;
            }
            
            @keyframes dots {
                0%, 20% {
                    content: '.';
                }
                40% {
                    content: '..';
                }
                60%, 100% {
                    content: '...';
                }
            }
            
            /* Hover Effects */
            .hover-lift {
                transition: transform 0.3s ease;
            }
            
            .hover-lift:hover {
                transform: translateY(-5px);
            }
            
            .hover-scale {
                transition: transform 0.3s ease;
            }
            
            .hover-scale:hover {
                transform: scale(1.05);
            }
            
            .hover-rotate {
                transition: transform 0.3s ease;
            }
            
            .hover-rotate:hover {
                transform: rotate(5deg);
            }
            
            /* Stagger Animations */
            .stagger-animation > * {
                animation-delay: calc(var(--stagger-delay, 0.1s) * var(--item-index, 0));
            }
        `;
    }
    
    startAnimationLoop() {
        const animate = () => {
            if (this.animationQueue.length > 0 && !this.isAnimating) {
                this.processAnimationQueue();
            }
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    processAnimationQueue() {
        if (this.animationQueue.length === 0) return;
        
        this.isAnimating = true;
        const animation = this.animationQueue.shift();
        
        this.executeAnimation(animation).then(() => {
            this.isAnimating = false;
        });
    }
    
    executeAnimation(animation) {
        return new Promise((resolve) => {
            const { element, type, duration = 500, delay = 0 } = animation;
            
            setTimeout(() => {
                switch (type) {
                    case 'fadeIn':
                        this.fadeIn(element, duration);
                        break;
                    case 'fadeOut':
                        this.fadeOut(element, duration);
                        break;
                    case 'slideIn':
                        this.slideIn(element, duration);
                        break;
                    case 'slideOut':
                        this.slideOut(element, duration);
                        break;
                    case 'scaleIn':
                        this.scaleIn(element, duration);
                        break;
                    case 'scaleOut':
                        this.scaleOut(element, duration);
                        break;
                    default:
                        console.warn(`Unknown animation type: ${type}`);
                }
                
                setTimeout(resolve, duration);
            }, delay);
        });
    }
    
    // Public animation methods
    fadeIn(element, duration = 500) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }
    
    fadeOut(element, duration = 500) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }
    
    slideIn(element, duration = 500, direction = 'up') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        const transforms = {
            up: 'translateY(100%)',
            down: 'translateY(-100%)',
            left: 'translateX(100%)',
            right: 'translateX(-100%)'
        };
        
        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.transform = 'translate(0, 0)';
            element.style.opacity = '1';
        });
    }
    
    slideOut(element, duration = 500, direction = 'up') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        const transforms = {
            up: 'translateY(-100%)',
            down: 'translateY(100%)',
            left: 'translateX(-100%)',
            right: 'translateX(100%)'
        };
        
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }
    
    scaleIn(element, duration = 500) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        element.style.transform = 'scale(0)';
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        });
    }
    
    scaleOut(element, duration = 500) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        element.style.transform = 'scale(0)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }
    
    // Queue animation
    queueAnimation(element, type, options = {}) {
        this.animationQueue.push({
            element,
            type,
            ...options
        });
    }
    
    // Stagger animations
    staggerAnimation(elements, type, staggerDelay = 100) {
        if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
        }
        
        elements.forEach((element, index) => {
            this.queueAnimation(element, type, {
                delay: index * staggerDelay
            });
        });
    }
    
    // Add animation class with auto-removal
    addTemporaryClass(element, className, duration = 1000) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        element.classList.add(className);
        
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
    
    // Animate number counting
    animateNumber(element, start, end, duration = 1000) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        const range = end - start;
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (range * this.easeOutCubic(progress));
            element.textContent = Math.round(current);
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    
    // Easing functions
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeInCubic(t) {
        return t * t * t;
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    // Observe new elements
    observeNewElements() {
        this.observeElements();
    }
    
    // Cleanup
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.animationQueue = [];
        this.isAnimating = false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}