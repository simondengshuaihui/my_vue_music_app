<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script>
  import MusicList from 'components/music-list/music-list'
  import { getMusicList } from 'api/rank'
  import { ERR_OK } from 'api/config'
  import { mapGetters } from 'vuex'
  import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'

  export default {
    data(){
      return {
        songs:[],
        rank:true
      }
    },
    computed:{
      title(){
        return this.topList.topTitle
      },
      bgImage(){
        if (this.songs.length) {  //排行榜图片太丑，用songs里面的图片
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters(['topList'])
    },
    methods:{
      _getMusicList() {  //抓取歌单
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        getMusicList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.songlist)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    created(){
      this._getMusicList()
    },
    components:{
      MusicList
    }
  }
</script>
<style scoped lang="stylus">
  .slide-enter-active,.slide-leave-active
    transition: all .3s ease
  .slide-enter,.slide-leave-to
    transform:translate3d(100%,0,0)
</style>
