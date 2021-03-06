import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';

const CryptoJS = require("crypto-js");
import {formatPrice, formatTime} from './blockchain/metamask';
import {io} from 'socket.io-client';

const socket = io(process.env.VUE_APP_API_URL);
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        priceETH: 0,
        isReady: false,
        isMetamaskEnabled: false,
        topMessage: {
            isVisible: false,
            type: '',
            textBefore: '',
            hash: '',
            textAfter: '',
        },
        user: {
            id: '',
            address: null,
            balance: 0,
            pendingBalance: 0,
            predictions: [],
        },
        round: {
            id: null,
            endTime: '',
            secondsToEnd: 0,
        },
        prevRoundResults: {},
        rooms: [],
        chat: {
            messages: [],
            participants: [],
            myself: {}
        }
    },
    getters: {
        addressShort(state) {
            const begin = state.user.address.slice(0, 6);
            const end = state.user.address.slice(-4);
            return `${begin}...${end}`;
        },
        addressHash(state) {
            return CryptoJS.MD5(state.user.address).toString();
        },
        canAddPrediction(state) {
            return state.round.secondsToEnd > parseInt(process.env.VUE_APP_LOCK_ROUND_MINUTES) * 60;
        }
    },
    mutations: {
        isMetamaskEnabled(state, value) {
            state.isMetamaskEnabled = value;
        },
        user(state, value) {
            state.user = value
        },
        userBalance(state, value) {
            state.user.balance = value
        },
        updateETHPrice(state, value) {
            state.priceETH = value
        },
        address(state, value) {
            state.user.address = value
        },
        isReady(state, value) {
            state.isReady = value
        },
        round(state, value) {
            state.round = value;
        },
        prevRoundResults(state, value) {
            state.prevRoundResults = value;
        },
        clearPrevRoomResults(state, value) {
            state.prevRoundResults[value] = null;
        },
        rooms(state, value) {
            state.rooms = value;
        },
        addPrediction(state, value) {
            state.user.predictions.push(value);
        },
        cleanUpPrediction(state) {
            state.user.predictions = [];
        },
        updateTokenPrice(state, value) {
            state.rooms[value.index].price_usd = formatPrice(value.price);
            state.rooms[value.index].price_raw = value.price;
        },
        updateTokenPct(state, value) {
            state.rooms[value.index].price_pct = value.diff;
        },
        secondsToEnd(state, value) {
            state.round.secondsToEnd = value;
        },
        closeTopMessage(state) {
            state.topMessage.isVisible = false;
        },
        openTopMessage(state, value) {
            state.topMessage.isVisible = true;
            state.topMessage.type = value.type;
            state.topMessage.textBefore = value.textBefore;
            state.topMessage.hash = value.hash;
            state.topMessage.textAfter = value.textAfter;

            if (value.type !== 'pending') {
                setTimeout(() => {
                    if (state.topMessage.hash === value.hash && state.topMessage.type === value.type) {
                        state.topMessage.isVisible = false;
                    }
                }, 20000);
            }
        },
        loadChatMessages(state, value) {
            let messages = [];
            value.messages.forEach(message => {
                message.timestamp = formatTime(message.timestamp);
                messages.push(message);
            });

            state.chat.messages.unshift(...messages)
            state.chat.participants.unshift(...value.participants)
            state.chat.myself = value.myself;
        },
        SOCKET_ROOM_UPDATE_MEMBERS(state, value) {
            state.rooms.forEach(room => {
                if (room.id === value.room_id) {
                    room.entry = value.entry;
                    room.members = value.members;
                }
            });
        },
        SOCKET_CHAT_MESSAGE(state, value) {
            if (value.participantId !== state.chat.myself.id) {
                value.myself = false;
            }

            value.timestamp = new Date();
            state.chat.messages.push(value);
        },
        SOCKET_CHAT_MESSAGE_USER(state, value) {
            state.chat.participants.push(value);
        },
    },
    actions: {
        loadRound({dispatch, commit, state}) {
            axios.get(`${process.env.VUE_APP_API_URL}/api/round`)
                .then(response => {
                    commit('round', response.data);

                    if (!state.rooms.length) {
                        commit('rooms', response.data.rooms);
                        dispatch('getBinancePriceStreams')
                    }

                    setTimeout(() => {
                        commit('isReady', true);
                    }, 50);
                });

            const timerInterval = setInterval(() => {
                const seconds = state.round.secondsToEnd;
                if (seconds - 1 >= 0) {
                    commit('secondsToEnd', seconds - 1);
                } else {
                    clearInterval(timerInterval);
                    commit('cleanUpPrediction');
                    dispatch('loadRound');

                    setTimeout(() => {
                        dispatch('loadUser');
                        dispatch('loadPreviousRoundResults');
                    }, 1000);
                }
            }, 1000);
        },
        getBinancePriceStreams({dispatch, commit, state}) {
            state.rooms.forEach((room, roomIndex) => {
                // Current price
                const ticker = room.symbol + 'usdt';
                const socketBinance = new WebSocket(`wss://stream.binance.com:9443/ws/${ticker}@kline_1m`);
                socketBinance.onmessage = function (event) {
                    const data = JSON.parse(event.data);
                    commit('updateTokenPrice', {index: roomIndex, price: data.k.c})
                    if (room.symbol === 'eth') {
                        commit('updateETHPrice', data.k.c)
                    }
                };
                socketBinance.onclose = function (event) {
                    console.log('[close] ???????????????????? ????????????????')
                    document.location.reload();
                };

                // Price change pct
                const socketBinanceDay = new WebSocket(`wss://stream.binance.com:9443/ws/${ticker}@kline_1d`);
                socketBinanceDay.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    const prevPrice = data.k.o;
                    const currentPrice = state.rooms[roomIndex].price_raw;

                    if (prevPrice > 0 && currentPrice) {
                        const diffPct = ((currentPrice - prevPrice) / prevPrice) * 100;
                        commit('updateTokenPct', {index: roomIndex, diff: diffPct.toFixed(2)});
                    }
                };
            });
        },
        makePrediction({dispatch, commit, state}, data) {
            axios.post(`${process.env.VUE_APP_API_URL}/api/add-prediction`, {
                user: state.user.id,
                price: data.price,
                room: data.room
            }).then(response => {
                if (response.data.status === 'success') {
                    commit('addPrediction', response.data.prediction);
                    dispatch('loadUser');
                } else if (response.data.text) {
                    alert(response.data.text);
                } else {
                    alert('Server error!');
                }
            });
        },
        loadUser({dispatch, commit, state}) {
            if (state.user.address) {
                axios.get(`${process.env.VUE_APP_API_URL}/api/user?acc=${state.user.address}`)
                    .then(response => {
                        if (response.data) {
                            commit('user', response.data);
                        }
                    });
            }
        },
        allDateRounds({dispatch, commit, state}, date) {
            return new Promise((resolve, reject) => {
                axios.get(`${process.env.VUE_APP_API_URL}/api/date-rounds?date=${date}&acc=${state.user.address}`)
                    .then(response => {
                        if (response.data) {
                            resolve(response.data);
                        } else {
                            resolve([]);
                        }
                    });
            });
        },
        newChatMessage({dispatch, commit, state}, message) {
            socket.emit("NEW_CHAT_MESSAGE", {
                'content': message.content,
                'user': state.user.id
            });
        },
        loadChatMessages({dispatch, commit, state}, lastId = null) {
            return new Promise((resolve, reject) => {
                axios.post(`${process.env.VUE_APP_API_URL}/api/chat-messages`, {
                    'user': state.user.id,
                    'lastId': lastId
                }).then(response => {
                    commit('loadChatMessages', response.data);
                    resolve(response.data.messages);
                }).catch(e => {
                    console.log(e);
                });
            });
        },
        loadPreviousRoundResults({dispatch, commit, state}) {
            if (state.user.address) {
                axios.get(`${process.env.VUE_APP_API_URL}/api/prev-round-results?acc=${state.user.address}`)
                    .then(response => {
                        if (response.data) {
                            commit('prevRoundResults', response.data);
                        }
                    });
            }
        },
        tryAgainPrediction({dispatch, commit, state}, roomId) {
            axios.post(`${process.env.VUE_APP_API_URL}/api/try-again-prediction`, {
                'room': roomId,
                'user': state.user.id,
            }).catch(e => {
                alert('Server error');
            });

            commit('clearPrevRoomResults', roomId);
        },
        newDepositTransaction({dispatch, commit, state}, transaction) {
            socket.emit("NEW_DEPOSIT_TRANSACTION", {
                'hash': transaction.hash,
                'amount': transaction.amount,
                'user': state.user.id
            });

            commit('openTopMessage', {
                type: 'pending',
                textBefore: 'PENDING TRANSACTION',
                textAfter: 'is being mined...',
                hash: transaction.hash,
            });
        },
        newWithdrawTransaction({dispatch, commit, state}, transaction) {
            socket.emit("NEW_WITHDRAW_TRANSACTION", {
                'user': state.user.id,
                'amount': transaction.amount,
                'address': transaction.address
            });
        },
        loadBalanceHistory({dispatch, commit, state}) {
            return axios.get(`${process.env.VUE_APP_API_URL}/api/balance-history?acc=${state.user.address}`);
        },
        socket_transactionChange({dispatch, commit, state, getters}, value) {
            if (value.addressHash === getters.addressHash) {
                commit('openTopMessage', value);
                dispatch('loadUser');
            }
        },
    }
})