const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const web3 = require('web3');

router.get('/', (req, res) => {
    res.send('Hello API');
});

router.get('/round', async (req, res) => {
    const round = await prisma.rounds.findFirst({orderBy: {id: 'desc'}});
    const secondsToEnd = parseInt((round.end_time - new Date()) / 1000);
    const endTime = round.end_time.toISOString().slice(11, 16);
    const rooms = await prisma.rooms.findMany();
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


    let roomSerialize = [];
    rooms.forEach(room => {
        let members = 0;
        let entry = 0;
        predictions.forEach(prediction => {
            if (prediction.room_id === room.id) {
                members = prediction._count.id;
                entry = web3.utils.fromWei('' + prediction._sum.entry_wei);
            }
        });

        roomSerialize.push({
            id: room.id,
            title: room.title,
            symbol: room.symbol,
            members: members,
            entry: entry
        });
    });

    const result = {
        id: round.id,
        endTime: endTime,
        secondsToEnd: secondsToEnd,
        rooms: roomSerialize
    }
    res.send(result);
});

router.post('/add-prediction', async (req, res) => {
    const round = await prisma.rounds.findFirst({orderBy: {id: 'desc'}});
    const entry = BigInt(web3.utils.toWei(process.env.ENTRY_ETH));
    const secondsToEnd = parseInt((round.end_time - new Date()) / 1000);
    const user = await prisma.users.findFirst({
        where: {
            id: req.body.user
        }
    });

    if (secondsToEnd > process.env.LOCK_ROUND_MINUTES * 60) {
        const prediction = await prisma.user_predictions.create({
            data: {
                user_id: req.body.user,
                room_id: req.body.room,
                round_id: round.id,
                prediction_usd: parseFloat(req.body.price),
                entry_wei: entry
            }
        });
        res.send({status: 'success', prediction: prediction});
    } else {
        res.send({status: 'error'});
    }
});

router.get('/user', async (req, res) => {
    let user = await prisma.users.findFirst({
        where: {
            address: req.query.acc
        }
    });
    if (!user) {
        user = await prisma.$executeRaw`INSERT INTO users (id, address) VALUES(UUID(), ${req.query.acc});`
    }

    let balance = web3.utils.fromWei('' + user.balance_wei);
    balance = parseFloat(balance).toFixed(4);

    let pendingBalance = 0;
    pendingBalance = parseFloat(pendingBalance).toFixed(4);

    const round = await prisma.rounds.findFirst({orderBy: {id: 'desc'}});
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

module.exports = router;
