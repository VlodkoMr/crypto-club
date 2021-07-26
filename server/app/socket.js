const {Server} = require('socket.io');
const _ = require('lodash');
const Web3 = require('web3');
const CryptoJS = require("crypto-js");

const {PrismaClient} = require('@prisma/client');
const {
    currentRound, roundPredictions, weiToETH, findUser, serializeMessage, serializeChatUser, gasPricePromise
} = require('./functions');
const prisma = new PrismaClient();
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.WEB_SOCKET_URL));

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

            io.emit('CHAT_MESSAGE_USER', serializeChatUser(user));
            setTimeout(() => {
                io.emit('CHAT_MESSAGE', newMessage);
            }, 300);
        });

        socket.on('NEW_WITHDRAW_TRANSACTION', async (data) => {
            const user = await findUser({id: data.user});
            if (user) {
                let balance = BigInt(user.balance_wei);
                const userAddressHash = CryptoJS.MD5(user.address).toString();
                const withdrawAmount = BigInt(web3.utils.toWei(data.amount.toString()));

                if (balance - withdrawAmount >= 0) {
                    const nonce = await web3.eth.getTransactionCount(process.env.ADMIN_ADDRESS);
                    const lastTransaction = await web3.eth.getBlock("latest", false);
                    let gasPrice = parseInt(lastTransaction.gasUsed * 1.2);
                    if (gasPrice > lastTransaction.gasLimit) {
                        gasPrice = lastTransaction.gasLimit;
                    }

                    const txObject = {
                        from: process.env.ADMIN_ADDRESS,
                        to: data.address,
                        nonce: nonce,
                        gas: gasPrice,
                        value: withdrawAmount.toString()
                    }

                    io.emit('transactionChange', {
                        addressHash: userAddressHash,
                        type: 'pending',
                        textBefore: 'YOUR WITHDRAW',
                        textAfter: 'in progress...'
                    });

                    console.log('txObject', txObject);

                    web3.eth.accounts.signTransaction(txObject, process.env.ADMIN_PRIVATE_KEY).then(signed => {
                        io.emit('transactionChange', {
                            addressHash: userAddressHash,
                            type: 'pending',
                            textBefore: 'YOUR WITHDRAW',
                            hash: signed.transactionHash,
                            textAfter: 'is being mined...'
                        });

                        web3.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', async (result) => {
                            // console.log('Result', result);

                            await prisma.users.update({
                                where: {id: user.id},
                                data: {
                                    balance_wei: (balance - withdrawAmount).toString()
                                }
                            });

                            io.emit('transactionChange', {
                                addressHash: userAddressHash,
                                type: 'success',
                                hash: signed.transactionHash,
                                textBefore: 'YOUR WITHDRAW',
                                textAfter: 'is completed'
                            });
                        }).on('error', function (error) {
                            // console.log('error', error);
                            io.emit('transactionChange', {
                                addressHash: userAddressHash,
                                type: 'error',
                                textBefore: 'YOUR WITHDRAW',
                                hash: signed.transactionHash,
                                textAfter: 'is Failed: ' + error.message
                            });
                        });
                    });

                } else {
                    io.emit('transactionChange', {
                        addressHash: userAddressHash,
                        type: 'error',
                        textBefore: 'YOUR WITHDRAW',
                        textAfter: 'is Failed: Not enough Balance'
                    });
                }
            }
        });

        socket.on('NEW_DEPOSIT_TRANSACTION', async (data) => {
            const user = await findUser({id: data.user});

            if (user) {
                const userAddressHash = CryptoJS.MD5(user.address).toString();
                const amountWei = web3.utils.toWei(data.amount.toString());
                await prisma.user_payments.create({
                    data: {
                        user_id: user.id,
                        type: 'deposit',
                        amount_wei: amountWei,
                        status: 0,
                        hash: data.hash
                    }
                });

                const transactionCheckInterval = setInterval(async () => {
                    web3.eth.getTransactionReceipt(data.hash).then(async (result) => {
                        console.log('getTransactionReceipt', data.hash);

                        if (result && result.blockNumber) {
                            const currentBlock = await web3.eth.getBlockNumber();
                            const confirmations = currentBlock - result.blockNumber;

                            if (confirmations > 2) {
                                clearInterval(transactionCheckInterval);
                                await prisma.user_payments.update({
                                    where: {hash: data.hash},
                                    data: {status: 1}
                                });

                                let newUserBalance = BigInt(user.balance_wei);
                                newUserBalance += BigInt(amountWei);

                                await prisma.users.update({
                                    where: {id: user.id},
                                    data: {
                                        balance_wei: newUserBalance.toString()
                                    }
                                });

                                io.emit('transactionChange', {
                                    addressHash: userAddressHash,
                                    type: 'success',
                                    textBefore: 'YOUR TRANSACTION',
                                    hash: data.hash,
                                    textAfter: 'is completed'
                                });
                            }
                        }
                    }).catch(async (err) => {
                        clearInterval(transactionCheckInterval);
                        console.log(err);

                        await prisma.user_payments.update({
                            where: {hash: data.hash},
                            data: {status: 2}
                        });

                        io.emit('transactionChange', {
                            addressHash: userAddressHash,
                            type: 'error',
                            textBefore: 'YOUR TRANSACTION',
                            hash: data.hash,
                            textAfter: 'is failed - ' + err.message
                        });
                    });
                }, 10000);
            }
        });

        socket.on('disconnect', function () {
            clearInterval(roundMembersInterval);
        });
    });

}


module.exports = {
    initSocketServer
}