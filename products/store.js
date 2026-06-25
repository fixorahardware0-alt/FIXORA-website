let currentLanguage = localStorage.getItem('fixora-language') || 'en';

document.addEventListener('DOMContentLoaded', function () {
    const sel = document.getElementById('language');
    if (sel) sel.value = currentLanguage;
    applyLanguage(currentLanguage);

    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    document.querySelectorAll('#navMenu a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('active')));

    // Gallery thumbnails
    document.querySelectorAll('.thumbs img').forEach(t => {
        t.addEventListener('click', function () {
            document.getElementById('mainImg').src = this.dataset.full || this.src;
            document.querySelectorAll('.thumbs img').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
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
    const sel = document.getElementById('language');
    if (sel) sel.value = lang;
}
