/**
 * Main JavaScript file for HikariADS's personal website
 * Handles time display and Discord presence initialization
 */
/**hoangthienquang */
class TimeDisplay {
    constructor() {
        this.timeElement = document.getElementById('currentTime');
        this.init();
    }
    
    init() {
        this.updateTime();
        // Update every second
        setInterval(() => this.updateTime(), 1000);
    }
    
    updateTime() {
        if (!this.timeElement) return;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        this.timeElement.textContent = timeString;
    }
}

class WebsiteController {
    constructor() {
        this.discordPresence = null;
        this.timeDisplay = null;
        this.dynamicText = null;
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupComponents());
        } else {
            this.setupComponents();
        }
    }
    
    setupComponents() {
        // Initialize time display
        this.timeDisplay = new TimeDisplay();
        
        // Initialize dynamic text animation
        this.dynamicText = new DynamicText();
        
        // Initialize Discord presence
        if (window.DiscordPresence) {
            this.discordPresence = new DiscordPresence('949681622825975868');
            window.discordPresence = this.discordPresence;
            console.log('🚀 Discord Presence initialized!');
        } else {
            console.error('❌ DiscordPresence class not found');
        }
        
        // Setup other interactions
        this.setupSmoothScrolling();
        this.setupImageErrorHandling();
        
        console.log('✅ Website initialized successfully!');
    }
    
    setupSmoothScrolling() {
        // Add smooth scrolling for any internal links
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
    
    setupImageErrorHandling() {
        // Handle Discord avatar loading errors
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            avatar.addEventListener('error', function() {
                console.log('Avatar failed to load, using fallback');
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNTg2NUYyIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RGlzY29yZDwvdGV4dD4KPC9zdmc+';
            });
            
            avatar.addEventListener('load', function() {
                console.log('Avatar loaded successfully');
            });
        }
    }
    
    // Public methods for external access
    getDiscordPresence() {
        return this.discordPresence;
    }
    
    reconnectDiscord() {
        if (this.discordPresence) {
            this.discordPresence.reconnect();
        }
    }
}

// Initialize website when script loads
const website = new WebsiteController();

// Make it globally accessible
window.website = website;

// Additional utility functions
window.utils = {
    formatTime: (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    },
    
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Copied to clipboard:', text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    }
};

/**
 * Dynamic Text Animation Class - Typewriter Effect
 * Handles the automatic text switching between "HikariADS's website" and "my profile"
 * with typewriter effect (typing and erasing character by character)
 */
class DynamicText {
    constructor() {
        this.textElement = document.getElementById('dynamicText');
        this.texts = ["HikariADS Website", "私の世界"];
        this.currentIndex = 0;
        this.isAnimating = false;
        this.currentText = '';
        this.init();
    }
    
    init() {
        if (!this.textElement) return;
        
        // Start with empty text
        this.textElement.textContent = '';
        
        // Start the animation after a short delay
        setTimeout(() => {
            this.startAnimation();
        }, 2000); // Wait 2 seconds before starting
    }
    
    startAnimation() {
        // Start typing the first text
        this.typeText();
    }
    
    typeText() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.textElement.classList.add('typing');
        
        const targetText = this.texts[this.currentIndex];
        let charIndex = 0;
        
        const typeInterval = setInterval(() => {
            if (charIndex < targetText.length) {
                this.currentText += targetText[charIndex];
                this.textElement.textContent = this.currentText;
                charIndex++;
            } else {
                clearInterval(typeInterval);
                
                // Wait a bit before starting to erase
                setTimeout(() => {
                    this.eraseText();
                }, 2000); // Wait 2 seconds before erasing
            }
        }, 100); // Type each character every 100ms
    }
    
    eraseText() {
        const eraseInterval = setInterval(() => {
            if (this.currentText.length > 0) {
                this.currentText = this.currentText.slice(0, -1);
                this.textElement.textContent = this.currentText;
            } else {
                clearInterval(eraseInterval);
                this.textElement.classList.remove('typing');
                
                // Move to next text
                this.currentIndex = (this.currentIndex + 1) % this.texts.length;
                this.isAnimating = false;
                
                // Wait a bit before typing next text
                setTimeout(() => {
                    this.typeText();
                }, 500); // Wait 500ms before typing next text
            }
        }, 50); // Erase each character every 50ms (faster than typing)
    }
}

// Add some fun console messages
console.log('%c👋 Hello there!', 'color: #5865f2; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to HikariADS\'s website!', 'color: #ec4899; font-size: 14px;');
console.log('%cBuilt with ❤️ and lots of ☕', 'color: #10b981; font-size: 12px;');