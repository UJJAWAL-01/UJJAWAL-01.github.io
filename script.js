const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
});
window.addEventListener('resize', () => {
    if (window.innerWidth > 700) nav.classList.remove('open');
});
document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href').startsWith("#")) {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                nav.classList.remove('open');
            }
        }
    });
});
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
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        themeToggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });
    window.addEventListener('DOMContentLoaded', () => {
        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.textContent = '☀️';
        }
    });
}
