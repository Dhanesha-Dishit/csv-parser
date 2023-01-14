import Vue from "vue";
import App from "./App.vue";
import Buefy from "buefy";
import "buefy/dist/buefy.css";

Vue.use(Buefy);

import Multiselect from "vue-multiselect";
import JsonCSV from "vue-json-csv";
require("@/assets/main.scss");

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");

Vue.component(Multiselect);
Vue.component(JsonCSV);
