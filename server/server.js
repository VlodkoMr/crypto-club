const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const {initSocketServer} = require('./app/socket');
const {startNewRound} = require('./app/functions');

require('dotenv').config();

// Configuring port
const port = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/views/'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/api', require('./app/routes'));

BigInt.prototype.toJSON = function () {
    return this.toString()
}

const server = http.createServer(app);
initSocketServer(server);

startNewRound().catch(e => {
    console.log(e);
});

// Listening to port
server.listen(port, () => {
    console.log(`Listening On http://localhost:${port}/api`);
});

module.exports = app;