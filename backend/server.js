const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Подключение CORS для работы с клиентом

const app = express();

// Строка подключения к базе данных MongoDB Atlas
const uri = 'mongodb+srv://viscosha1575:MfrYeemw2D7LnJSJ@cluster0.5lht6.mongodb.net/myDatabase?retryWrites=true&w=majority';

// Подключение к базе данных MongoDB
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

// Схема и модель базы данных
const scoreSchema = new mongoose.Schema({
    score: Number,
    date: { type: Date, default: Date.now },
});
app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

const Score = mongoose.model('Score', scoreSchema);

// Middleware
app.use(cors()); // Разрешаем CORS
app.use(bodyParser.json());

// Сохранение счёта в базе данных
app.post('/save-score', async (req, res) => {
    try {
        const { score } = req.body;
        const newScore = new Score({ score });
        await newScore.save();
        res.status(201).send({ message: 'Score saved successfully' });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).send({ message: 'Error saving score' });
    }
});


// Запуск сервера
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
