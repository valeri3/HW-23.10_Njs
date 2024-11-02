// подключение express и socket.io
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 8080;

// массив для хранения текущих подключений
let connections = [];
// массив для хранения текущих пользователей
let users = [];
// массив для хранения текущих сообщений
let messages = [];

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/:id', (req, res) => {
    const username = req.params.id;
    if (username === 'client.js') {
        res.sendFile(path.join(__dirname, 'client.js'));
    } else if (username === 'favicon.ico') {
        res.sendStatus(404);
    } else {
        // Проверка уникальности пользователя
        if (users.includes(username)) {
            res.send(`<script>alert("Такой пользователь уже существует, попробуйте другое имя"); window.location.href = '/';</script>`);
        } else {
            users.push(username);
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    }
});

// установка соединения
io.on('connection', (socket) => {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Отключение
    socket.on('disconnect', () => {
        const index = connections.indexOf(socket);
        const userName = users[index];

        // удалить разорванное соединение и пользователя из списка
        connections.splice(index, 1);
        users.splice(index, 1);

        // Обновление списка пользователей на клиенте
        io.sockets.emit('users loaded', {users});
        console.log(`Пользователь ${userName} отключился. Оставшиеся подключения: ${connections.length}`);
    });

    // Обработка отправки сообщения
    socket.on('send message', (data) => {
        messages.push(data);
        io.sockets.emit('chat message', data);
    });

    // Загрузка пользователей
    socket.on('load users', () => {
        io.sockets.emit('users loaded', {users});
    });

    // Загрузка сообщений
    socket.on('load messages', () => {
        socket.emit('messages loaded', {messages});
    });

    // Добавление нового пользователя
    socket.emit('new user', {name: users[users.length - 1]});
});

server.listen(port, () => {
    console.log(`Сервер работает на порту ${port}`);
});
