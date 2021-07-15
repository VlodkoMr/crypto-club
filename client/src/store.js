import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';
import {maxDigits} from './blockchain/metamask';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        lockRoundMinutes: 2,
        entryETH: 0.01,
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
            rooms: [],
        }
    },
    getters: {
        canAddPrediction(state) {
            return state.round.secondsToEnd > state.lockRoundMinutes * 60;
        }
    },
    mutations: {
        isMetamaskInstalled(state, value) {
            state.isMetamaskInstalled = value;
        },
        user(state, value) {
            state.user = value
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
        addPrediction(state, value) {
            this.state.user.predictions.push(value);
        },
        cleanUpPrediction(state) {
            this.state.user.predictions = [];
        },
        updateTokenPrice(state, value) {
            // console.log(maxDigits(value.price))
            this.state.round.rooms[value.index].price_usd = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: maxDigits(value.price)
            }).format(value.price);
        },
        secondsToEnd(state, value) {
            this.state.round.secondsToEnd = value;
        },
        SOCKET_ROOM_UPDATE_MEMBERS(state, value) {
            state.round.rooms.forEach(room => {
                if (room.id === value.room_id) {
                    room.entry = value.entry;
                    room.members = value.members;
                }
            });
        }
    },
    actions: {
        loadRound({dispatch, commit, state}) {
            axios.get(`http://localhost:9000/api/round`)
                .then(response => {
                    if (response.data) {
                        commit('round', response.data);
                        setTimeout(() => {
                            commit('isReady', true);
                        }, 50);
                    }
                });

            const timerInterval = setInterval(() => {
                const seconds = state.round.secondsToEnd;
                if (seconds - 1 >= 0) {
                    commit('secondsToEnd', seconds - 1);
                } else {
                    clearInterval(timerInterval);
                    commit('cleanUpPrediction');
                    dispatch('loadRound');
                }
            }, 1000);
        },
        getPriceStreams({dispatch, commit, state}) {
            setTimeout(() => {
                state.round.rooms.forEach((room, roomIndex) => {
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
            }, 100);
        },
        makePrediction({dispatch, commit, state}, data) {
            // balance

            axios.post(`http://localhost:9000/api/add-prediction`, {
                user: state.user.id,
                price: data.price,
                room: data.room
            }).then(response => {
                if (response.data.status === 'success') {
                    commit('addPrediction', response.data.prediction);
                } else {
                    alert('Server error!')
                }
            });
        },
        loadUser({dispatch, commit, state}) {
            if (state.user.address) {
                axios.get(`http://localhost:9000/api/user?acc=${state.user.address}`)
                    .then(response => {
                        if (response.data) {
                            commit('user', response.data);
                        }
                    });
            }

        }
    }
})