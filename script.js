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

/* Research modal: open card details in centered overlay */
const modal = document.getElementById('research-modal');
const modalBody = document.getElementById('research-modal-body');
const modalClose = document.querySelector('.modal-close');

let lastFocused = null;

function getFocusable(el = document) {
    return Array.from(el.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'))
        .filter(node => node.offsetParent !== null);
}

function openResearchModalFromCard(card, triggerBtn) {
    if (!modal || !card) return;
    const full = card.querySelector('.full-content');
    if (!full) return;

    // Save last focused element to restore after close
    lastFocused = triggerBtn || document.activeElement;

    // Inject content
    modalBody.innerHTML = full.innerHTML;

    // prepare hero image src from card thumbnail (if available)
    const cardImg = card.querySelector('.thumb img');
    const heroImg = document.getElementById('research-modal-hero-img');
    if (heroImg) { heroImg.src = ''; heroImg.alt = cardImg ? (cardImg.alt || '') : ''; }

    // Prepare modal panel for morph animation
    const panel = modal.querySelector('.research-modal-panel');
    const panelRect = panel.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    // Compute translation from panel center to card center
    const panelCenterX = panelRect.left + panelRect.width / 2;
    const panelCenterY = panelRect.top + panelRect.height / 2;
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    const deltaX = cardCenterX - panelCenterX;
    const deltaY = cardCenterY - panelCenterY;

    // scale relative to widths
    const scaleX = cardRect.width / panelRect.width;
    const scaleY = cardRect.height / panelRect.height;
    const scale = Math.min(scaleX, scaleY);

    // set initial transform to match card
    panel.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
    panel.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';

    // show modal (with backdrop)
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    // ARIA announcement (polite)
    try { modalBody.setAttribute('aria-live', 'polite'); } catch (e) {}

    // allow the browser to paint the initial transform, then animate to center
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            panel.style.transform = 'translate(0,0) scale(1)';
            // If there's a thumbnail, set it directly into the modal hero (no floating morph)
            if (cardImg && heroImg) {
                heroImg.src = cardImg.src;
            }
            // reveal fibonacci bands inside the modal (staggered)
            try {
                const bands = modal.querySelectorAll('.f-band');
                if (bands && bands.length) bands.forEach((b, i) => setTimeout(() => b.classList.add('reveal'), 120 * i));
            } catch (err) { /* ignore */ }
        });
    });

    // After animation completes, focus first focusable element inside modal
    const onTransitionEnd = (e) => {
        if (e.target !== panel || e.propertyName !== 'transform') return;
        panel.removeEventListener('transitionend', onTransitionEnd);
        const focusables = getFocusable(modal);
        if (focusables.length) focusables[0].focus();
        // trap focus
        document.addEventListener('focus', trapFocus, true);
    };
    panel.addEventListener('transitionend', onTransitionEnd);

    // push history state for deep-linking
    try {
        const id = card.getAttribute('data-id');
        if (id) history.pushState({ researchOpen: id }, '', `#${id}`);
    } catch (err) { /* ignore history errors */ }
}

function closeResearchModal() {
    if (!modal) return;
    const panel = modal.querySelector('.research-modal-panel');
    if (!panel) return;

    // reverse animation: shrink back to last focused card if present
    // If we can find a card whose title matches modal title, attempt reverse morph
    const modalTitle = modalBody.querySelector('h4')?.textContent?.trim();
    let targetCard = null;
    if (modalTitle) {
        targetCard = Array.from(document.querySelectorAll('.research-card')).find(c => c.querySelector('h4') && c.querySelector('h4').textContent.trim() === modalTitle);
    }

    if (targetCard) {
        // clear modal hero image (no reverse floating morph)
        const heroImg = document.getElementById('research-modal-hero-img');
        if (heroImg) heroImg.src = '';
        const cardRect = targetCard.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const panelCenterX = panelRect.left + panelRect.width / 2;
        const panelCenterY = panelRect.top + panelRect.height / 2;
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const deltaX = cardCenterX - panelCenterX;
        const deltaY = cardCenterY - panelCenterY;
        const scaleX = cardRect.width / panelRect.width;
        const scaleY = cardRect.height / panelRect.height;
        const scale = Math.min(scaleX, scaleY);

        // animate back
        panel.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
        panel.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';

        panel.addEventListener('transitionend', function handler(e) {
            if (e.target !== panel || e.propertyName !== 'transform') return;
            panel.removeEventListener('transitionend', handler);
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            panel.style.transform = '';
            panel.style.transition = '';
            modalBody.innerHTML = '';
            document.removeEventListener('focus', trapFocus, true);
            if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
            // Pop history if we opened via pushState
            try { if (location.hash) history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
            // nothing to animate for hero image
        });
            // remove any revealed bands (safe cleanup)
            try {
                const bands = modal.querySelectorAll('.f-band.reveal');
                if (bands && bands.length) bands.forEach(b => b.classList.remove('reveal'));
            } catch (err) {}
    } else {
        // no matching card: fade out
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            modalBody.innerHTML = '';
            document.removeEventListener('focus', trapFocus, true);
            if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        }, 320);
    }
}

function trapFocus(e) {
    if (!modal || !modal.classList.contains('open')) return;
    const focusables = getFocusable(modal);
    if (!focusables.length) return;
    if (!modal.contains(e.target)) {
        e.stopPropagation();
        focusables[0].focus();
    }
}

// Motion utilities: respect user preference for reduced motion and initialize AOS
function prefersReducedMotion() {
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
        return false;
    }
}

function initAOS() {
    if (!window.AOS) return;
    const reduce = prefersReducedMotion();
    AOS.init({
        duration: reduce ? 80 : 420,
        easing: 'cubic-bezier(.2,.9,.2,1)',
        once: true,
        mirror: false,
        offset: 90
    });
    if (reduce) document.documentElement.classList.add('reduced-motion');
}

document.querySelectorAll('.research-readmore').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = btn.closest('.research-card');
        openResearchModalFromCard(card, btn);
    });
});

// allow clicking anywhere on a card to open the modal (except interactive controls)
document.addEventListener('click', (e) => {
    const readmore = e.target.closest('.research-readmore');
    if (readmore) return; // let button handler run
    const card = e.target.closest('.research-card');
    if (!card) return;
    // if click was on a link or interactive control, ignore
    if (e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('input')) return;
    // if clicked on the thumbnail image specifically, open full image mode
    const thumbImg = e.target.closest('.thumb')?.querySelector('img');
    if (thumbImg && (e.target === thumbImg || e.target.closest('.thumb'))) {
        // open modal first (if not open), then toggle image-mode to show full image
        openResearchModalFromCard(card, thumbImg);
        // after modal opens, toggle image-mode to allow full-size viewing
        // small delay ensures modal DOM has been injected
        setTimeout(() => {
            if (modal) {
                modal.classList.add('image-mode');
                // make sure hero image is set (openResearchModalFromCard sets it)
                const hero = document.getElementById('research-modal-hero-img');
                if (hero) {
                    hero.style.objectFit = 'contain';
                }
            }
        }, 220);
        return;
    }
    // otherwise open modal (treat as clicking the card)
    openResearchModalFromCard(card, e.target);
});

// clicking on modal hero image toggles image-mode (zoom in/out)
document.addEventListener('click', (e) => {
    if (!modal || !modal.classList.contains('open')) return;
    const heroImg = e.target.closest('#research-modal-hero-img');
    if (heroImg) {
        // toggle image-mode class
        if (modal.classList.contains('image-mode')) {
            modal.classList.remove('image-mode');
            heroImg.style.objectFit = 'cover';
        } else {
            modal.classList.add('image-mode');
            heroImg.style.objectFit = 'contain';
        }
    }
});

// pressing Escape closes image-mode first, then modal
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        if (modal.classList.contains('image-mode')) {
            // exit image-mode
            modal.classList.remove('image-mode');
            const heroImg = document.getElementById('research-modal-hero-img');
            if (heroImg) heroImg.style.objectFit = 'cover';
            e.stopPropagation();
            return;
        }
        // otherwise handled by existing Escape logic above
    }
});

if (modalClose) modalClose.addEventListener('click', closeResearchModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('research-modal-backdrop')) closeResearchModal();
    });
}
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeResearchModal();
    // manage tab key to cycle inside modal
    if (e.key === 'Tab' && modal && modal.classList.contains('open')) {
        const focusables = getFocusable(modal);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
        }
    }
});

// Handle popstate (back/forward) to open/close modal based on hash
window.addEventListener('popstate', (e) => {
    const hash = location.hash.replace('#', '');
    if (!hash) {
        if (modal && modal.classList.contains('open')) closeResearchModal();
        return;
    }
    const targetCard = document.querySelector(`.research-card[data-id="${hash}"]`);
    if (targetCard) openResearchModalFromCard(targetCard);
});

// On initial load, open modal if URL contains a matching hash
window.addEventListener('DOMContentLoaded', () => {
    const hash = location.hash.replace('#', '');
    if (hash) {
        const targetCard = document.querySelector(`.research-card[data-id="${hash}"]`);
        if (targetCard) openResearchModalFromCard(targetCard);
    }

    // SVG tooltip interactions (F-CPR diagram)
    const diagramWrap = document.querySelector('.f-cpr-diagram-wrap');
    if (diagramWrap) {
        const tooltip = diagramWrap.querySelector('.f-cpr-tooltip');
        const interactives = diagramWrap.querySelectorAll('.f-line, .f-band');
        interactives.forEach(el => {
            // keyboard accessibility: show tooltip on focus
            el.addEventListener('focus', (ev) => {
                const label = el.getAttribute('data-label') || '';
                if (!label) return;
                tooltip.textContent = label;
                tooltip.style.display = 'block';
                const rect = el.getBoundingClientRect();
                const bbox = diagramWrap.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width/2 - bbox.left}px`;
                tooltip.style.top = `${rect.top - bbox.top - 10}px`;
                // link for assistive tech
                tooltip.id = tooltip.id || 'f-cpr-tooltip';
                el.setAttribute('aria-describedby', tooltip.id);
            });
            el.addEventListener('blur', (ev) => { tooltip.style.display = 'none'; el.removeAttribute('aria-describedby'); });
            el.addEventListener('mouseenter', (ev) => {
                const label = el.getAttribute('data-label') || '';
                if (!label) return;
                tooltip.textContent = label;
                tooltip.style.display = 'block';
                const bbox = diagramWrap.getBoundingClientRect();
                // position tooltip near mouse
                tooltip.style.left = `${ev.clientX - bbox.left}px`;
                tooltip.style.top = `${ev.clientY - bbox.top}px`;
            });
            el.addEventListener('mousemove', (ev) => {
                const bbox = diagramWrap.getBoundingClientRect();
                tooltip.style.left = `${ev.clientX - bbox.left}px`;
                tooltip.style.top = `${ev.clientY - bbox.top}px`;
            });
            el.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
        });
    }
});
