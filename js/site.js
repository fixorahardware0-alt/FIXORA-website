let currentLanguage = localStorage.getItem('fixora-language') || 'en';

document.addEventListener('DOMContentLoaded', function () {
    const sel = document.getElementById('language');
    if (sel) sel.value = currentLanguage;
    applyLanguage(currentLanguage);

    // Mobile menu
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
        navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('active')));
    }

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
