<template>
  <div>
    <div class="row">
      <div class="col-lg-4">
        <h1 class="pt-lg-4 ml-lg-4 pl-lg-2 text-center text-lg-left">Prediction Rooms</h1>
      </div>
      <div class="col-lg-4 text-center">
        <RoundTimer/>
      </div>
    </div>
    <div class="d-lg-none d-block splide-block pl-2 pr-2 ml-2">
      <splide :options="options">
        <splide-slide v-for="room in $store.state.rooms" :key="room.id">
          <RoomPreview :room="room"/>
        </splide-slide>
      </splide>
    </div>
    <div class="row d-none d-lg-flex rooms-list">
      <div class="col-lg-3 room-block" v-for="room in $store.state.rooms" :key="room.id">
        <RoomPreview :room="room"/>
      </div>
    </div>

  </div>
</template>

<script>
import RoomPreview from '@/components/RoomPreview';
import RoundTimer from '@/components/RoundTimer';

export default {
  name: 'HomepageUser',
  data() {
    return {
      options: {
        rewind: true,
        width: 800,
        perPage: 1,
        arrows: false,
      },
    };
  },
  components: {
    RoomPreview,
    RoundTimer
  },
}
</script>


<style lang="scss" scoped>
h1 {
  font-weight: bold;
  font-size: 48px;
}

h2 {
  font-size: 48px;
}

.room-block {
  padding: 0 3rem !important;
}

.rooms-list {
  margin-top: 4vh;
}

@media all and (max-width: 992px) {
  h1 {
    font-size: 36px;
  }

  h2 {
    font-size: 32px;
  }

  .splide-block {
    height: 50vh;

    .splide {
      height: 100%;
    }

    .splide__slide {
      padding: 0 10vw;
    }
  }
}

@media all and (min-width: 992px) and (max-width: 1340px) {
  h1 {
    font-size: 32px;
  }

  .room-block {
    padding: 0 1rem !important;
    margin-top: 2rem;
  }

}

</style>