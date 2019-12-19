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
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD = document.head || document.getElementsByTagName('head')[0];
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) { style.element.setAttribute('media', css.media); }
      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) { style.element.removeChild(nodes[index]); }
      if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }else { style.element.appendChild(textNode); }
    }
  }
}

var browser = createInjector;

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"daterangepicker-mobile"},[_c('div',{staticClass:"daterangepicker-header"},[_c('div',{staticClass:"daterangepicker-cell"},[_c('button',{attrs:{"disabled":_vm.prevMonthBtnStatus},on:{"click":_vm.prev}},[_vm._v("\n        < "+_vm._s(_vm.prevMonthLabel)+"\n      ")])]),_vm._v(" "),_c('div',{staticClass:"daterangepicker-cell"},[_c('h3',{ref:"monthYear",staticClass:"month-year"},[_vm._v("\n        "+_vm._s(_vm.currentDate.getFullYear())+" "+_vm._s(_vm.months[_vm.currentDate.getMonth()])+"\n      ")])]),_vm._v(" "),_c('div',{staticClass:"daterangepicker-cell"},[_c('button',{attrs:{"disabled":_vm.nextMonthBtnStatus},on:{"click":_vm.next}},[_vm._v("\n        "+_vm._s(_vm.nextMonthLabel)+" >\n      ")])])]),_vm._v(" "),_c('div',{staticClass:"daterangepicker-body"},[_c('div',{staticClass:"daterangepicker-row week-days"},_vm._l((_vm.weekDays),function(weekDay,index){return _c('div',{key:index,staticClass:"daterangepicker-cell"},[_vm._v(_vm._s(weekDay))])}),0),_vm._v(" "),_vm._l((_vm.datesArray),function(itm,index){return _c('div',{key:index,staticClass:"daterangepicker-row"},_vm._l((itm),function(date){return _c('div',{key:date.milis,ref:date.milis,refInFor:true,staticClass:"daterangepicker-cell",class:date.classes.join(' '),on:{"click":function($event){return _vm.dateClickhandler(date.milis, date.classes)}}},[_vm._v("\n        "+_vm._s(date.day)+"\n      ")])}),0)})],2),_vm._v(" "),(_vm.showReset)?_c('div',[_c('button',{on:{"click":_vm.resetMarks}},[_vm._v("\n      Reset\n    ")])]):_vm._e(),_vm._v(" "),(_vm.showResult)?_c('div',[(_vm.selectedDates[0])?_c('div',{staticClass:"selected-dates-container"},[_vm._v("\n      "+_vm._s(_vm.selectedDates[0].toDateString())+"\n    ")]):_vm._e(),_vm._v(" "),(_vm.selectedDates[1])?_c('div',{staticClass:"selected-dates-container"},[_vm._v("\n      "+_vm._s(_vm.selectedDates[1].toDateString())+"\n    ")]):_vm._e()]):_vm._e()])};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-0e023ea4_0", { source: ".daterangepicker-mobile[data-v-0e023ea4]{font-family:sans-serif}.daterangepicker-header[data-v-0e023ea4]{max-width:322px;display:table;width:100%}.daterangepicker-header button[data-v-0e023ea4]{background:0 0;border:none;font-size:15px}.daterangepicker-header .daterangepicker-cell[data-v-0e023ea4]{cursor:default}.daterangepicker-body[data-v-0e023ea4]{display:table}.daterangepicker-row[data-v-0e023ea4]{display:table-row}.week-days .daterangepicker-cell[data-v-0e023ea4]{padding:10px 2px}.daterangepicker-cell[data-v-0e023ea4]{display:table-cell;padding:10px;min-width:46px;min-height:46px;cursor:pointer;border:1px solid #fff;text-align:center;box-sizing:border-box}.offset[data-v-0e023ea4]{color:#d3d3d3}.clicked[data-v-0e023ea4]{background:#add8e6;color:#fff}.daterangepicker-cell.in-range[data-v-0e023ea4]:not(.clicked){color:#fff;background:#d3d3d3}.daterangepicker-cell.disabled[data-v-0e023ea4]{color:gray;background:#d3d3d3}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-0e023ea4";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  

  
  var component = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    browser,
    undefined
  );

// Import vue component

// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component('VueDaterangepickerMobile', component);
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
component.install = install;

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;

export default component;
