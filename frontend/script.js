const board = document.querySelector('.game-board');
const restartButton = document.getElementById('restart');
const scoreDisplay = document.getElementById('score'); // Ссылка на элемент для отображения счёта

let score = 0; // Начальный счёт

// Список путей к картинкам (уникальные изображения)
const images = [
    'src/biscuit_8933104.png',
    'src/burger_8932640.png',
    'src/burrito_8932668.png',
    'src/cake-slice_8932792.png',
    'src/coffee-cup_8933030.png',
    'src/hot-chocolate_8933065.png',
    'src/ice-cream_8933094.png',
    'src/soda-can_8933015.png'
];

// Создаем дубли каждой картинки и перемешиваем
let cards = [...images, ...images].sort(() => Math.random() - 0.5);

let flippedCards = [];
let matchedPairs = 0;

// Функция создания карточек
function createBoard() {
    board.innerHTML = '';
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

    // Добавляем обработчики событий для всех карточек
    document.querySelectorAll('.card').forEach(card => {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (!isTouchDevice) {
            // Для устройств без тач-скрина добавляем обработчик клика
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
                flipCard(card);
            });
        } else {
            // Для устройств с тач-скрином добавляем обработчик touchstart
            card.addEventListener('touchstart', () => {
                card.classList.toggle('flipped');
                flipCard(card);
            });
        }
    });
}

// Переворачивание карточек
function flipCard(card) {
    if (flippedCards.length === 2 || card.classList.contains('flipped')) return;

    flippedCards.push(card);

    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 1000);
    }
}

// Проверка на совпадение
function checkMatch() {
    const [card1, card2] = flippedCards;
    const index1 = card1.dataset.index;
    const index2 = card2.dataset.index;

    if (cards[index1] === cards[index2]) {
        matchedPairs++;
        score += 10; // Увеличиваем счёт на 10 за правильную пару
        scoreDisplay.textContent = `Score: ${score}`; // Обновляем счёт

        if (matchedPairs === images.length) {
            saveScoreToDB(score); // Сохраняем счёт после победы
            console.log('Game won!'); // Лог вместо оповещения
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }

    flippedCards = [];
}

// Перезапуск игры
restartButton.addEventListener('click', async () => {
    await saveScoreToDB(score); // Сохраняем текущий счёт перед перезапуском
    cards = [...images, ...images].sort(() => Math.random() - 0.5);
    matchedPairs = 0;
    flippedCards = [];
    score = 0; // Сбрасываем счёт при перезапуске
    scoreDisplay.textContent = `Score: ${score}`; // Обновляем счёт
    createBoard();
});

// Создание игрового поля
createBoard();

async function saveScoreToDB(score) {
    try {
        const response = await fetch('https://servertggame.onrender.com/save-score', { // Обновленный URL сервера
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score }),
        });
        const data = await response.json();
        console.log('Score saved:', data);
    } catch (error) {
        console.error('Error saving score:', error);
    }
}
