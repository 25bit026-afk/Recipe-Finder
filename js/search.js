/**
 * Recipe Finder - Advanced Search & Multi-Filter Engine (recipes.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Only execute on search/recipes page
    const searchGrid = document.getElementById('searchResultsGrid');
    if (!searchGrid) return;

    initSearchEngine();
});

function initSearchEngine() {
    // DOM Elements
    const searchInput = document.getElementById('searchQueryInput');
    const cuisineSelect = document.getElementById('filterCuisine');
    const dietSelect = document.getElementById('filterDiet');
    const timeSelect = document.getElementById('filterTime');
    const difficultySelect = document.getElementById('filterDifficulty');
    const spicyChips = document.querySelectorAll('.spicy-filter-chip');
    const sortSelect = document.getElementById('sortBySelect');
    const resetBtn = document.getElementById('resetFiltersBtn');
    const resultsGrid = document.getElementById('searchResultsGrid');
    const resultsCount = document.getElementById('resultsCountBadge');
    const activeFiltersContainer = document.getElementById('activeFiltersList');
    const viewGridBtn = document.getElementById('viewGridBtn');
    const viewListBtn = document.getElementById('viewListBtn');

    let currentFilters = {
        query: '',
        cuisine: 'all',
        diet: 'all',
        maxTime: 'all',
        difficulty: 'all',
        spicyLevel: 'all',
        sortBy: 'rating'
    };

    // Parse URL Parameters (e.g., from home page quick search / cuisine tags)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q')) {
        currentFilters.query = urlParams.get('q').trim();
        if (searchInput) searchInput.value = currentFilters.query;
    }
    if (urlParams.has('cuisine')) {
        currentFilters.cuisine = urlParams.get('cuisine');
        if (cuisineSelect) cuisineSelect.value = currentFilters.cuisine;
    }
    if (urlParams.has('diet')) {
        currentFilters.diet = urlParams.get('diet');
        if (dietSelect) dietSelect.value = currentFilters.diet;
    }

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.query = e.target.value.trim();
            filterAndRender();
        });
    }

    if (cuisineSelect) {
        cuisineSelect.addEventListener('change', (e) => {
            currentFilters.cuisine = e.target.value;
            filterAndRender();
        });
    }

    if (dietSelect) {
        dietSelect.addEventListener('change', (e) => {
            currentFilters.diet = e.target.value;
            filterAndRender();
        });
    }

    if (timeSelect) {
        timeSelect.addEventListener('change', (e) => {
            currentFilters.maxTime = e.target.value;
            filterAndRender();
        });
    }

    if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
            currentFilters.difficulty = e.target.value;
            filterAndRender();
        });
    }

    if (spicyChips.length) {
        spicyChips.forEach(chip => {
            chip.addEventListener('click', () => {
                spicyChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentFilters.spicyLevel = chip.dataset.spicy;
                filterAndRender();
            });
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
            filterAndRender();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentFilters = {
                query: '',
                cuisine: 'all',
                diet: 'all',
                maxTime: 'all',
                difficulty: 'all',
                spicyLevel: 'all',
                sortBy: 'rating'
            };
            if (searchInput) searchInput.value = '';
            if (cuisineSelect) cuisineSelect.value = 'all';
            if (dietSelect) dietSelect.value = 'all';
            if (timeSelect) timeSelect.value = 'all';
            if (difficultySelect) difficultySelect.value = 'all';
            if (sortSelect) sortSelect.value = 'rating';
            spicyChips.forEach(c => c.classList.remove('active'));
            if (spicyChips[0]) spicyChips[0].classList.add('active');
            
            // Clean URL params
            window.history.replaceState({}, document.title, window.location.pathname);
            filterAndRender();
            showToast('Filters have been reset', 'info', 'fa-undo');
        });
    }

    // Grid vs List View Toggle
    if (viewGridBtn && viewListBtn) {
        viewGridBtn.addEventListener('click', () => {
            viewGridBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            resultsGrid.classList.remove('list-view');
        });

        viewListBtn.addEventListener('click', () => {
            viewListBtn.classList.add('active');
            viewGridBtn.classList.remove('active');
            resultsGrid.classList.add('list-view');
        });
    }

    // Core Filtering Logic
    function filterAndRender() {
        let results = [...RECIPES_DATA];

        // 1. Search Query (matches name, ingredients, or tagline)
        if (currentFilters.query) {
            const q = currentFilters.query.toLowerCase();
            results = results.filter(recipe => {
                const nameMatch = recipe.name.toLowerCase().includes(q);
                const tagMatch = recipe.tagline.toLowerCase().includes(q);
                const cuisineMatch = recipe.cuisine.toLowerCase().includes(q);
                const ingredientMatch = recipe.ingredients.some(ing => ing.name.toLowerCase().includes(q));
                return nameMatch || tagMatch || cuisineMatch || ingredientMatch;
            });
        }

        // 2. Cuisine Filter
        if (currentFilters.cuisine !== 'all') {
            results = results.filter(r => r.cuisine.toLowerCase() === currentFilters.cuisine.toLowerCase());
        }

        // 3. Diet Filter
        if (currentFilters.diet !== 'all') {
            results = results.filter(r => {
                if (currentFilters.diet === 'Vegetarian') {
                    return r.diet === 'Vegetarian' || r.diet === 'Vegan';
                }
                return r.diet.toLowerCase() === currentFilters.diet.toLowerCase();
            });
        }

        // 4. Cooking Time Filter
        if (currentFilters.maxTime !== 'all') {
            const timeLimit = parseInt(currentFilters.maxTime, 10);
            if (timeLimit === 20) {
                results = results.filter(r => r.time <= 20);
            } else if (timeLimit === 30) {
                results = results.filter(r => r.time <= 30);
            } else if (timeLimit === 45) {
                results = results.filter(r => r.time <= 45);
            } else if (timeLimit === 60) {
                results = results.filter(r => r.time > 45);
            }
        }

        // 5. Difficulty Filter
        if (currentFilters.difficulty !== 'all') {
            results = results.filter(r => r.difficulty.toLowerCase() === currentFilters.difficulty.toLowerCase());
        }

        // 6. Spicy Level Filter
        if (currentFilters.spicyLevel !== 'all') {
            const level = parseInt(currentFilters.spicyLevel, 10);
            results = results.filter(r => (r.spicyLevel || 1) === level);
        }

        // 7. Sorting
        if (currentFilters.sortBy === 'rating') {
            results.sort((a, b) => b.rating - a.rating);
        } else if (currentFilters.sortBy === 'time-asc') {
            results.sort((a, b) => a.time - b.time);
        } else if (currentFilters.sortBy === 'time-desc') {
            results.sort((a, b) => b.time - a.time);
        } else if (currentFilters.sortBy === 'name') {
            results.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentFilters.sortBy === 'popular') {
            results.sort((a, b) => b.reviewsCount - a.reviewsCount);
        }

        // Render Cards
        renderResults(results);
        renderActiveFilters();
    }

    function renderResults(recipes) {
        if (resultsCount) {
            resultsCount.textContent = `${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'} found`;
        }

        if (recipes.length === 0) {
            resultsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🍳</div>
                    <h3>No matching recipes found</h3>
                    <p>We couldn't find any recipes matching your current filters. Try relaxing your search terms or resetting filters.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('resetFiltersBtn').click()">
                        <i class="fas fa-undo"></i> Reset All Filters
                    </button>
                </div>
            `;
            return;
        }

        resultsGrid.innerHTML = recipes.map(recipe => renderRecipeCard(recipe)).join('');
    }

    function renderActiveFilters() {
        if (!activeFiltersContainer) return;

        const chips = [];

        if (currentFilters.query) {
            chips.push({ label: `"${currentFilters.query}"`, key: 'query' });
        }
        if (currentFilters.cuisine !== 'all') {
            chips.push({ label: `Cuisine: ${currentFilters.cuisine}`, key: 'cuisine' });
        }
        if (currentFilters.diet !== 'all') {
            chips.push({ label: `Diet: ${currentFilters.diet}`, key: 'diet' });
        }
        if (currentFilters.maxTime !== 'all') {
            chips.push({ label: `Time: ≤ ${currentFilters.maxTime}m`, key: 'maxTime' });
        }
        if (currentFilters.difficulty !== 'all') {
            chips.push({ label: `Level: ${currentFilters.difficulty}`, key: 'difficulty' });
        }
        if (currentFilters.spicyLevel !== 'all') {
            chips.push({ label: `Spiciness: ${currentFilters.spicyLevel} 🌶️`, key: 'spicyLevel' });
        }

        if (chips.length === 0) {
            activeFiltersContainer.innerHTML = '';
            return;
        }

        activeFiltersContainer.innerHTML = chips.map(chip => `
            <span class="active-filter-badge">
                ${chip.label}
                <i class="fas fa-times" onclick="removeFilterChip('${chip.key}')" title="Remove filter"></i>
            </span>
        `).join('');
    }

    // Expose chip removal to global scope
    window.removeFilterChip = function(key) {
        if (key === 'query') {
            currentFilters.query = '';
            if (searchInput) searchInput.value = '';
        } else if (key === 'cuisine') {
            currentFilters.cuisine = 'all';
            if (cuisineSelect) cuisineSelect.value = 'all';
        } else if (key === 'diet') {
            currentFilters.diet = 'all';
            if (dietSelect) dietSelect.value = 'all';
        } else if (key === 'maxTime') {
            currentFilters.maxTime = 'all';
            if (timeSelect) timeSelect.value = 'all';
        } else if (key === 'difficulty') {
            currentFilters.difficulty = 'all';
            if (difficultySelect) difficultySelect.value = 'all';
        } else if (key === 'spicyLevel') {
            currentFilters.spicyLevel = 'all';
            spicyChips.forEach(c => c.classList.remove('active'));
            if (spicyChips[0]) spicyChips[0].classList.add('active');
        }
        filterAndRender();
    };

    // Initial load
    filterAndRender();
}
