<template>
  <transition name="silde">
    <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script>
  import musicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from "api/config"
  import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'

  export default{
    data(){
      return {
        songs:[]
      }
    },
    computed:{
      title(){
        return this.disc.dissname
      },
      bgImage(){
        return this.disc.imgurl
      },
      ...mapGetters(['disc'])
    },
    components:{
      musicList
    },
    methods:{
      _getSongList(){
        if(!this.disc.dissid){  //没有dissid就回退到上一个路由
          this.$router.push('/recommend')
          return
        }
        getSongList(this.disc.dissid).then((res)=>{
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    mounted(){
    },
    created(){
      this._getSongList()
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active,.slide-leave-active
    transition: all .3s
  .slide-enter,.slide-leave-to
    transform: translate3d(100%,0,0)
</style>
