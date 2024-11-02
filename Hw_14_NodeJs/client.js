const socket = io.connect('http://26.154.68.88:8080/');
let user = '';

window.onload = function () {
    const usersContainer = document.getElementById('userlist');
    const messageContainer = document.getElementById('messages');
    const btn = document.getElementById('btn');
    const messageInput = document.getElementById('inp');

    messageContainer.style.height = window.innerHeight - 200 + 'px';

    // Загрузка пользователей
    socket.emit('load users');
    socket.on('users loaded', function (data) {
        const displayUsers = data.users.map(username => `<li>${username}</li>`);
        usersContainer.innerHTML = displayUsers.join('');
    });

    // Загрузка сообщений
    socket.emit('load messages');
    socket.on('messages loaded', function (data) {
        const displayMessages = data.messages.map(msg => formatMessage(msg));
        messageContainer.innerHTML = displayMessages.join('');
    });

    // Отправка сообщения
    btn.onclick = sendMessage;
    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Получение нового сообщения
    socket.on('chat message', function (message) {
        messageContainer.innerHTML += formatMessage(message);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });

    // Получение имени пользователя
    socket.on('new user', function (data) {
        user = data.name;
    });

    function sendMessage() {
        const text = messageInput.value;
        if (!text) return;

        socket.emit('send message', {text, author: user});
        messageInput.value = '';
    }

    function formatMessage(message) {
        const isMyMessage = message.author === user;
        return `
            <div class="panel well message ${isMyMessage ? 'my-message' : 'other-message'}">
                <h4 class="${isMyMessage ? 'my-username' : 'other-username'}">${message.author}</h4>
                <h5>${message.text}</h5>
            </div>`;
    }
};
