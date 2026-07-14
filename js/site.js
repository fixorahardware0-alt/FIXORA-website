let currentLanguage = localStorage.getItem('fixora-language') || 'en';

document.addEventListener('DOMContentLoaded', function () {
    const sel = document.getElementById('language');
    if (sel) sel.value = currentLanguage;
    applyLanguage(currentLanguage);

    // Mobile menu
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');
    const isMobileNav = () => window.matchMedia('(max-width: 900px)').matches;
    const megaItem = navMenu ? navMenu.querySelector('.nav-item.has-mega') : null;
    const megaTrigger = megaItem ? megaItem.querySelector(':scope > a') : null;

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
        navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            // Products link acts as an accordion toggle on mobile — don't close the menu
            if (a === megaTrigger && isMobileNav()) return;
            navMenu.classList.remove('active');
        }));
    }

    // Products mega-menu: collapse/expand on mobile instead of navigating away
    if (megaItem && megaTrigger) {
        megaTrigger.addEventListener('click', (e) => {
            if (isMobileNav()) {
                e.preventDefault();
                megaItem.classList.toggle('open');
            }
        });
    }

    // Swipeable card carousels on mobile — add dot indicators
    document.querySelectorAll('.reasons-grid, .value-grid, .support-grid, .projects-grid.projects-4').forEach(grid => {
        const cards = Array.from(grid.children);
        if (cards.length < 3) return;
        grid.classList.add('is-carousel');
        const dots = document.createElement('div');
        dots.className = 'carousel-dots';
        cards.forEach((card, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', 'Go to card ' + (i + 1));
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => grid.scrollTo({ left: card.offsetLeft, behavior: 'smooth' }));
            dots.appendChild(dot);
        });
        grid.after(dots);
        let ticking = false;
        grid.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                const center = grid.scrollLeft + grid.clientWidth / 2;
                let active = 0, best = Infinity;
                cards.forEach((card, i) => {
                    const d = Math.abs(card.offsetLeft + card.clientWidth / 2 - center);
                    if (d < best) { best = d; active = i; }
                });
                dots.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === active));
            });
        }, { passive: true });
    });

    // Highlight current page in nav
    const here = (location.pathname.split('/').pop() || 'index.html');
    document.querySelectorAll('.nav-menu a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === here || (here === '' && href === 'index.html')) a.classList.add('active');
    });

    // Smooth scroll for same-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });
});

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('fixora-language', lang);
    applyLanguage(lang);
}

function applyLanguage(lang) {
    document.querySelectorAll('[data-en]').forEach(el => {
        const t = el.getAttribute('data-' + lang);
        if (t) el.textContent = t;
    });
    const titleEl = document.querySelector('title');
    if (titleEl && titleEl.getAttribute('data-' + lang)) {
        document.title = titleEl.getAttribute('data-' + lang);
    }
    const sel = document.getElementById('language');
    if (sel) sel.value = lang;
}
