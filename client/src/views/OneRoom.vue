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
          <img :src="getTokenImg(room.symbol)" alt="" class="token-img">
          <img src="../assets/img/dot.svg" alt="" class="dots-img">
          <h1 class="pr-5 mr-3 pr-lg-0">{{ room.title }}</h1>
        </div>

        <div class="col-lg-3 pr-lg-0 font-weight-bold members-block d-none d-lg-block">
          <div class="row">
            <div class="col-6 text-right pt-2 text-grey fz-14 text-uppercase">Members</div>
            <div class="col-6 pl-0 pt-1 fz-18">80</div>
          </div>
          <div class="row">
            <div class="col-6 text-right pt-2 mt-3 text-grey fz-14 text-uppercase">Total Stake</div>
            <div class="col-6 pl-0 fz-18 pt-1 mt-3 position-relative">
              <small class="avg-price">≈$ 1606,77</small>
              <span>0.66 ETH</span>
            </div>
          </div>
        </div>

      </div>

      <div class="row">
        <div class="col-lg-5 offset-lg-4 prediction-form">

          <div class="row">
            <div class="col-5 text-right text-uppercase fz-14 font-weight-bold pr-0 text-grey">
              <div class="mt-4 pt-2">Current Price</div>
            </div>
            <div class="col-7 mt-2 pt-1 position-relative">
              <span class="change-pct">-1.1%</span>
              <b class="fz-36 text-nowrap price">{{ room.price_usd }}</b>
            </div>
          </div>

          <div class="row">
            <div class="col-lg pr-lg-0 ml-lg-3 pl-5 pr-5">
              <input type="text" placeholder="Your prediction for BTC price"
                     class="form-control fz-14 mt-3 input-border form-control-lg"/>
              <div class="text-center mt-3 pt-1 mb-4 pb-3 pb-lg-2">
                <b-button pill class="btn-pad">Make a Prediction</b-button>
              </div>
            </div>
          </div>

          <div class="row prediction-row mb-3">
            <div class="col-4 text-grey fz-14 font-weight-bold text-right prediction-text">PREDICTION</div>
            <div class="col-5 fz-16">1) $27, 754.2345</div>
            <div class="col-3 fz-16 pr-0 text-lg-right">0.02 ETH</div>
          </div>

        </div>
      </div>
    </div>

    <div class="col-lg-4 chat-block mt-5 mt-lg-0 text-center">
      <div class="text-center">
        <img src="../assets/img/chat.png" alt="" style="width: 350px;" class="ml-lg-5 ml-2">
      </div>
    </div>

  </div>
</template>


<script>
import RoundTimer from '@/components/RoundTimer';

export default {
  name: 'OneRoom',
  data() {
    return {
      room: null
    }
  },
  created() {
    this.$store.state.round.rooms.forEach(room => {
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
    getTokenImg(symbol) {
      const images = require.context('../assets/img/tokens/', false, /\-black.svg$/);
      return images('./' + symbol + "-black.svg");
    }
  },
  components: {
    RoundTimer
  }
}
</script>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
  margin-top: 22px;
  margin-left: 12px;
  font-size: 48px;
}

h2 {
  font-size: 42px;
}

.token-img {
  top: -14px;
  right: 22%;
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
  left: 146px;
  font-weight: 500;
}

.price {
  letter-spacing: -1px;
}

.avg-price {
  position: absolute;
  top: -9px;
  left: 19px;
  font-size: 12px;
  color: #464646;
}

.chat-block {
  width: 350px;
}

.prediction-form {
  min-width: 50%;
  margin-left: 25%;
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