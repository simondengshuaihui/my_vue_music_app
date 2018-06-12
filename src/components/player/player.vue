<template>
  <div class="player" v-show="playlist.length>0">
    <!--大窗口播放器-->
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <!--阻止默认滑动事件-->
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class=" progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onPercentChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="dsiableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="dsiableCls">
              <i @click="togglePlaying" :class="palyIcon"></i>
            </div>
            <div class="icon i-right" :class="dsiableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!--小播放器-->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :percent="percent" :radius="radius">
            <i @click.stop="togglePlaying" :class="miniIcon" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!--<playlist ref="playlist"></playlist>-->
    <audio ref="audio" :src="currentSong.url"
           @play="ready"
           @error="err"
           @ended="end"
           @timeupdate="updateTime"></audio>
  </div>
</template>
<script>
  import {mapGetters} from 'vuex'
  import {mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'  //引入动画插件，可以使用js构建css3动画
  import {prefixStyle} from "common/js/dom"
  import ProgressBar from 'base/progress-bar/progress-bar'
  import progressCircle from 'base/progress-circle/progress-circle'
  import {playMode} from "common/js/config"
  import {shuffle} from "common/js/util"
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'

  const transform = prefixStyle('transform')
  const transitionDuration=prefixStyle('transitionDuration')

  export default {
    data() {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric:''
      }
    },
    created() {  //只用于数据操作，不用添加get和set方法
      this.touch = {}
    },
    computed: {
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      dsiableCls() {  //按钮不可点击
        return this.songReady ? '' : 'disable'
      },
      palyIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      iconMode() {  //判断是什么mode
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      ...mapGetters([
        'fullScreen',
        'playlist',
        'currentSong',
        'playing',
        'currentIndex',
        'mode',
        'sequenceList'
      ])
    },
    methods: {
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',
        setPlaylist: 'SET_PLAYLIST'
      }),
      back() {
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      enter(el, done) {   //动画钩子
        const {x, y, scale} = this._getPosAndScale()

        let animation = {
          0: {  //初始位置
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        animations.registerAnimation({  //注册动画
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        //调用动画
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)

      },
      afterEnter() {  //注销动画
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {  //把大cd移动到小cd
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {  //移动过来后要归位
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      _getPosAndScale() {  //获取音乐盘从小移动到大盘的距离和比例
        const targetWidth = 40
        const paddingLeft = 40   //中心坐标离左边的宽度
        const paddingBottom = 30  //中心坐标离底边的宽度
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width    //是把原来图片尺寸缩小到mini播放器大小
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom

        return {
          x,
          y,
          scale
        }
      },
      togglePlaying() {   //切换播放暂停
        if(!this.songReady){  //如果歌曲没有准备好就不播放
          return
        }
        this.setPlayingState(!this.playing)
        if(this.currentLyric){  //歌曲暂停的时候让歌词也暂停
          this.currentLyric.togglePlay()
        }
      },
      next() {   //下一首歌
        // console.log(this.songReady)
        if (!this.songReady) {   //如果歌曲没装备好就return
          return
        }
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {   //歌曲在暂停状态，播放下一首时就开始播放
          this.togglePlaying()
        }
        this.songReady = false   //防止多次快速点击
      },
      prev() {  //下一首歌
        if (!this.songReady) {   //如果歌曲没装备好就return
          return
        }
        let index = this.currentIndex - 1
        if (index < 0) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {   //歌曲在暂停状态，播放下一首时就开始播放
          this.togglePlaying()
        }
        this.songReady = false
      },
      ready() {
        this.songReady = true
      },
      err() {  //歌曲加载失败也可以把songReady改为true
        this.songReady = true
      },
      end() {  //播放结束时播放下一曲
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {  //单曲循环
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play() //设置时间后再播放
        if(this.currentLyric){
          this.currentLyric.seek(0)
        }
      },
      updateTime(e) {  //获取播放时间
        this.currentTime = e.target.currentTime
      },
      format(interval) {
        interval = interval | 0   //向下取整，相当于math.floor
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      _pad(num, n = 2) {  //对秒数补零
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      onPercentChange(percent) {  //根据拖动情况重新设置currentTime
        // console.log(percent)
        const currentTime=percent * this.currentSong.duration
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {  //如果播放是停止的，则改为播放
          this.togglePlaying()
        }
      //  修改歌词位置,播放时间*1000ms
        if(this.currentLyric){
          this.currentLyric.seek(currentTime*1000)
        }
      },
      changeMode() {  //改变mode
        const mode = (this.mode + 1) % 3
        this.setPlayMode(mode)
        let list = null
        if (mode === playMode.sequence) {  //根据mode改变playlist
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        this.resetCurrentIndex(list)  //先设置currentIndex
        this.setPlaylist(list)
      },
      resetCurrentIndex(list) {  //重置currentIndex
        let index = list.findIndex((item) => {  //找到现在播放歌曲在playlist中的位置
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      },
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {  //如果播放状态，就调用歌词的play方法切换linbun
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric({lineNum, txt}) {  //Lyric插件会根据不同的时间切换lineNum
        this.currentLineNum = lineNum
        // console.log(lineNum)
        if (lineNum > 5) {  //如果lineNum大于5，为了让currentLine保持在中间，滚动到lineNum-5的元素上
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {  //小于5就滚到顶点
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }

        this.playingLyric=txt   //正在播放的歌词
      },
      middleTouchStart(e) {
        // console.log(2)
        this.touch.initiated = true  //先初始值,用来判断是否移动一次
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) {  //如果y的移动距离大于x，就return
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        //lyric页面偏移宽度在left+deltaX之间
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)

        this.$refs.middleL.style[transitionDuration] = 0  //消除过度时间
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.middleL.style.opacity = 1 - this.touch.percent  //根据移动距离改变cd页面的透明度
      },
      middleTouchEnd() {
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') { //如果在cd页面，向左滑动超过10%就跳转到lyric页面
          // console.log(this.touch.percent)
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow='lyric'
          } else {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity=1
          }
        } else {  //在lyric页面，向右滑动比例低于90%，就跳转到cd页面
          if (this.touch.percent < 0.9){
            offsetWidth=0
            this.currentShow = 'cd'
            opacity=1
          }else{
            offsetWidth=-window.innerWidth
            opacity = 0
          }
        }
        this.$refs.middleL.style[transitionDuration] = `300ms`
        this.$refs.lyricList.$el.style[transitionDuration] = `300ms`  //设置过度时间300ms
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.middleL.style.opacity = opacity

        this.touch.initiated = false
      }

    },
    watch: {
      currentSong(newSong, oldSong) {
        if (newSong.id === oldSong.id) {  //播放模式改变后index改变，currentSong改变，如果改变后newSong和oldSong的id值一样就return
          return
        }
        if(this.currentLyric){
          this.currentLyric.stop()//切换歌曲的时候，如果已经有this.currentLyric了就停止之前的
        }
        this.$nextTick(() => {  //等待dom加载完成后再调用play方法
          this.$refs.audio.play()
          this.getLyric()
        })
      },
      playing(newPlaying) {
        setTimeout(() => {  //等待dom加载完成后再调用play方法
          const audio = this.$refs.audio
          newPlaying ? audio.play() : audio.pause()
        },1000)

      }
    },
    components: {
      ProgressBar,
      progressCircle,
      Scroll
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
