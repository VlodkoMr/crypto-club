const cors = require('cors');
const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

require('dotenv').config();

// Configuring port
const port = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/views/'));
app.use('/api', require('./routes/api'));
app.set('view engine', 'html');

// Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    // console.log('a user connected');
    socket.emit("hello", "world");

    setTimeout(() => {
        socket.emit("CHAT_MESSAGE", "test");
    }, 3000);
});


// Listening to port
server.listen(port, () => {
    console.log(`Listening On http://localhost:${port}/api`);
});

module.exports = app;