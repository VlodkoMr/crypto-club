const express = require('express');
const path = require('path');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', (req, res) => {
    res.send('Hello API');
});

router.get('/round', async (req, res) => {
    const round = await prisma.rounds.findFirst({orderBy: {id: 'desc'}});
    const secondsToEnd = parseInt((round.end_time - new Date()) / 1000);
    const result = {
        id: round,
        endTime: round.end_time.toISOString().slice(11, 16),
        secondsToEnd: secondsToEnd,
        predictions: [],
        rooms: await prisma.rooms.findMany()
    }
    res.send(result);
});

router.get('/user', async (req, res) => {
    let user = await prisma.users.findFirst({
        where: {
            address: req.query.acc
        }
    });

    if (!user) {
        user = await prisma.users.create({
            data: {
                address: req.query.acc,
                balance_wei: 0
            }
        });
    }
    res.send({
        address: user.address
    });
})

module.exports = router;
