const Binance = require('node-binance-api');
const binance = new Binance();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const web3 = require('web3');
const CryptoJS = require("crypto-js");
const https = require('https');

function removeArrItem(arr) {
    let what, a = arguments,
        L = a.length,
        ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

const findClosest = (list, targetPrice) => {
    let results = [];
    let newList = [];
    for (let key in list) {
        if (list.hasOwnProperty(key)) {
            newList.push(list[key])
        }
    }

    for (let i = 0; i < 3; i++) {
        if (newList.length) {
            let closest = newList.reduce(function (prev, curr) {
                return (Math.abs(curr - targetPrice) < Math.abs(prev - targetPrice) ? curr : prev);
            });
            results.push(parseInt(closest));
            removeArrItem(newList, closest);
        }
    }

    return results;
}

const roundPredictions = async (round) => {
    return await prisma.user_predictions.groupBy({
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
}

const currentRound = async () => {
    return await prisma.rounds.findFirst({orderBy: {id: 'desc'}});
}

const findUser = async (where) => {
    return await prisma.users.findFirst({
        where: where
    });
}

const weiToETH = (value, digits = 4) => {
    return parseFloat(web3.utils.fromWei(value.toString())).toFixed(digits);
}

const addressShort = (address) => {
    const begin = address.slice(0, 6);
    const end = address.slice(-4);
    return `${begin}...${end}`;
}

const binancePricePromise = (token) => {
    let tokenFull = `${token.toUpperCase()}USDT`;
    return new Promise((resolve, reject) => {
        binance.prices(tokenFull, (error, ticker) => {
            if (ticker && ticker[tokenFull]) {
                resolve(ticker[tokenFull].slice(0, -2));
            } else {
                reject(error);
            }
        });
    });
}

const startNewRound = async () => {
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

const finishRound = async () => {
    // console.log('Finish round...');
    const pricePromises = [];
    const round = await currentRound();
    const rooms = await prisma.rooms.findMany();
    const roomsList = [];

    rooms.forEach((room, index) => {
        pricePromises.push(binancePricePromise(room.symbol));
        roomsList.push({
            id: room.id,
            index: index
        })
    });

    Promise.all(pricePromises).then(async (results) => {
            await prisma.user_predictions.updateMany({
                where: {
                    round_id: round.id,
                },
                data: {is_winner: false}
            });

            for (const room of roomsList) {
                const resultExists = await prisma.round_results.count({
                    where: {
                        round_id: round.id,
                        room_id: room.id
                    }
                });

                if (!resultExists) {
                    const resultPrice = results[room.index];
                    await prisma.round_results.create({
                        data: {
                            round_id: round.id,
                            room_id: room.id,
                            price_usd: resultPrice
                        }
                    });
                    const predictions = await prisma.user_predictions.findMany({
                        where: {
                            round_id: round.id,
                            room_id: room.id
                        }
                    });

                    if (predictions.length) {
                        let totalEntry = BigInt(0);
                        let prices = [];

                        predictions.forEach(prediction => {
                            totalEntry += prediction.entry_wei;
                            prices.push(prediction.prediction_usd * 1000000);
                        });

                        const closest = findClosest(prices, resultPrice * 1000000);
                        if (closest.length) {
                            const payForUsers = totalEntry - (totalEntry / BigInt(100)) * BigInt(process.env.WEBSITE_FEE_PCT);
                            const payForOneUser = payForUsers / BigInt(closest.length);

                            for (const winPrice of closest) {
                                const price = parseFloat(winPrice / 1000000).toFixed(6);
                                // console.log('winPrice', winPrice, room.id, price);

                                const winner = await prisma.user_predictions.findFirst({
                                    where: {
                                        prediction_usd: price,
                                        round_id: round.id,
                                        room_id: room.id
                                    },
                                    orderBy: {
                                        id: "asc"
                                    }
                                });

                                if (winner) {
                                    const user = await prisma.users.findFirst({
                                        where: {
                                            id: winner.user_id
                                        },
                                    });

                                    let newUserBalance = BigInt(user.balance_wei);
                                    newUserBalance += payForOneUser;

                                    await prisma.users.update({
                                        where: {
                                            id: winner.user_id
                                        },
                                        data: {
                                            balance_wei: newUserBalance.toString()
                                        }
                                    });

                                    await prisma.user_predictions.update({
                                        where: {id: winner.id},
                                        data: {
                                            is_winner: true,
                                            win_amount_wei: payForOneUser.toString()
                                        }
                                    });
                                }
                                // console.log(price, round.id, room.id, web3.utils.fromWei('' + payForOneUser));
                            }
                            // console.log('--------');
                        }
                    }
                }
            }
        }
    ).catch(e => {
        console.error('Promise error: ', e);
    });

    startNewRound().catch(e => {
        // console.log(e);
    });
}

const gasPricePromise = new Promise((resolve, reject) => {
    https.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=' + process.env.ETHERSCAN_API_KEY, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            let result = JSON.parse(data);
            let fastest = parseInt(result.result.FastGasPrice);
            fastest = parseInt(fastest * 1.1) * 1000;
            resolve(fastest);
        });
    }).on("error", (err) => {
        reject("Error: " + err.message);
        console.log("Error: " + err.message);
    });
});

const serializeMessage = (message, user) => {
    let myself = false;
    if (user && message.user_id === user.id) {
        myself = true;
    }

    return {
        id: message.id,
        content: message.text,
        myself: myself,
        participantId: CryptoJS.MD5(message.user_id).toString(),
        timestamp: message.created_at,
        type: 'text'
    }
}

const userImage = (userHash) => {
    return `https://avatars.dicebear.com/api/jdenticon/${userHash}.svg?radius=30&width=30&height=30`;
}

const serializeChatUser = (user) => {
    const userIdHash = CryptoJS.MD5(user.id).toString();
    return {
        name: addressShort(user.address),
        id: userIdHash,
        profilePicture: userImage(userIdHash)
    }
}

const getRoundWinners = async (roomId, roundId) => {
    let winnersList = [];
    const winners = await prisma.user_predictions.findMany({
        where: {
            is_winner: true,
            room_id: roomId,
            round_id: roundId
        },
        include: {
            users: true
        }
    });

    winners.forEach(winner => {
        winnersList.push({
            id: winner.id,
            prediction_usd: winner.prediction_usd,
            created_at: winner.created_at,
            user: addressShort(winner.users.address)
        });
    });

    return winnersList;
}

// const subscribedEvents = {};
// const subscribeLogEvent = (contract, eventName, callback) => {
//     const eventJsonInterface = window.web3.utils._.find(
//         contract._jsonInterface,
//         o => o.name === eventName && o.type === 'event',
//     )
//
//     subscribedEvents[eventName] = window.web3.eth.subscribe('logs', {
//         address: contract.options.address,
//         topics: [eventJsonInterface.signature]
//     }, (error, result) => {
//         if (!error) {
//             const eventObj = window.web3.eth.abi.decodeLog(
//                 eventJsonInterface.inputs,
//                 result.data,
//                 result.topics.slice(1)
//             )
//             console.log(`New ${eventName}!`, eventObj);
//
//             if (callback) {
//                 callback(eventObj);
//             }
//         }
//     })
//
//     console.log(`subscribed to event '${eventName}' of contract '${contract.options.address}' `)
// }

module.exports = {
    startNewRound,
    roundPredictions,
    currentRound,
    findUser,
    weiToETH,
    serializeMessage,
    serializeChatUser,
    addressShort,
    getRoundWinners,
    gasPricePromise,
    // subscribeLogEvent
}