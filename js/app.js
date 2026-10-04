/**
 * Recipe Finder - Global Application Controller
 * Handles themes, mobile navigation, toast alerts, favorites badge, and shared components.
 */

// LocalStorage Keys
const THEME_KEY = 'recipe_finder_theme';
const FAVORITES_KEY = 'recipe_finder_favorites';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initBackToTop();
    updateFavoriteBadge();
    initRandomRecipeModal();
});

/* ==========================================================================
   Theme Management (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(THEME_KEY, newTheme);
            updateThemeIcon(newTheme);
            showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info', 'fa-moon');
        });
    });
}

function updateThemeIcon(theme) {
    const icons = document.querySelectorAll('.theme-toggle-btn i');
    icons.forEach(icon => {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    });
}

/* ==========================================================================
   Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('mobileOverlay');
    const closeBtn = document.getElementById('closeMobileDrawer');

    if (!toggleBtn || !drawer || !overlay) return;

    function openDrawer() {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
}

/* ==========================================================================
   Favorites LocalStorage Management
   ========================================================================== */
function getFavorites() {
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function isFavorite(recipeId) {
    const favs = getFavorites();
    return favs.includes(parseInt(recipeId, 10));
}

function toggleFavorite(recipeId) {
    let favs = getFavorites();
    const id = parseInt(recipeId, 10);
    const recipe = typeof getRecipeById === 'function' ? getRecipeById(id) : null;
    const name = recipe ? recipe.name : 'Recipe';

    if (favs.includes(id)) {
        favs = favs.filter(item => item !== id);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
        updateFavoriteBadge();
        showToast(`Removed "${name}" from Favorites`, 'warning', 'fa-heart-broken');
        return false;
    } else {
        favs.push(id);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
        updateFavoriteBadge();
        showToast(`Saved "${name}" to Favorites!`, 'success', 'fa-heart');
        return true;
    }
}

function updateFavoriteBadge() {
    const favs = getFavorites();
    const badges = document.querySelectorAll('.fav-count-badge');
    badges.forEach(badge => {
        badge.textContent = favs.length;
        if (favs.length === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'inline-block';
        }
    });
}

/* ==========================================================================
   Card HTML Generator (Reusable across pages)
   ========================================================================== */
function renderRecipeCard(recipe) {
    const isFav = isFavorite(recipe.id);
    const isNonVeg = recipe.diet.toLowerCase().includes('non-veg') || recipe.category.toLowerCase().includes('non-veg');
    
    // Generate spicy peppers
    let spicyHtml = '';
    for (let i = 0; i < (recipe.spicyLevel || 1); i++) {
        spicyHtml += '🌶️';
    }

    return `
        <article class="recipe-card" data-id="${recipe.id}">
            <div class="card-image-wrap">
                <img src="${recipe.image}" alt="${recipe.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'">
                <span class="badge-diet ${isNonVeg ? 'non-veg' : ''}">
                    <i class="fas ${isNonVeg ? 'fa-drumstick-bite' : 'fa-leaf'}"></i>
                    ${recipe.diet}
                </span>
                <span class="badge-time">
                    <i class="far fa-clock"></i> ${recipe.time} min
                </span>
                <button class="btn-fav-toggle ${isFav ? 'active' : ''}" onclick="handleCardFavClick(event, ${recipe.id})" title="${isFav ? 'Remove Favorite' : 'Add to Favorites'}" aria-label="Favorite">
                    <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            
            <div class="card-content">
                <div class="card-meta-top">
                    <span class="card-cuisine">${recipe.cuisine}</span>
                    <span class="card-rating">
                        <i class="fas fa-star"></i> ${recipe.rating}
                    </span>
                </div>
                
                <h3 class="card-title">
                    <a href="recipe-details.html?id=${recipe.id}">${recipe.name}</a>
                </h3>
                
                <p class="card-tagline">${recipe.tagline || 'Delicious handcrafted recipe with fresh ingredients.'}</p>
                
                <div class="card-spicy" title="Spice level: ${recipe.spicyLevel || 1}/4">
                    <span>Spiciness:</span> ${spicyHtml}
                </div>

                <div class="card-footer">
                    <span class="card-difficulty">
                        <i class="fas fa-signal"></i> ${recipe.difficulty}
                    </span>
                    <a href="recipe-details.html?id=${recipe.id}" class="btn btn-primary btn-sm">
                        View Recipe <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </article>
    `;
}

function handleCardFavClick(e, recipeId) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    const isNowFav = toggleFavorite(recipeId);
    
    if (isNowFav) {
        btn.classList.add('active');
        btn.querySelector('i').className = 'fas fa-heart';
    } else {
        btn.classList.remove('active');
        btn.querySelector('i').className = 'far fa-heart';
        
        // If we are currently on the favorites page, re-render the list
        if (typeof renderFavoritesList === 'function') {
            renderFavoritesList();
        }
    }
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message, type = 'info', iconClass = 'fa-info-circle') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/* ==========================================================================
   Back To Top Floating Button
   ========================================================================== */
function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ==========================================================================
   Random Recipe Feature / Modal
   ========================================================================== */
function initRandomRecipeModal() {
    const randomBtns = document.querySelectorAll('.btn-random-recipe');
    const modal = document.getElementById('randomRecipeModal');
    const closeBtn = document.getElementById('closeRandomModal');
    const content = document.getElementById('randomModalContent');

    if (!randomBtns.length || !modal || !content) return;

    function openRandomModal() {
        const recipe = getRandomRecipe();
        if (!recipe) return;

        content.innerHTML = `
            <div style="position:relative;">
                <img src="${recipe.image}" alt="${recipe.name}" style="width:100%; height:260px; object-fit:cover; border-radius: 18px 18px 0 0;">
                <div style="position:absolute; bottom:12px; left:16px; background:rgba(0,0,0,0.75); color:#fff; padding:4px 12px; border-radius:99px; font-size:0.85rem; font-weight:600;">
                    🎲 Mystery Pick: ${recipe.cuisine} Cuisine
                </div>
            </div>
            <div style="padding: 24px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                    <span style="color:var(--primary); font-weight:700; text-transform:uppercase; font-size:0.85rem;">${recipe.diet}</span>
                    <span style="color:var(--accent); font-weight:700;"><i class="fas fa-star"></i> ${recipe.rating} (${recipe.reviewsCount} reviews)</span>
                </div>
                <h2 style="font-size:1.6rem; margin-bottom:10px;">${recipe.name}</h2>
                <p style="color:var(--text-secondary); margin-bottom:20px; line-height:1.5;">${recipe.tagline}</p>
                <div style="display:flex; gap:16px; margin-bottom:24px; color:var(--text-secondary); font-size:0.9rem;">
                    <span><i class="far fa-clock" style="color:var(--primary)"></i> ${recipe.time} mins</span>
                    <span><i class="fas fa-fire" style="color:var(--primary)"></i> ${recipe.calories} kcal</span>
                    <span><i class="fas fa-signal" style="color:var(--primary)"></i> ${recipe.difficulty}</span>
                </div>
                <div style="display:flex; gap:12px;">
                    <a href="recipe-details.html?id=${recipe.id}" class="btn btn-primary" style="flex:1;">
                        Cook This Recipe <i class="fas fa-arrow-right"></i>
                    </a>
                    <button class="btn btn-secondary" onclick="initRandomRecipeModal.rollAgain()">
                        <i class="fas fa-redo"></i> Roll Another
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    initRandomRecipeModal.rollAgain = openRandomModal;

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    randomBtns.forEach(btn => btn.addEventListener('click', openRandomModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}
