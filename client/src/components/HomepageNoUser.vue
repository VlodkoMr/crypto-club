<template>
  <div class="row">
    <div class="col-lg-7">
      <div class="ml-lg-5 mr-lg-0 pl-lg-0 ml-3 pl-2 mr-4">
        <h1 class="mr-4 mr-lg-0">Welcome to club of Crypto Lovers</h1>
        <p class="home-description">
          Stake crypto, predict prices for an hour on BTC, ETH, XRP, DOGE
          compete with other users to win a collective bank.
        </p>
        <div class="text-center text-lg-left">
          <b-button pill v-b-modal.modal-how-it-work variant="white" class="font-weight-bolder">
            <img src="../assets/img/book.svg" alt="" class="mr-1">
            How it works
          </b-button>
        </div>
      </div>
    </div>

    <div class="col-lg-4 overflow-lg-visible" v-if="oneRoom">
      <div class="one-currency">
        <img :src="getTokenImg(oneRoom.symbol)" alt="" class="token-img">
        <img src="../assets/img/dot.svg" alt="" class="dots-img">
        <h2>{{ oneRoom.title }}</h2>
        <span class="price-block" v-if="oneRoom.price_usd">
          {{ oneRoom.price_usd }}
          <span class="price-now-text d-inline-block">PRICE NOW</span>
          <span class="price-now red" v-if="oneRoom.price_pct">{{ oneRoom.price_pct }}%</span>
        </span>
      </div>
      <div class="text-center mt-3 ml-3">
        <p class="font-seaweed how-much">How much will it cost at {{ endRound }}?</p>
        <b-button pill class="btn-pad" :to="{name:'OneRoom', 'params':{'id': oneRoom.symbol}}">Make a Prediction</b-button>
      </div>
    </div>

    <b-modal id="modal-how-it-work" hide-footer hide-header size="lg">
      <button type="button" class="close" aria-label="Close" @click="$bvModal.hide('modal-how-it-work')">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="mt-4 mb-2">
        <iframe width="100%" height="400px" src="https://www.youtube.com/embed/yWfZnjkhhhg?controls=0&amp;start=28" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </b-modal>
  </div>
</template>

<script>
import {formatTime} from '@/blockchain/metamask';

export default {
  name: 'HomepageNoUser',
  computed: {
    oneRoom() {
      return this.$store.state.rooms[this.currentRoomIndex];
    },
    endRound() {
      return formatTime(this.$store.state.round.endTime).slice(0, 5);
    }
  },
  data() {
    return {
      currentRoomIndex: 0,
      roomsInterval: null,
    }
  },
  mounted() {
    this.roomsInterval = setInterval(() => {
      this.currentRoomIndex++;
      if (this.currentRoomIndex > this.$store.state.rooms.length - 1) {
        this.currentRoomIndex = 0;
      }
    }, 2500);
  },
  destroyed() {
    clearInterval(this.roomsInterval);
  },
  methods: {
    getTokenImg(symbol) {
      const images = require.context('../assets/img/tokens/', false, /.svg$/);
      return images('./' + symbol + ".svg");
    },
  }
}
</script>

<style lang="scss" scoped>
h1 {
  margin-top: 16vh;
  font-size: 64px;
  line-height: 72px;
  font-weight: 700;
  margin-bottom: 24px;
}

h2 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 3px;
}

.home-description {
  font-weight: 500;
  font-size: 18px;
  line-height: 190%;
  margin-bottom: 10px;
}

.one-currency {
  margin: 17vh auto 0 auto;
  width: 216px;
  position: relative;

  .dots-img {
    top: -30%;
    left: -10%;
  }

  .token-img {
    top: -110px;
    right: -130px;
  }

  .price-block {
    font-size: 36px;
    margin-top: 20px;
    display: inline-block;
    font-weight: 600;
    position: relative;

    .price-now-text {
      color: #545454;
      font-size: 14px;
      font-weight: 500;
      position: absolute;
      top: -15px;
      left: 0;
    }

    .price-now {
      font-weight: 600;
      font-size: 24px;
      position: absolute;
      top: -23px;
      right: 0;

      &.red {
        color: #FF8989;
      }
    }
  }
}

.how-much {
  transform: rotate(-2deg);
  font-size: 24px;
}

@media all and (min-width: 992px) and (max-width: 1340px) {
  .token-img {
    zoom: .8;
  }
}

@media all and (max-width: 992px) {
  h1 {
    font-size: 36px;
    line-height: 36px;
    margin-top: 30px;
  }
}

</style>
