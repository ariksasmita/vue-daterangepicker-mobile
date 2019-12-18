'use strict';Object.defineProperty(exports,'__esModule',{value:true});var vueRuntimeHelpers=require('vue-runtime-helpers');//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var script = {
  name: 'PlainCalendar',
  props: {
    maxDate: {
      type: Date,
      default: new Date(),
    },
    minDate: {
      type: Date,
      default: function () { return new Date(1970, 0, 1); }
    },
    showReset: {
      type: Boolean,
      default: true,
    },
    showResult: {
      type: Boolean,
      default: true,
    },
  },
  data: function data () {
    return {
      datesArray: [],
      currentDate: new Date(),
      selectedDates: [],
      months: months,
      weekDays: weekDays,
    }
  },
  computed: {
    nextMonthLabel: function nextMonthLabel () {
      var ref = this;
      var crDt = ref.currentDate;
      var monthIdx = new Date(crDt.getFullYear(), crDt.getMonth() + 1, 1).getMonth();
      return months[monthIdx]
    },
    prevMonthLabel: function prevMonthLabel () {
      var ref = this;
      var crDt = ref.currentDate;
      var monthIdx = new Date(crDt.getFullYear(), crDt.getMonth() - 1, 1).getMonth();
      return months[monthIdx]
    },
    nextMonthBtnStatus: function nextMonthBtnStatus () {
      var ref = this;
      var maxDate = ref.maxDate;
      var currentDate = ref.currentDate;
      if (maxDate) {
        var currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        return maxDate ? +currentMonthEnd >= +maxDate : false
      }
      return false
    },
    prevMonthBtnStatus: function prevMonthBtnStatus () {
      var ref = this;
      var minDate = ref.minDate;
      var currentDate = ref.currentDate;
      var prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      return +prevMonthEnd <= +minDate
    },
  },
  mounted: function mounted () {
    this.initCalendar();
  },
  methods: {
    initCalendar: function initCalendar () {
      var ref = this;
      var currentDate = ref.currentDate;
      this.showCalendar(currentDate.getFullYear(), currentDate.getMonth());
    },
    showCalendar: function showCalendar (year, month) {
      // reset
      this.datesArray = [];

      var edgeMonthDate = new Date(year, month + 1, 0);
      var currMonthDate = new Date(year, month, 1);
      var iter = 0;
      var rowCount = 0;
      var ready = true;
      var rowArray = [];

      if (currMonthDate.getDay() !== 0) {
        iter = iter - currMonthDate.getDay();
      }

      while (ready) {
        if (currMonthDate.getDay() === 6 && rowArray.length > 0) {
          this.datesArray.push(rowArray);
          rowArray = [];
        }
        currMonthDate = new Date(year, month, ++iter);
        var dateObj = { day: currMonthDate.getDate(), classes: [], milis: +currMonthDate };

        // add .offset class if it's not current month's date
        if (iter < 1 || +currMonthDate > +edgeMonthDate) {
          dateObj.classes.push('offset');
        }
        // add .disabled class if it's beyond maxDate
        if (this.maxDate && +currMonthDate > +this.maxDate) {
          dateObj.classes.push('disabled');
        }
        rowArray.push(dateObj);
        if (currMonthDate.getDay() === 6){
          rowCount++;
        }

        // stop iteration when it's reaching next month and a full row
        if (+currMonthDate > +edgeMonthDate && currMonthDate.getDay() === 6 && rowCount === 7) {
          ready = false;
          rowCount = 0;
        }
      }

      this.selectedDates.length > 0 && this.markDates(this.selectedDates);
    },
    dateClickhandler: function dateClickhandler (milis, classes) {
      var ref = this;
      var selectedDates = ref.selectedDates;
      var resetMarks = ref.resetMarks;
      var addSelectedDate = ref.addSelectedDate;
      if (!classes.includes('disabled')) {
        // none or 1 date selected, push current selected date
        if (selectedDates.length < 2) {
          addSelectedDate(milis);
        } else if (selectedDates.length === 2) {
          // if both ends have selected and another click triggered, reset
          resetMarks();
          addSelectedDate(milis);
        }
      }
    },
    addSelectedDate: function addSelectedDate(milis) {
      var ref = this;
      var selectedDates = ref.selectedDates;
      var markDates = ref.markDates;
      // var nom = this.$refs[milis]
      selectedDates.push(new Date(milis));

      // if there's already a date selected, check milis to decide start/end date
      if (selectedDates.length === 2) {
        +selectedDates[0] > +selectedDates[1] && selectedDates.reverse();
      }
      // push dates to parent
      this.$emit('on-date-change', selectedDates);

      // mark dates
      markDates(selectedDates);
    },
    markDates: function markDates(dates) {
      var ref = this;
      var datesArray = ref.datesArray;
      var idx = 0;

      // iterate to dates array
      while (idx < datesArray.length) {
        datesArray[idx].forEach(function (item) {
          // if only one date passed, mark first date only
          if (dates.length === 1) {
            if (item.milis === +dates[0]) {
              item.classes.push('clicked');
            }
          }
          // if two dates passed, mark both dates and in-betweens
          if (dates.length === 2) {
            if (item.milis >= +dates[0] && item.milis <= +dates[1]) {
              item.classes.push('in-range');
            }
            if (item.milis === +dates[0] || item.milis === +dates[1]) {
              !item.classes.includes('clicked') && item.classes.push('clicked');
            }
          }
        });
        idx++;
      }
    },
    resetMarks: function resetMarks () {
      var ref = this;
      var currentDate = ref.currentDate;
      this.selectedDates = [];
      this.showCalendar(currentDate.getFullYear(), currentDate.getMonth());
    },
    next: function next () {
      var ref = this;
      var currentDate = ref.currentDate;
      var showCalendar = ref.showCalendar;
      this.currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      showCalendar(currentDate.getFullYear(), currentDate.getMonth());
    },
    prev: function prev () {
      var ref = this;
      var currentDate = ref.currentDate;
      var showCalendar = ref.showCalendar;
      this.currentDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      showCalendar(currentDate.getFullYear(), currentDate.getMonth());
    },
  },
};/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"daterangepicker-mobile"},[_vm._ssrNode("<div class=\"daterangepicker-header\"><div class=\"daterangepicker-cell\"><button"+(_vm._ssrAttr("disabled",_vm.prevMonthBtnStatus))+">"+_vm._ssrEscape("\n        < "+_vm._s(_vm.prevMonthLabel)+"\n      ")+"</button></div> <div class=\"daterangepicker-cell\"><h3 class=\"month-year\">"+_vm._ssrEscape("\n        "+_vm._s(_vm.currentDate.getFullYear())+" "+_vm._s(_vm.months[_vm.currentDate.getMonth()])+"\n      ")+"</h3></div> <div class=\"daterangepicker-cell\"><button"+(_vm._ssrAttr("disabled",_vm.nextMonthBtnStatus))+">"+_vm._ssrEscape("\n        "+_vm._s(_vm.nextMonthLabel)+" >\n      ")+"</button></div></div> <div class=\"daterangepicker-body\"><div class=\"daterangepicker-row week-days\">"+(_vm._ssrList((_vm.weekDays),function(weekDay,index){return ("<div class=\"daterangepicker-cell\">"+_vm._ssrEscape(_vm._s(weekDay))+"</div>")}))+"</div> "+(_vm._ssrList((_vm.datesArray),function(itm,index){return ("<div class=\"daterangepicker-row\">"+(_vm._ssrList((itm),function(date){return ("<div"+(_vm._ssrClass("daterangepicker-cell",date.classes.join(' ')))+">"+_vm._ssrEscape("\n        "+_vm._s(date.day)+"\n      ")+"</div>")}))+"</div>")}))+"</div> "+((_vm.showReset)?("<div><button>\n      Reset\n    </button></div>"):"<!---->")+" "+((_vm.showResult)?("<div>"+((_vm.selectedDates[0])?("<div class=\"selected-dates-container\">"+_vm._ssrEscape("\n      "+_vm._s(_vm.selectedDates[0].toDateString())+"\n    ")+"</div>"):"<!---->")+" "+((_vm.selectedDates[1])?("<div class=\"selected-dates-container\">"+_vm._ssrEscape("\n      "+_vm._s(_vm.selectedDates[1].toDateString())+"\n    ")+"</div>"):"<!---->")+"</div>"):"<!---->"))])};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-0e023ea4_0", { source: ".daterangepicker-mobile[data-v-0e023ea4]{font-family:sans-serif}.daterangepicker-header[data-v-0e023ea4]{max-width:322px;display:table;width:100%}.daterangepicker-header button[data-v-0e023ea4]{background:0 0;border:none;font-size:15px}.daterangepicker-header .daterangepicker-cell[data-v-0e023ea4]{cursor:default}.daterangepicker-body[data-v-0e023ea4]{display:table}.daterangepicker-row[data-v-0e023ea4]{display:table-row}.week-days .daterangepicker-cell[data-v-0e023ea4]{padding:10px 2px}.daterangepicker-cell[data-v-0e023ea4]{display:table-cell;padding:10px;min-width:46px;min-height:46px;cursor:pointer;border:1px solid #fff;text-align:center;box-sizing:border-box}.offset[data-v-0e023ea4]{color:#d3d3d3}.clicked[data-v-0e023ea4]{background:#add8e6;color:#fff}.daterangepicker-cell.in-range[data-v-0e023ea4]:not(.clicked){color:#fff;background:#d3d3d3}.daterangepicker-cell.disabled[data-v-0e023ea4]{color:gray;background:#d3d3d3}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-0e023ea4";
  /* module identifier */
  var __vue_module_identifier__ = "data-v-0e023ea4";
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject shadow dom */
  

  
  var __vue_component__ = vueRuntimeHelpers.normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    vueRuntimeHelpers.createInjectorSSR,
    undefined
  );// Import vue component

// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component('VueDaterangepickerMobile', __vue_component__);
}

// Create module definition for Vue.use()
var plugin = {
  install: install,
};

// To auto-install when vue is found
/* global window global */
var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
__vue_component__.install = install;

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
exports.default=__vue_component__;