import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        isReady: false,
        isMetamaskInstalled: false,
        user: {
            account: null,
            balanceETH: '',
            balanceUSDT: '',
            pendingBalanceETH: '',
            pendingBalanceUSDT: '',
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
        account(state, value) {
            state.user.account = value
        },
        isReady(state, value) {
            state.user.isReady = value
        },
        round(state, value) {
            this.state.round = value;
        },
        secondsToEnd(state, value) {
            this.state.round.secondsToEnd = value;
        },
        SOCKET_CHAT_MESSAGE(state, value) {
            console.log('SOCKET_CHAT_MESSAGE', value);
        }
    },
    actions: {
        loadRound({dispatch, commit, state}) {
            axios.get('http://localhost:9000/api/current-round')
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
        }
    }
})