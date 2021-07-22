<template>
  <div class="popup-block" :class="{
    visible: $store.state.topMessage.isVisible,
    error: $store.state.topMessage.type==='error',
    success: $store.state.topMessage.type==='success',
   }">
    {{ $store.state.topMessage.textBefore }}
    <a :href="txUrl" target="_blank" v-if="shortHash">{{ shortHash }}</a>
    {{ $store.state.topMessage.textAfter }}

    <img src="../assets/img/close.svg" alt="x" @click="close()" class="close">
  </div>
</template>

<script>
export default {
  name: 'TopMessagePopup',
  computed: {
    txUrl() {
      return process.env.VUE_APP_ETHERSCAN_URL + this.$store.state.topMessage.hash;
    },
    shortHash() {
      const hash = this.$store.state.topMessage.hash;
      if (hash) {
        const begin = hash.slice(0, 8);
        const end = hash.slice(-8);
        return `${begin}...${end}`;
      }

      return '';
    }
  },
  methods: {
    close() {
      this.$store.commit('closeTopMessage');
    }
  }
}
</script>

<style lang="scss">
.popup-block {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 550px;
  max-width: 100%;
  background: #F8F8F8;
  box-shadow: 0 15px 10px rgba(13, 39, 80, 0.16);
  border-radius: 25px;
  padding: 20px 55px 20px 35px;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  top: -50px;
  opacity: 0;
  z-index: -1;
  transition: all ease .3s;

  &.visible {
    opacity: 1;
    top: 9px;
    z-index: 1;
  }

  &.error {
    color: #FF0000;

    a {
      color: #FF0000;
    }
  }

  &.success {
    color: #04990A;

    a {
      color: #04990A;
    }
  }

  a {
    margin: 0 10px;
    font-weight: 300;
    text-decoration: underline;
    color: #000;
  }

  .close {
    cursor: pointer;
    padding: 2px;
    margin-top: -5px;
  }
}
</style>