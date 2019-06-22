<template>
  <div class="daterangepicker-mobile">
    <div class="calendar-header">
      <button
        :disabled="prevMonthBtnStatus"
        @click="prev">
        &lt; {{ prevMonthLabel }}
      </button>
      <h3 ref="monthYear" class="month-year">
        {{ currentDate.getFullYear() }} {{ months[currentDate.getMonth()] }}
      </h3>
      <button
        :disabled="nextMonthBtnStatus"
        @click="next">
        {{ nextMonthLabel }} &gt;
      </button>
    </div>

    <table
      class="calendar-body">
      <thead>
        <tr>
          <th v-for="(weekDay, index) in weekDays" :key="index">{{ weekDay }}</th>
        </tr>
      </thead>

      <tbody class="calendar-body">
        <tr
          v-for="(itm, index) in datesArray"
          :key="index">
          <td
            v-for="date in itm"
            :key="date.milis"
            :ref="date.milis"
            :class="date.classes.join(' ')"
            @click="dateClickhandler(date.milis, date.classes)">
            {{ date.day }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="showReset">
      <button @click="resetMarks">
        Reset
      </button>
    </div>
    <div v-if="showResult">
      <div
        v-if="selectedDates[0]"
        class="selected-dates-container">
        {{ selectedDates[0].toDateString() }}
      </div>
      <div
        v-if="selectedDates[1]"
        class="selected-dates-container">
        {{ selectedDates[1].toDateString() }}
      </div>
    </div>
  </div>
</template>

<script>
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default {
  name: 'PlainCalendar',
  props: {
    maxDate: {
      type: Date,
      default: new Date(),
    },
    minDate: {
      type: Date,
      default: () => new Date(1970, 0, 1)
    },
    showReset: {
      type: Boolean,
      default: true,
    },
    showResult: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      datesArray: [],
      currentDate: new Date(),
      selectedDates: [],
      months,
      weekDays,
    }
  },
  computed: {
    nextMonthLabel () {
      const { currentDate: crDt } = this
      const monthIdx = new Date(crDt.getFullYear(), crDt.getMonth() + 1, 1).getMonth()
      return months[monthIdx]
    },
    prevMonthLabel () {
      const { currentDate: crDt } = this
      const monthIdx = new Date(crDt.getFullYear(), crDt.getMonth() - 1, 1).getMonth()
      return months[monthIdx]
    },
    nextMonthBtnStatus () {
      const { maxDate, currentDate } = this
      if (maxDate) {
        const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        return maxDate ? +currentMonthEnd >= +maxDate : false
      }
      return false
    },
    prevMonthBtnStatus () {
      const { minDate, currentDate } = this
      const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      return +prevMonthEnd <= +minDate
    },
  },
  mounted () {
    this.initCalendar()
  },
  methods: {
    initCalendar () {
      const { currentDate } = this
      this.showCalendar(currentDate.getFullYear(), currentDate.getMonth())
    },
    showCalendar (year, month) {
      // reset
      this.datesArray = []

      const edgeMonthDate = new Date(year, month + 1, 0)
      let currMonthDate = new Date(year, month, 1)
      let iter = 0
      let rowCount = 0
      let ready = true
      let rowArray = []

      if (currMonthDate.getDay() !== 0) {
        iter = iter - currMonthDate.getDay()
      }

      while (ready) {
        if (currMonthDate.getDay() === 6 && rowArray.length > 0) {
          this.datesArray.push(rowArray)
          rowArray = []
        }
        currMonthDate = new Date(year, month, ++iter)
        let dateObj = { day: currMonthDate.getDate(), classes: [], milis: +currMonthDate }

        // add .offset class if it's not current month's date
        if (iter < 1 || +currMonthDate > +edgeMonthDate) {
          dateObj.classes.push('offset')
        }
        // add .disabled class if it's beyond maxDate
        if (this.maxDate && +currMonthDate > +this.maxDate) {
          dateObj.classes.push('disabled')
        }
        rowArray.push(dateObj)
        if (currMonthDate.getDay() === 6){
          rowCount++
        }

        // stop iteration when it's reaching next month and a full row
        if (+currMonthDate > +edgeMonthDate && currMonthDate.getDay() === 6 && rowCount === 7) {
          ready = false
          rowCount = 0
        }
      }

      this.selectedDates.length > 0 && this.markDates(this.selectedDates)
    },
    dateClickhandler (milis, classes) {
      const { selectedDates, resetMarks, addSelectedDate } = this
      if (!classes.includes('disabled')) {
        // none or 1 date selected, push current selected date
        if (selectedDates.length < 2) {
          addSelectedDate(milis)
        } else if (selectedDates.length === 2) {
          // if both ends have selected and another click triggered, reset
          resetMarks()
          addSelectedDate(milis)
        }
      }
    },
    addSelectedDate(milis) {
      const { selectedDates, markDates } = this
      // var nom = this.$refs[milis]
      selectedDates.push(new Date(milis))

      // if there's already a date selected, check milis to decide start/end date
      if (selectedDates.length === 2) {
        +selectedDates[0] > +selectedDates[1] && selectedDates.reverse()
      }
      // push dates to parent
      this.$emit('on-date-change', selectedDates)

      // mark dates
      markDates(selectedDates)
    },
    markDates(dates) {
      const { datesArray } = this
      let idx = 0

      // iterate to dates array
      while (idx < datesArray.length) {
        datesArray[idx].forEach(item => {
          // if only one date passed, mark first date only
          if (dates.length === 1) {
            if (item.milis === +dates[0]) {
              item.classes.push('clicked')
            }
          }
          // if two dates passed, mark both dates and in-betweens
          if (dates.length === 2) {
            if (item.milis >= +dates[0] && item.milis <= +dates[1]) {
              item.classes.push('in-range')
            }
            if (item.milis === +dates[0] || item.milis === +dates[1]) {
              !item.classes.includes('clicked') && item.classes.push('clicked')
            }
          }
        })
        idx++
      }
    },
    resetMarks () {
      const { currentDate } = this
      this.selectedDates = []
      this.showCalendar(currentDate.getFullYear(), currentDate.getMonth())
    },
    next () {
      const { currentDate, showCalendar } = this
      this.currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
      showCalendar(currentDate.getFullYear(), currentDate.getMonth())
    },
    prev () {
      const { currentDate, showCalendar } = this
      this.currentDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1))
      showCalendar(currentDate.getFullYear(), currentDate.getMonth())
    },
  },
}
</script>

<style scoped>
.daterangepicker-mobile {
  font-family: sans-serif;
}
.calendar-header > button,
.calendar-header > h3 {
  display: inline-block;
}
.month-year {
  margin: 20px;
}
.offset {
  color: lightgray;
}
.clicked {
  background: lightblue;
  color: white;
}
.calendar-body td {
  cursor: pointer;
}
td.in-range:not(.clicked) {
  color: white;
  background: lightgray;
}
td.disabled {
  color: gray;
  background: lightgray;
}
td {
  min-width: 37px;
  line-height: 37px;
}
</style>
