<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :data="songs" :probe-type="probeType" :listen-scroll="listenScroll" class="list"
            ref="list">
      <div class="song-list-wrapper">
        <song-list :rank="rank" :songs="songs" @select="selectItem"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length>0">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>
<script>
  import Scroll from '@/base/scroll/scroll'
  import SongList from '@/base/song-list/song-list.vue'
  import {prefixStyle} from 'common/js/dom'   //修改js的样式前缀方法
  import Loading from 'base/loading/loading'
  import {mapActions} from 'vuex'
  import {playlistMixin} from "common/js/mixin";

  const RESERVED_HEIGHT = 40
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')

  export default {
    mixins: [playlistMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank:{
        type:Boolean,
        default:false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      },

    },
    watch: {
      scrollY(newY) {  //让layer跟随scroll滚动而偏移
        let zIndex = 0
        let scale = 1
        let blur = 0  //用于高斯模糊
        const percent = Math.abs(newY / this.imageHeigth)  //取绝对值

        let translateY = Math.max(this.miniTranslateY, newY)  //newY为负值，最大滚动距离为imgage的高度
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
        // console.log(transform)
        // this.$refs.layer.style['webkitTransform'] = `translate3d(0,${translateY}px,0)`  //兼容性

        if (newY > 0) {  //如果向上滚动，newY为正值，则图片放大比例为newY跟高度的比
          // let percent = Math.abs(newY / this.imageHeigth)
          scale = 1 + percent
          zIndex = 10  //图片放大后防止被后面的图片盖住
        } else {
          blur = Math.min(20 * percent, 20)  //最高模糊效果就是20
        }
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`  //设置模糊效果,ios才有效果


        if (newY < this.miniTranslateY) {  //newY小于最大滚动距离后，调整index值，让bgimg覆盖歌单
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = RESERVED_HEIGHT + 'px'

          this.$refs.playBtn.style.display = 'none'  //滚动到头的时候播放按钮隐藏
        } else {  //其他情况就恢复原有的样子
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0

          this.$refs.playBtn.style.display = ''
        }
        this.$refs.bgImage.style['transform'] = `scale(${scale})`
        this.$refs.bgImage.style.zIndex = zIndex

      }
    },
    components: {
      Scroll,
      SongList,
      Loading
    },
    mounted() {
      let zIndex = 0
      this.imageHeigth = this.$refs.bgImage.clientHeight
      this.miniTranslateY = -this.imageHeigth + RESERVED_HEIGHT  //滚动最大值
      //设置scroll的top值是背景图的高度  $el是Vue 实例使用的根 DOM 元素
      this.$refs.list.$el.style.top = this.$refs.bgImage.clientHeight + 'px'
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()   //让scroll组件再刷新一次
      },
      scroll(pos) {  //记录y的滚动值
        this.scrollY = pos.y
      },
      back() {  //后退方法
        this.$router.back()
      },
      selectItem(item, index) {
        this.selectPlay({
          list: this.songs,
          index:index
        })
      },
      random() {
        this.randomPlay({list: this.songs})
      },
      ...mapActions(['selectPlay', 'randomPlay'])
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
