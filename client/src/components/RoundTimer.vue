<template>
  <div>

    <div v-if="!isClosed">
      <div class="make-prediction mb-1">Make your prediction</div>
      <h2 class="font-bai make-prediction-time" :class="{'m-auto text-center': !compactView}">{{ timeToEnd }}</h2>
    </div>

    <div v-if="isClosed">
      <div class="make-prediction mb-1">
        {{ compactView ? 'Results in' : 'Acceptance of predictions is completed.' }}
      </div>
      <div>
        <span class="results-in d-inline-block make-prediction" v-if="!compactView">Results in</span>
        <h2 class="d-inline-block font-bai make-prediction-time closed pr-3">{{ timeToEnd }}</h2>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'RoundTimer',
  props: ['compactView'],
  computed: {
    isClosed() {
      return this.$store.state.round.secondsToEnd <= 2 * 60;
    },
    timeToEnd() {
      let minutes = 0;
      let seconds = 0;
      const totalSeconds = this.$store.state.round.secondsToEnd;
      if (totalSeconds >= 0) {
        minutes = parseInt(totalSeconds / 60);
        seconds = totalSeconds - minutes * 60;
      }

      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      if (seconds < 10) {
        seconds = '0' + seconds;
      }

      return `00:${minutes}:${seconds}`;
    }
  }
}
</script>

<style scoped>
@media all and (max-width: 1000px) {
  .make-prediction-time {
    margin: auto;
    text-align: center;
  }
}
</style>