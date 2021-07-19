const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const web3 = require('web3');
const _ = require('lodash');
const {
    roundPredictions, currentRound, findUser, weiToETH, serializeMessage, serializeChatUser, getRoundWinners
} = require('./functions');

router.get('/', (req, res) => {
    res.send('Hello API');
});

router.get('/round', async (req, res) => {
    let result = {};
    let roomSerialize = [];

    const round = await currentRound();
    if (round) {
        const secondsToEnd = parseInt((round.end_time - new Date()) / 1000);
        const endTime = round.end_time;
        const predictions = await roundPredictions(round);
        const rooms = await prisma.rooms.findMany();

        for (let index in rooms) {
            if (rooms.hasOwnProperty(index)) {
                let members = 0;
                let entry = 0;
                const room = rooms[index];

                predictions.forEach(prediction => {
                    if (prediction.room_id === room.id) {
                        members = prediction._count.id;
                        entry = weiToETH(prediction._sum.entry_wei, 2);
                    }
                });

                roomSerialize.push({
                    id: room.id,
                    title: room.title,
                    symbol: room.symbol,
                    members: members,
                    entry: entry
                });
            }
        }

        result = {
            id: round.id,
            endTime: endTime,
            secondsToEnd: secondsToEnd,
            rooms: roomSerialize,
        }
    }

    res.send(result);
});

router.get('/prev-round-results', async (req, res) => {
    let prevRoundResults = {};
    const rooms = await prisma.rooms.findMany();
    let user = await findUser({address: req.query.acc});

    for (let index in rooms) {
        if (rooms.hasOwnProperty(index)) {
            const room = rooms[index];
            prevRoundResults[room.id] = null;

            // Is prev rounds results
            const prevResultList = await prisma.user_predictions.findMany({
                where: {
                    room_id: room.id,
                    is_new: true,
                    user_id: user.id
                }
            });

            if (prevResultList.length) {
                let isWinner = false;
                let winPrediction = 0;
                prevResultList.forEach(prevResult => {
                    if (!isWinner) {
                        isWinner = prevResult.is_winner;
                        if (isWinner) {
                            winPrediction = prevResult.prediction_usd;
                        }
                    }
                });

                const winners = await getRoundWinners(room.id, prevResultList[0].round_id)
                const roundResult = await prisma.round_results.findFirst({
                    where: {
                        round_id: prevResultList[0].round_id,
                        room_id: room.id
                    }
                });

                if (roundResult) {
                    prevRoundResults[room.id] = {
                        roomId: room.id,
                        isWinner: isWinner,
                        winPrediction: winPrediction,
                        roundPrice: roundResult.price_usd,
                        winners: winners
                    }
                }
            }
        }
    }

    res.send(prevRoundResults);
});

router.post('/chat-messages', async (req, res) => {
    const user = await findUser({id: req.body.user});
    let where = {};
    let take = -20;

    if (req.body.lastId) {
        where = {
            id: {
                lt: req.body.lastId
            }
        };
        take = -2;
    }

    const messages = await prisma.messages.findMany({
        where: where,
        orderBy: {
            id: "asc",
        },
        take: take,
        include: {
            users: true
        }
    });

    let messagesList = [];
    let participantList = [];
    messages.forEach(message => {
        messagesList.push(serializeMessage(message, user));
        participantList.push(serializeChatUser(message.users))
    })

    const result = {
        messages: messagesList,
        participants: participantList,
        myself: {}
    };

    if (user) {
        result['myself'] = serializeChatUser(user);
    }

    res.send(result);
});

router.post('/try-again-prediction', async (req, res) => {
    const user = await findUser({id: req.body.user});
    const result = await prisma.user_predictions.updateMany({
        where: {
            user_id: user.id,
            room_id: req.body.room,
            is_new: true
        },
        data: {
            is_new: false
        }
    });

    res.send({status: result});
});

router.post('/add-prediction', async (req, res) => {
    const round = await currentRound();
    const entry = BigInt(web3.utils.toWei(process.env.ENTRY_ETH));
    const secondsToEnd = parseInt((round.end_time - new Date()) / 1000);
    const user = await findUser({id: req.body.user});
    const predictionUsd = parseFloat(req.body.price);

    const predictionCounts = await prisma.user_predictions.count({
        where: {
            room_id: req.body.room,
            round_id: round.id,
            prediction_usd: predictionUsd
        }
    });

    if (user.balance_wei <= entry) {
        res.send({status: 'error', 'text': 'Not enough balance for prediction'});
    } else if (secondsToEnd < process.env.LOCK_ROUND_MINUTES * 60) {
        res.send({status: 'error', 'text': 'It is too late for prediction, please wait next round.'});
    } else if (predictionCounts > 0) {
        res.send({status: 'error', 'text': 'This price is already taken in current round, please choose another prediction.'});
    } else {
        const newBalance = BigInt(user.balance_wei) - entry;
        await prisma.users.update({
            where: {id: user.id},
            data: {balance_wei: newBalance.toString()},
        })

        const prediction = await prisma.user_predictions.create({
            data: {
                user_id: req.body.user,
                room_id: req.body.room,
                round_id: round.id,
                prediction_usd: predictionUsd,
                entry_wei: entry
            }
        });

        res.send({
            status: 'success',
            prediction: prediction
        });
    }
});

router.get('/user', async (req, res) => {
    let user = await findUser({address: req.query.acc});
    if (!user) {
        await prisma.$executeRaw`INSERT INTO users (id, address, balance_wei) VALUES(UUID(), ${req.query.acc}, 0);`;
        user = await findUser({address: req.query.acc});
    }

    let balance = weiToETH(user.balance_wei);
    let pendingBalance = 0;

    const round = await currentRound();
    const predictions = await prisma.user_predictions.findMany({
        where: {
            round_id: round.id,
            user_id: user.id,
        }
    })

    res.send({
        pendingBalance: pendingBalance,
        balance: balance,
        address: user.address,
        predictions: predictions,
        id: user.id
    });
})

router.get('/date-rounds', async (req, res) => {
    const date = req.query.date;
    const user = await findUser({address: req.query.acc});
    let rounds = [];
    let predictions = [];

    if (date) {
        rounds = await prisma.$queryRaw
            `SELECT id, DATE_FORMAT(start_time, "%H:%i") start_time, DATE_FORMAT(end_time, "%H:%i") end_time
        FROM rounds WHERE DATE_FORMAT(start_time, "%Y-%m-%d") = ${date};
        `;
    }

    if (user && rounds) {
        const roundIds = _.map(rounds, 'id');
        predictions = await prisma.user_predictions.findMany({
            select: {
                id: true,
                room_id: true,
                prediction_usd: true,
                round_id: true,
                is_winner: true,
                created_at: true
            },
            where: {
                user_id: user.id,
                round_id: {in: roundIds}
            }
        })
    }

    res.send({
        rounds, predictions
    });
});

module.exports = router;
