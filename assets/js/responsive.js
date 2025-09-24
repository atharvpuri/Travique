// RESPONSIVE UTILITIES AND MOBILE OPTIMIZATIONS

class ResponsiveManager {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.detectDevice();
        this.setupViewportHeight();
        this.setupTouchOptimizations();
        this.setupOrientationChange();
    }

    detectDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        document.documentElement.classList.toggle('is-mobile', isMobile);
        document.documentElement.classList.toggle('is-tablet', isTablet);
        document.documentElement.classList.toggle('is-touch', isTouch);
        document.documentElement.classList.toggle('is-desktop', !isMobile && !isTablet);

        // Store device info globally
        window.deviceInfo = {
            isMobile,
            isTablet,
            isTouch,
            isDesktop: !isMobile && !isTablet
        };
    }

    setupViewportHeight() {
        // Fix for mobile viewport height issues
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });
    }

    setupTouchOptimizations() {
        if (!window.deviceInfo.isTouch) return;

        // Prevent zoom on double tap for form inputs
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Add touch feedback for buttons
        this.addTouchFeedback();

        // Improve scroll performance
        this.optimizeScrolling();
    }

    addTouchFeedback() {
        const touchElements = document.querySelectorAll('.btn, .nav-item, .glass-card, .trip-item');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });

            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            }, { passive: true });

            element.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
        });
    }

    optimizeScrolling() {
        // Enable momentum scrolling on iOS
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupOrientationChange() {
        let orientationTimeout;
        
        const handleOrientationChange = () => {
            clearTimeout(orientationTimeout);
            
            // Add orientation class
            document.documentElement.classList.toggle('portrait', window.innerHeight > window.innerWidth);
            document.documentElement.classList.toggle('landscape', window.innerWidth > window.innerHeight);
            
            // Delayed actions after orientation stabilizes
            orientationTimeout = setTimeout(() => {
                this.setupViewportHeight();
                this.recalculateLayouts();
            }, 200);
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);
        
        // Initial call
        handleOrientationChange();
    }

    recalculateLayouts() {
        // Trigger recalculation of any dynamic layouts
        const event = new CustomEvent('layout-recalculate');
        document.dispatchEvent(event);
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.setupMobileMenu();
        
        // Responsive image loading
        this.setupResponsiveImages();
        
        // Keyboard handling for mobile
        this.setupMobileKeyboard();
    }

    setupMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('mobile-active');
                mobileMenuToggle.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
                    navMenu.classList.remove('mobile-active');
                    mobileMenuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        }
    }

    setupResponsiveImages() {
        // Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupMobileKeyboard() {
        if (!window.deviceInfo.isMobile) return;

        let initialViewportHeight = window.innerHeight;
        
        // Handle virtual keyboard appearance
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            if (heightDifference > 150) { // Keyboard is likely visible
                document.documentElement.classList.add('keyboard-visible');
            } else {
                document.documentElement.classList.remove('keyboard-visible');
            }
        });

        // Prevent scroll when typing
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    input.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 300);
            });
        });
    }
}

// Responsive Utilities
class ResponsiveUtils {
    static getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < 480) return 'xs';
        if (width < 768) return 'sm';
        if (width < 992) return 'md';
        if (width < 1200) return 'lg';
        return 'xl';
    }

    static isMobile() {
        return window.deviceInfo?.isMobile || false;
    }

    static isTablet() {
        return window.deviceInfo?.isTablet || false;
    }

    static isDesktop() {
        return window.deviceInfo?.isDesktop || false;
    }

    static isTouch() {
        return window.deviceInfo?.isTouch || false;
    }

    static addResponsiveClass(element, classes) {
        const breakpoint = this.getCurrentBreakpoint();
        const className = classes[breakpoint] || classes.default;
        if (className) {
            element.className = element.className.replace(/\b\w+-responsive-\w+/g, '');
            element.classList.add(className);
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Performance Optimizations
class PerformanceOptimizer {
    static optimizeAnimations() {
        // Reduce animations on low-performance devices
        const isLowPerformance = navigator.hardwareConcurrency < 4 || 
                                 navigator.deviceMemory < 4;
        
        if (isLowPerformance) {
            document.documentElement.classList.add('reduced-animations');
        }
    }

    static preloadCriticalResources() {
        // Preload critical CSS and fonts
        const criticalResources = [
            { href: 'assets/css/main.css', as: 'style' },
            { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap', as: 'style' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }

    static setupIntersectionObserver() {
        // Optimize animations and effects based on visibility
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                    } else {
                        entry.target.classList.remove('in-view');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.glass-card, .trip-item, .stats-card').forEach(el => {
                observer.observe(el);
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ResponsiveManager();
    PerformanceOptimizer.optimizeAnimations();
    PerformanceOptimizer.preloadCriticalResources();
    PerformanceOptimizer.setupIntersectionObserver();
});

// Export utilities for global use
window.ResponsiveUtils = ResponsiveUtils;
window.PerformanceOptimizer = PerformanceOptimizer;