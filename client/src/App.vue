<template>
  <div class="app-container" :class="{'homepage': isHomepage}">
    <header id="header">
      <div class="container">
        <div class="row">

          <div class="col-lg-3">
            <b-link to="/" active>
              <img src="./assets/img/logo.svg" alt="logo" class="logo">
            </b-link>
          </div>

          <div class="col-lg">
            <div class="row">
              <div class="col-12 pt-2 mt-1 col-lg-6 order-1 order-lg-0">
                <b-link to="/my-predictions"
                        class="text-left font-weight-bold pr-0 pl-1 no-decoration prediction-info"
                        v-if="$store.state.user.predictions.length">
                  <span class="mr-lg-3 mr-2 ml-lg-0 ml-2 text-grey">YOUR PREDICTION</span>
                  <b class="text-black">{{ $store.state.user.predictions.length }}</b>
                </b-link>
                <b-link to="/my-predictions"
                        class="text-left font-weight-bold pl-4 pr-0 no-decoration prediction-info"
                        v-if="$store.state.user.predictions.length">
                  <span class="mr-lg-3 mr-2 ml-2 text-grey">YOUR ENTRY</span>
                  <i class="avg-price">
                    ≈$ {{ parseFloat(predictionsEntry * $store.state.priceETH).toFixed(2) }}
                  </i>
                  <b class="text-black">
                    {{ predictionsEntry }} ETH
                  </b>
                </b-link>
              </div>

              <div class="col-12 col-lg-6 text-right">
                <!--<LanguageDropdown/>-->
                <UserAccount/>
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="container" v-if="$store.state.isReady">
      <router-view/>
    </div>

    <footer id="footer">
      <div class="container">
        <div class="row">
          <div class="col-lg-3 text-center text-lg-left text-nowrap">
            © 2021 Club of crypto lovers
          </div>
          <div class="col-lg d-none d-lg-block">
            <b-nav>
              <b-nav-item to="/" active variant="outline-primary" class="ml-lg-3">Home</b-nav-item>
              <b-nav-item to="/about-club" class="ml-lg-3">About Club</b-nav-item>
              <b-nav-item to="/rules" class="ml-lg-3">Rules</b-nav-item>
              <b-nav-item to="/privacy" class="ml-lg-3">Privacy</b-nav-item>
            </b-nav>
          </div>
          <div class="col-lg-3 d-none d-lg-block text-right pl-0 text-nowrap">
            Made with love by Crypto Lovers
          </div>
        </div>
      </div>
    </footer>

    <WalletConnectPopup @click="connectMetamask"/>
  </div>
</template>

<script>
import UserAccount from '@/components/UserAccount.vue'
import WalletConnectPopup from '@/components/WalletConnectPopup.vue'
import {isMetamaskInstalled, getUserAddress} from './blockchain/metamask'
import web3 from 'web3';

export default {
  data() {
    return {}
  },
  async created() {
    // Connect metamask on init
    await this.connectMetamask();
    await this.$store.dispatch('loadRound');
    await this.$store.dispatch('loadPreviousRoundResults');
    await this.$store.dispatch('loadUser');
  },
  computed: {
    isHomepage() {
      return this.$route.name === 'Home' || this.$route.name === 'Rooms';
    },
    predictionsEntry() {
      let result = 0;
      this.$store.state.user.predictions.forEach(item => {
        result += parseInt(item.entry_wei);
      });
      return web3.utils.fromWei('' + result);
    }
  },
  methods: {
    async connectMetamask() {
      this.$store.commit('isMetamaskInstalled', await isMetamaskInstalled());
      if (this.$store.state.isMetamaskInstalled) {
        this.$store.commit('address', await getUserAddress());
        this.$bvModal.hide('modal-connect-wallet');
      }
    }
  },
  components: {
    UserAccount,
    WalletConnectPopup
  }
}
</script>

<style lang="scss" src="./assets/css/main.scss"></style>
