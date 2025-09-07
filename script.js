// Mobile menu toggle
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

// Ensure menu starts closed
nav.classList.remove('open');

// Toggle mobile nav
toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
});

// Close mobile nav if resized to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        nav.classList.remove('open');
    }
});

// Smooth scroll for nav links
document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            nav.classList.remove('open'); // close on mobile after click
        }
    });
});

// Experience section Read More toggle
document.querySelectorAll('.read-more-btn').forEach(button => {
    button.addEventListener('click', () => {
        const experienceCard = button.closest('.experience-card');
        const fullTextContent = experienceCard.querySelector('.full-text-content');
        const shortText = experienceCard.querySelector('.experience-short-text');

        if (fullTextContent.style.display === 'none' || fullTextContent.style.display === '') {
            fullTextContent.style.display = 'block';
            shortText.style.display = 'none';
            button.textContent = 'Read Less';
        } else {
            fullTextContent.style.display = 'none';
            shortText.style.display = 'block';
            button.textContent = 'Read More';
        }
    });
});
