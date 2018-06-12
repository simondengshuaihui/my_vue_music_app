<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>

</template>
<script>
  import {mapGetters} from 'vuex'
  import {getSingerDetial} from "@/api/singer"
  import {ERR_OK} from "@/api/config"
  import {createSong,isValidMusic,processSongsUrl} from '@/common/js/song'   //重新处理过的songs对象
  import MusicList from '@/components/music-list/music-list'

  export default {
    data() {
      return {
        songs: []
      }
    },
    components:{
      MusicList
    },
    computed: {    //把singer映射成vue的一个props，可以用this.singer读取数据
      ...mapGetters(['singer']),
      title(){
        return this.singer.name
      },
      bgImage(){
        return this.singer.avatar
      }
    },
    created() {
      this._getDetail()
    },
    methods: {
      _getDetail() {  //获取歌手详情
        if (!this.singer.id) {
          this.$router.push({path: '/singer'}) //如果用户在歌手详情页刷新，没有得到singer.id则退回歌手页面
          return
        }
        getSingerDetial(this.singer.id).then((res) => {
            if (res.code === ERR_OK) {
              processSongsUrl(this._nomallizeSongs(res.data.list)).then((songs) => {
                this.songs = songs
                // console.log(this.songs)
              })
            }
          }
        )
      },
      _nomallizeSongs(list) {
        let ret = []
        list.forEach((item)=>{
          let {musicData} = item   //ES6的解构赋值   等价于musicData=item.musicData
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))   //经过处理后的歌曲表单push进数组，方便以后应用
          }
        })
        return ret
      }
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">

  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
