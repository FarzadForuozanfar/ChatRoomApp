const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utility/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utility/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Admin';

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.emit('message', formatMessage(botName, `${username} welcome to chat`));
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${username} has joined the chat`));
    
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });

    //Run when current client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user){
            io.to(user['room']).emit('message', formatMessage(botName, `${user['username']} left chat`)); // notif to all user
        }

        io.to(user.room).emit('roomUsers', {
            room: user['room'],
            users: getRoomUsers(user['room'])
        });
    });

    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id); 
        io.emit('message', formatMessage(user.username, msg));
    });

});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server Start On Port ${PORT}`));
