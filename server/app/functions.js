const Binance = require('node-binance-api');
const binance = new Binance();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const web3 = require('web3');
const CryptoJS = require("crypto-js");

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
    return parseFloat(web3.utils.fromWei('' + value)).toFixed(digits);
}

const addressShort = (address) => {
    const begin = address.slice(0, 6);
    const end = address.slice(-4);
    return `${begin}... ${end}`;
}

const binancePricePromise = (token) => {
    let tokenFull = `${token.toUpperCase()}USDT`;
    return new Promise((resolve, reject) => {
        binance.prices(tokenFull, (error, ticker) => {
            if (ticker[tokenFull]) {
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
                                    await prisma.users.updateMany({
                                        where: {
                                            id: winner.user_id
                                        },
                                        data: {
                                            balance_wei: {
                                                increment: payForOneUser
                                            }
                                        }
                                    });

                                    await prisma.user_predictions.update({
                                        where: {id: winner.id},
                                        data: {is_winner: true}
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
    );

    startNewRound().catch(e => {
        // console.log(e);
    });
}

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
        timestamp: {
            year: message.created_at.getFullYear(),
            month: message.created_at.getMonth() + 1,
            day: message.created_at.getDate(),
            hour: message.created_at.getHours(),
            minute: message.created_at.getMinutes()
        },
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

module.exports = {
    startNewRound,
    roundPredictions,
    currentRound,
    findUser,
    weiToETH,
    serializeMessage,
    serializeChatUser
}