/**
 * Recipe Finder - Advanced Motion & Animation Engine
 * Delivers buttery smooth scroll-reveals, 3D card tilt, stats counter, ripples, and particle bursts.
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollProgressBar();
    initScrollObserver();
    initStatsCounter();
    init3DTilt();
    initButtonRipples();
    initFloatingParticles();
    initMagneticElements();
});

/* ==========================================================================
   1. Scroll Progress Bar
   ========================================================================== */
function initScrollProgressBar() {
    let bar = document.querySelector('.scroll-progress-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.className = 'scroll-progress-bar';
        document.body.appendChild(bar);
    }

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${Math.min(scrollPercent, 100)}%`;
    }, { passive: true });
}

/* ==========================================================================
   2. Viewport Scroll Reveal (IntersectionObserver)
   ========================================================================== */
function initScrollObserver() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('[data-motion]').forEach(el => el.classList.add('motion-in-view'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('motion-in-view');
                obs.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.12
    });

    document.querySelectorAll('[data-motion]').forEach(el => observer.observe(el));

    // Expose helper to re-observe newly added dynamic elements
    window.refreshMotionObserver = () => {
        document.querySelectorAll('[data-motion]:not(.motion-in-view)').forEach(el => observer.observe(el));
    };
}

/* ==========================================================================
   3. Animated Number Counters for Stats
   ========================================================================== */
function initStatsCounter() {
    const statElements = document.querySelectorAll('.stat-number');
    if (!statElements.length) return;

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statElements.forEach(el => counterObserver.observe(el));
}

function animateCounter(element) {
    const rawText = element.textContent.trim();
    const hasPlus = rawText.includes('+');
    const hasStar = rawText.includes('★');
    const hasPercent = rawText.includes('%');
    
    // Extract numeric float/int value
    const match = rawText.replace(/,/g, '').match(/[\d.]+/);
    if (!match) return;

    const targetValue = parseFloat(match[0]);
    const isFloat = rawText.includes('.');
    const duration = 1600; // ms
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // EaseOutExpo curve
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = targetValue * ease;

        let formatted = isFloat ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString();
        
        if (hasPlus) formatted += '+';
        if (hasStar) formatted += ' ★';
        if (hasPercent) formatted += '%';

        element.textContent = formatted;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = rawText; // restore exact original formatted string
        }
    }

    requestAnimationFrame(updateCounter);
}

/* ==========================================================================
   4. 3D Perspective Tilt on Recipe Cards & Banners
   ========================================================================== */
function init3DTilt() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return; // Disable tilt on mobile for optimal performance

    function applyTiltToElement(card) {
        if (card._hasTilt) return;
        card._hasTilt = true;
        card.classList.add('tilt-card');

        // Create glare layer if not existing
        if (!card.querySelector('.tilt-glare')) {
            const glare = document.createElement('div');
            glare.className = 'tilt-glare';
            card.appendChild(glare);
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -7; // max 7 deg
            const rotateY = ((x - centerX) / centerX) * 7;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
        });
    }

    // Apply to existing cards and cuisine collection cards
    document.querySelectorAll('.recipe-card, .tilt-target, .curated-card').forEach(applyTiltToElement);

    // Watch for dynamically rendered cards
    const gridContainers = document.querySelectorAll('.recipes-grid');
    gridContainers.forEach(grid => {
        const observer = new MutationObserver(() => {
            grid.querySelectorAll('.recipe-card').forEach(applyTiltToElement);
        });
        observer.observe(grid, { childList: true });
    });
}

/* ==========================================================================
   5. Fluid Button Ripples
   ========================================================================== */
function initButtonRipples() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn, .tag-pill, .btn-icon');
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        target.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

/* ==========================================================================
   6. Hero Floating Culinary Particles
   ========================================================================== */
function initFloatingParticles() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection || heroSection.querySelector('.floating-particle-container')) return;

    const emojis = ['🍳', '🥑', '🍅', '🌿', '🌶️', '🍋', '🍝', '🧄'];
    const container = document.createElement('div');
    container.className = 'floating-particle-container';

    for (let i = 1; i <= 6; i++) {
        const particle = document.createElement('div');
        particle.className = `floating-particle p-${i}`;
        particle.textContent = emojis[(i - 1) % emojis.length];
        container.appendChild(particle);
    }

    heroSection.insertBefore(container, heroSection.firstChild);
}

/* ==========================================================================
   7. Favorite Heart Sparkle Burst
   ========================================================================== */
window.triggerHeartSparkles = function(buttonElement) {
    if (!buttonElement) return;

    // Pop the heart icon
    const icon = buttonElement.querySelector('i');
    if (icon) {
        icon.classList.remove('heart-burst');
        void icon.offsetWidth; // trigger reflow
        icon.classList.add('heart-burst');
    }

    // Spawn 8 mini burst sparkles
    const rect = buttonElement.getBoundingClientRect();
    const count = 8;
    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        
        const angle = (i / count) * 2 * Math.PI;
        const distance = 24 + Math.random() * 16;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        sparkle.style.setProperty('--dx', `${dx}px`);
        sparkle.style.setProperty('--dy', `${dy}px`);
        sparkle.style.left = '50%';
        sparkle.style.top = '50%';

        buttonElement.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 600);
    }
};

/* ==========================================================================
   8. Subtle Magnetic Pull on Key Actions
   ========================================================================== */
function initMagneticElements() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return;

    const magneticElements = document.querySelectorAll('.brand-logo, .hero-badge, .btn-primary');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            el.style.transition = 'transform 0.1s ease-out';
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0px, 0px)';
            el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });
}
