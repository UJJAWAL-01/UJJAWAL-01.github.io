// Toggle nav on mobile
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

toggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

// Close nav on resize back to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    nav.classList.remove('open');
  }
});
