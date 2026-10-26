/**
 * Recipe Finder - Full-Page Motion & 10 Signature Food Animations Engine
 * Supports page-wide ambient floating food, falling ingredients, moving gradients,
 * curling steam, bubbling particles, and animated shapes across the entire website.
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollProgressBar();
    initScrollObserver();
    initStatsCounter();
    init3DTilt();
    initButtonRipples();
    
    // All-Sides Ambient Motion Engine (Top, Right, Bottom, Left & 4 Corners)
    initAllSidesAmbientMotion();
    initSteamAnimation();
    initMovingGradient();
    initParallaxScroll();
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
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
    });

    document.querySelectorAll('[data-motion]').forEach(el => observer.observe(el));

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
    
    const match = rawText.replace(/,/g, '').match(/[\d.]+/);
    if (!match) return;

    const targetValue = parseFloat(match[0]);
    const isFloat = rawText.includes('.');
    const duration = 1600;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
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
            element.textContent = rawText;
        }
    }

    requestAnimationFrame(updateCounter);
}

/* ==========================================================================
   4. 3D Tilt on Recipe Cards & Banners
   ========================================================================== */
function init3DTilt() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return;

    function applyTiltToElement(card) {
        if (card._hasTilt) return;
        card._hasTilt = true;
        card.classList.add('tilt-card');

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

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
        });
    }

    document.querySelectorAll('.recipe-card, .tilt-target, .curated-card').forEach(applyTiltToElement);

    const gridContainers = document.querySelectorAll('.recipes-grid');
    gridContainers.forEach(grid => {
        const observer = new MutationObserver(() => {
            grid.querySelectorAll('.recipe-card').forEach(applyTiltToElement);
        });
        observer.observe(grid, { childList: true });
    });
}

/* ==========================================================================
   5. Button Ripple Effects
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
        setTimeout(() => ripple.remove(), 600);
    });
}

/* ==========================================================================
   ANIMATION 1: Floating Food Items (🍕🍔🍟 Slowly floating ALL OVER THE PAGE)
   ========================================================================== */
function initFloatingFoodItems() {
    if (document.getElementById('floatingFoodLayer')) return;

    const foods = [
        { icon: '🍕', class: 'f-1', name: 'Pizza' },
        { icon: '🍔', class: 'f-2', name: 'Burger' },
        { icon: '🍟', class: 'f-3', name: 'Fries' },
        { icon: '🌮', class: 'f-4', name: 'Tacos' },
        { icon: '🍰', class: 'f-5', name: 'Cake' },
        { icon: '🥑', class: 'f-6', name: 'Avocado' },
        { icon: '🍜', class: 'f-7', name: 'Ramen' },
        { icon: '🍣', class: 'f-8', name: 'Sushi' },
        { icon: '🍩', class: 'f-9', name: 'Donut' },
        { icon: '🥗', class: 'f-10', name: 'Salad' }
    ];

    const layer = document.createElement('div');
    layer.className = 'floating-food-layer';
    layer.id = 'floatingFoodLayer';

    foods.forEach((item) => {
        const el = document.createElement('div');
        el.className = `floating-food-item ${item.class}`;
        el.textContent = item.icon;
        el.title = `Floating ${item.name} - Click to bounce!`;
        
        // Interactive bounce on click/tap
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            el.style.transform = 'scale(1.8) rotate(360deg)';
            if (window.showToast) {
                window.showToast(`Yum! You caught a floating ${item.icon} ${item.name}!`, 'info', 'fa-utensils');
            }
            setTimeout(() => {
                el.style.transform = '';
            }, 600);
        });

        layer.appendChild(el);
    });

    document.body.appendChild(layer);
}

/* ==========================================================================
/* ==========================================================================
   Falling Ingredients Shower (Kept gentle on sides)
   ========================================================================== */
function initFallingIngredients() {
    // Replaced by All-Sides Ambient Flank Streams for a clean, non-intrusive experience
}

/* ==========================================================================
   ANIMATION 3: Steam Animation (Rises from hot bowl of soup or coffee)
   ========================================================================== */
function initSteamAnimation() {
    const steamEmitters = document.querySelectorAll('.steam-emitter');
    steamEmitters.forEach(emitter => {
        if (emitter.querySelector('.steam-wrap')) return;

        const steamWrap = document.createElement('div');
        steamWrap.className = 'steam-wrap';
        for (let i = 0; i < 4; i++) {
            const wisp = document.createElement('span');
            wisp.className = 'steam-wisp';
            steamWrap.appendChild(wisp);
        }
        emitter.appendChild(steamWrap);
    });
}

/* ==========================================================================
   ANIMATION 4: Moving Gradient (Full Page Red, Orange, and Yellow Mesh)
   ========================================================================== */
function initMovingGradient() {
    if (document.getElementById('movingGradientBg')) return;

    const bgLayer = document.createElement('div');
    bgLayer.className = 'moving-gradient-bg';
    bgLayer.id = 'movingGradientBg';

    const orb1 = document.createElement('div');
    orb1.className = 'gradient-orb orb-1';
    const orb2 = document.createElement('div');
    orb2.className = 'gradient-orb orb-2';
    const orb3 = document.createElement('div');
    orb3.className = 'gradient-orb orb-3';

    document.body.prepend(orb3);
    document.body.prepend(orb2);
    document.body.prepend(orb1);
    document.body.prepend(bgLayer);
}

/* ==========================================================================
   ANIMATION 5: Parallax Food Images & Floating Elements
   ========================================================================== */
function initParallaxScroll() {
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                
                // Parallax on floating food items across page
                const floatingItems = document.querySelectorAll('.floating-food-item');
                floatingItems.forEach((item, idx) => {
                    const speed = 0.06 + (idx % 4) * 0.03;
                    item.style.marginTop = `${(scrollY * speed * -0.4).toFixed(1)}px`;
                });

                // Subtle parallax on hero carousel
                const carousel = document.querySelector('.hero-food-carousel');
                if (carousel && scrollY < 700) {
                    carousel.style.transform = `translateY(${(scrollY * 0.05).toFixed(1)}px)`;
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ==========================================================================
   ANIMATION 6: Food Carousel Showcase (Burger → Pizza → Pasta → Dessert → Tacos)
   ========================================================================== */
const CAROUSEL_DISHES = [
    {
        tag: '🔥 Top Rated Burger',
        title: 'Gourmet Truffle Smash Burger',
        desc: 'Charred double Angus patties, molten aged cheddar, caramelized shallots, and fragrant truffle aioli on toasted brioche.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        link: 'recipes.html?q=Burger',
        badge: '18 min • Easy'
    },
    {
        tag: '🍕 Artisan Oven Classic',
        title: 'Authentic Neapolitan Margherita Pizza',
        desc: 'Blistered San Marzano tomato sauce, fresh buffalo mozzarella, fragrant sweet basil, and extra virgin cold-pressed olive oil.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
        link: 'recipes.html?q=Pizza',
        badge: '25 min • Masterclass'
    },
    {
        tag: '🍝 Creamy Comfort Pasta',
        title: 'Roman Fettuccine Carbonara & Pancetta',
        desc: 'Silk-coated bronze-cut fettuccine tossed with golden egg yolks, grated Pecorino Romano, crispy guanciale, and cracked pepper.',
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62817d4?auto=format&fit=crop&w=800&q=80',
        link: 'recipes.html?q=Pasta',
        badge: '20 min • Popular'
    },
    {
        tag: '🍰 Decadent Dessert',
        title: 'Warm Molten Lava Chocolate Cake',
        desc: 'Rich Belgian dark chocolate sponge with a flowing molten core, dusted with powdered sugar and vanilla bean ice cream.',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        link: 'recipes.html?q=Cake',
        badge: '30 min • Sweet Treat'
    },
    {
        tag: '🌮 Street Food Fiesta',
        title: 'Zesty Mexican Birria Beef Tacos',
        desc: 'Slow-braised spiced tender beef folded into crispy griddled corn tortillas with cilantro, lime, and rich consommé dip.',
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
        link: 'recipes.html?q=Tacos',
        badge: '35 min • Flavor Bomb'
    }
];

let carouselCurrentIdx = 0;
let carouselAutoTimer = null;

function initFoodCarousel() {
    const container = document.getElementById('heroFoodCarousel');
    if (!container) return;

    container.innerHTML = `
        <div class="carousel-slide-track" id="carouselTrack">
            ${CAROUSEL_DISHES.map((dish, i) => `
                <div class="carousel-slide-item">
                    <div class="carousel-content">
                        <span class="carousel-tag"><i class="fas fa-fire"></i> ${dish.tag}</span>
                        <h3 class="carousel-title">${dish.title}</h3>
                        <p class="carousel-desc">${dish.desc}</p>
                        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                            <a href="${dish.link}" class="btn btn-primary btn-sm">
                                <i class="fas fa-utensils"></i> Cook This Recipe
                            </a>
                            <span class="hot-food-badge steam-emitter">
                                ♨️ ${dish.badge}
                            </span>
                        </div>
                    </div>
                    <div class="carousel-image-wrap">
                        <img src="${dish.image}" alt="${dish.title}" loading="lazy">
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="carousel-nav-controls">
            <div class="carousel-dots" id="carouselDots">
                ${CAROUSEL_DISHES.map((_, i) => `
                    <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-idx="${i}" aria-label="Go to slide ${i + 1}"></button>
                `).join('')}
            </div>
            <div style="display:flex; gap:8px;">
                <button class="carousel-arrow-btn" id="carouselPrevBtn" aria-label="Previous Slide"><i class="fas fa-chevron-left"></i></button>
                <button class="carousel-arrow-btn" id="carouselNextBtn" aria-label="Next Slide"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    `;

    initSteamAnimation();

    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');

    function goToSlide(idx) {
        carouselCurrentIdx = (idx + CAROUSEL_DISHES.length) % CAROUSEL_DISHES.length;
        track.style.transform = `translateX(-${carouselCurrentIdx * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === carouselCurrentIdx));
    }

    function startAutoCarousel() {
        if (carouselAutoTimer) clearInterval(carouselAutoTimer);
        carouselAutoTimer = setInterval(() => {
            goToSlide(carouselCurrentIdx + 1);
        }, 4500);
    }

    prevBtn?.addEventListener('click', () => {
        goToSlide(carouselCurrentIdx - 1);
        startAutoCarousel();
    });

    nextBtn?.addEventListener('click', () => {
        goToSlide(carouselCurrentIdx + 1);
        startAutoCarousel();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.getAttribute('data-idx'), 10);
            goToSlide(idx);
            startAutoCarousel();
        });
    });

    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(carouselAutoTimer);
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
            goToSlide(carouselCurrentIdx + 1);
        } else if (touchEndX - touchStartX > 50) {
            goToSlide(carouselCurrentIdx - 1);
        }
        startAutoCarousel();
    }, { passive: true });

    container.addEventListener('mouseenter', () => clearInterval(carouselAutoTimer));
    container.addEventListener('mouseleave', () => startAutoCarousel());

    startAutoCarousel();
}

/* ==========================================================================
   ANIMATION 7: Bubbles & Culinary Particles (Full Page Rising)
   ========================================================================== */
function initBubblesAndParticles() {
    if (document.getElementById('bubblesContainer')) return;

    const container = document.createElement('div');
    container.className = 'bubbles-container';
    container.id = 'bubblesContainer';

    const isMobile = window.innerWidth <= 768;
    const bubbleCount = isMobile ? 10 : 20;

    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble-particle';

        const size = 10 + Math.random() * 24;
        const left = Math.random() * 100;
        const duration = 8 + Math.random() * 9;
        const delay = Math.random() * 10;
        const drift = (Math.random() - 0.5) * 70;

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.animationDelay = `${delay}s`;
        bubble.style.setProperty('--drift-x', `${drift}px`);

        container.appendChild(bubble);
    }

    document.body.appendChild(container);
}

/* ==========================================================================
   ANIMATION 8: Animated Shapes (Page-Wide Floating Leaves, Plates, Blobs)
   ========================================================================== */
function initAnimatedShapes() {
    if (document.getElementById('animatedShapesLayer')) return;

    const layer = document.createElement('div');
    layer.className = 'animated-shapes-layer';
    layer.id = 'animatedShapesLayer';

    layer.innerHTML = `
        <div class="anim-shape leaf-1"></div>
        <div class="anim-shape leaf-2"></div>
        <div class="anim-shape circle-plate"></div>
        <div class="anim-shape circle-ring"></div>
        <div class="anim-shape blob-1"></div>
    `;

    document.body.appendChild(layer);
}

/* ==========================================================================
   ANIMATION 10: Cooking Animation (Animated Sizzling Pan with Tossed Food)
   ========================================================================== */
function initCookingAnimation() {
    const cookingStages = document.querySelectorAll('.cooking-stage-card');
    const foodTossItems = ['🍤', '🥦', '🍄', '🥩', '🌶️', '🥕', '🍳'];

    cookingStages.forEach(stage => {
        const foodEl = stage.querySelector('.flipping-food');
        
        stage.addEventListener('click', () => {
            if (foodEl) {
                const randomFood = foodTossItems[Math.floor(Math.random() * foodTossItems.length)];
                foodEl.textContent = randomFood;
            }
            if (window.triggerHeartSparkles) {
                window.triggerHeartSparkles(stage);
            }
            if (window.showToast) {
                window.showToast('🔥 Sizzling Chef Special tossed in the pan!', 'warning', 'fa-fire-burner');
            }
        });
    });
}

/* ==========================================================================
   ALL-SIDES AMBIENT MOTION & PERIMETER ENGINE
   Applies animated motion, glowing runners, and floating culinary accents
   around ALL SIDES of the webpage (Top, Right, Bottom, Left & 4 Corners).
   ========================================================================== */
function initAllSidesAmbientMotion() {
    if (document.getElementById('allSidesMotionFrame')) return;

    // 1. Perimeter Edge Runners & Ambient Inset Glow Frame
    const frame = document.createElement('div');
    frame.className = 'all-sides-motion-frame';
    frame.id = 'allSidesMotionFrame';
    frame.innerHTML = `
        <div class="edge-runner-top"></div>
        <div class="edge-runner-bottom"></div>
        <div class="edge-runner-left"></div>
        <div class="edge-runner-right"></div>
        <div class="perimeter-inset-glow"></div>
        <div class="corner-glow-orb orb-top-left"></div>
        <div class="corner-glow-orb orb-top-right"></div>
        <div class="corner-glow-orb orb-bottom-left"></div>
        <div class="corner-glow-orb orb-bottom-right"></div>
    `;
    document.body.appendChild(frame);

    // 2. Left & Right Margin Flank Floating Culinary Items
    if (!document.getElementById('sideFlankLayer')) {
        const flankLayer = document.createElement('div');
        flankLayer.className = 'side-flank-layer';
        flankLayer.id = 'sideFlankLayer';

        const leftItems = [
            { icon: '🌿', class: 'flank-left-1', name: 'Fresh Rosemary' },
            { icon: '🧄', class: 'flank-left-2', name: 'Roasted Garlic' },
            { icon: '🍋', class: 'flank-left-3', name: 'Zesty Lemon' },
            { icon: '🥑', class: 'flank-left-4', name: 'Fresh Avocado' },
            { icon: '🌶️', class: 'flank-left-5', name: 'Organic Chili' }
        ];

        const rightItems = [
            { icon: '🍕', class: 'flank-right-1', name: 'Artisan Pizza' },
            { icon: '🍜', class: 'flank-right-2', name: 'Steaming Ramen' },
            { icon: '🥟', class: 'flank-right-3', name: 'Dim Sum' },
            { icon: '🍣', class: 'flank-right-4', name: 'Sushi Nigiri' },
            { icon: '🥐', class: 'flank-right-5', name: 'Golden Croissant' }
        ];

        [...leftItems, ...rightItems].forEach(item => {
            const el = document.createElement('div');
            el.className = `side-flank-item ${item.class}`;
            el.textContent = item.icon;
            el.title = `${item.name} - Click for culinary cheer!`;

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                el.style.transform = 'scale(1.7) rotate(360deg)';
                if (window.showToast) {
                    window.showToast(`${item.icon} ${item.name}!`, 'info', 'fa-sparkles');
                }
                setTimeout(() => {
                    el.style.transform = '';
                }, 600);
            });

            flankLayer.appendChild(el);
        });

        document.body.appendChild(flankLayer);

        // Gentle mouse interactive parallax for sides
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (!isTouch) {
            window.addEventListener('mousemove', (e) => {
                const xPercent = (e.clientX / window.innerWidth) - 0.5;
                const yPercent = (e.clientY / window.innerHeight) - 0.5;
                
                const leftElList = flankLayer.querySelectorAll('[class*="flank-left"]');
                const rightElList = flankLayer.querySelectorAll('[class*="flank-right"]');
                
                leftElList.forEach((el, idx) => {
                    const factor = (idx + 1) * 3;
                    el.style.transform = `translate3d(${xPercent * factor}px, ${yPercent * factor}px, 0)`;
                });
                
                rightElList.forEach((el, idx) => {
                    const factor = (idx + 1) * 3;
                    el.style.transform = `translate3d(${-xPercent * factor}px, ${yPercent * factor}px, 0)`;
                });
            }, { passive: true });
        }
    }
}

/* ==========================================================================
   Favorite Heart Sparkle Burst
   ========================================================================== */
window.triggerHeartSparkles = function(buttonElement) {
    if (!buttonElement) return;

    const icon = buttonElement.querySelector('i');
    if (icon) {
        icon.classList.remove('heart-burst');
        void icon.offsetWidth;
        icon.classList.add('heart-burst');
    }

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
