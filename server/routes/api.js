const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

router.get('/rooms', (req, res) => {
    res.send([
        {
            id: 'eth',
            title: 'Ethereum',
            price: '2,301.85',
            pct: '1.1',
            totalStake: 0
        }, {
            id: 'btc',
            title: 'Bitcoin',
            price: '32,405.82',
            pct: '1.0'
        }
    ])
});

router.get('/account', (req, res) => {
    res.send({
        predictions: [
            // roomId, price, amount
        ]
    });
})

module.exports = router;
