<template>
  <div class="d-inline-block">
    <b-button pill
              v-if="!$store.state.user.address"
              class="d-none d-lg-inline ml-2 btn-secondary-fill"
              v-b-modal.modal-connect-wallet>Connect Wallet
    </b-button>

    <div class="mobile-menu-button" v-if="$store.state.user.address">
      <b-button pill class="btn-secondary-fill" @click="isWalletPopupVisible = !isWalletPopupVisible">
        <img src="../assets/img/user.svg" alt="">
        <span class="ml-3 mr-3 d-none d-lg-inline align-middle">
          {{ address }}
        </span>
        <img src="../assets/img/icon-menu.svg" alt="" class="ml-3 mr-2 d-lg-none d-inline">
        <img src="../assets/img/white-arrow-down.svg" alt="" class="d-none d-lg-inline arrow-down">
      </b-button>

      <div class="menu-popup text-left" :class="{visible: isWalletPopupVisible}">
        <h3>My Wallet</h3>
        <button type="button" class="close pr-0" aria-label="Close" @click="closePopup">
          <span aria-hidden="true">&times;</span>
        </button>

        <div class="row mb-2">
          <div class="col-6 fz-14 text-uppercase text-grey font-weight-bold">Total Balance</div>
          <div class="col-6 text-right position-relative">
            <span class="avg-price">≈$ 4917,69</span>
            <p class="bold-500">2.02 ETH</p>
          </div>
        </div>

        <div class="row mb-2">
          <div class="col-6 fz-14 text-uppercase text-grey font-weight-bold">Pending Prize</div>
          <div class="col-6 text-right position-relative">
            <span class="avg-price">≈$ 4917,69</span>
            <p class="bold-500">2.02 ETH</p>
          </div>
        </div>

        <div class="text-center mb-4 pb-3">
          <b-button pill variant="secondary" class="btn-pad bold-500">Payout</b-button>
        </div>

        <hr class="mt-1 mb-1">
        <b-button variant="white border-none pl-0 d-block text-left bold-500" to="/my-predictions" @click="closePopup">
          My Predictions
        </b-button>
        <div class="d-block d-lg-none">
          <hr class="mt-1 mb-1">
          <b-button variant="white border-none pl-0 d-block text-left bold-500" to="/" @click="closePopup">
            Home
          </b-button>
          <hr class="mt-1 mb-1">
          <b-button variant="white border-none pl-0 d-block text-left bold-500" to="/about-club" @click="closePopup">
            About Club
          </b-button>
          <hr class="mt-1 mb-1">
          <b-button variant="white border-none pl-0 d-block text-left bold-500" to="/rules" @click="closePopup">
            Rules
          </b-button>
          <hr class="mt-1 mb-1">
          <b-button variant="white border-none pl-0 d-block text-left bold-500" to="/privacy" @click="closePopup">
            Privacy
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyWallet',
  data() {
    return {
      isWalletPopupVisible: false
    }
  },
  computed: {
    address() {
      const begin = this.$store.state.user.address.slice(0, 6);
      const end = this.$store.state.user.address.slice(-4);
      return `${begin}... ${end}`;
    }
  },
  created() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePopup();
      }
    });

    window.addEventListener('click', (e) => {
      const element = document.querySelector('.mobile-menu-button');
      if (element && e.target !== element && !element.contains(e.target)) {
        this.closePopup();
      }
    });
  },
  methods: {
    closePopup() {
      this.isWalletPopupVisible = false;
    }
  }
}
</script>

<style scoped>
h3 {
  font-size: 20px;
  margin-bottom: 34px;
}

.close {
  margin-right: -5px;
}

.avg-price {
  position: absolute;
  right: 15px;
  top: -14px;
  font-size: 12px;
  color: #464646;
}

.btn-pad {
  padding: 8px 30px;
}
</style>
