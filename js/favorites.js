/**
 * Recipe Finder - Favorites Management Page (favorites.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    const favGrid = document.getElementById('favoritesGrid');
    if (!favGrid) return;

    renderFavoritesList();
    initFavoritesActions();
});

function renderFavoritesList() {
    const favGrid = document.getElementById('favoritesGrid');
    const favCountEl = document.getElementById('favTotalCount');
    const clearAllBtn = document.getElementById('clearAllFavsBtn');

    if (!favGrid) return;

    const favIds = getFavorites();
    const savedRecipes = RECIPES_DATA.filter(recipe => favIds.includes(recipe.id));

    if (favCountEl) {
        favCountEl.textContent = `${savedRecipes.length} saved ${savedRecipes.length === 1 ? 'recipe' : 'recipes'}`;
    }

    if (clearAllBtn) {
        clearAllBtn.style.display = savedRecipes.length > 0 ? 'inline-flex' : 'none';
    }

    if (savedRecipes.length === 0) {
        favGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❤️</div>
                <h3>No Favorite Recipes Saved Yet</h3>
                <p>You haven't added any recipes to your favorites. Explore our delicious collection and click the heart icon on any recipe to save it here!</p>
                <div style="display:flex; gap:12px; justify-content:center; margin-top:20px;">
                    <a href="recipes.html" class="btn btn-primary">
                        <i class="fas fa-search"></i> Discover Recipes
                    </a>
                    <button class="btn btn-secondary btn-random-recipe">
                        🎲 Try a Random Recipe
                    </button>
                </div>
            </div>
        `;
        return;
    }

    favGrid.innerHTML = savedRecipes.map(recipe => renderRecipeCard(recipe)).join('');
    if (typeof window.refreshMotionObserver === 'function') {
        window.refreshMotionObserver();
    }
}

function initFavoritesActions() {
    const clearAllBtn = document.getElementById('clearAllFavsBtn');
    if (!clearAllBtn) return;

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to remove all saved recipes from your favorites?')) {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
            updateFavoriteBadge();
            renderFavoritesList();
            showToast('All favorites have been cleared', 'info', 'fa-trash-alt');
        }
    });
}
