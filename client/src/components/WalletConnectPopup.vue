<template>
  <b-modal id="modal-connect-wallet" hide-footer hide-header title="Connect Wallet">
    <button type="button" class="close" aria-label="Close" @click="$bvModal.hide('modal-connect-wallet')">
      <span aria-hidden="true">&times;</span>
    </button>

    <div class="p-3">
      <h1 class="fz-24 font-weight-bolder mb-3">Connect your wallet.</h1>
      <p class="mb-4 fz-18">By connecting your wallet, you agree to our
        <b-link to="/rules" class="text-grey" @click="$bvModal.hide('modal-connect-wallet')">Terms of Service</b-link>
        and our
        <b-link to="/privacy" class="text-grey" @click="$bvModal.hide('modal-connect-wallet')">Privacy Policy.</b-link>
      </p>

      <b-button block size="lg" variant="white" :disabled="!isMetamaskInstalled"
                class="btn-outline-secondary text-left wallet-connect"
                @click="connectMetamask()">
        MetaMask
        <span v-if="!isMetamaskInstalled">(not installed)</span>
        <img src="../assets/img/metamask.svg" alt="">
      </b-button>

      <!--        <b-button block size="lg" class="btn-outline-secondary text-left wallet-connect" variant="white">-->
      <!--          Wallet Connect-->
      <!--          <img src="../assets/img/walletconnect.svg" alt="" class="mt-1">-->
      <!--        </b-button>-->

      <p class="mt-4 pt-2 fz-18 mb-2">New to Ethereum?</p>
      <b-link href="https://medium.com/@decryptmedia/metamask-the-beginners-guide-6111143f2581" class="text-grey"
              @click="$bvModal.hide('modal-connect-wallet')" target="_blank">
        Learn more about wallets
      </b-link>
    </div>
  </b-modal>
</template>

<script>
import {isMetamaskInstalled} from '@/blockchain/metamask';


export default {
  name: 'WalletConnectPopup',
  computed: {
    isMetamaskInstalled() {
      return isMetamaskInstalled();
    }
  },
  methods: {
    connectMetamask() {
      return this.$parent.connectMetamask()
    }
  }
}
</script>
