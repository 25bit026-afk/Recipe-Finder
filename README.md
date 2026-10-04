# 🍳 Recipe Finder Web Application

A modern, responsive, and feature-rich **Recipe Finder** web application built with clean semantic **HTML5**, modern **CSS3**, and modular **Vanilla JavaScript**. It empowers food enthusiasts and home cooks to discover, search, customize, and cook gourmet recipes from around the globe.

---

## 🌟 Key Features

### 🔍 1. Smart Search & Multi-Faceted Filters
- **Ingredient & Name Search**: Search by dish name (e.g., *Biryani*, *Tacos*), tagline, cuisine, or specific ingredients (e.g., *Chicken*, *Avocado*, *Rice*).
- **Cuisine Filters**: Filter across Indian, Italian, Chinese, Mexican, Japanese, Mediterranean, American, and Thai delicacies.
- **Dietary Categories**: Toggle between *Vegetarian*, *Non-Vegetarian*, *Vegan*, and *Pescatarian*.
- **Cooking Time Range**: Quickly find express meals (under 20 mins) or slow-cooked weekend feasts.
- **Difficulty & Spiciness Selector**: Choose cooking difficulty and filter by spice meter (Mild 🌶️ to Fiery 🔥).
- **Multiple Sorting Options**: Sort recipes by highest rating, popularity, quickest prep time, or alphabetical order.
- **Active Filter Badges**: Easily view and dismiss individual active filters with one click.
- **Grid & List View Switcher**: Seamlessly toggle between visual card grid view and compact list view.

---

### 📖 2. Interactive Recipe Masterclass Details
- **Dynamic Serving Scaler**: Adjust servings (`+` / `-`) to automatically recalculate and scale ingredient amounts proportionally in real time.
- **Interactive Checklist**: Cross off ingredients as you prep in the kitchen.
- **Copy Shopping List**: Export formatted grocery shopping lists directly to your clipboard.
- **Step-by-Step Cooking Guide**: Clear numbered instructions for effortless cooking.
- **Built-in Cooking Countdown Timer**: Interactive timer preset to the recipe's cook time with play/pause/reset and an audio chime notification upon completion.
- **Nutrition Facts Card**: Complete breakdown of calories, protein, carbs, healthy fats, and dietary fiber per serving.
- **Print & Social Share**: Clean print-optimized layout for physical kitchen recipes and native URL sharing.

---

### ❤️ 3. LocalStorage Favorites Management
- Save and unsave favorite recipes with instant heart toggle animations.
- Saved recipes persist across browser refreshes and sessions using `localStorage`.
- Dedicated Favorites page (`favorites.html`) with total count and a 1-click **Clear All** action.
- Live badge counter dynamically synced in the navigation bar.

---

### 🎲 4. Surprise Random Recipe Generator
- Indecisive about what to cook? Tap **"Surprise Me"** to trigger a modal with a random mystery dish, ready to roll again or start cooking immediately.

---

### 🌙 5. Dark Mode & Rich Responsive Design
- Built with a warm gourmet color palette and sleek midnight dark theme with automatic preference detection and memory.
- Fluid mobile slide-in drawer navigation with touch-friendly controls.
- Micro-interactions, subtle hover glows, and responsive typography powered by Google Fonts (*Outfit* and *Plus Jakarta Sans*).

---

## 📁 Project Structure

```text
Recipe-Finder/
│
├── index.html              # Home page with hero, search, cuisine pills & popular recipes
├── recipes.html            # Search & exploration page with sidebar filters & sorting
├── favorites.html          # Saved recipes collection powered by LocalStorage
├── recipe-details.html     # Interactive detail page with servings scaler & cooking timer
│
├── css/
│   ├── style.css           # Global tokens, typography, navbar, footer, toast & modals
│   ├── recipes.css         # Recipe cards, search controls, details view & timer widget
│   └── responsive.css      # Breakpoints, mobile navigation drawer & print styles
│
├── js/
│   ├── data.js             # Rich 16+ recipe dataset with ingredients, steps & nutrition
│   ├── app.js              # Theme manager, toast alerts, card renderer & random modal
│   ├── search.js           # Multi-criteria filtering, live search & URL query sync
│   ├── favorites.js        # LocalStorage favorites loader and batch management
│   └── recipe-details.js   # Serving scaler, ingredient checklist, timer & chime
│
└── README.md               # Project documentation and guide
```

---

## 🚀 How to Run Locally

This project requires **no external build tools, NPM packages, or backend servers**!

### Option 1: VS Code Live Server (Recommended)
1. Open the `Recipe-Finder` project folder in **VS Code**.
2. Right-click on `index.html` and select **"Open with Live Server"**.
3. The app will open in your default browser at `http://127.0.0.1:5500`.

### Option 2: Python HTTP Server
Open a terminal in the project directory and run:
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

### Option 3: Direct File Opening
Double-click `index.html` to open directly in Chrome, Edge, Safari, or Firefox.

---

## 🛠️ Technology Stack

| Technology | Role |
|---|---|
| **HTML5** | Semantic structure, accessibility & responsive meta tags |
| **CSS3** | Custom properties (tokens), CSS Grid, Flexbox, Glassmorphism, Print styles |
| **JavaScript (ES6+)** | Dynamic DOM rendering, live filtering, timers, audio API, clipboard API |
| **LocalStorage** | Persistent favorite recipe storage |
| **Font Awesome 6** | Modern iconography |
| **Google Fonts** | Typography (*Outfit* & *Plus Jakarta Sans*) |
| **Unsplash API** | High-definition curated food photography |

---

## 👨‍🍳 Author & License
Crafted with passion for culinary and web development excellence.
Open-source under the MIT License.
