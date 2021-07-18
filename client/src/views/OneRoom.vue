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

            <div class="col text-center text-lg-left">
              <RoundTimer compact-view="true"/>
            </div>

            <div class="col-3 d-lg-none"></div>
          </div>
        </div>

        <div class="col-lg text-center text-lg-left">
          <img src="../assets/img/dot.svg" alt="" class="dots-img">
          <h1 class="pr-5 mr-3 pr-lg-0">
            {{ room.title }}
            <img :src="getTokenImg(room.symbol)" alt="" class="token-img">
          </h1>
        </div>

        <div class="col-lg-3 pr-lg-0 font-weight-bold members-block d-none d-lg-block">
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

      <div class="row">
        <div class="col-lg-5 offset-lg-4 prediction-form">

          <div class="row" v-if="room.price_usd">
            <div class="col-6 text-right text-uppercase fz-14 font-weight-bold pr-0 text-grey">
              <div class="mt-4 pt-2 pl-3">Current Price</div>
            </div>
            <div class="col-6 mt-2 pt-1 position-relative">
              <span class="change-pct" v-if="room.price_pct">{{ room.price_pct }}%</span>
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
              <p class="fz-18 bold-700 text-center pl-5">Acceptance of predictions is completed.</p>
            </div>
          </div>

          <div v-if="$store.state.user.predictions">
            <div class="row prediction-row mb-3" v-for="(prediction, index) in filterPredictions" :key="prediction.id">
              <div class="col-5 text-grey fz-14 font-weight-bold text-right prediction-text">PREDICTION</div>
              <div class="col fz-16">{{ index + 1 }}) {{ predictionFormat(prediction.prediction_usd) }}</div>
              <div class="col-3 fz-16 pr-0 text-lg-right">{{ weiToETH(prediction.entry_wei) }} ETH</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="col-lg-4 chat-block mt-5 mt-lg-0 text-center">
      <div class="text-center">
        <div class="ml-lg-5 ml-2">
          <ChatApp/>
        </div>
      </div>
    </div>

  </div>
</template>


<script>
import RoundTimer from '@/components/RoundTimer';
import web3 from 'web3';
import {maxDigits} from '@/blockchain/metamask';
import ChatApp from '@/components/ChatApp';

export default {
  name: 'OneRoom',
  data() {
    return {
      room: {},
      userPrice: ''
    }
  },
  computed: {
    filterPredictions() {
      return this.$store.state.user.predictions.filter(prediction => {
        return this.room.id === prediction.room_id;
      });
    }
  },
  created() {
    // previous results


    this.$store.state.rooms.forEach(room => {
      if (room.symbol === this.$route.params.id) {
        this.room = room;
      }
    })
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
    predictionFormat(price) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: maxDigits(price)
      }).format(price);
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
          alert('Not enough balance for prediction.')
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
  color: #FF8989;
  position: absolute;
  top: -18px;
  left: 124px;
  font-weight: 500;
}

.price {
  letter-spacing: -1px;
}

.avg-price {
  position: absolute;
  top: -12px;
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

@media all and (max-width: 992px) {
  h1 {
    margin-top: 32px;
  }
  h2 {
    font-size: 32px;
  }
  .dots-img {
    top: 19%;
    left: 18%;
  }
  .token-img {
    top: 0;
    right: 23%;
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