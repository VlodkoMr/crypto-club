<template>
  <div>
    <div class="row">

      <div class="col-lg-3 col-12">
        <div class="row">
          <div class="col-lg-4 col-2">
            <b-button pill to="/" class="btn-sm btn-secondary-fill mt-4 d-none d-lg-block home-btn-width">
              Home
            </b-button>
            <b-button pill to="/" class="btn-sm btn-secondary-fill mt-3 d-lg-none d-block btn-arrow ml-2">
              <img src="../assets/img/back.svg" alt="<">
            </b-button>
          </div>

          <div class="col col-lg-8 text-center text-lg-left timer-block">
            <RoundTimer compact-view="true"/>
          </div>

          <div class="col-2 d-lg-none"></div>
        </div>
      </div>

      <div class="col-12 col-lg-6 pl-3 pr-3 p-sm-0">
        <h1 class="font-weight-bold mt-4 mb-lg-5 mb-3 text-center text-lg-left">Privacy Policy</h1>
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-sm-9 col-lg-6 offset-lg-3 p-3 p-sm-0">
        <p>
          Club of Crypto Lovers is a transparent and blockchain-based prediction platform where users can compete in predicting the hourly price of digital
          assets. We do not charge high fees, freeze accounts or manipulate the price of assets.
        </p>
        <p>
          Club of Crypto lovers is built on Ethereum so we can offer our users direct payouts that no third party can interfere with. We use centralized servers
          for sorting and looping so we can ensure the stability of prediction rooms and reduce the gas fees but we do not collect any users' personal
          information (social media, name, e-mail, phone number). No registration is required – connect your crypto wallet and participate.
        </p>
      </div>
    </div>
  </div>
</template>


<script>
import RoundTimer from '@/components/RoundTimer';

export default {
  name: 'AboutClub',
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
  components: {
    RoundTimer
  }
}
</script>