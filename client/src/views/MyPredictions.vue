<template>
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

    <div class="col-lg-6 offset-lg-2">
      <h1 class="text-center mb-4 font-weight-bold mt-lg-0 mt-4">My Predictions</h1>
      <div class="row">
        <div class="col-lg-4 col-6 text-right">
          <b-dropdown id="dropdown-room" class="min-dropdown" variant="white" text="All Rooms">
            <b-dropdown-item>1</b-dropdown-item>
            <b-dropdown-item>2</b-dropdown-item>
            <b-dropdown-item>3</b-dropdown-item>
          </b-dropdown>
        </div>
        <div class="col-lg-4 col-12 order-lg-1 order-2 mt-lg-0 mt-2 pl-4 pr-4">
          <b-form-datepicker
              :max="maxDate"
              placeholder="Choose a date"
              weekday-header-format="short"
              class="datepicker"
              :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
          ></b-form-datepicker>
        </div>
        <div class="col-lg-4 col-6">
          <b-dropdown id="dropdown-time" class="min-dropdown" variant="white" text="19:00 - 19:15">
            <b-dropdown-item>1</b-dropdown-item>
            <b-dropdown-item>2</b-dropdown-item>
            <b-dropdown-item>3</b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
      <div class="row">
        <table class="table text-center mt-4 ml-lg-5 mr-lg-5 ml-2 mr-2">
          <thead class="text-uppercase">
          <tr>
            <th>Room</th>
            <th>Time & Data</th>
            <th>Account</th>
            <th>Prediction</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td class="bold-500">Bitcoin</td>
            <td>02/03/2021 10:23:13</td>
            <td>0xF2...65A4</td>
            <td class="bold-500">$27,754.2345</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script>
import RoundTimer from '@/components/RoundTimer';

export default {
  name: 'MyPredictions',
  data() {
    const now = new Date()
    const maxDate = new Date()
    maxDate.setMonth(now.getMonth())
    maxDate.setDate(now.getDate())

    return {
      maxDate: maxDate
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

<style>
.datepicker {
  border: 1px solid rgba(0, 0, 0, 0.3);
  padding: 3px 10px 3px 10px !important;
  line-height: 30px;
  border-radius: 23px;
}

.min-dropdown {
  min-width: 165px;
}

.dropdown-toggle::after {
  float: right;
}

.table {
  font-size: 14px;
}

.table th, .table td {
  border: none !important;
  padding: 8px;
}

thead {
  background: rgba(0, 0, 0, .15);
}

</style>