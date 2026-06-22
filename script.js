// Language translations
const translations = {
    en: {
        'Engineered for Reliability': 'Engineered for Reliability',
        'PREMIUM HARDWARE SOLUTIONS': 'PREMIUM HARDWARE SOLUTIONS',
        'Strategic distribution network and premium quality hardware solutions for builders, contractors, and distributors across North America': 'Strategic distribution network and premium quality hardware solutions for builders, contractors, and distributors across North America',
        'Contact Sales': 'Contact Sales',
        'Explore Solutions': 'Explore Solutions',
        'Solutions by Market': 'Solutions by Market',
        'Tailored hardware solutions for your specific application': 'Tailored hardware solutions for your specific application',
        'Residential Construction': 'Residential Construction',
        'Premium hardware for new builds and high-end residential projects': 'Premium hardware for new builds and high-end residential projects',
        'Renovation & Remodeling': 'Renovation & Remodeling',
        'Quality upgrades for renovation and renovation projects': 'Quality upgrades for renovation and renovation projects',
        'Commercial & Hospitality': 'Commercial & Hospitality',
        'Specification-grade hardware for commercial environments': 'Specification-grade hardware for commercial environments',
        'Institutional': 'Institutional',
        'Durable hardware for educational and government facilities': 'Durable hardware for educational and government facilities',
        'Multifamily Housing': 'Multifamily Housing',
        'Reliable solutions for apartments and multi-unit housing': 'Reliable solutions for apartments and multi-unit housing',
        'Specialized Applications': 'Specialized Applications',
        'Custom solutions for unique project requirements': 'Custom solutions for unique project requirements',
    },
    es: {
        'Engineered for Reliability': 'Diseñado para Confiabilidad',
        'PREMIUM HARDWARE SOLUTIONS': 'SOLUCIONES DE HARDWARE PREMIUM',
        'Strategic distribution network and premium quality hardware solutions for builders, contractors, and distributors across North America': 'Red de distribución estratégica y soluciones de hardware de calidad premium para constructores, contratistas y distribuidores en toda América del Norte',
        'Contact Sales': 'Contactar Ventas',
        'Explore Solutions': 'Explorar Soluciones',
        'Solutions by Market': 'Soluciones por Mercado',
        'Tailored hardware solutions for your specific application': 'Soluciones de hardware personalizadas para su aplicación específica',
        'Residential Construction': 'Construcción Residencial',
        'Premium hardware for new builds and high-end residential projects': 'Hardware premium para construcciones nuevas y proyectos residenciales de alta gama',
        'Renovation & Remodeling': 'Renovación y Remodelación',
        'Quality upgrades for renovation and renovation projects': 'Mejoras de calidad para proyectos de renovación',
        'Commercial & Hospitality': 'Comercial y Hospitalidad',
        'Specification-grade hardware for commercial environments': 'Hardware de grado de especificación para entornos comerciales',
        'Institutional': 'Institucional',
        'Durable hardware for educational and government facilities': 'Hardware duradero para instalaciones educativas y gubernamentales',
        'Multifamily Housing': 'Vivienda Multifamiliar',
        'Reliable solutions for apartments and multi-unit housing': 'Soluciones confiables para apartamentos y viviendas multifamiliares',
        'Specialized Applications': 'Aplicaciones Especializadas',
        'Custom solutions for unique project requirements': 'Soluciones personalizadas para requisitos de proyectos únicos',
    },
    fr: {
        'Engineered for Reliability': 'Conçu pour la Fiabilité',
        'PREMIUM HARDWARE SOLUTIONS': 'SOLUTIONS MATÉRIEL PREMIUM',
        'Strategic distribution network and premium quality hardware solutions for builders, contractors, and distributors across North America': 'Réseau de distribution stratégique et solutions matériel de qualité premium pour les constructeurs, entrepreneurs et distributeurs en Amérique du Nord',
        'Contact Sales': 'Contacter les Ventes',
        'Explore Solutions': 'Explorer les Solutions',
        'Solutions by Market': 'Solutions par Marché',
        'Tailored hardware solutions for your specific application': 'Solutions matériel adaptées à votre application spécifique',
        'Residential Construction': 'Construction Résidentielle',
        'Premium hardware for new builds and high-end residential projects': 'Matériel premium pour les nouvelles constructions et les projets résidentiels haut de gamme',
        'Renovation & Remodeling': 'Rénovation et Remodelage',
        'Quality upgrades for renovation and renovation projects': 'Mises à niveau de qualité pour les projets de rénovation',
        'Commercial & Hospitality': 'Commercial et Hôtellerie',
        'Specification-grade hardware for commercial environments': 'Matériel de qualité de spécification pour les environnements commerciaux',
        'Institutional': 'Institutionnel',
        'Durable hardware for educational and government facilities': 'Matériel durable pour les installations éducatives et gouvernementales',
        'Multifamily Housing': 'Logement Multifamilial',
        'Reliable solutions for apartments and multi-unit housing': 'Solutions fiables pour les appartements et les logements multi-unités',
        'Specialized Applications': 'Applications Spécialisées',
        'Custom solutions for unique project requirements': 'Solutions personnalisées pour les exigences de projets uniques',
    }
};

// Get current language from localStorage or default to English
let currentLanguage = localStorage.getItem('fixora-language') || 'en';

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language selector
    document.getElementById('language').value = currentLanguage;

    // Apply current language
    applyLanguage(currentLanguage);

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('#navMenu a').forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Handle form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message. Our team will contact you soon.');
            contactForm.reset();
        });
    }

    // Close mobile menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (menuToggle) menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// Change language function
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('fixora-language', lang);
    applyLanguage(lang);
}

// Apply language to all elements with data attributes
function applyLanguage(lang) {
    // Get all elements with data attributes for different languages
    const elements = document.querySelectorAll('[data-en]');

    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });

    // Update page title
    if (lang === 'es') {
        document.title = 'FIXORA - Diseñado para Confiabilidad';
    } else if (lang === 'fr') {
        document.title = 'FIXORA - Conçu pour la Fiabilité';
    } else {
        document.title = 'FIXORA - Engineered for Reliability';
    }

    // Update language selector
    document.getElementById('language').value = lang;
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards and animate them
document.querySelectorAll('.solution-card, .product-card, .project-card, .support-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});
