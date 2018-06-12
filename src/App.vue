<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!--保存在缓存中，避免每次切换路由都重新加载dom-->
    <keep-alive>
      <router-view/>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'
  import Player from 'components/player/player'

  export default {
  name: 'App',
  components:{
    MHeader,
    Tab,
    Player
  }
}
</script>

<style>

</style>
