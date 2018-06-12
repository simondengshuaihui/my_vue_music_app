<template>
  <div class="loading-container">
    <span>功能玩命搭建中</span>
    <loading></loading>
  </div>
</template>
<script>
  import  Loading from 'base/loading/loading'
  export default{
    components:{
      Loading
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .loading-container
    position: absolute
    text-align:center
    width: 100%
    top: 50%
    transform: translateY(-50%)
</style>
