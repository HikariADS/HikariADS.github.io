/**
 * Main JavaScript file for HikariADS's personal website
 * Handles time display and Discord presence initialization
 */

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
        this.setupBackgroundControls();
        
        console.log('✅ Website initialized successfully!');
    }
    
    setupBackgroundControls() {
        // Add background effect switcher for all environments
        this.addBackgroundControls();
    }
    
    addBackgroundControls() {
        // Create hamburger menu container
        const menuContainer = document.createElement('div');
        menuContainer.id = 'bg-menu-container';
        menuContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Create hamburger button
        const hamburgerBtn = document.createElement('div');
        hamburgerBtn.id = 'bg-hamburger';
        hamburgerBtn.style.cssText = `
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 4px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
        `;
        
        // Create hamburger lines
        for (let i = 0; i < 3; i++) {
            const line = document.createElement('div');
            line.className = 'hamburger-line';
            line.style.cssText = `
                width: 20px;
                height: 2px;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 2px;
                transition: all 0.3s ease;
            `;
            hamburgerBtn.appendChild(line);
        }
        
        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.id = 'bg-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 50px;
            left: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 12px;
            padding: 15px;
            min-width: 180px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        `;
        
        // Create menu title
        const title = document.createElement('div');
        title.textContent = 'Background Effects';
        title.style.cssText = `
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
            text-align: center;
        `;
        dropdown.appendChild(title);
        
        // Create menu items
        const effects = [
            { name: 'Particles', key: 'particles', icon: '✨' },
            { name: 'Waves', key: 'waves', icon: '🌊' },
            { name: 'Matrix', key: 'matrix', icon: '💻' },
            { name: 'Bubbles', key: 'bubbles', icon: '🫧' },
            { name: 'None', key: 'none', icon: '🚫' }
        ];
        
        effects.forEach(effect => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #374151;
                transition: all 0.2s ease;
                margin-bottom: 2px;
            `;
            
            item.innerHTML = `<span>${effect.icon}</span><span>${effect.name}</span>`;
            
            // Hover effects
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(88, 101, 242, 0.1)';
                item.style.color = '#5865f2';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
                item.style.color = '#374151';
            });
            
            // Click handler
            item.addEventListener('click', () => {
                if (effect.key === 'none') {
                    animatedBg.clearBackground();
                } else {
                    animatedBg.switchEffect(effect.key);
                }
                
                // Update active state
                dropdown.querySelectorAll('.menu-item').forEach(i => {
                    i.style.background = 'transparent';
                    i.style.color = '#374151';
                });
                item.style.background = 'rgba(88, 101, 242, 0.2)';
                item.style.color = '#5865f2';
                
                // Close menu
                this.toggleDropdown(false);
            });
            
            item.classList.add('menu-item');
            dropdown.appendChild(item);
        });
        
        // Add hover effect to hamburger
        hamburgerBtn.addEventListener('mouseenter', () => {
            hamburgerBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            hamburgerBtn.style.transform = 'scale(1.05)';
        });
        
        hamburgerBtn.addEventListener('mouseleave', () => {
            hamburgerBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            hamburgerBtn.style.transform = 'scale(1)';
        });
        
        // Toggle dropdown on click
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuContainer.contains(e.target)) {
                this.toggleDropdown(false);
            }
        });
        
        // Assemble menu
        menuContainer.appendChild(hamburgerBtn);
        menuContainer.appendChild(dropdown);
        document.body.appendChild(menuContainer);
        
        // Store references
        this.bgMenuContainer = menuContainer;
        this.bgDropdown = dropdown;
        this.bgHamburger = hamburgerBtn;
    }
    
    toggleDropdown(show = null) {
        const dropdown = this.bgDropdown;
        const isVisible = dropdown.style.visibility === 'visible';
        const shouldShow = show !== null ? show : !isVisible;
        
        if (shouldShow) {
            dropdown.style.opacity = '1';
            dropdown.style.visibility = 'visible';
            dropdown.style.transform = 'translateY(0)';
        } else {
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-10px)';
        }
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