import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';
import {maxDigits} from './blockchain/metamask';

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
    },
    getters: {
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
            this.state.round = value;
        },
        rooms(state, value) {
            this.state.rooms = value;
        },
        addPrediction(state, value) {
            this.state.user.predictions.push(value);
        },
        cleanUpPrediction() {
            this.state.user.predictions = [];
        },
        updateTokenPrice(state, value) {
            this.state.rooms[value.index].price_usd = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: maxDigits(value.price)
            }).format(value.price);
        },
        secondsToEnd(state, value) {
            this.state.round.secondsToEnd = value;
        },
        SOCKET_ROOM_UPDATE_MEMBERS(state, value) {
            state.rooms.forEach(room => {
                if (room.id === value.room_id) {
                    room.entry = value.entry;
                    room.members = value.members;
                }
            });
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
        }
    }
})