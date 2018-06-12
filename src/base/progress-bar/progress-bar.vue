<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >


        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16
  const transform = prefixStyle('transform')

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {  //创建touch变量
      this.touch = {}
    },
    methods: {
      progressTouchStart(e) {
        this.touch.inite = true
        this.touch.left = this.$refs.progress.clientWidth
        this.touch.startX = e.touches[0].pageX
      },
      progressTouchMove(e) {
        const deltaX = e.touches[0].pageX - this.touch.startX
        //offsetWidth最大不能超过bar的宽度，也不能小于0
        const offsetWidth = Math.min(Math.max(0, this.touch.left + deltaX), this.$refs.progressBar.clientWidth - progressBtnWidth)
        this._offset(offsetWidth)
      },
      progressTouchEnd() {
        this.touch.inite = false
        this._triggerPercent()
      },
      _offset(offsetWidth) {  //设置bar和btn的偏移量
        this.$refs.progress.style.width = offsetWidth + 'px'  //根据进度调整bar的宽度
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      },
      _triggerPercent() {  //提交percentchange时间
        const barwidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const percent = this.$refs.progress.clientWidth / barwidth
        this.$emit('percentChange', percent)
      },
      progressClick(e){  //progress的点击事件
        const rect = this.$refs.progressBar.getBoundingClientRect()  //记录progressBar元素距离整个视口的距离
        const offsetWidth=e.pageX - rect.left
        this._offset(offsetWidth)
        //这里点击progressBtn的时候offset获取不对
        // this._offset(e.offsetX)
        this._triggerPercent()
      }
    },
    watch: {
      percent(newPercent) {
        if (newPercent > 0 && !this.touch.inite) {
          const barwidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          const offsetWidth = barwidth * newPercent
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
