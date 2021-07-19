<template>
  <div class="row">
    <div class="col-lg-3 col-12">
      <div class="row">
        <div class="col-lg-4 col-3">
          <b-button pill to="/" class="btn-sm btn-secondary-fill mt-4 d-none d-lg-block home-btn-width">
            Home
          </b-button>
          <b-button pill to="/" class="btn-sm btn-secondary-fill mt-3 d-lg-none d-block btn-arrow ml-2">
            <img src="../assets/img/back.svg" alt="<">
          </b-button>
        </div>

        <div class="col col-lg-8 text-center text-lg-left timer-block pl-0 pl-lg-2">
          <RoundTimer compact-view="true"/>
        </div>

        <div class="col-2 d-lg-none"></div>
      </div>
    </div>

    <div class="col-lg-6">
      <h1 class="text-center mb-4 font-weight-bold mt-lg-0 mt-4">My Predictions</h1>
      <div class="row">
        <div class="col-lg-4 col-6 pl-4 text-right">

          <b-dropdown id="dropdown-room" class="min-dropdown" v-model="selectedRoom" variant="white" :text="selectedRoomTitle">
            <b-dropdown-item @click="selectedRoom=''">All Rooms</b-dropdown-item>
            <b-dropdown-item v-for="room in $store.state.rooms" :key="room.id" @click="selectedRoom=room.id">
              {{ room.title }}
            </b-dropdown-item>
          </b-dropdown>
        </div>

        <div class="col-lg-4 col-12 order-lg-0 order-2 mt-lg-0 mt-2 pl-4 pr-4">
          <b-form-datepicker
              :max="maxDate"
              v-model="selectedDate"
              @input="loadDateRounds()"
              placeholder="Choose a date"
              weekday-header-format="short"
              class="datepicker"
              :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
          ></b-form-datepicker>
        </div>

        <div class="col-lg-4 col-6 pr-4">
          <b-dropdown id="dropdown-time" class="min-dropdown" v-model="selectedRound" variant="white" :text="selectedRoundTitle">
            <b-dropdown-item @click="selectedRound = ''" v-if="rounds.length">
              All Rounds
            </b-dropdown-item>
            <b-dropdown-item @click="selectedRound = round.id" v-for="round in rounds" :key="round.id">
              {{ round.start_time }} - {{ round.end_time }}
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
      <div class="row" v-if="predictions.length">
        <div class="col" v-if="filterRoomAndRound().length">
          <table class="table mt-4 mb-5">
            <thead class="text-uppercase">
            <tr>
              <th width="28%" class="pl-4">Room</th>
              <th>Time & Data</th>
              <th width="28%">Prediction</th>
              <th width="84">Result</th>
            </tr>
            </thead>
            <tbody>
            <tr class="prediction-row" v-for="prediction in filterRoomAndRound()" :key="prediction.id">
              <td class="bold-500 pl-4">{{ roomTitle(prediction.room_id) }}</td>
              <td>{{ formatDate(prediction.created_at) }}</td>
              <td class="bold-500">{{ formatPrice(prediction.prediction_usd) }}</td>
              <td class="bold-500">{{ status(prediction.is_winner) }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="col mt-4 text-center" v-if="!filterRoomAndRound().length">
          *No Predictions
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import RoundTimer from '@/components/RoundTimer';
import _ from 'lodash';
import {formatPrice, formatDate} from '@/blockchain/metamask';

export default {
  name: 'MyPredictions',
  data() {
    return {
      maxDate: new Date(),
      rounds: [],
      predictions: [],
      selectedDate: '',
      selectedRoom: '',
      selectedRound: '',
      currentRoundId: null,
      roundInterval: null
    }
  },
  computed: {
    selectedRoomTitle() {
      if (this.selectedRoom) {
        const room = _.find(this.$store.state.rooms, ['id', this.selectedRoom]);
        return room.title;
      }
      return 'All Rooms';
    },
    selectedRoundTitle() {
      if (this.selectedRound) {
        const round = _.find(this.rounds, ['id', this.selectedRound]);
        return round.start_time + ' - ' + round.end_time;
      }
      return this.rounds.length ? 'All Rounds' : 'No Rounds';
    },
    formatPrice() {
      return formatPrice;
    },
    formatDate() {
      return formatDate;
    }
  },
  created() {
    const now = new Date()
    this.maxDate.setMonth(now.getMonth())
    this.maxDate.setDate(now.getDate());
    this.currentRoundId = this.$store.state.round.id;

    let month = now.getMonth() + 1;
    let day = now.getDate();
    if (month < 10) {
      month = '0' + month;
    }
    if (day < 10) {
      day = '0' + day;
    }

    this.selectedDate = `${now.getFullYear()}-${month}-${day}`;
    this.loadDateRounds();

    this.roundInterval = setInterval(() => {
      if (this.currentRoundId != this.$store.state.round.id) {
        this.currentRoundId = this.$store.state.round.id;
        this.loadDateRounds();
      }
    }, 1000);
  },
  destroyed() {
    clearInterval(this.roundInterval);
  },
  methods: {
    loadDateRounds() {
      this.$store.dispatch('allDateRounds', this.selectedDate).then(result => {
        this.rounds = result.rounds;
        this.predictions = result.predictions;
      }).catch(e => {
        console.log(e);
      });
    },
    roomTitle(id) {
      const room = _.find(this.$store.state.rooms, ['id', id]);
      return room.title;
    },
    status(isWinner) {
      if (isWinner) {
        return 'Win';
      } else if (isWinner !== null) {
        return 'Lose';
      } else {
        return '—';
      }
    },
    filterRoomAndRound() {
      if (!this.selectedRoom && !this.selectedRound) {
        return this.predictions;
      }

      return this.predictions.filter(prediction => {
        let result = true;
        if (this.selectedRoom) {
          result = this.selectedRoom === prediction.room_id;
        }
        console.log(this.selectedRound)
        if (result && this.selectedRound) {
          result = this.selectedRound === prediction.round_id;
        }
        return result;
      });
    }
  },
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

<style lang="scss">
.datepicker {
  border: 1px solid rgba(0, 0, 0, 0.3);
  padding: 3px 10px 3px 10px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  line-height: 30px;
  border-radius: 23px;

  &:focus, &.focus {
    box-shadow: none !important;
    border-color: rgba(0, 0, 0, 0.3) !important;
  }

  > button {
    padding: 8px;
  }

  > label {
    color: #000 !important;
    font-weight: 500;
  }

}

.form-control:focus {
  box-shadow: none;
  border-color: #ced4da;
}

.min-dropdown {
  min-width: 165px;
}

.dropdown .dropdown-menu {
  max-height: 400px;
  overflow: auto;
}

.dropdown-toggle::after {
  float: right;
}

.prediction-row {
  transition: all ease .3s;

  &:hover {
    transition: all ease .3s;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

@media all and (max-width: 992px) {
  .min-dropdown {
    min-width: 148px;
  }
}

</style>