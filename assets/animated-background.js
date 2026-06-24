/**
 * Animated Background Effects
 * Multiple options for beautiful animated backgrounds
 */

class AnimatedBackground {
    constructor(containerId = 'animated-bg') {
        this.container = document.getElementById(containerId) || document.body;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.currentEffect = 'bubbles';
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
        if (document.body.classList.contains('music-theme')) {
            this.currentEffect = 'equalizer';
        }
        this.startAnimation();
    }
    
    createCanvas() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'bg-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        
        // Add to container
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Reinitialize particles after resize
        if (this.currentEffect === 'particles') {
            this.initParticles();
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    // Floating Particles Effect
    initParticles() {
        this.particles = [];
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor()
            });
        }
        
        // Reset text color for particles
        this.changeTextColor('default');
    }
    
    getRandomColor() {
        const colors = [
            'rgba(88, 101, 242, 0.3)',  // Discord blue
            'rgba(236, 72, 153, 0.3)',  // Pink
            'rgba(16, 185, 129, 0.3)',  // Green
            'rgba(239, 68, 68, 0.3)',   // Red
            'rgba(147, 197, 253, 0.3)'  // Light blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let particle of this.particles) {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            // Draw connections to nearby particles
            this.drawConnections(particle);
        }
    }
    
    drawConnections(particle) {
        for (let other of this.particles) {
            if (particle === other) continue;
            
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(other.x, other.y);
                this.ctx.strokeStyle = `rgba(88, 101, 242, ${0.1 * (1 - distance / 100)})`;
                this.ctx.lineWidth = 0.5;
                this.ctx.stroke();
            }
        }
    }
    
    // Geometric Waves Effect
    drawGeometricWaves() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const time = Date.now() * 0.001;
        const waves = 3;
        
        for (let i = 0; i < waves; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.canvas.height / 2);
            
            for (let x = 0; x <= this.canvas.width; x += 10) {
                const y = this.canvas.height / 2 + 
                         Math.sin((x * 0.01) + (time * 2) + (i * Math.PI / 3)) * 50 +
                         Math.sin((x * 0.02) + (time * 1.5) + (i * Math.PI / 2)) * 30;
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.closePath();
            
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, `rgba(88, 101, 242, ${0.1 - i * 0.03})`);
            gradient.addColorStop(1, `rgba(236, 72, 153, ${0.05 - i * 0.01})`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
    }
    
    // Matrix Rain Effect
    initMatrix() {
        this.matrixColumns = Math.floor(this.canvas.width / 20);
        this.matrixDrops = [];
        
        for (let i = 0; i < this.matrixColumns; i++) {
            this.matrixDrops[i] = Math.random() * this.canvas.height;
        }
        
        // Change text color to white when matrix is active
        this.changeTextColor('white');
    }
    
    drawMatrix() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        this.ctx.font = '15px monospace';
        
        for (let i = 0; i < this.matrixDrops.length; i++) {
            const text = String.fromCharCode(Math.random() * 128);
            this.ctx.fillText(text, i * 20, this.matrixDrops[i]);
            
            if (this.matrixDrops[i] > this.canvas.height && Math.random() > 0.975) {
                this.matrixDrops[i] = 0;
            }
            this.matrixDrops[i] += 20;
        }
    }
    
    // Helper method to change text colors
    changeTextColor(color) {
        // Add/remove matrix theme class
        if (color === 'white') {
            document.body.classList.add('matrix-theme');
        } else {
            document.body.classList.remove('matrix-theme');
        }
        
        const elements = [
            '.header h1',
            '.introduction p',
            '.connect-section h2',
            '.skills-section h2',
            '.skill-card h3',
            '.skill-card p',
            '.local-time'
        ];
        
        elements.forEach(selector => {
            const els = document.querySelectorAll(selector);
            els.forEach(el => {
                if (color === 'white') {
                    el.style.color = 'white';
                    el.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
                } else {
                    el.style.color = '';
                    el.style.textShadow = '';
                }
            });
        });
        
        // Special handling for highlight text
        const highlights = document.querySelectorAll('.highlight');
        highlights.forEach(el => {
            if (color === 'white') {
                el.style.color = '#00ff00'; // Matrix green for highlight
            } else {
                el.style.color = '';
            }
        });
        
        // Handle time display
        const timeDisplay = document.getElementById('currentTime');
        if (timeDisplay) {
            if (color === 'white') {
                timeDisplay.style.color = '#00ff00'; // Matrix green for time
            } else {
                timeDisplay.style.color = '';
            }
        }
        
        // Handle container border for matrix effect
        const container = document.querySelector('.container');
        if (container) {
            if (color === 'white') {
                container.style.borderColor = '#00ff00'; // Matrix green border
                container.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.5)'; // Green glow
            } else {
                container.style.borderColor = '';
                container.style.boxShadow = '';
            }
        }
        
        // Handle hamburger menu lines for matrix effect
        const hamburgerLines = document.querySelectorAll('.hamburger-line');
        hamburgerLines.forEach(line => {
            if (color === 'white') {
                // Matrix mode: Keep original white color
                line.style.background = 'rgba(255, 255, 255, 0.8)';
            } else {
                // Other modes: Black color
                line.style.background = 'rgba(0, 0, 0, 0.8)';
            }
        });
        
        // Handle skill cards for matrix effect
        const skillCards = document.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            const title = card.querySelector('h3');
            const content = card.querySelector('p');
            
            if (color === 'white') {
                // Matrix mode: Pink theme with white text and pink border
                card.style.background = 'rgba(236, 72, 153, 0.15)';
                card.style.borderColor = 'rgba(236, 72, 153, 0.3)';
                card.style.borderWidth = '1px';
                if (title) title.style.color = '#ffffff';
                if (content) content.style.color = '#e5e7eb';
            } else {
                // Other modes: Light transparent theme with dark text and dark border
                card.style.background = 'rgba(255, 255, 255, 0.15)';
                card.style.borderColor = 'rgba(0, 0, 0, 0.3)';
                card.style.borderWidth = '2px';
                if (title) title.style.color = '#1f2937';
                if (content) content.style.color = '#374151';
            }
        });
    }
    
    // Bubble Effect
    initBubbles() {
        this.bubbles = [];
        const bubbleCount = 15;
        
        for (let i = 0; i < bubbleCount; i++) {
            this.bubbles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 100,
                size: Math.random() * 60 + 20,
                speed: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
        
        // Reset text color for bubbles
        this.changeTextColor('default');
    }
    
    drawBubbles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let bubble of this.bubbles) {
            bubble.y -= bubble.speed;
            
            // Reset bubble when it goes off screen
            if (bubble.y + bubble.size < 0) {
                bubble.y = this.canvas.height + bubble.size;
                bubble.x = Math.random() * this.canvas.width;
            }
            
            // Draw bubble
            const gradient = this.ctx.createRadialGradient(
                bubble.x, bubble.y, 0,
                bubble.x, bubble.y, bubble.size
            );
            gradient.addColorStop(0, `rgba(88, 101, 242, ${bubble.opacity})`);
            gradient.addColorStop(0.7, `rgba(147, 197, 253, ${bubble.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
    }
    
    // Music page — equalizer bars + floating notes
    initEqualizer() {
        this.eqBars = [];
        const barCount = Math.max(20, Math.floor(this.canvas.width / 14));
        for (let i = 0; i < barCount; i++) {
            this.eqBars.push({
                x: i * 14 + 3,
                height: Math.random() * 60 + 20,
                targetHeight: Math.random() * 60 + 20,
                speed: Math.random() * 0.06 + 0.04
            });
        }

        this.musicNotes = [];
        const noteChars = ['♪', '♫', '♬'];
        for (let i = 0; i < 14; i++) {
            this.musicNotes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                char: noteChars[Math.floor(Math.random() * noteChars.length)],
                size: Math.random() * 12 + 10,
                speedY: Math.random() * 0.35 + 0.08,
                opacity: Math.random() * 0.25 + 0.08,
                wobble: Math.random() * Math.PI * 2
            });
        }

        this.changeTextColor('default');
    }

    drawEqualizer() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(15, 10, 26, 0.12)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const note of this.musicNotes) {
            note.y -= note.speedY;
            note.wobble += 0.025;
            if (note.y < -24) {
                note.y = this.canvas.height + 24;
                note.x = Math.random() * this.canvas.width;
            }

            const hue = note.char === '♫' ? '255, 85, 0' : '168, 85, 247';
            this.ctx.font = `${note.size}px Georgia, serif`;
            this.ctx.fillStyle = `rgba(${hue}, ${note.opacity})`;
            this.ctx.fillText(note.char, note.x + Math.sin(note.wobble) * 10, note.y);
        }

        const baseY = this.canvas.height;
        const maxBarHeight = this.canvas.height * 0.22;

        for (const bar of this.eqBars) {
            if (Math.random() > 0.92) {
                bar.targetHeight = Math.random() * maxBarHeight + 12;
            }
            bar.targetHeight = Math.max(12, Math.min(maxBarHeight, bar.targetHeight));
            bar.height += (bar.targetHeight - bar.height) * bar.speed;

            const gradient = this.ctx.createLinearGradient(0, baseY - bar.height, 0, baseY);
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.55)');
            gradient.addColorStop(0.45, 'rgba(255, 85, 0, 0.45)');
            gradient.addColorStop(1, 'rgba(29, 185, 84, 0.25)');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(bar.x, baseY - bar.height, 9, bar.height);
        }
    }
    
    // Animation loop
    animate() {
        switch (this.currentEffect) {
            case 'particles':
                this.drawParticles();
                break;
            case 'waves':
                this.drawGeometricWaves();
                break;
            case 'matrix':
                this.drawMatrix();
                break;
            case 'bubbles':
                this.drawBubbles();
                break;
            case 'equalizer':
                this.drawEqualizer();
                break;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Initialize based on current effect
        switch (this.currentEffect) {
            case 'particles':
                this.initParticles();
                break;
            case 'matrix':
                this.initMatrix();
                break;
            case 'bubbles':
                this.initBubbles();
                break;
            case 'equalizer':
                this.initEqualizer();
                break;
            case 'waves':
                this.changeTextColor('default'); // Reset to default colors
                break;
        }
        
        this.animate();
    }
    
    // Public methods
    switchEffect(effectName) {
        this.currentEffect = effectName;
        this.startAnimation();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    clearBackground() {
        // Stop animation
        this.stop();
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Reset text colors to default
        this.changeTextColor('default');
        
        // Set current effect to none
        this.currentEffect = 'none';
        
        console.log('🧹 Background cleared');
    }
    
    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

let animatedBg = null;

document.addEventListener('DOMContentLoaded', function() {
    animatedBg = new AnimatedBackground();
    if (document.body.classList.contains('music-theme')) {
        animatedBg.switchEffect('equalizer');
    } else {
        animatedBg.switchEffect('bubbles');
    }
    window.animatedBg = animatedBg;
});

// Export for global use
window.AnimatedBackground = AnimatedBackground;