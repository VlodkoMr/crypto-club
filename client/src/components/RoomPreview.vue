<template>
  <div class="ml-lg-3">
    <h3>{{ room.title }}</h3>
    <div class="row">
      <img :src="getTokenImg(room.symbol)" alt="" class="token-img">
      <img src="../assets/img/dot.svg" alt="" class="dots-img">

      <div class="col-5 pt-2 mt-1 text-grey font-weight-bold fz-14 pr-0">TOTAL STAKE</div>
      <div class="col-7 pt-1 text-right font-weight-bold fz-24 pr-4 pl-0">{{ room.entry }} ETH</div>
    </div>
    <div class="row">
      <div class="col-6 pt-2 mt-2 text-grey font-weight-bold fz-14">MEMBERS</div>
      <div class="col-6 pt-1 text-right font-weight-bold fz-24 pr-4 pl-0">{{ room.members }}</div>
    </div>
    <div class="text-center">
      <b-button class="btn-pad mt-4" pill :to="{name:'OneRoom', 'params':{'id': room.symbol}}">Join</b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoomPreview',
  props: ['room'],
  methods: {
    getTokenImg(symbol) {
      const images = require.context('../assets/img/tokens/', false, /\-black.svg$/);
      return images('./' + symbol + "-black.svg");
    },
  }
}
</script>

<style scoped>
h3 {
  font-size: 48px;
  font-weight: bold;
  margin-top: 70px;
}

.dots-img {
  position: absolute;
  z-index: -2;
  top: 26px;
  left: 28px;
}

.token-img {
  position: absolute;
  z-index: -1;
  top: 3px;
  right: 20%;
}

@media all and (min-width: 992px) and (max-width: 1340px) {
  h3 {
    font-size: 34px;
  }

  .fz-14 {
    font-size: 12px;
  }

  .fz-24 {
    font-size: 20px;
  }

  .dots-img {
    top: 15%;
    left: 6%;
    zoom: .8;
  }

  .token-img {
    top: -4px;
    right: 18%;
  }
}

</style>
