// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import  '@/common/stylus/index.styl'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import store from './store'

fastclick.attach(document.body)

Vue.config.productionTip = false

Vue.use(VueLazyLoad,{
  loading:require('@/common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
