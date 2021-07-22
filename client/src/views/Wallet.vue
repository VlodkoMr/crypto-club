<template>
  <div>
    <div class="row">

      <div class="col-lg-3 col-12">
        <div class="row">
          <div class="col-lg-4 col-3">
            <b-button pill to="/" class="btn-sm btn-secondary-fill mt-4 d-none d-lg-block home-btn-width">
              Home
            </b-button>
            <b-button pill to="/" class="btn-sm btn-secondary-fill mt-3 d-lg-none d-block btn-arrow ml-2">
              <img src="../assets/img/back.svg" alt="<">
            </b-button>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6 pl-3 pr-3 p-sm-0">
        <h1 class="font-weight-bold mt-4 mb-lg-5 mb-3 text-center text-lg-left">My Wallet</h1>
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-lg-5 offset-lg-3 p-3 p-sm-0">
        <b-tabs content-class="mt-4">
          <b-tab title="Deposit" :active="activeTab==='deposit'">
            <div class="row">
              <div class="col-9 form-group">
                <label class="pl-3 text-uppercase fz-14 bold-500 mb-1">Amount (ETH)</label>
                <input type="number" step="0.01" min="0" placeholder="0,00"
                       class="form-control mb-2 fz-16 input-border form-control-lg" v-model="depositAmount"/>
                <button class="btn btn-secondary rounded-pill btn-secondary-fill mt-2 payment-button" @click="deposit()">
                  Generate payment
                </button>
              </div>
            </div>
          </b-tab>

          <b-tab title="Withdrawal" :active="activeTab==='withdrawal'">
            <div class="row">
              <div class="col-9">
                <div class="form-group">
                  <label class="pl-3 text-uppercase fz-14 bold-500 mb-1">To address</label>
                  <input type="text" class="form-control mb-2 fz-16 input-border form-control-lg" v-model="withdrawAddress"/>
                </div>
                <div class="form-group position-relative">
                  <label class="pl-3 text-uppercase fz-14 bold-500 mb-1">Amount (ETH)</label>
                  <input type="number" step="0.01" min="0" placeholder="0,00" v-model="withdrawAmount"
                         class="form-control mb-2 fz-16 input-border form-control-lg input-small-amount no-arrows"/>
                  <button class="btn btn-link text-black p-1 max-btn" @click="maxBalance()">MAX</button>
                </div>
                <button class="btn btn-secondary rounded-pill btn-secondary-fill mt-2 payment-button" @click="withdraw()">
                  Withdraw
                </button>
              </div>
            </div>
          </b-tab>

          <b-tab title="History" :active="activeTab==='history'" @click="loadHistory()">

            <div v-if="!balanceHistory.length">
              *No transactions
            </div>
            <div v-if="balanceHistory.length">
              <table class="table">
                <thead>
                <tr>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>TRANSACTION</th>
                  <th>STATUS</th>
                </tr>
                </thead>
                <tr v-for="tx of balanceHistory" :key="tx.id">
                  <td>{{ formatDate(tx.created_at) }}</td>
                  <td class="text-capitalize">{{ tx.type }}</td>
                  <td class="bold-500">{{ web3.utils.fromWei(tx.amount_wei) }} ETH</td>
                  <td><a :href="txUrl(tx.hash)" target="_blank">{{ txShort(tx.hash) }}</a></td>
                  <td class="bold-500">{{ statusText(tx.status) }}</td>
                </tr>
              </table>
            </div>

          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>


<script>
import {formatDate} from '@/blockchain/metamask';
import {depositPromise, txShort} from '@/blockchain/metamask';

export default {
  name: 'Wallet',
  data() {
    return {
      activeTab: '',
      depositAmount: '',
      withdrawAmount: '',
      withdrawAddress: this.$store.state.user.address,
      balanceHistory: []
    }
  },
  computed: {
    web3() {
      return window.web3;
    },
    formatDate() {
      return formatDate;
    },
    txShort() {
      return txShort;
    },
  },
  metaInfo() {
    const meta = this.$t('meta.home');

    return {
      title: meta['title'] || '',
      meta: [
        {name: 'description', content: meta['description'] || ''},
        {property: 'og:title', content: meta['title'] || ''},
        {property: 'og:site_name', content: this.$t('meta.site_name') || ''},
        {property: 'og:type', content: 'website'},
        {name: 'robots', content: 'index, follow'}
      ]
    }
  },

  methods: {
    loadHistory() {
      this.$store.dispatch('loadBalanceHistory').then(result => {
        this.balanceHistory = result.data;
      });
    },
    txUrl(hash) {
      return process.env.VUE_APP_ETHERSCAN_URL + hash;
    },
    statusText(status) {
      if (status === 2) {
        return 'Failed';
      } else if (status === 1) {
        return 'Success';
      } else {
        return 'In Progress';
      }
    },
    deposit() {
      if (this.depositAmount > 0) {
        depositPromise(this.depositAmount).then(result => {
          this.$store.dispatch('newDepositTransaction', {
            hash: result,
            amount: this.depositAmount
          });
          this.depositAmount = '';
        }).catch(err => {
          this.$store.commit('openTopMessage', {
            type: 'error',
            textBefore: err
          })
        })
      }
    },
    maxBalance() {
      if (this.$store.state.user.balance > 0) {
        this.withdrawAmount = this.$store.state.user.balance;
      }
    },
    withdraw() {
      if (this.withdrawAmount > 0 && this.withdrawAddress) {
        this.$store.dispatch('newWithdrawTransaction', {
          amount: this.withdrawAmount,
          address: this.withdrawAddress
        });

        setTimeout(() => {
          this.withdrawAmount = 0;
        }, 1000);
      }
    }
  },
  components: {}
}
</script>

<style lang="scss">
.nav-tabs {
  border: none !important;

  .nav-link {
    font-weight: 500;
    color: #84847E;
    padding-left: 0;
    padding-right: 50px;
    font-size: 18px;
    border: none !important;

    &.active {
      background-color: transparent !important;
      color: #000 !important;
    }
  }
}

.no-arrows {
  &::-webkit-outer-spin-button, &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.max-btn {
  position: absolute;
  left: 210px;
  top: 31px;

  &:hover {
    text-decoration: none !important;
  }
}

.payment-button {
  width: 220px;
}

.input-small-amount {
  width: 270px !important;
  max-width: 100%;
}

.table {
  a {
    color: #000;
  }
}

</style>