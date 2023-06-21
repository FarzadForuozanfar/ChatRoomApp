const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const username = urlParams.get('username');
const room = urlParams.get('room');

const socket = io();

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({room, users}) => {
    OutPutRoomName(room);
    OutPutUsersName(users);
});

socket.on('message', message => {
    console.log(message);
    OutPutMessage(message);
});

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const msg = event.target.elements.msg.value;
    socket.emit('chatMessage', msg);
    event.target.elements.msg.value = '';
    e.target.elements.msg.focus();

    chatMessages.scrollTop = chatMessages.scrollHeight ;
});

function OutPutMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    chatMessages.appendChild(div);
}

function OutPutRoomName(room){
    roomName.innerText = room;
}

function OutPutUsersName(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}