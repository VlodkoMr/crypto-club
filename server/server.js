const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const {Server} = require('socket.io');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const Binance = require('node-binance-api');
const web3 = require('web3');

// const roundPredictions = async (round) => {
//     return await prisma.user_predictions.groupBy({
//         by: ['room_id'],
//         where: {
//             round_id: round.id
//         },
//         _sum: {
//             entry_wei: true
//         },
//         _count: {
//             id: true
//         }
//     });
// }


require('dotenv').config();

// Configuring port
const port = process.env.PORT || 9000;
const app = express();
const binance = new Binance();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/views/'));
app.use('/api', require('./routes/api'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'html');

// Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

BigInt.prototype.toJSON = function () {
    return this.toString()
}

io.on('connection', (socket) => {
    // console.log('User connected');
    const roundInterval = setInterval(async () => {
        const round = await prisma.rounds.findFirst({orderBy: {id: 'desc'}});
        const predictions = await prisma.user_predictions.groupBy({
            by: ['room_id'],
            where: {
                round_id: round.id
            },
            _sum: {
                entry_wei: true
            },
            _count: {
                id: true
            }
        });

        if (predictions.length) {
            predictions.forEach(prediction => {
                socket.emit("ROOM_UPDATE_MEMBERS", {
                    room_id: prediction.room_id,
                    entry: web3.utils.fromWei('' + prediction._sum.entry_wei),
                    members: prediction._count.id
                });
            });
        }

    }, 5000);


    socket.on('disconnect', function () {
        // console.log('User disconnect');
        clearInterval(roundInterval);
    });
});

function finishRound() {
    startNewRound().catch(e => {
        // console.log(e);
    });
}


async function startNewRound() {
    let startDate = new Date();
    startDate.setMinutes(parseInt(startDate.getMinutes() / process.env.ROUND_MINUTES) * process.env.ROUND_MINUTES);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    let endDate = new Date(startDate.getTime() + process.env.ROUND_MINUTES * 60 * 1000);

    const round = await prisma.rounds.findFirst({
        where: {
            start_time: startDate,
            end_time: endDate
        }
    });
    if (!round) {
        // Create new round
        // console.log('Create new round')
        await prisma.rounds.create({
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