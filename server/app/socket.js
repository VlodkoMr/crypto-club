const {Server} = require('socket.io');
const {currentRound, roundPredictions, weiToETH, findUser} = require('./functions');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const _ = require('lodash');

const initSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', async (socket) => {
        let userId = null;
        const rooms = await prisma.rooms.findMany();

        const roundMembersInterval = setInterval(async () => {
            const round = await currentRound();
            let predictions = await roundPredictions(round);
            predictions = _.keyBy(predictions, 'room_id');

            rooms.forEach(room => {
                let entry = 0;
                let members = 0;
                if (predictions[room.id]) {
                    entry = weiToETH(predictions[room.id]._sum.entry_wei, 2);
                    members = predictions[room.id]._count.id;
                }

                socket.emit("ROOM_UPDATE_MEMBERS", {
                    room_id: room.id,
                    entry: entry,
                    members: members,
                    user: userId
                });
            });
        }, 3000);

        socket.on('disconnect', function () {
            clearInterval(roundMembersInterval);
        });
    });

}


module.exports = {
    initSocketServer
}