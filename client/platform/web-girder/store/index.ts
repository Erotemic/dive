import Vue from 'vue';
import Vuex from 'vuex';

import router from '../router';
import { RootState } from './types';
import Location from './Location';
import Dataset from './Dataset';
import Brand from './Brand';

Vue.use(Vuex);

const store = new Vuex.Store<RootState>({
  modules: {
    Brand,
    Location,
    Dataset,
  },
});

/* Keep location state up to date with current route */
router.beforeEach((to, from, next) => {
  if (to.name === 'home') {
    store.dispatch('Location/setLocationFromRoute', to);
  }
  next();
});

export default store;
