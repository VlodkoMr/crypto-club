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
        rooms: [],
        round: {
            id: null,
            secondsToEnd: 135,
            endTime: '',
            isLocked: false,
            predictions: [],
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
        rooms(state, value) {
            state.rooms = value;
        },
        secondsToEnd(state, value) {
            this.state.round.secondsToEnd = value;
        },
        SOCKET_CHAT_MESSAGE(state, value) {
            console.log('SOCKET_CHAT_MESSAGE', value);
        }
    },
    actions: {
        loadRooms(context) {
            return axios.get('http://localhost:9000/api/rooms')
                .then(response => {
                    if (response.data) {
                        context.commit('rooms', response.data);
                    }
                });
        },
        loadRound(context) {
            setInterval(() => {
                const seconds = context.state.round.secondsToEnd;
                if (seconds - 1 >= 0) {
                    context.commit('secondsToEnd', seconds - 1);
                }
            }, 1000);
        }
    }
})