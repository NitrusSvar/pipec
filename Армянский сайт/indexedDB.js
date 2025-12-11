// indexedDB.js - полноценная база данных на IndexedDB
class ArmenianFlavorsDB {
    constructor() {
        this.dbName = 'ArmenianFlavorsDB';
        this.dbVersion = 2;
        this.db = null;
        this.initialized = false;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    // Инициализация базы данных
    async init() {
        if (this.initialized && this.db) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Ошибка открытия IndexedDB:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.initialized = true;
                console.log('IndexedDB успешно инициализирована');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('Обновление базы данных до версии:', this.dbVersion);
                
                // Создаем хранилище для пользователей
                if (!db.objectStoreNames.contains('users')) {
                    console.log('Создаем хранилище users');
                    const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    usersStore.createIndex('login', 'login', { unique: true });
                    usersStore.createIndex('email', 'email', { unique: true });
                    
                    // Добавляем начальных пользователей
                    const transaction = event.target.transaction;
                    const store = transaction.objectStore('users');
                    
                    const initialUsers = [
                        { id: 1, login: "admin", email: "admin@test.ru", password: "123", avatar: "", createdAt: "2024-01-01" },
                        { id: 2, login: "армен", email: "armen@mail.ru", password: "123", avatar: "", createdAt: "2024-02-15" },
                        { id: 3, login: "гаяне", email: "gayane@mail.ru", password: "123", avatar: "", createdAt: "2024-03-10" }
                    ];
                    
                    initialUsers.forEach(user => {
                        const request = store.add(user);
                        request.onerror = (e) => console.error('Ошибка добавления пользователя:', e.target.error);
                    });
                }

                // Создаем хранилище для категорий
                if (!db.objectStoreNames.contains('categories')) {
                    console.log('Создаем хранилище categories');
                    const categoriesStore = db.createObjectStore('categories', { keyPath: 'id' });
                    categoriesStore.createIndex('name', 'name', { unique: true });
                    
                    const transaction = event.target.transaction;
                    const store = transaction.objectStore('categories');
                    
                    const initialCategories = [
                        { id: 1, name: "Супы" },
                        { id: 2, name: "Основные блюда" },
                        { id: 3, name: "Выпечка" },
                        { id: 4, name: "Закуски" },
                        { id: 5, name: "Десерты" },
                        { id: 6, name: "Напитки" }
                    ];
                    
                    initialCategories.forEach(category => {
                        const request = store.add(category);
                        request.onerror = (e) => console.error('Ошибка добавления категории:', e.target.error);
                    });
                }

                // Создаем хранилище для рецептов
                if (!db.objectStoreNames.contains('recipes')) {
                    console.log('Создаем хранилище recipes');
                    const recipesStore = db.createObjectStore('recipes', { keyPath: 'id' });
                    recipesStore.createIndex('categoryId', 'categoryId', { unique: false });
                    recipesStore.createIndex('userId', 'userId', { unique: false });
                    recipesStore.createIndex('title', 'title', { unique: false });
                    recipesStore.createIndex('difficulty', 'difficulty', { unique: false });
                    recipesStore.createIndex('cookingTime', 'cookingTime', { unique: false });
                    
                    // Добавляем все 40 рецептов
                    const transaction = event.target.transaction;
                    const store = transaction.objectStore('recipes');
                    
                    // Все 40 рецептов из db.js
                    const initialRecipes = [
                        // Супы (5 рецептов)
                        {
                            id: 1,
                            title: "Хаш",
                            description: "Традиционный армянский суп из говяжьих ножек",
                            cookingTime: 360,
                            difficulty: "Сложная",
                            categoryId: 1,
                            userId: 1,
                            steps: [
                                "Тщательно промойте говяжьи ножки",
                                "Замочите ножки в холодной воде на 12 часов",
                                "Варите ножки на медленном огне 6-8 часов",
                                "Подавайте горячим с чесноком и лавашом"
                            ],
                            ingredients: [
                                "Говяжьи ножки - 2 кг",
                                "Чеснок - 1 головка",
                                "Лаваш - 4 шт",
                                "Соль - 1 ст.л.",
                                "Перец черный - 1 ч.л."
                            ],
                            rating: 4.8,
                            favorites: 203,
                            views: 1500,
                            tips: "Подавать с мацони и зеленью",
                            history: "Один из древнейших армянских супов, традиционно готовится зимой",
                            createdAt: "2024-01-01"
                        },
                        {
                            id: 2,
                            title: "Бозбаш",
                            description: "Густой суп с бараниной и овощами",
                            cookingTime: 120,
                            difficulty: "Средняя",
                            categoryId: 1,
                            userId: 2,
                            steps: [
                                "Обжарьте баранину до золотистой корочки",
                                "Добавьте нарезанный лук и морковь",
                                "Залейте водой и варите 1.5 часа",
                                "Добавьте картофель и тушите до готовности"
                            ],
                            ingredients: [
                                "Баранина - 800 г",
                                "Картофель - 500 г",
                                "Лук репчатый - 2 шт",
                                "Морковь - 2 шт",
                                "Томатная паста - 3 ст.л.",
                                "Зелень петрушки - 1 пучок"
                            ],
                            rating: 4.5,
                            favorites: 156,
                            views: 1200,
                            createdAt: "2024-01-02"
                        },
                        {
                            id: 3,
                            title: "Спас",
                            description: "Кисломолочный суп с зеленью и пшеницей",
                            cookingTime: 60,
                            difficulty: "Легкая",
                            categoryId: 1,
                            userId: 1,
                            steps: [
                                "Доведите мацони до кипения на медленном огне",
                                "Добавьте промытую пшеницу",
                                "Варите 40 минут, постоянно помешивая",
                                "Добавьте зелень и подавайте"
                            ],
                            ingredients: [
                                "Мацони - 1 л",
                                "Пшеница - 200 г",
                                "Укроп - 30 г",
                                "Петрушка - 30 г",
                                "Кинза - 20 г",
                                "Соль - 1 ч.л."
                            ],
                            rating: 4.3,
                            favorites: 98,
                            views: 850,
                            createdAt: "2024-01-03"
                        },
                        {
                            id: 4,
                            title: "Ариса",
                            description: "Кашеобразный суп из курицы и пшеницы",
                            cookingTime: 180,
                            difficulty: "Средняя",
                            categoryId: 1,
                            userId: 3,
                            steps: [
                                "Варите курицу до готовности",
                                "Отделите мясо от костей",
                                "Добавьте пшеницу и варите до размягчения",
                                "Верните мясо в суп и подавайте"
                            ],
                            ingredients: [
                                "Курица - 1.2 кг",
                                "Пшеница - 300 g",
                                "Лук репчатый - 2 шт",
                                "Сливочное масло - 50 г",
                                "Соль - 1.5 ч.л.",
                                "Перец черный - 0.5 ч.л."
                            ],
                            rating: 4.6,
                            favorites: 112,
                            views: 920,
                            createdAt: "2024-01-04"
                        },
                        {
                            id: 5,
                            title: "Танапур",
                            description: "Суп из йогурта с ячменем и мятой",
                            cookingTime: 45,
                            difficulty: "Легкая",
                            categoryId: 1,
                            userId: 2,
                            steps: [
                                "Смешайте йогурт с водой",
                                "Добавьте отваренный ячмень",
                                "Доведите до кипения на медленном огне",
                                "Добавьте мяту и подавайте"
                            ],
                            ingredients: [
                                "Йогурт натуральный - 800 мл",
                                "Ячмень - 150 г",
                                "Свежая мята - 20 г",
                                "Соль - 1 ч.л.",
                                "Чеснок - 3 зубчика"
                            ],
                            rating: 4.2,
                            favorites: 76,
                            views: 680,
                            createdAt: "2024-01-05"
                        },
                        
                        // Основные блюда (10 рецептов)
                        {
                            id: 6,
                            title: "Долма",
                            description: "Виноградные листья, фаршированные мясом и рисом",
                            cookingTime: 120,
                            difficulty: "Средняя",
                            categoryId: 2,
                            userId: 1,
                            steps: [
                                "Приготовьте фарш из мяса, риса и зелени",
                                "Заверните фарш в виноградные листья",
                                "Уложите в кастрюлю, добавьте воду",
                                "Тушите на медленном огне 1.5 часа"
                            ],
                            ingredients: [
                                "Виноградные листья - 50 шт",
                                "Говяжий фарш - 500 г",
                                "Рис - 200 г",
                                "Лук репчатый - 3 шт",
                                "Зелень петрушки - 50 г",
                                "Томатная паста - 2 ст.л."
                            ],
                            rating: 4.9,
                            favorites: 345,
                            views: 2800,
                            createdAt: "2024-01-06"
                        },
                        {
                            id: 7,
                            title: "Хоровац",
                            description: "Армянский шашлык на углях",
                            cookingTime: 90,
                            difficulty: "Средняя",
                            categoryId: 2,
                            userId: 2,
                            steps: [
                                "Нарежьте мясо кубиками",
                                "Маринуйте в луке и специях 2 часа",
                                "Нанижите на шампуры",
                                "Жарьте на углях до готовности"
                            ],
                            ingredients: [
                                "Свиная шея - 1.5 кг",
                                "Лук репчатый - 4 шт",
                                "Перец болгарский - 3 шт",
                                "Базилик сушеный - 1 ст.л.",
                                "Кориандр молотый - 1 ч.л.",
                                "Соль - 2 ч.л."
                            ],
                            rating: 4.8,
                            favorites: 298,
                            views: 2500,
                            createdAt: "2024-01-07"
                        },
                        {
                            id: 8,
                            title: "Кюфта",
                            description: "Мясные шарики в бульоне",
                            cookingTime: 150,
                            difficulty: "Сложная",
                            categoryId: 2,
                            userId: 3,
                            steps: [
                                "Приготовьте фарш из мяса и булгура",
                                "Сформируйте шарики с начинкой из масла",
                                "Аккуратно варите в бульоне",
                                "Подавайте с бульоном и зеленью"
                            ],
                            ingredients: [
                                "Бараний фарш - 800 г",
                                "Булгур - 150 г",
                                "Лук репчатый - 2 шт",
                                "Сливочное масло - 100 г",
                                "Яйцо - 2 шт",
                                "Паприка сладкая - 1 ст.л."
                            ],
                            rating: 4.7,
                            favorites: 187,
                            views: 1600,
                            createdAt: "2024-01-08"
                        },
                        {
                            id: 9,
                            title: "Лахмаджун",
                            description: "Армянская пицца с мясной начинкой",
                            cookingTime: 60,
                            difficulty: "Средняя",
                            categoryId: 2,
                            userId: 1,
                            steps: [
                                "Приготовьте тесто для основы",
                                "Смешайте фарш с овощами и специями",
                                "Раскатайте тесто, выложите начинку",
                                "Выпекайте в духовке 10-15 минут"
                            ],
                            ingredients: [
                                "Мука - 500 г",
                                "Говяжий фарш - 400 г",
                                "Помидоры - 3 шт",
                                "Болгарский перец - 2 шт",
                                "Лук репчатый - 2 шт",
                                "Петрушка - 30 г"
                            ],
                            rating: 4.6,
                            favorites: 234,
                            views: 1900,
                            createdAt: "2024-01-09"
                        },
                        {
                            id: 10,
                            title: "Толма",
                            description: "Фаршированные овощи (перец, баклажаны, помидоры)",
                            cookingTime: 120,
                            difficulty: "Средняя",
                            categoryId: 2,
                            userId: 2,
                            steps: [
                                "Подготовьте овощи, удалите сердцевину",
                                "Приготовьте фарш из мяса и риса",
                                "Нафаршируйте овощи",
                                "Тушите в томатном соусе 1 час"
                            ],
                            ingredients: [
                                "Болгарский перец - 6 шт",
                                "Баклажаны - 4 шт",
                                "Помидоры - 6 шт",
                                "Говяжий фарш - 600 г",
                                "Рис - 200 г",
                                "Зелень кинзы - 40 г"
                            ],
                            rating: 4.5,
                            favorites: 167,
                            views: 1400,
                            createdAt: "2024-01-10"
                        },
                        {
                            id: 11,
                            title: "Мшош",
                            description: "Чечевица с сухофруктами и орехами",
                            cookingTime: 90,
                            difficulty: "Легкая",
                            categoryId: 2,
                            userId: 3,
                            steps: [
                                "Отварите чечевицу до готовности",
                                "Обжарьте лук с сухофруктами",
                                "Смешайте с чечевицей",
                                "Посыпьте орехами и подавайте"
                            ],
                            ingredients: [
                                "Чечевица красная - 300 г",
                                "Курага - 150 г",
                                "Чернослив - 100 г",
                                "Грецкие орехи - 100 г",
                                "Лук репчатый - 2 шт",
                                "Растительное масло - 3 ст.л."
                            ],
                            rating: 4.4,
                            favorites: 123,
                            views: 1050,
                            createdAt: "2024-01-11"
                        },
                        {
                            id: 12,
                            title: "Женгялов хац",
                            description: "Лепешка с зеленью и сыром",
                            cookingTime: 45,
                            difficulty: "Легкая",
                            categoryId: 2,
                            userId: 1,
                            steps: [
                                "Приготовьте тесто для лаваша",
                                "Смешайте зелень с сыром",
                                "Выложите начинку на тесто",
                                "Выпекайте в тандыре 5-7 минут"
                            ],
                            ingredients: [
                                "Мука - 400 г",
                                "Шпинат - 200 г",
                                "Кинза - 50 г",
                                "Укроп - 50 г",
                                "Сыр сулугуни - 300 г",
                                "Сливочное масло - 80 г"
                            ],
                            rating: 4.7,
                            favorites: 198,
                            views: 1750,
                            createdAt: "2024-01-12"
                        },
                        {
                            id: 13,
                            title: "Хашлама",
                            description: "Тушеная баранина с овощами",
                            cookingTime: 180,
                            difficulty: "Средняя",
                            categoryId: 2,
                            userId: 2,
                            steps: [
                                "Обжарьте баранину до румяной корочки",
                                "Добавьте нарезанные овощи",
                                "Залейте водой и тушите 2.5 часа",
                                "Подавайте с зеленью"
                            ],
                            ingredients: [
                                "Баранина - 1 кг",
                                "Картофель - 800 г",
                                "Морковь - 3 шт",
                                "Лук репчатый - 3 шт",
                                "Чеснок - 5 зубчиков",
                                "Болгарский перец - 3 шт"
                            ],
                            rating: 4.6,
                            favorites: 154,
                            views: 1350,
                            createdAt: "2024-01-13"
                        },
                        {
                            id: 14,
                            title: "Бастурма",
                            description: "Вяленая говядина с чесночным соусом",
                            cookingTime: 1440, // 24 часа
                            difficulty: "Сложная",
                            categoryId: 2,
                            userId: 3,
                            steps: [
                                "Замаринуйте мясо в специях",
                                "Подвесьте для сушки на 3 недели",
                                "Нарежьте тонкими ломтиками",
                                "Подавайте с чесночным соусом"
                            ],
                            ingredients: [
                                "Говяжья вырезка - 2 кг",
                                "Чеснок - 10 зубчиков",
                                "Паприка - 3 ст.л.",
                                "Тмин молотый - 1 ст.л.",
                                "Кориандр молотый - 1 ст.л.",
                                "Соль морская - 100 г"
                            ],
                            rating: 4.8,
                            favorites: 89,
                            views: 950,
                            createdAt: "2024-01-14"
                        },
                        {
                            id: 15,
                            title: "Ишхан на гриле",
                            description: "Форель, приготовленная на углях",
                            cookingTime: 40,
                            difficulty: "Легкая",
                            categoryId: 2,
                            userId: 1,
                            steps: [
                                "Почистите и промойте рыбу",
                                "Натрите солью и специями",
                                "Жарьте на гриле по 15 минут с каждой стороны",
                                "Подавайте с лимоном и зеленью"
                            ],
                            ingredients: [
                                "Форель - 2 шт (по 500 г)",
                                "Лимон - 2 шт",
                                "Оливковое масло - 4 ст.л.",
                                "Укроп - 30 г",
                                "Соль - 1.5 ч.л.",
                                "Перец черный - 1 ч.л."
                            ],
                            rating: 4.5,
                            favorites: 132,
                            views: 1100,
                            createdAt: "2024-01-15"
                        },
                        
                        // Выпечка (5 рецептов)
                        {
                            id: 16,
                            title: "Лаваш",
                            description: "Тонкий армянский хлеб",
                            cookingTime: 120,
                            difficulty: "Средняя",
                            categoryId: 3,
                            userId: 1,
                            steps: [
                                "Замесите тесто из муки, воды и соли",
                                "Дайте тесту отдохнуть 1 час",
                                "Раскатайте в тонкие лепешки",
                                "Выпекайте в тандыре 1-2 минуты"
                            ],
                            ingredients: [
                                "Мука пшеничная - 1 кг",
                                "Вода теплая - 600 мл",
                                "Соль - 2 ч.л.",
                                "Дрожжи сухие - 10 г (опционально)"
                            ],
                            rating: 4.9,
                            favorites: 278,
                            views: 2200,
                            createdAt: "2024-01-16"
                        },
                        {
                            id: 17,
                            title: "Гата",
                            description: "Сладкая слоеная выпечка",
                            cookingTime: 90,
                            difficulty: "Сложная",
                            categoryId: 3,
                            userId: 2,
                            steps: [
                                "Приготовьте слоеное тесто",
                                "Сделайте начинку из муки, масла и сахара",
                                "Сформируйте гату, нанесите узоры",
                                "Выпекайте 30-40 минут до золотистого цвета"
                            ],
                            ingredients: [
                                "Мука - 800 г",
                                "Сливочное масло - 400 г",
                                "Сахар - 300 g",
                                "Яйцо - 2 шт",
                                "Ванилин - 1 ч.л.",
                                "Сметана - 200 г"
                            ],
                            rating: 4.7,
                            favorites: 203,
                            views: 1800,
                            createdAt: "2024-01-17"
                        },
                        {
                            id: 18,
                            title: "Назук",
                            description: "Мягкая сладкая булочка",
                            cookingTime: 60,
                            difficulty: "Средняя",
                            categoryId: 3,
                            userId: 3,
                            steps: [
                                "Замесите дрожжевое тесто",
                                "Добавьте масло и сахар",
                                "Сформируйте булочки",
                                "Выпекайте 20-25 минут"
                            ],
                            ingredients: [
                                "Мука - 600 г",
                                "Дрожжи сухие - 20 г",
                                "Молоко - 300 мл",
                                "Сливочное масло - 150 г",
                                "Сахар - 100 г",
                                "Яйцо - 1 шт"
                            ],
                            rating: 4.6,
                            favorites: 156,
                            views: 1400,
                            createdAt: "2024-01-18"
                        },
                        {
                            id: 19,
                            title: "Матах",
                            description: "Ритуальный хлеб с медом",
                            cookingTime: 180,
                            difficulty: "Сложная",
                            categoryId: 3,
                            userId: 1,
                            steps: [
                                "Приготовьте пресное тесто",
                                "Выпеките круглые лепешки",
                                "Смажьте медом и маслом",
                                "Освятите по традиции"
                            ],
                            ingredients: [
                                "Мука - 500 г",
                                "Вода - 250 мл",
                                "Соль - 1 ч.л.",
                                "Мед - 200 г",
                                "Сливочное масло - 100 г"
                            ],
                            rating: 4.4,
                            favorites: 67,
                            views: 750,
                            createdAt: "2024-01-19"
                        },
                        {
                            id: 20,
                            title: "Борек",
                            description: "Слоеные пирожки с сыром",
                            cookingTime: 75,
                            difficulty: "Средняя",
                            categoryId: 3,
                            userId: 2,
                            steps: [
                                "Раскатайте слоеное тесто",
                                "Приготовьте начинку из сыра и зелени",
                                "Сформируйте треугольники",
                                "Выпекайте 25-30 минут"
                            ],
                            ingredients: [
                                "Слоеное тесто - 500 г",
                                "Сыр фета - 300 г",
                                "Творог - 200 г",
                                "Укроп - 40 г",
                                "Яйцо - 1 шт",
                                "Кунжут - 2 ст.л."
                            ],
                            rating: 4.8,
                            favorites: 189,
                            views: 1600,
                            createdAt: "2024-01-20"
                        },
                        
                        // Закуски (5 рецептов)
                        {
                            id: 21,
                            title: "Лоби",
                            description: "Салат из фасоли с грецкими орехами",
                            cookingTime: 120,
                            difficulty: "Легкая",
                            categoryId: 4,
                            userId: 3,
                            steps: [
                                "Замочите фасоль на ночь",
                                "Отварите фасоль до готовности",
                                "Смешайте с орехами и луком",
                                "Заправьте маслом и специями"
                            ],
                            ingredients: [
                                "Фасоль красная - 300 г",
                                "Грецкие орехи - 150 г",
                                "Лук красный - 2 шт",
                                "Кинза - 30 г",
                                "Растительное масло - 4 ст.л.",
                                "Лимонный сок - 3 ст.л."
                            ],
                            rating: 4.5,
                            favorites: 134,
                            views: 1150,
                            createdAt: "2024-01-21"
                        },
                        {
                            id: 22,
                            title: "Мутабаль",
                            description: "Закуска из баклажанов",
                            cookingTime: 60,
                            difficulty: "Легкая",
                            categoryId: 4,
                            userId: 1,
                            steps: [
                                "Запеките баклажаны до мягкости",
                                "Очистите от кожицы",
                                "Разомните с чесноком и специями",
                                "Подавайте с лавашом"
                            ],
                            ingredients: [
                                "Баклажаны - 3 шт",
                                "Чеснок - 4 зубчика",
                                "Тахини - 3 ст.л.",
                                "Лимонный сок - 2 ст.л.",
                                "Оливковое масло - 2 ст.л.",
                                "Петрушка - 20 г"
                            ],
                            rating: 4.6,
                            favorites: 145,
                            views: 1250,
                            createdAt: "2024-01-22"
                        },
                        {
                            id: 23,
                            title: "Джуджук",
                            description: "Острая колбаса с чесноком",
                            cookingTime: 180,
                            difficulty: "Средняя",
                            categoryId: 4,
                            userId: 2,
                            steps: [
                                "Приготовьте фарш из говядины",
                                "Добавьте специи и чеснок",
                                "Начините колбасные оболочки",
                                "Подсушите в течение 2 недель"
                            ],
                            ingredients: [
                                "Говядина - 1.5 кг",
                                "Чеснок - 8 зубчиков",
                                "Паприка острая - 2 ст.л.",
                                "Перец чили молотый - 1 ч.л.",
                                "Тмин - 1 ст.л.",
                                "Соль - 50 г"
                            ],
                            rating: 4.7,
                            favorites: 98,
                            views: 900,
                            createdAt: "2024-01-23"
                        },
                        {
                            id: 24,
                            title: "Пасуц толма",
                            description: "Постные голубцы с чечевицей",
                            cookingTime: 90,
                            difficulty: "Средняя",
                            categoryId: 4,
                            userId: 3,
                            steps: [
                                "Приготовьте начинку из чечевицы",
                                "Заверните в капустные листья",
                                "Уложите в кастрюлю",
                                "Тушите в томатном соусе 1 час"
                            ],
                            ingredients: [
                                "Капустные листья - 15 шт",
                                "Чечевица зеленая - 250 г",
                                "Лук репчатый - 2 шт",
                                "Морковь - 2 шт",
                                "Томатная паста - 3 ст.л.",
                                "Зелень петрушки - 30 г"
                            ],
                            rating: 4.4,
                            favorites: 112,
                            views: 950,
                            createdAt: "2024-01-24"
                        },
                        {
                            id: 25,
                            title: "СпанАч",
                            description: "Шпинатный паштет",
                            cookingTime: 45,
                            difficulty: "Легкая",
                            categoryId: 4,
                            userId: 1,
                            steps: [
                                "Бланшируйте шпинат",
                                "Измельчите в блендере",
                                "Добавьте орехи и специи",
                                "Подавайте охлажденным"
                            ],
                            ingredients: [
                                "Шпинат свежий - 500 г",
                                "Грецкие орехи - 100 г",
                                "Чеснок - 3 зубчика",
                                "Лимонный сок - 2 ст.л.",
                                "Оливковое масло - 3 ст.л.",
                                "Соль - 1 ч.л."
                            ],
                            rating: 4.3,
                            favorites: 89,
                            views: 800,
                            createdAt: "2024-01-25"
                        },
                        
                        // Десерты (5 рецептов)
                        {
                            id: 26,
                            title: "Пахлава",
                            description: "Слоеный десерт с орехами и медом",
                            cookingTime: 150,
                            difficulty: "Сложная",
                            categoryId: 5,
                            userId: 2,
                            steps: [
                                "Приготовьте слоеное тесто",
                                "Измельчите орехи с сахаром",
                                "Выложите слоями тесто и начинку",
                                "Выпекайте 45 минут, залейте сиропом"
                            ],
                            ingredients: [
                                "Слоеное тесто - 500 г",
                                "Грецкие орехи - 400 г",
                                "Мед - 300 g",
                                "Сахар - 200 г",
                                "Корица молотая - 2 ч.л.",
                                "Гвоздика молотая - 0.5 ч.л."
                            ],
                            rating: 4.9,
                            favorites: 245,
                            views: 2000,
                            createdAt: "2024-01-26"
                        },
                        {
                            id: 27,
                            title: "Назук с изюмом",
                            description: "Сладкие булочки с изюмом",
                            cookingTime: 70,
                            difficulty: "Средняя",
                            categoryId: 5,
                            userId: 3,
                            steps: [
                                "Замесите дрожжевое тесто",
                                "Добавьте изюм и специи",
                                "Сформируйте булочки",
                                "Выпекайте 25-30 минут"
                            ],
                            ingredients: [
                                "Мука - 600 г",
                                "Дрожжи сухие - 20 g",
                                "Изюм - 200 г",
                                "Сахар - 150 г",
                                "Молоко - 300 мл",
                                "Яйцо - 1 шт",
                                "Корица - 1 ст.л."
                            ],
                            rating: 4.7,
                            favorites: 167,
                            views: 1450,
                            createdAt: "2024-01-27"
                        },
                        {
                            id: 28,
                            title: "Алани",
                            description: "Фаршированные персики",
                            cookingTime: 120,
                            difficulty: "Средняя",
                            categoryId: 5,
                            userId: 1,
                            steps: [
                                "Подготовьте сушеные персики",
                                "Приготовьте начинку из орехов",
                                "Нафаршируйте персики",
                                "Подавайте с медом"
                            ],
                            ingredients: [
                                "Сушеные персики - 20 шт",
                                "Грецкие орехи - 200 г",
                                "Мед - 150 г",
                                "Корица молотая - 1 ч.л.",
                                "Сахарная пудра - 50 г"
                            ],
                            rating: 4.6,
                            favorites: 123,
                            views: 1100,
                            createdAt: "2024-01-28"
                        },
                        {
                            id: 29,
                            title: "Кята",
                            description: "Сладкие печенья с кунжутом",
                            cookingTime: 60,
                            difficulty: "Легкая",
                            categoryId: 5,
                            userId: 2,
                            steps: [
                                "Замесите песочное тесто",
                                "Сформируйте печенья",
                                "Посыпьте кунжутом",
                                "Выпекайте 20-25 минут"
                            ],
                            ingredients: [
                                "Мука - 400 г",
                                "Сливочное масло - 250 г",
                                "Сахар - 150 г",
                                "Яйцо - 1 шт",
                                "Кунжут - 100 г",
                                "Ванилин - 1 ч.л."
                            ],
                            rating: 4.5,
                            favorites: 145,
                            views: 1250,
                            createdAt: "2024-01-29"
                        },
                        {
                            id: 30,
                            title: "Шароц",
                            description: "Фруктовый пастила",
                            cookingTime: 240,
                            difficulty: "Сложная",
                            categoryId: 5,
                            userId: 3,
                            steps: [
                                "Приготовьте пюре из слив",
                                "Уварите до густой консистенции",
                                "Распределите тонким слоем",
                                "Сушите на солнце 2-3 дня"
                            ],
                            ingredients: [
                                "Сливы - 2 кг",
                                "Сахар - 300 г",
                                "Корица молотая - 1 ч.л.",
                                "Гвоздика молотая - 0.5 ч.л."
                            ],
                            rating: 4.4,
                            favorites: 78,
                            views: 850,
                            createdAt: "2024-01-30"
                        },
                        
                        // Напитки (3 рецепта)
                        {
                            id: 31,
                            title: "Тархун",
                            description: "Ароматный напиток из эстрагона",
                            cookingTime: 30,
                            difficulty: "Легкая",
                            categoryId: 6,
                            userId: 1,
                            steps: [
                                "Приготовьте отвар из эстрагона",
                                "Добавьте сахар и лимонную кислоту",
                                "Охладите",
                                "Подавайте со льдом"
                            ],
                            ingredients: [
                                "Эстрагон свежий - 100 г",
                                "Сахар - 200 г",
                                "Лимонная кислота - 1 ч.л.",
                                "Вода - 2 л"
                            ],
                            rating: 4.3,
                            favorites: 156,
                            views: 1300,
                            createdAt: "2024-01-31"
                        },
                        {
                            id: 32,
                            title: "Мацун",
                            description: "Армянский йогурт",
                            cookingTime: 480,
                            difficulty: "Средняя",
                            categoryId: 6,
                            userId: 2,
                            steps: [
                                "Подогрейте молоко до 40°C",
                                "Добавьте закваску",
                                "Укутайте и оставьте на 8 часов",
                                "Охладите перед подачей"
                            ],
                            ingredients: [
                                "Молоко цельное - 1 л",
                                "Закваска для йогурта - 2 ст.л.",
                                "Соль - 0.5 ч.л. (по желанию)"
                            ],
                            rating: 4.7,
                            favorites: 189,
                            views: 1600,
                            createdAt: "2024-02-01"
                        },
                        {
                            id: 33,
                            title: "Сюзьма",
                            description: "Освежающий напиток из мацуна",
                            cookingTime: 10,
                            difficulty: "Легкая",
                            categoryId: 6,
                            userId: 3,
                            steps: [
                                "Разбавьте мацун холодной водой",
                                "Добавьте соль и зелень",
                                "Тщательно перемешайте",
                                "Подавайте охлажденным"
                            ],
                            ingredients: [
                                "Мацун - 500 г",
                                "Вода холодная - 300 мл",
                                "Соль - 0.5 ч.л.",
                                "Укроп - 20 г",
                                "Мята свежая - 10 г"
                            ],
                            rating: 4.5,
                            favorites: 134,
                            views: 1150,
                            createdAt: "2024-02-02"
                        },
                        
                        // Дополнительные рецепты (7 рецептов)
                        {
                            id: 34,
                            title: "Андун",
                            description: "Тушеная баранина с гранатовым соусом",
                            cookingTime: 150,
                            difficulty: "Средняя",
                            categoryId: 2,
                            userId: 1,
                            steps: [
                                "Обжарьте баранину",
                                "Добавьте лук и специи",
                                "Залейте гранатовым соком",
                                "Тушите до готовности"
                            ],
                            ingredients: [
                                "Баранина - 1 кг",
                                "Гранатовый сок - 500 мл",
                                "Лук репчатый - 3 шт",
                                "Кориандр молотый - 1 ст.л.",
                                "Базилик сушеный - 1 ст.л.",
                                "Соль - 1.5 ч.л."
                            ],
                            rating: 4.8,
                            favorites: 167,
                            views: 1450,
                            createdAt: "2024-02-03"
                        },
                        {
                            id: 35,
                            title: "Чихиртма",
                            description: "Куриный суп с яично-лимонной заправкой",
                            cookingTime: 90,
                            difficulty: "Средняя",
                            categoryId: 1,
                            userId: 2,
                            steps: [
                                "Сварите куриный бульон",
                                "Добавьте лук и специи",
                                "Приготовьте яично-лимонную смесь",
                                "Аккуратно соедините с бульоном"
                            ],
                            ingredients: [
                                "Курица - 1.5 кг",
                                "Яйца - 3 шт",
                                "Лимон - 2 шт",
                                "Лук репчатый - 2 шт",
                                "Мука - 2 ст.л.",
                                "Куркума - 1 ч.л."
                            ],
                            rating: 4.6,
                            favorites: 145,
                            views: 1250,
                            createdAt: "2024-02-04"
                        },
                        {
                            id: 36,
                            title: "Амич",
                            description: "Фаршированная курица с рисом и сухофруктами",
                            cookingTime: 180,
                            difficulty: "Сложная",
                            categoryId: 2,
                            userId: 3,
                            steps: [
                                "Подготовьте курицу для фарширования",
                                "Приготовьте начинку из риса и сухофруктов",
                                "Нафаршируйте курицу",
                                "Запекайте в духовке 2 часа"
                            ],
                            ingredients: [
                                "Курица целая - 2 кг",
                                "Рис - 300 г",
                                "Курага - 200 г",
                                "Изюм - 150 г",
                                "Грецкие орехи - 100 г",
                                "Корица - 1 ч.л."
                            ],
                            rating: 4.7,
                            favorites: 123,
                            views: 1100,
                            createdAt: "2024-02-05"
                        },
                        {
                            id: 37,
                            title: "Манта",
                            description: "Армянские пельмени с мясной начинкой",
                            cookingTime: 120,
                            difficulty: "Сложная",
                            categoryId: 2,
                            userId: 1,
                            steps: [
                                "Приготовьте тесто для манты",
                                "Сделайте фарш из мяса и лука",
                                "Сформируйте треугольные пельмени",
                                "Готовьте на пару 40 минут"
                            ],
                            ingredients: [
                                "Мука - 600 г",
                                "Говяжий фарш - 500 г",
                                "Лук репчатый - 3 шт",
                                "Йогурт натуральный - 400 г",
                                "Чеснок - 4 зубчика",
                                "Мята свежая - 20 г"
                            ],
                            rating: 4.9,
                            favorites: 201,
                            views: 1750,
                            createdAt: "2024-02-06"
                        },
                        {
                            id: 38,
                            title: "Зейтун лаваш",
                            description: "Лаваш с оливковой начинкой",
                            cookingTime: 60,
                            difficulty: "Средняя",
                            categoryId: 3,
                            userId: 2,
                            steps: [
                                "Приготовьте тесто для лаваша",
                                "Смешайте оливки с травами",
                                "Раскатайте тесто, выложите начинку",
                                "Выпекайте в тандыре"
                            ],
                            ingredients: [
                                "Мука - 500 г",
                                "Оливки без косточек - 300 г",
                                "Оливковое масло - 4 ст.л.",
                                "Чеснок - 3 зубчика",
                                "Орегано сушеный - 1 ст.л.",
                                "Соль морская - 1 ч.л."
                            ],
                            rating: 4.5,
                            favorites: 134,
                            views: 1150,
                            createdAt: "2024-02-07"
                        },
                        {
                            id: 39,
                            title: "Анушапура",
                            description: "Сладкий хлеб с фруктами",
                            cookingTime: 120,
                            difficulty: "Средняя",
                            categoryId: 5,
                            userId: 3,
                            steps: [
                                "Замесите дрожжевое тесто",
                                "Добавьте сухофрукты и орехи",
                                "Сформируйте круглый хлеб",
                                "Выпекайте 40-45 минут"
                            ],
                            ingredients: [
                                "Мука - 700 г",
                                "Дрожжи сухие - 25 g",
                                "Изюм - 200 г",
                                "Инжир сушеный - 150 г",
                                "Грецкие орехи - 150 г",
                                "Мед - 100 g"
                            ],
                            rating: 4.6,
                            favorites: 112,
                            views: 950,
                            createdAt: "2024-02-08"
                        },
                        {
                            id: 40,
                            title: "Балех",
                            description: "Соленая выпечка с травами",
                            cookingTime: 75,
                            difficulty: "Легкая",
                            categoryId: 3,
                            userId: 1,
                            steps: [
                                "Замесите пресное тесто",
                                "Добавьте травы и соль",
                                "Раскатайте тонкие лепешки",
                                "Выпекайте на сухой сковороде"
                            ],
                            ingredients: [
                                "Мука - 400 г",
                                "Вода - 200 мл",
                                "Соль - 1 ч.л.",
                                "Укроп свежий - 50 г",
                                "Кинза свежая - 30 г",
                                "Базилик свежий - 20 г"
                            ],
                            rating: 4.4,
                            favorites: 98,
                            views: 850,
                            createdAt: "2024-02-09"
                        }
                    ];
                    
                    initialRecipes.forEach(recipe => {
                        const request = store.add(recipe);
                        request.onerror = (e) => console.error('Ошибка добавления рецепта:', e.target.error);
                    });
                }

                // Создаем хранилище для комментариев
                if (!db.objectStoreNames.contains('comments')) {
                    console.log('Создаем хранилище comments');
                    const commentsStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
                    commentsStore.createIndex('recipeId', 'recipeId', { unique: false });
                    commentsStore.createIndex('userId', 'userId', { unique: false });
                    
                    // Добавляем начальные комментарии
                    const transaction = event.target.transaction;
                    const store = transaction.objectStore('comments');
                    
                    const initialComments = [
                        {
                            id: 1,
                            recipeId: 1,
                            userId: 2,
                            userName: "армен",
                            text: "Отличный рецепт хаша! Готовил в прошлые выходные, получилось очень вкусно.",
                            rating: 5,
                            date: "2024-01-15",
                            likes: 12
                        },
                        {
                            id: 2,
                            recipeId: 1,
                            userId: 3,
                            userName: "гаяне",
                            text: "Спасибо за подробное описание! Очень помогло с первым приготовлением.",
                            rating: 4,
                            date: "2024-01-20",
                            likes: 8
                        },
                        {
                            id: 3,
                            recipeId: 6,
                            userId: 2,
                            userName: "армен",
                            text: "Долма получилась идеальной! Семья в восторге.",
                            rating: 5,
                            date: "2024-02-10",
                            likes: 15
                        },
                        {
                            id: 4,
                            recipeId: 7,
                            userId: 3,
                            userName: "гаяне",
                            text: "Лучший шашлык, который я когда-либо готовила!",
                            rating: 5,
                            date: "2024-02-15",
                            likes: 20
                        }
                    ];
                    
                    initialComments.forEach(comment => {
                        const request = store.add(comment);
                        request.onerror = (e) => console.error('Ошибка добавления комментария:', e.target.error);
                    });
                }

                // Создаем хранилище для избранного
                if (!db.objectStoreNames.contains('favorites')) {
                    console.log('Создаем хранилище favorites');
                    const favoritesStore = db.createObjectStore('favorites', { keyPath: ['userId', 'recipeId'] });
                    favoritesStore.createIndex('userId', 'userId', { unique: false });
                    favoritesStore.createIndex('recipeId', 'recipeId', { unique: false });
                    
                    // Добавляем начальные избранные
                    const transaction = event.target.transaction;
                    const store = transaction.objectStore('favorites');
                    
                    const initialFavorites = [
                        { userId: 1, recipeId: 6, date: "2024-01-10" },
                        { userId: 1, recipeId: 16, date: "2024-01-12" },
                        { userId: 1, recipeId: 26, date: "2024-01-15" },
                        { userId: 2, recipeId: 7, date: "2024-02-01" },
                        { userId: 2, recipeId: 17, date: "2024-02-05" },
                        { userId: 3, recipeId: 1, date: "2024-02-10" },
                        { userId: 3, recipeId: 32, date: "2024-02-12" }
                    ];
                    
                    initialFavorites.forEach(fav => {
                        const request = store.add(fav);
                        request.onerror = (e) => console.error('Ошибка добавления в избранное:', e.target.error);
                    });
                }
            };
        });
    }

    // Базовые CRUD операции
    async addItem(storeName, item) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(item);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getItem(storeName, key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAllItems(storeName, indexName = null, query = null) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            let store = transaction.objectStore(storeName);
            
            if (indexName) {
                store = store.index(indexName);
            }

            let request;
            if (query) {
                if (typeof query === 'object' && query.range) {
                    // Используем IDBKeyRange для диапазона
                    request = store.getAll(query.range);
                } else {
                    request = store.getAll(query);
                }
            } else {
                request = store.getAll();
            }

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async updateItem(storeName, key, updates) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(key);

            getRequest.onsuccess = () => {
                const existingItem = getRequest.result;
                if (!existingItem) {
                    reject(new Error('Элемент не найден'));
                    return;
                }

                const updatedItem = { ...existingItem, ...updates };
                const putRequest = store.put(updatedItem);

                putRequest.onsuccess = () => resolve(updatedItem);
                putRequest.onerror = (event) => reject(event.target.error);
            };

            getRequest.onerror = (event) => reject(event.target.error);
        });
    }

    async deleteItem(storeName, key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // Методы для пользователей
    async getCurrentUser() {
        return this.currentUser;
    }

    async setCurrentUser(user) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    async login(email, password) {
        await this.init();
        
        // Ищем пользователя по email или login
        const users = await this.getAllItems('users');
        const user = users.find(u => 
            (u.email === email || u.login === email) && u.password === password
        );
        
        if (user) {
            await this.setCurrentUser(user);
            return user;
        }
        return null;
    }

    async logout() {
        await this.setCurrentUser(null);
    }

    async register(userData) {
        await this.init();
        
        // Проверяем, нет ли пользователя с таким email или логином
        const users = await this.getAllItems('users');
        const existingUser = users.find(u => 
            u.email === userData.email || u.login === userData.login
        );
        
        if (existingUser) {
            return null;
        }
        
        // Получаем максимальный ID
        const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
        
        const newUser = {
            id: maxId + 1,
            ...userData,
            avatar: userData.avatar || '',
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        const userId = await this.addItem('users', newUser);
        newUser.id = userId;
        
        await this.setCurrentUser(newUser);
        return newUser;
    }

    // Методы для рецептов
    async getRecipes() {
        return await this.getAllItems('recipes');
    }

    async getRecipeById(id) {
        return await this.getItem('recipes', Number(id));
    }

    async searchRecipes(query) {
        if (!query || query.trim() === '') {
            return await this.getRecipes();
        }
        
        const searchTerm = query.toLowerCase().trim();
        const recipes = await this.getRecipes();
        const categories = await this.getAllItems('categories');
        
        return recipes.filter(recipe => {
            // Поиск в названии
            if (recipe.title.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Поиск в описании
            if (recipe.description.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Поиск в ингредиентах
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                const hasIngredient = recipe.ingredients.some(ingredient => 
                    ingredient.toLowerCase().includes(searchTerm)
                );
                if (hasIngredient) return true;
            }
            
            // Поиск в категории
            const category = categories.find(c => c.id == recipe.categoryId);
            if (category && category.name.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            return false;
        });
    }

    async getRecipesByCategory(categoryId) {
        return await this.getAllItems('recipes', 'categoryId', Number(categoryId));
    }

    async getPopularRecipes(limit = 6) {
        const recipes = await this.getRecipes();
        return recipes
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, limit);
    }

    async getNewRecipes(limit = 6) {
        const recipes = await this.getRecipes();
        return recipes
            .sort((a, b) => b.id - a.id)
            .slice(0, limit);
    }

    async addRecipe(recipe) {
        await this.init();
        
        // Получаем максимальный ID
        const recipes = await this.getRecipes();
        const maxId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) : 0;
        
        const newRecipe = {
            id: maxId + 1,
            ...recipe,
            rating: recipe.rating || 0,
            favorites: recipe.favorites || 0,
            views: recipe.views || 0,
            createdAt: recipe.createdAt || new Date().toISOString().split('T')[0]
        };
        
        const recipeId = await this.addItem('recipes', newRecipe);
        return await this.getRecipeById(recipeId);
    }

    async updateRecipe(id, updates) {
        const recipe = await this.getRecipeById(id);
        if (!recipe) return null;
        
        const updatedRecipe = { ...recipe, ...updates };
        return await this.updateItem('recipes', Number(id), updatedRecipe);
    }

    async incrementRecipeViews(id) {
        const recipe = await this.getRecipeById(id);
        if (recipe) {
            recipe.views = (recipe.views || 0) + 1;
            await this.updateItem('recipes', Number(id), { views: recipe.views });
        }
    }

    // Методы для категорий
    async getAllCategories() {
        return await this.getAllItems('categories');
    }

    async getCategoryById(id) {
        return await this.getItem('categories', Number(id));
    }

    // Методы для комментариев
    async getCommentsByRecipe(recipeId) {
        return await this.getAllItems('comments', 'recipeId', Number(recipeId));
    }

    async getCommentsByUser(userId) {
        return await this.getAllItems('comments', 'userId', Number(userId));
    }

    async addComment(comment) {
        const newComment = {
            ...comment,
            date: comment.date || new Date().toISOString().split('T')[0],
            likes: comment.likes || 0
        };
        
        const commentId = await this.addItem('comments', newComment);
        newComment.id = commentId;
        
        // Обновляем рейтинг рецепта
        await this.updateRecipeRating(comment.recipeId);
        
        return newComment;
    }

    async updateRecipeRating(recipeId) {
        const comments = await this.getCommentsByRecipe(recipeId);
        if (comments.length === 0) return;
        
        const totalRating = comments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
        const averageRating = (totalRating / comments.length).toFixed(1);
        
        await this.updateRecipe(recipeId, { rating: parseFloat(averageRating) });
    }

    // Методы для избранного
    async getUserFavorites(userId) {
        return await this.getAllItems('favorites', 'userId', Number(userId));
    }

    async isRecipeInFavorites(userId, recipeId) {
        try {
            await this.getItem('favorites', [Number(userId), Number(recipeId)]);
            return true;
        } catch {
            return false;
        }
    }

    async addToFavorites(userId, recipeId) {
        const alreadyFavorite = await this.isRecipeInFavorites(userId, recipeId);
        if (alreadyFavorite) return;
        
        const favorite = {
            userId: Number(userId),
            recipeId: Number(recipeId),
            date: new Date().toISOString().split('T')[0]
        };
        
        await this.addItem('favorites', favorite);
        
        // Увеличиваем счетчик избранного у рецепта
        const recipe = await this.getRecipeById(recipeId);
        if (recipe) {
            recipe.favorites = (recipe.favorites || 0) + 1;
            await this.updateItem('recipes', Number(recipeId), { favorites: recipe.favorites });
        }
    }

    async removeFromFavorites(userId, recipeId) {
        await this.deleteItem('favorites', [Number(userId), Number(recipeId)]);
        
        // Уменьшаем счетчик избранного у рецепта
        const recipe = await this.getRecipeById(recipeId);
        if (recipe && recipe.favorites > 0) {
            recipe.favorites -= 1;
            await this.updateItem('recipes', Number(recipeId), { favorites: recipe.favorites });
        }
    }

    // Методы для статистики
    async getStatistics() {
        const [recipes, users, comments, favorites] = await Promise.all([
            this.getRecipes(),
            this.getAllItems('users'),
            this.getAllItems('comments'),
            this.getAllItems('favorites')
        ]);

        const mostPopularRecipe = recipes.length > 0 
            ? recipes.sort((a, b) => (b.views || 0) - (a.views || 0))[0]
            : null;
            
        const newestRecipe = recipes.length > 0
            ? recipes.sort((a, b) => b.id - a.id)[0]
            : null;

        return {
            totalRecipes: recipes.length,
            totalUsers: users.length,
            totalComments: comments.length,
            totalFavorites: favorites.length,
            mostPopularRecipe,
            newestRecipe
        };
    }

    // Утилитарные методы
    async clearDatabase() {
        await this.init();
        const objectStoreNames = Array.from(this.db.objectStoreNames);
        
        for (const storeName of objectStoreNames) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject(event.target.error);
            });
        }
    }

    async exportData() {
        const data = {};
        const objectStoreNames = Array.from(this.db.objectStoreNames);
        
        for (const storeName of objectStoreNames) {
            data[storeName] = await this.getAllItems(storeName);
        }
        
        return data;
    }

    async importData(data) {
        await this.clearDatabase();
        
        for (const storeName in data) {
            if (data.hasOwnProperty(storeName)) {
                const items = data[storeName];
                for (const item of items) {
                    await this.addItem(storeName, item);
                }
            }
        }
    }
}

// Создаем глобальный экземпляр базы данных
window.db = new ArmenianFlavorsDB();

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.db.init();
        console.log('База данных Armenian Flavors готова к работе');
    } catch (error) {
        console.error('Ошибка инициализации базы данных:', error);
    }
});