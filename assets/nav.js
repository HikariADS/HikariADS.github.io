/**
 * Floating bubble navigation — shared across all pages
 */
(function () {
    const PAGES = [
        { id: 'home', href: '/index.html', label: 'Home', sub: 'ホーム', icon: '🏠' },
        { id: 'about', href: '/about.html', label: 'About Me', sub: '私について', icon: '✨' },
        { id: 'music', href: '/music.html', label: 'Music', sub: '音楽', icon: '🎵' },
        { id: 'photos', href: '/photos.html', label: 'Photos', sub: '写真', icon: '📷' }
    ];

    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.endsWith('/about.html')) return 'about';
        if (path.endsWith('/music.html')) return 'music';
        if (path.endsWith('/photos.html')) return 'photos';
        return 'home';
    }

    function renderBubbleNav() {
        const nav = document.getElementById('bubbleNav');
        if (!nav) return;

        const active = getCurrentPage();

        nav.innerHTML = PAGES.map(page => `
            <a href="${page.href}"
               class="bubble-link${page.id === active ? ' active' : ''}"
               title="${page.label}">
                <span class="bubble-icon">${page.icon}</span>
                <span class="bubble-label">${page.label}</span>
                <span class="bubble-sub">${page.sub}</span>
            </a>
        `).join('');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderBubbleNav);
    } else {
        renderBubbleNav();
    }
})();
