const cors = require('cors');
const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const Binance = require('node-binance-api');

require('dotenv').config();

// Configuring port
const port = process.env.PORT || 9000;
const app = express();
const binance = new Binance();

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

// io.on('connection', (socket) => {
//     // console.log('a user connected');
//     socket.emit("hello", "world");
//     setTimeout(() => {
//         socket.emit("CHAT_MESSAGE", "test");
//     }, 3000);
// });
const roundMinutes = 5;
const blockRoundMinutes = 2;

function finishRound() {
    startNewRound().catch(e => {
        // console.log(e);
    });
}


async function startNewRound() {
    let startDate = new Date();
    startDate.setMinutes(parseInt(startDate.getMinutes() / roundMinutes) * roundMinutes);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    let endDate = new Date(startDate.getTime() + roundMinutes * 60 * 1000);

    round = await prisma.rounds.findFirst({
        where: {
            start_time: startDate,
            end_time: endDate
        }
    });
    if (!round) {
        // await prisma.rounds.update({
        //     where: {is_active: 1},
        //     data: {is_active: 0},
        // })

        // Create new round
        const newRound = await prisma.rounds.create({
            data: {
                start_time: startDate,
                end_time: endDate
            }
        });
    }

    const checkNextRound = setInterval(() => {
        if (new Date() >= endDate) {
            clearInterval(checkNextRound);
            finishRound();
        }
    }, 1000);
}

startNewRound().catch(e => {
    console.log(e);
});


// Listening to port
server.listen(port, () => {
    console.log(`Listening On http://localhost:${port}/api`);
});

module.exports = app;