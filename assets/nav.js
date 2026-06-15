/**
 * Hamburger site menu — navigation only (no background settings)
 */
(function () {
    const PAGES = [
        { id: 'home', href: '/index.html', label: 'Home', icon: '🏠' },
        { id: 'about', href: '/about.html', label: 'About Me', icon: '✨' },
        { id: 'music', href: '/music.html', label: 'Music', icon: '🎵' },
        { id: 'photos', href: '/photos.html', label: 'Photos', icon: '📷' }
    ];

    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.endsWith('/about.html')) return 'about';
        if (path.endsWith('/music.html')) return 'music';
        if (path.endsWith('/photos.html')) return 'photos';
        return 'home';
    }

    function renderSiteMenu() {
        const mount = document.getElementById('siteMenu');
        if (!mount) return;

        const active = getCurrentPage();

        mount.innerHTML = `
            <button class="menu-hamburger" id="menuHamburger" aria-label="Open menu" aria-expanded="false">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
            <div class="menu-dropdown" id="menuDropdown" aria-hidden="true">
                <div class="menu-title">Menu</div>
                ${PAGES.map(page => `
                    <a href="${page.href}"
                       class="menu-item${page.id === active ? ' active' : ''}">
                        <span class="menu-item-icon">${page.icon}</span>
                        <span>${page.label}</span>
                    </a>
                `).join('')}
            </div>
        `;

        const hamburger = document.getElementById('menuHamburger');
        const dropdown = document.getElementById('menuDropdown');

        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        document.addEventListener('click', (e) => {
            if (!mount.contains(e.target)) {
                setMenuOpen(false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        });

        function toggleMenu() {
            const isOpen = dropdown.classList.contains('open');
            setMenuOpen(!isOpen);
        }

        function setMenuOpen(open) {
            dropdown.classList.toggle('open', open);
            hamburger.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', open);
            dropdown.setAttribute('aria-hidden', !open);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderSiteMenu);
    } else {
        renderSiteMenu();
    }
})();
