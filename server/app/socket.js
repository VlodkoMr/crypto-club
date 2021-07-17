const {Server} = require('socket.io');
const {currentRound, roundPredictions, weiToETH, findUser} = require('./functions');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const _ = require('lodash');
const {serializeMessage} = require('./functions');

const initSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', async (socket) => {
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
                    members: members
                });
            });
        }, 3000);


        socket.on('NEW_CHAT_MESSAGE', async (message) => {
            const user = await findUser({id: message.user});
            await prisma.messages.create({
                data: {
                    text: message.content,
                    user_id: user.id
                }
            });
            const lastMessage = await prisma.messages.findFirst({
                where: {user_id: user.id},
                orderBy: {id: 'desc'}
            });

            const newMessage = serializeMessage(lastMessage, user)

            io.emit('CHAT_MESSAGE', newMessage);
        });

        socket.on('disconnect', function () {
            clearInterval(roundMembersInterval);
        });
    });

}


module.exports = {
    initSocketServer
}