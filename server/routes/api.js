const express = require('express');
const path = require('path');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', (req, res) => {
    res.send('Hello API');
});

router.get('/current-round', async (req, res) => {
    const round = await prisma.rounds.findFirst({orderBy: {id: 'desc'}});
    const secondsToEnd = parseInt((round.end_time - new Date()) / 1000);

    const result = {
        id: round,
        endTime: round.end_time.toISOString().slice(11, 16),
        secondsToEnd: secondsToEnd,
        predictions: [],
        rooms: await prisma.rooms.findMany()
    }
    console.log(result)

    res.send(result);
});

router.get('/account', (req, res) => {
    res.send({
        predictions: [
            // roomId, price, amount
        ]
    });
})

module.exports = router;
