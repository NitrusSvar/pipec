// Основной JavaScript файл с обновлениями для новой базы данных
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация приложения
    initApp();
});

function initApp() {
    // Проверка авторизации
    checkAuth();
    
    // Инициализация слайдера
    initSlider();
    
   
    
    // Инициализация мобильного меню
    initMobileMenu();
    
    // Загрузка популярных рецептов
    loadPopularRecipes();
    
    // Инициализация улучшенного поиска
    initEnhancedSearch();
    
    // Инициализация фильтров в каталоге (если есть)
    if (document.querySelector('.filters')) {
        initFilters();
    }
    
    // Инициализация формы добавления рецепта
    if (document.getElementById('addRecipeForm')) {
        initRecipeForm();
    }
    
    // Инициализация системы комментариев
    if (document.getElementById('commentsSection')) {
        initComments();
    }
    
    // Инициализация системы избранного
    initFavorites();
}

// Вспомогательная функция для получения названия категории
function getCategoryName(id) {
    const categories = window.db?.categories || [];
    const category = categories.find(c => c.id == id);
    return category?.name || 'Неизвестно';
}

// Проверка авторизации
function checkAuth() {
    const authBtn = document.getElementById('authBtn');
    const profileBtn = document.getElementById('profileBtn');
    const user = window.db?.getCurrentUser?.();
    
    if (user) {
        authBtn?.classList.add('hidden');
        profileBtn?.classList.remove('hidden');
        profileBtn.querySelector('span').textContent = user.login;
    } else {
        authBtn?.classList.remove('hidden');
        profileBtn?.classList.add('hidden');
    }
}

// Слайдер
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    let currentSlide = 0;
    
    if (!slides.length) return;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    }
    
    // Автопрокрутка слайдера
    setInterval(() => showSlide(currentSlide + 1), 5000);
}



// Улучшенный поиск в каталоге
function initEnhancedSearch() {
    const searchInput = document.getElementById('search');
    const searchForm = document.getElementById('filterForm');
    
    if (searchInput) {
        // Поиск при вводе (с задержкой)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterRecipes();
            }, 500);
        });
    }
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterRecipes();
        });
    }
}

// Расширенная фильтрация
function filterRecipes() {
    const form = document.getElementById('filterForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const filters = {
        category: formData.get('category'),
        difficulty: formData.get('difficulty'),
        maxTime: formData.get('maxTime'),
        sort: formData.get('sort'),
        search: formData.get('search')
    };
    
    let recipes;
    
    // Если есть поисковый запрос, используем поиск
    if (filters.search && filters.search.trim() !== '') {
        recipes = window.db?.searchRecipes?.(filters.search) || [];
    } else {
        recipes = window.db?.getRecipes?.() || [];
    }
    
    // Применяем дополнительные фильтры
    if (filters.category) {
        recipes = recipes.filter(r => r.categoryId == filters.category);
    }
    
    if (filters.difficulty) {
        recipes = recipes.filter(r => r.difficulty === filters.difficulty);
    }
    
    if (filters.maxTime) {
        recipes = recipes.filter(r => r.cookingTime <= parseInt(filters.maxTime));
    }
    
    // Сортировка
    if (filters.sort) {
        switch(filters.sort) {
            case 'popular':
                recipes.sort((a, b) => b.views - a.views);
                break;
            case 'new':
                recipes.sort((a, b) => b.id - a.id);
                break;
            case 'rating':
                recipes.sort((a, b) => b.rating - a.rating);
                break;
            case 'time':
                recipes.sort((a, b) => a.cookingTime - b.cookingTime);
                break;
            case 'favorites':
                recipes.sort((a, b) => b.favorites - a.favorites);
                break;
        }
    }
    
    displayRecipes(recipes);
}

// Обновленная функция отображения рецептов
function displayRecipes(recipes) {
    const recipesGrid = document.getElementById('recipesGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    if (!recipesGrid) return;
    
    if (recipes.length === 0) {
        noResults?.classList.remove('hidden');
        recipesGrid.innerHTML = '';
        resultsCount.textContent = 'Найдено 0 рецептов';
        return;
    }
    
    noResults?.classList.add('hidden');
    resultsCount.textContent = `Найдено ${recipes.length} рецептов`;
    
    recipesGrid.innerHTML = recipes.map(recipe => {
        const categoryName = getCategoryName(recipe.categoryId);
        
        return `
            <div class="recipe-card">
                <div class="recipe-image">
                    <i class="fas fa-utensils fa-3x"></i>
                </div>
                <div class="recipe-content">
                    <div class="recipe-category">${categoryName}</div>
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.cookingTime} мин</span>
                        <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
                        <span><i class="fas fa-eye"></i> ${recipe.views || 0}</span>
                    </div>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-footer">
                        <div class="recipe-rating">
                            <i class="fas fa-star"></i>
                            <span>${recipe.rating || '4.5'}</span>
                        </div>
                        <a href="pages/recipe.html?id=${recipe.id}" class="btn btn-primary">
                            <i class="fas fa-book-open"></i>
                            <span>Открыть</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Мобильное меню
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
}

// Загрузка популярных рецептов (обновленная)
function loadPopularRecipes() {
    const recipesGrid = document.getElementById('popularRecipes');
    if (!recipesGrid) return;
    
    // Используем новую функцию getPopularRecipes из db.js
    const popularRecipes = window.db?.getPopularRecipes?.(6) || window.db?.recipes?.slice(0, 6) || [];
    
    recipesGrid.innerHTML = popularRecipes.map(recipe => {
        const categoryName = getCategoryName(recipe.categoryId);
        
        return `
            <div class="recipe-card">
                <div class="recipe-image">
                    <i class="fas fa-utensils fa-3x"></i>
                </div>
                <div class="recipe-content">
                    <div class="recipe-category">${categoryName}</div>
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.cookingTime} мин</span>
                        <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
                    </div>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-footer">
                        <div class="recipe-rating">
                            <i class="fas fa-star"></i>
                            <span>${recipe.rating || '4.5'}</span>
                        </div>
                        <a href="pages/recipe.html?id=${recipe.id}" class="btn btn-primary">
                            <i class="fas fa-book-open"></i>
                            <span>Открыть</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Фильтры в каталоге
function initFilters() {
    const filterForm = document.getElementById('filterForm');
    const recipesGrid = document.getElementById('recipesGrid');
    
    if (!filterForm || !recipesGrid) return;
    
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        filterRecipes();
    });
    
    filterForm.addEventListener('change', filterRecipes);
}

// Система комментариев
function initComments() {
    const commentForm = document.getElementById('commentForm');
    const commentsList = document.getElementById('commentsList');
    
    if (!commentForm || !commentsList) return;
    
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(commentForm);
        const comment = {
            id: Date.now(),
            recipeId: getRecipeIdFromUrl(),
            userId: getCurrentUser()?.id,
            userName: getCurrentUser()?.login || 'Аноним',
            text: formData.get('comment'),
            rating: formData.get('rating'),
            date: new Date().toLocaleDateString('ru-RU'),
            likes: 0
        };
        
        if (!comment.text.trim()) {
            alert('Пожалуйста, введите комментарий');
            return;
        }
        
        // Сохраняем комментарий через новую функцию
        window.db?.addComment?.(comment);
        
        // Очищаем форму
        commentForm.reset();
        
        // Добавляем комментарий в список
        addCommentToDOM(comment);
    });
    
    // Загружаем существующие комментарии
    loadComments();
}

function loadComments() {
    const recipeId = getRecipeIdFromUrl();
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    const comments = window.db?.getCommentsByRecipe?.(recipeId) || [];
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.userName}</span>
                <span class="comment-date">${comment.date}</span>
                <div class="comment-rating">
                    ${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)}
                </div>
            </div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-footer">
                <button class="like-btn" data-id="${comment.id}">
                    <i class="fas fa-thumbs-up"></i>
                    <span>${comment.likes}</span>
                </button>
            </div>
        </div>
    `).join('');
}

function addCommentToDOM(comment) {
    const commentsList = document.getElementById('commentsList');
    const commentHTML = `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.userName}</span>
                <span class="comment-date">${comment.date}</span>
                <div class="comment-rating">
                    ${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)}
                </div>
            </div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-footer">
                <button class="like-btn" data-id="${comment.id}">
                    <i class="fas fa-thumbs-up"></i>
                    <span>${comment.likes}</span>
                </button>
            </div>
        </div>
    `;
    
    commentsList.insertAdjacentHTML('afterbegin', commentHTML);
}

// Система избранного
function initFavorites() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.favorite-btn')) {
            const btn = e.target.closest('.favorite-btn');
            const recipeId = btn.dataset.id;
            const user = window.db?.getCurrentUser?.();
            
            if (!user) {
                window.location.href = 'pages/auth.html';
                return;
            }
            
            if (window.db?.isRecipeInFavorites?.(user.id, recipeId)) {
                window.db?.removeFromFavorites?.(user.id, recipeId);
                btn.innerHTML = '<i class="far fa-heart"></i>';
            } else {
                window.db?.addToFavorites?.(user.id, recipeId);
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            }
        }
    });
}

// Вспомогательные функции
function getRecipeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getCurrentUser() {
    return window.db?.getCurrentUser?.();
}

// Инициализация формы рецепта
function initRecipeForm() {
    // Код для формы добавления рецепта
}