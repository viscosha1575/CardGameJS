const board = document.querySelector('.game-board');
const restartButton = document.getElementById('restart');
const scoreDisplay = document.getElementById('score'); // Ссылка на элемент для отображения счёта

// Проверка на существование элементов DOM
if (!board || !restartButton || !scoreDisplay) {
    console.error('Не удалось найти необходимые элементы на странице');
}

/ Ожидаем полной инициализации Telegram WebApp
const tg = window.Telegram.WebApp;

// Инициализация Telegram WebApp
tg.ready();

// Получаем данные пользователя после инициализации
const user = tg.getUser();
if (!user || !user.id) {
    console.error('Данные пользователя Telegram не получены:', user);
} else {
    console.log('Данные пользователя Telegram:', user);

    // Сохраняем данные для отправки на сервер
    const userData = {
        telegramId: user.id,  // Получаем ID пользователя
        username: user.username || 'Неизвестно',  // Имя пользователя, если есть
    };

    // Пример использования в функции сохранения счёта
    saveScoreToDB(userData, score);
}

// Инициализация переменных
let score = 0; // Начальный счёт
const API_BASE_URL = 'https://servertggame.onrender.com'; // URL вашего API
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let isChecking = false;

// Список путей к картинкам
const images = [
    'src/biscuit_8933104.png',
    'src/burger_8932640.png',
    'src/burrito_8932668.png',
    'src/cake-slice_8932792.png',
    'src/coffee-cup_8933030.png',
    'src/hot-chocolate_8933065.png',
    'src/ice-cream_8933094.png',
    'src/soda-can_8933015.png',
];

// Функция создания карточек
function createBoard() {
    if (!board) return; // Защита от отсутствия элемента
    board.innerHTML = '';

    // Перемешивание карточек
    cards = [...images, ...images].sort(() => Math.random() - 0.5);

    cards.forEach((image, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="${image}" alt="Card Image">
                </div>
            </div>
        `;
        card.dataset.index = index;
        board.appendChild(card);
    });

    // Добавляем обработчики событий
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(card => {
        card.addEventListener('click', () => flipCard(card));
    });
}

// Функция переворачивания карточек
function flipCard(card) {
    if (isChecking || flippedCards.length === 2 || card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        isChecking = true; // Блокируем переворачивание других карточек
        setTimeout(checkMatch, 1000);
    }
}

// Проверка совпадения карточек
function checkMatch() {
    const [card1, card2] = flippedCards;
    const index1 = card1.dataset.index;
    const index2 = card2.dataset.index;

    if (cards[index1] === cards[index2]) {
        matchedPairs++;
        score += 10; // Увеличиваем счёт
        updateScore();

        if (matchedPairs === images.length) {
            saveScoreToDB(score); // Сохраняем счёт после победы
            console.log('Вы выиграли!');
        }
    } else {
        // Убираем класс flipped, если карточки не совпадают
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }

    flippedCards = [];
    isChecking = false; // Разблокируем переворачивание
}

// Обновление отображения счёта
function updateScore() {
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${score}`;
    }
}

// Перезапуск игры
restartButton?.addEventListener('click', async () => {
    console.log('Кнопка Restart нажата');
    if (score > 0) {
        console.log('Сохраняем текущий счёт:', score);
        await saveScoreToDB(score); // Сохраняем счёт перед перезапуском
    }
    score = 0; // Сбрасываем счёт
    matchedPairs = 0;
    flippedCards = [];
    updateScore();
    createBoard();
});

// Сохранение счёта в базу данных
async function saveScoreToDB(score) {
    try {
        const userData = {
            telegramId: user?.id || null,
            username: user?.username || 'Неизвестно',
        };

        console.log('Отправляем данные на сервер:', { score, user: userData });

        const response = await fetch(`${API_BASE_URL}/save-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score, user: userData }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Счёт сохранён:', data);
    } catch (error) {
        console.error('Ошибка при сохранении счёта:', error);
    }
}

// Создаём игровое поле при загрузке
createBoard();

