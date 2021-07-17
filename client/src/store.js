import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';
import {maxDigits} from './blockchain/metamask';
import {io} from 'socket.io-client';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        priceETH: 0,
        isReady: false,
        isMetamaskInstalled: false,
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
            return `${begin}... ${end}`;
        },
        canAddPrediction(state) {
            return state.round.secondsToEnd > parseInt(process.env.VUE_APP_LOCK_ROUND_MINUTES) * 60;
        }
    },
    mutations: {
        isMetamaskInstalled(state, value) {
            state.isMetamaskInstalled = value;
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
            state.rooms[value.index].price_usd = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: maxDigits(value.price)
            }).format(value.price);
        },
        secondsToEnd(state, value) {
            state.round.secondsToEnd = value;
        },
        loadChatMessages(state, value) {
            state.chat.messages.unshift(...value.messages)
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
            state.chat.messages.push(value);
        }
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
                    }, 1000);
                }
            }, 1000);
        },
        getBinancePriceStreams({dispatch, commit, state}) {
            state.rooms.forEach((room, roomIndex) => {
                const ticker = room.symbol + 'usdt';
                const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${ticker}@kline_1m`);
                socket.onmessage = function (event) {
                    const data = JSON.parse(event.data);
                    commit('updateTokenPrice', {index: roomIndex, price: data.k.c})
                    if (room.symbol === 'eth') {
                        commit('updateETHPrice', data.k.c)
                    }
                };
                socket.onclose = function (event) {
                    console.log('[close] Соединение прервано')
                    document.location.reload();
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
            const socket = io(process.env.VUE_APP_API_URL);
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
        }
    }
})