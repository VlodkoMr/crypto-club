import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        isReady: false,
        isMetamaskInstalled: false,
        user: {
            address: null,
            balanceETH: '',
            pendingBalanceETH: '',
        },
        round: {
            id: null,
            endTime: '',
            secondsToEnd: 0,
            predictions: [],
            rooms: [],
        }
    },
    mutations: {
        isMetamaskInstalled(state, value) {
            state.isMetamaskInstalled = value;
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
        updateTokenPrice(state, value) {
            let minimumFractionDigits = 2;
            if (value.price < 1) {
                minimumFractionDigits = 6;
            } else if (value.price < 10) {
                minimumFractionDigits = 5;
            } else if (value.price < 100) {
                minimumFractionDigits = 4;
            } else if (value.price < 1000) {
                minimumFractionDigits = 3;
            }

            this.state.round.rooms[value.index].price_usd = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: minimumFractionDigits
            }).format(value.price);
        },
        secondsToEnd(state, value) {
            this.state.round.secondsToEnd = value;
        },
        // SOCKET_CHAT_MESSAGE(state, value) {
        //     console.log('SOCKET_CHAT_MESSAGE', value);
        // }
    },
    actions: {
        loadRound({dispatch, commit, state}) {
            axios.get('http://localhost:9000/api/round')
                .then(response => {
                    if (response.data) {
                        commit('round', response.data);
                    }
                });

            const timerInterval = setInterval(() => {
                const seconds = state.round.secondsToEnd;
                if (seconds - 1 >= 0) {
                    commit('secondsToEnd', seconds - 1);
                } else {
                    clearInterval(timerInterval);
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
                        // console.log(data.s, data.k.c);
                    };
                    socket.onclose = function (event) {
                        alert('[close] Соединение прервано');
                        document.location.reload();
                    };
                });
            }, 100);
        }
        // loadUser({dispatch, commit, state}) {
        //     if (state.user.address) {
        //         axios.get(`http://localhost:9000/api/user?acc=${state.user.address}`)
        //             .then(response => {
        //                 if (response.data) {
        //                     commit('user', response.data);
        //                 }
        //             });
        //     }
        //
        // }
    }
})