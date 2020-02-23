import Vue from 'vue'
import Router from 'vue-router'
const Recommend = ()=> import ('components/recommend/recommend')
const Search = ()=> import ('components/search/search')
const Rank = ()=> import ('components/rank/rank')
const Singer = ()=> import ('components/singer/singer')
const SingerDetail = ()=> import ('components/singer-detail/singer-detail')
const Disc = ()=> import ('components/disc/disc')
const TopList = ()=> import ('components/top-list/top-list')



Vue.use(Router)

export default new Router({
  mode:'history',
  routes: [
    {
      path: '/',
      redirect:'/recommend'
    },
    {
      path:'/recommend',
      component:Recommend,
      children:[
        {
          path:':id',
          component:Disc
        }
      ]
    },
    {
      path:'/rank',
      component:Rank,
      children:[{
        path:':id',
        component:TopList
      }]

    },
    {
      path:'/singer',
      component:Singer,
      children:[
        {
          path:':id',
          component:SingerDetail
        }
      ]
    },
    {
      path:'/search',
      component:Search
    }
  ]
})
