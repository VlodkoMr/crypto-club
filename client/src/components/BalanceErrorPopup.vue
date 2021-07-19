<template>
  <b-modal size="sm" centered id="modal-balance-error" hide-footer hide-header title="Sorry">
    <button type="button" class="close" aria-label="Close" @click="$bvModal.hide('modal-balance-error')">
      <span aria-hidden="true">&times;</span>
    </button>

    <div>
      <h1 class="fz-24 font-weight-bolder mb-3">Sorry</h1>
      <p>You do not have enough ETH to make a prediction. Minimum entry {{ entry }} ETH</p>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'BalanceErrorPopup',
  computed: {
    entry() {
      return process.env.VUE_APP_ENTRY_ETH;
    }
  },
  methods: {}
}
</script>
