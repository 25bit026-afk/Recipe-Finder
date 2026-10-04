/**
 * Recipe Finder - Recipe Details Controller (recipe-details.html)
 * Includes dynamic serving scaler, interactive ingredient checklist, shopping list copy,
 * step tracker, interactive cooking countdown timer with audio chime, and related recipes.
 */

let currentRecipe = null;
let baseServings = 2;
let currentServings = 2;
let timerInterval = null;
let timerRemainingSeconds = 0;
let isTimerRunning = false;

document.addEventListener('DOMContentLoaded', () => {
    // Only execute on recipe details page
    const detailsContainer = document.getElementById('recipeDetailsRoot');
    if (!detailsContainer) return;

    loadRecipeFromUrl();
});

function loadRecipeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id') || '1';
    currentRecipe = getRecipeById(recipeId);

    if (!currentRecipe) {
        showRecipeNotFound();
        return;
    }

    baseServings = currentRecipe.servings || 2;
    currentServings = baseServings;

    // Update Page Meta Title
    document.title = `${currentRecipe.name} - Recipe Finder`;

    renderRecipeDetails();
    renderRelatedRecipes();
    initTimer();
}

function showRecipeNotFound() {
    const root = document.getElementById('recipeDetailsRoot');
    if (!root) return;

    root.innerHTML = `
        <div class="empty-state" style="margin-top: 60px;">
            <div class="empty-state-icon">🍳</div>
            <h2>Recipe Not Found</h2>
            <p>The recipe you are looking for does not exist or has been removed.</p>
            <div style="margin-top: 20px;">
                <a href="recipes.html" class="btn btn-primary">
                    <i class="fas fa-search"></i> Browse All Recipes
                </a>
            </div>
        </div>
    `;
}

function renderRecipeDetails() {
    const root = document.getElementById('recipeDetailsRoot');
    if (!root || !currentRecipe) return;

    const isFav = isFavorite(currentRecipe.id);
    const isNonVeg = currentRecipe.diet.toLowerCase().includes('non-veg');

    // Spicy peppers
    let spicyPeppers = '';
    for (let i = 0; i < (currentRecipe.spicyLevel || 1); i++) {
        spicyPeppers += '🌶️';
    }

    root.innerHTML = `
        <div class="details-hero">
            <div class="details-image-card">
                <img src="${currentRecipe.image}" alt="${currentRecipe.name}">
                <span class="badge-diet ${isNonVeg ? 'non-veg' : ''}">
                    <i class="fas ${isNonVeg ? 'fa-drumstick-bite' : 'fa-leaf'}"></i> ${currentRecipe.diet}
                </span>
            </div>

            <div class="details-header">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                    <span style="color:var(--primary); font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
                        ${currentRecipe.cuisine} Cuisine
                    </span>
                    <span style="color:var(--text-muted);">•</span>
                    <span style="color:var(--accent); font-weight:700;">
                        <i class="fas fa-star"></i> ${currentRecipe.rating} (${currentRecipe.reviewsCount} reviews)
                    </span>
                </div>

                <h1>${currentRecipe.name}</h1>
                <p class="details-tagline">${currentRecipe.tagline}</p>

                <div class="details-stats-grid">
                    <div class="detail-stat-box">
                        <i class="far fa-clock"></i>
                        <div class="stat-val">${currentRecipe.time} min</div>
                        <div class="stat-lbl">Total Time</div>
                    </div>
                    <div class="detail-stat-box">
                        <i class="fas fa-fire"></i>
                        <div class="stat-val">${currentRecipe.calories} kcal</div>
                        <div class="stat-lbl">Calories</div>
                    </div>
                    <div class="detail-stat-box">
                        <i class="fas fa-signal"></i>
                        <div class="stat-val">${currentRecipe.difficulty}</div>
                        <div class="stat-lbl">Difficulty</div>
                    </div>
                    <div class="detail-stat-box">
                        <i class="fas fa-pepper-hot"></i>
                        <div class="stat-val">${spicyPeppers}</div>
                        <div class="stat-lbl">Spiciness</div>
                    </div>
                </div>

                <div class="details-action-buttons">
                    <button id="detailsFavBtn" class="btn ${isFav ? 'btn-primary' : 'btn-outline'}" onclick="toggleDetailsFav()">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i> ${isFav ? 'Saved in Favorites' : 'Add to Favorites'}
                    </button>
                    <button class="btn btn-secondary" onclick="copyShoppingList()">
                        <i class="fas fa-shopping-cart"></i> Copy Shopping List
                    </button>
                    <button class="btn btn-secondary" onclick="window.print()">
                        <i class="fas fa-print"></i> Print Recipe
                    </button>
                    <button class="btn btn-secondary" onclick="shareRecipe()">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                </div>
            </div>
        </div>

        <div class="details-content-grid">
            <!-- Left Column: Ingredients & Servings Scaler -->
            <div class="ingredients-card">
                <div class="ingredients-header">
                    <h3>Ingredients</h3>
                    <div class="servings-controller">
                        <span style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">Servings:</span>
                        <button class="btn-servings" onclick="adjustServings(-1)" title="Decrease Servings">-</button>
                        <span id="servingsDisplay" style="font-weight:800; min-width:18px; text-align:center;">${currentServings}</span>
                        <button class="btn-servings" onclick="adjustServings(1)" title="Increase Servings">+</button>
                    </div>
                </div>

                <ul class="ingredients-list" id="ingredientsList">
                    ${renderIngredientsListHtml()}
                </ul>

                <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
                    <button class="btn btn-outline btn-sm" onclick="toggleSelectAllIngredients()">
                        <i class="fas fa-check-double"></i> Check All
                    </button>
                    <span style="font-size:0.82rem; color:var(--text-muted);">Click items to cross off</span>
                </div>

                <!-- Nutrition Info Box -->
                <div class="nutrition-card">
                    <h4 style="font-size:1.05rem; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-chart-pie" style="color:var(--primary);"></i> Nutrition per serving
                    </h4>
                    <div class="nutrition-grid">
                        <div class="nutrition-box">
                            <div class="nutri-val">${currentRecipe.nutrition.calories}</div>
                            <div class="nutri-lbl">Energy</div>
                        </div>
                        <div class="nutrition-box">
                            <div class="nutri-val">${currentRecipe.nutrition.protein}</div>
                            <div class="nutri-lbl">Protein</div>
                        </div>
                        <div class="nutrition-box">
                            <div class="nutri-val">${currentRecipe.nutrition.carbs}</div>
                            <div class="nutri-lbl">Carbs</div>
                        </div>
                        <div class="nutrition-box">
                            <div class="nutri-val">${currentRecipe.nutrition.fat}</div>
                            <div class="nutri-lbl">Fat</div>
                        </div>
                        <div class="nutrition-box">
                            <div class="nutri-val">${currentRecipe.nutrition.fiber}</div>
                            <div class="nutri-lbl">Fiber</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Step-by-Step Instructions -->
            <div class="instructions-card">
                <div class="instructions-header">
                    <h3>Step-by-Step Instructions</h3>
                    <span style="font-size:0.88rem; color:var(--text-muted); font-weight:600;">
                        ${currentRecipe.instructions.length} Steps
                    </span>
                </div>

                <div class="step-list">
                    ${currentRecipe.instructions.map((step, index) => `
                        <div class="step-item" id="step-${index + 1}">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-text">${step}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Interactive Cooking Timer -->
                <div class="cooking-timer-widget">
                    <div>
                        <h4 style="font-size:1.15rem; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
                            <i class="fas fa-stopwatch" style="color:var(--primary);"></i> Built-in Cooking Timer
                        </h4>
                        <p style="font-size:0.86rem; color:var(--text-secondary);">Set timer for this recipe (${currentRecipe.cookTime || currentRecipe.time} mins)</p>
                    </div>

                    <div class="timer-display" id="timerDisplay">
                        ${formatTimerTime((currentRecipe.cookTime || currentRecipe.time) * 60)}
                    </div>

                    <div class="timer-controls">
                        <button id="timerToggleBtn" class="btn btn-primary btn-sm" onclick="toggleCookingTimer()">
                            <i class="fas fa-play"></i> Start
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="resetCookingTimer()">
                            <i class="fas fa-redo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Related Recipes -->
        <div class="related-recipes-section">
            <div class="section-header">
                <div class="section-title-wrap">
                    <h2>You Might Also Love</h2>
                    <p>Similar ${currentRecipe.cuisine} dishes and chef selections</p>
                </div>
                <a href="recipes.html?cuisine=${currentRecipe.cuisine}" class="btn btn-outline btn-sm">
                    Explore More ${currentRecipe.cuisine} <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            <div class="recipes-grid" id="relatedRecipesGrid"></div>
        </div>
    `;
}

/* ==========================================================================
   Dynamic Ingredient Scaling
   ========================================================================== */
function renderIngredientsListHtml() {
    if (!currentRecipe || !currentRecipe.ingredients) return '';

    const factor = currentServings / baseServings;

    return currentRecipe.ingredients.map((item, idx) => {
        const scaledAmount = item.amount ? formatAmount(item.amount * factor) : '';
        const unit = item.unit ? ` ${item.unit}` : '';
        return `
            <li class="ingredient-item" onclick="toggleIngredientCheck(this)">
                <input type="checkbox" id="ing-${idx}" onclick="event.stopPropagation(); toggleIngredientCheck(this.parentElement);">
                <span><strong>${scaledAmount}${unit}</strong> ${item.name}</span>
            </li>
        `;
    }).join('');
}

function formatAmount(val) {
    if (!val) return '';
    // Format to 2 decimal places if needed or clean fraction
    const rounded = Math.round(val * 100) / 100;
    if (rounded === 0.25) return '1/4';
    if (rounded === 0.33 || rounded === 0.3) return '1/3';
    if (rounded === 0.5) return '1/2';
    if (rounded === 0.75) return '3/4';
    if (rounded === 1.5) return '1 1/2';
    if (rounded === 2.5) return '2 1/2';
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

function adjustServings(delta) {
    const newServings = currentServings + delta;
    if (newServings < 1 || newServings > 24) return;

    currentServings = newServings;
    document.getElementById('servingsDisplay').textContent = currentServings;
    document.getElementById('ingredientsList').innerHTML = renderIngredientsListHtml();
    showToast(`Ingredients scaled for ${currentServings} servings`, 'info', 'fa-balance-scale');
}

function toggleIngredientCheck(element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    element.classList.toggle('checked');
    checkbox.checked = element.classList.contains('checked');
}

let allIngredientsChecked = false;
function toggleSelectAllIngredients() {
    allIngredientsChecked = !allIngredientsChecked;
    const items = document.querySelectorAll('.ingredient-item');
    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (allIngredientsChecked) {
            item.classList.add('checked');
            checkbox.checked = true;
        } else {
            item.classList.remove('checked');
            checkbox.checked = false;
        }
    });
}

function copyShoppingList() {
    if (!currentRecipe) return;

    const factor = currentServings / baseServings;
    let listText = `🛒 Shopping List for ${currentRecipe.name} (${currentServings} servings):\n\n`;
    
    currentRecipe.ingredients.forEach(item => {
        const scaledAmount = item.amount ? formatAmount(item.amount * factor) : '';
        const unit = item.unit ? ` ${item.unit}` : '';
        listText += `• ${scaledAmount}${unit} ${item.name}\n`;
    });

    listText += `\nDiscover more at Recipe Finder!`;

    navigator.clipboard.writeText(listText).then(() => {
        showToast('Shopping list copied to clipboard!', 'success', 'fa-clipboard-check');
    }).catch(() => {
        showToast('Failed to copy shopping list', 'warning', 'fa-exclamation');
    });
}

/* ==========================================================================
   Details Favorite Toggle
   ========================================================================== */
function toggleDetailsFav() {
    if (!currentRecipe) return;
    const isNowFav = toggleFavorite(currentRecipe.id);
    const btn = document.getElementById('detailsFavBtn');
    if (btn) {
        btn.className = `btn ${isNowFav ? 'btn-primary' : 'btn-outline'}`;
        btn.innerHTML = `<i class="${isNowFav ? 'fas' : 'far'} fa-heart"></i> ${isNowFav ? 'Saved in Favorites' : 'Add to Favorites'}`;
        if (isNowFav && typeof triggerHeartSparkles === 'function') {
            triggerHeartSparkles(btn);
        }
    }
}

/* ==========================================================================
   Share Recipe Feature
   ========================================================================== */
function shareRecipe() {
    if (!currentRecipe) return;
    const shareData = {
        title: currentRecipe.name,
        text: `Check out this delicious recipe for ${currentRecipe.name}!`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Recipe URL link copied to clipboard!', 'success', 'fa-link');
        });
    }
}

/* ==========================================================================
   Cooking Timer & Chime Sound
   ========================================================================== */
function initTimer() {
    if (!currentRecipe) return;
    const totalMinutes = currentRecipe.cookTime || currentRecipe.time || 20;
    timerRemainingSeconds = totalMinutes * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    if (display) {
        display.textContent = formatTimerTime(timerRemainingSeconds);
    }
}

function formatTimerTime(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleCookingTimer() {
    const btn = document.getElementById('timerToggleBtn');
    if (!btn) return;

    if (isTimerRunning) {
        // Pause
        clearInterval(timerInterval);
        isTimerRunning = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Resume';
        btn.className = 'btn btn-primary btn-sm';
    } else {
        // Start
        isTimerRunning = true;
        btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        btn.className = 'btn btn-secondary btn-sm';

        timerInterval = setInterval(() => {
            if (timerRemainingSeconds > 0) {
                timerRemainingSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                isTimerRunning = false;
                btn.innerHTML = '<i class="fas fa-play"></i> Start';
                btn.className = 'btn btn-primary btn-sm';
                playTimerChime();
                showToast(`⏰ Timer Complete for ${currentRecipe.name}!`, 'success', 'fa-bell');
            }
        }, 1000);
    }
}

function resetCookingTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    const totalMinutes = currentRecipe ? (currentRecipe.cookTime || currentRecipe.time || 20) : 20;
    timerRemainingSeconds = totalMinutes * 60;
    updateTimerDisplay();

    const btn = document.getElementById('timerToggleBtn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-play"></i> Start';
        btn.className = 'btn btn-primary btn-sm';
    }
}

// Play pleasant Web Audio API chime when timer finishes
function playTimerChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.2); // A5
        osc.frequency.setValueAtTime(1174.66, now + 0.4); // D6

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
    } catch (e) {
        console.log('Audio chime not supported');
    }
}

/* ==========================================================================
   Related Recipes
   ========================================================================== */
function renderRelatedRecipes() {
    const grid = document.getElementById('relatedRecipesGrid');
    if (!grid || !currentRecipe) return;

    const related = RECIPES_DATA
        .filter(r => r.id !== currentRecipe.id && (r.cuisine === currentRecipe.cuisine || r.diet === currentRecipe.diet))
        .slice(0, 3);

    if (related.length === 0) {
        grid.parentElement.style.display = 'none';
        return;
    }

    grid.innerHTML = related.map(recipe => renderRecipeCard(recipe)).join('');
}
