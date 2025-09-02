// Select the hamburger menu button and the nav
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

// Ensure the menu is hidden initially
nav.classList.remove('open');

// Toggle mobile menu on click
toggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

// Close the mobile menu automatically if window is resized to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    nav.classList.remove('open');
  }
});
