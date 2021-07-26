<template>
  <div class="row">
    <div class="col-lg">
      <div class="row">
        <div class="col-lg-5">
          <div class="row">
            <div class="col-lg-4 col-3">
              <b-button pill to="/" class="btn-sm btn-secondary-fill mt-4 d-none d-lg-block home-btn-width">
                Back
              </b-button>
              <b-button pill to="/" class="btn-sm btn-secondary-fill mt-2 d-lg-none d-block btn-arrow">
                <img src="../assets/img/back.svg" alt="<">
              </b-button>
            </div>

            <div class="col text-center text-lg-left pr-lg-2 pl-0 pl-lg-2" v-if="!prevRound">
              <RoundTimer compact-view="true"/>
            </div>

            <div class="col-lg-3 col-2"></div>
          </div>
        </div>

        <div class="col-lg text-center text-lg-left">
          <img src="../assets/img/dot.svg" alt="" class="dots-img">
          <h1 class="pr-5 mr-3 pr-lg-0">
            {{ room.title }}
            <img :src="getTokenImg(room.symbol)" alt="" class="token-img">
          </h1>
        </div>

        <div class="col-lg-3 pr-lg-0 font-weight-bold members-block d-none d-lg-block" v-if="!prevRound">
          <div class="row">
            <div class="col-6 text-right pt-2 text-grey fz-14 text-uppercase">Members</div>
            <div class="col-6 pl-0 pt-1 fz-18">{{ room.members }}</div>
          </div>
          <div class="row">
            <div class="col-6 text-right pt-1 mt-3 text-grey fz-14 text-uppercase">Total Stake</div>
            <div class="col-6 pl-0 fz-18 mt-3 position-relative">
              <small class="avg-price" v-if="room.entry > 0 &&  $store.state.priceETH > 0">
                ≈$ {{ parseFloat(room.entry * $store.state.priceETH).toFixed(2) }}
              </small>
              <span>{{ room.entry }} ETH</span>
            </div>
          </div>
        </div>
      </div>


      <div class="row" v-if="prevRound">
        <div class="col-6 offset-4">
          <div class="text-center mb-4">
            <p class="bold-500 fz-18 mb-0">
              <span v-if="prevRound.isWinner">Congratulations. Your prediction won</span>
              <span v-if="!prevRound.isWinner">Sorry, your prediction didn’t win</span>
            </p>
            <b class="bold-700 fz-36" v-if="prevRound.isWinner">{{ prevRound.winAmount }} ETH</b>
          </div>

          <div class="row bold-500">
            <div class="col-6 text-grey fz-14 text-uppercase pt-2">
              <span class="ml-3">Current Price</span>
            </div>
            <div class="col-6 fz-20 text-right">
              <span class="mr-3">{{ formatPrice(prevRound.roundPrice) }}</span>
            </div>
          </div>
          <div class="row bold-500 mt-3">
            <div class="col-6 text-grey fz-14 text-uppercase pt-2">
              <span class="ml-3">Your Prediction{{ prevRound.userPredictions.length > 1 ? 's' : '' }}</span>
            </div>
            <div class="col-6 fz-20 text-right">
              <div class="mr-3" v-for="price of prevRound.userPredictions" :key="price">
                {{ formatPrice(price) }}
              </div>
            </div>
          </div>

          <h4 class="mt-5 fz-20 bold-700 pl-3">List of winners</h4>
          <table class="table">
            <thead>
            <tr class="text-uppercase">
              <th class="pl-3">Account</th>
              <th>Prediction</th>
              <th>Time stamp</th>
            </tr>
            </thead>
            <tr v-for="winner of prevRound.winners" :key="winner.id">
              <td class="pl-3">{{ winner.user }}</td>
              <td class="bold-500">{{ formatPrice(winner.prediction_usd) }}</td>
              <td>{{ formatTime(winner.created_at) }}</td>
            </tr>
          </table>

          <div class="text-center">
            <button class="btn btn-secondary rounded-pill try-again bold-500" @click="tryAgain()">Try Again</button>
          </div>
        </div>
      </div>

      <div class="row" v-if="!prevRound">
        <div class="col-lg-5 offset-lg-4 prediction-form">

          <div class="row" v-if="room.price_usd">
            <div class="col-5 col-lg-6 text-right text-uppercase fz-14 font-weight-bold pr-0 text-grey">
              <div class="mt-4 pt-2 pl-3">Current Price</div>
            </div>
            <div class="col-6 mt-2 pt-1 position-relative">
              <span class="change-pct" :class="{green: room.price_pct > 0}" v-if="room.price_pct">{{ room.price_pct }}%</span>
              <b class="fz-36 text-nowrap price"
                 :class="{'pointer-event': $store.getters.canAddPrediction}"
                 @click="setCurrentPrice()">{{ room.price_usd }}</b>
            </div>
          </div>

          <div class="row">
            <div class="col-lg pr-lg-0 ml-lg-3 pl-5 pr-5" v-if="$store.getters.canAddPrediction">
              <input type="number" min="0" :step="getInputStep()" :placeholder="'Your prediction for '+ room.title +' price'"
                     v-model="userPrice"
                     class="form-control fz-14 mt-3 input-border form-control-lg"/>
              <div class="text-center mt-3 pt-1 mb-4 pb-3 pb-lg-2">
                <b-button pill class="btn-pad" @click="makePrediction()">Make a Prediction</b-button>
              </div>
            </div>
            <div class="col-lg pr-lg-0 ml-lg-3 pt-4 pb-5 mb-4 mt-2" v-if="!$store.getters.canAddPrediction">
              <p class="fz-18 bold-700 text-center pl-lg-5">Acceptance of predictions is completed.</p>
            </div>
          </div>

          <div v-if="$store.state.user.predictions" class="mb-5 mb-lg-3">
            <div class="row prediction-row mb-3" v-for="(prediction, index) in filterPredictions" :key="prediction.id">
              <div class="col-lg-5 col-4 text-grey fz-14 font-weight-bold text-right prediction-text">PREDICTION</div>
              <div class="col fz-16">{{ index + 1 }}) {{ formatPrice(prediction.prediction_usd) }}</div>
              <div class="col-3 fz-16 pr-0 text-lg-right">{{ weiToETH(prediction.entry_wei) }} ETH</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="col-lg-4 chat-block text-center" v-if="mobileChatOpened">
      <div class="text-center">
        <div class="ml-lg-5 ml-lg-2">
          <ChatApp/>
        </div>
      </div>
    </div>

    <img src="../assets/img/chat-button.svg" class="chat-button" alt=""
         v-if="!mobileChatOpened"
         @click="openChat()">

  </div>
</template>


<script>
import RoundTimer from '@/components/RoundTimer';
import web3 from 'web3';
import {formatPrice, formatDate, formatTime} from '@/blockchain/metamask';
import ChatApp from '@/components/ChatApp';

export default {
  name: 'OneRoom',
  data() {
    return {
      room: {},
      mobileChatOpened: window.innerWidth > 992,
      userPrice: ''
    }
  },
  computed: {
    filterPredictions() {
      return this.$store.state.user.predictions.filter(prediction => {
        return this.room.id === prediction.room_id;
      });
    },
    formatPrice() {
      return formatPrice;
    },
    formatDate() {
      return formatDate;
    },
    formatTime() {
      return formatTime;
    },
    prevRound() {
      return this.$store.state.prevRoundResults[this.room.id];
    }
  },
  created() {
    this.$store.state.rooms.forEach(room => {
      if (room.symbol === this.$route.params.id) {
        this.room = room;
      }
    });
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
    getInputStep() {
      if (this.room.price_usd) {
        const price = this.room.price_usd.replace('$', '');
        if (price < 1) {
          return '0.000001';
        } else if (price < 10) {
          return '0.00001';
        } else if (price < 100) {
          return '0.0001';
        } else if (price < 1000) {
          return '0.001';
        }
      }
      return '0.01';
    },
    openChat() {
      this.mobileChatOpened = true;
    },
    tryAgain() {
      this.$store.dispatch('tryAgainPrediction', this.room.id);
    },
    getTokenImg(symbol) {
      const images = require.context('../assets/img/tokens/', false, /\-black.svg$/);
      return images('./' + symbol + "-black.svg");
    },
    setCurrentPrice() {
      let price = this.room.price_usd.replace('$', '');
      price = price.replace(',', '')
      this.userPrice = price;
    },
    makePrediction() {
      if (!this.$store.state.user.address) {
        this.$bvModal.show('modal-connect-wallet')
        return false;
      }

      if (this.userPrice > 0 && this.$store.getters.canAddPrediction) {
        if (this.$store.state.user.balance >= process.env.VUE_APP_ENTRY_ETH) {
          this.$store.dispatch('makePrediction', {
            price: this.userPrice,
            room: this.room.id
          });
          this.userPrice = '';
        } else {
          this.$bvModal.show('modal-balance-error')
        }
      }
    },
    weiToETH(value) {
      if (value) {
        return web3.utils.fromWei('' + value);
      }
      return 0;
    }
  },
  components: {
    RoundTimer,
    ChatApp
  }
}
</script>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
  margin-top: 22px;
  margin-left: 12px;
  font-size: 48px;
  position: relative;
  display: inline;
  line-height: 96px;
}

h2 {
  font-size: 42px;
}

.token-img {
  top: -33px;
  right: -60px;
}

.dots-img {
  top: 10px;
  left: 10px;
}

.members-block {
  .fz-14 {
    line-height: 18px;
  }
}

.form-control-lg {
  height: 44px;
  padding: 18px;
}

.prediction-row {
  font-weight: 500;
}

.prediction-text {
  margin-top: 2px;
}

.change-pct {
  font-size: 24px;
  color: #ff8989;
  position: absolute;
  top: -18px;
  left: 124px;
  font-weight: 500;

  &.green {
    color: rgba(86, 236, 0, .7);
  }
}

.price {
  letter-spacing: -1px;
}

.avg-price {
  position: absolute;
  top: -14px;
  left: 23%;
  font-size: 12px;
  color: #464646;
}

.chat-block {
  min-width: 350px;
  max-width: 450px;
}

.prediction-form {
  min-width: 45%;
  margin-left: 30%;
}

.chat-button {
  display: none;
}

.try-again {
  width: 220px;
  padding: 10px;
  background-color: rgba(58, 58, 58, .7);
}

@media all and (max-width: 992px) {
  .chat-button {
    display: block;
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 99;
  }
  h1 {
    margin-top: 32px;
    display: inline-block;
    line-height: 72px;
  }
  h2 {
    font-size: 32px;
  }
  .dots-img {
    top: 19%;
    left: 18%;
  }
  .token-img {
    top: -20px;
    right: -14px;
  }
  .price {
    font-weight: 500;
    font-size: 28px;
    margin-top: 5px;
    display: inline-block;
  }
  .change-pct {
    left: 48%;
    font-size: 16px;
    top: -8px;
  }
  .prediction-form {
    margin-left: 0;
  }
}

@media all and (min-width: 992px) and (max-width: 1340px) {
  .members-block {
    display: none !important;
  }
  .token-img {
    left: 32%;
  }
}

</style>