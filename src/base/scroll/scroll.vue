<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>
<script>
  import BScroll from 'better-scroll'

  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      listenScroll: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })

        if (this.listenScroll) {   //添加scroll事件监听
          let me = this     //this.scroll 里面的this是指scroll不是vue实例
          this.scroll.on('scroll', (pos) => {  //派发事件，better-scroll传出position参数
            me.$emit('scroll', pos)
          })
        }
      },
      enable() {
        this.scroll && this.scroll.enable()
      },
      disable() {
        this.scroll && this.scroll.disable()
      },
      refresh() {    //刷新
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {   //滚动到   因为需要apply把scrollTo的参数传递到this.scrolldTo()的方法中
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() {   //滚动到某个元素
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      data() {   //监听data的变化来刷新scroll的启动
        setTimeout(() => {
          this.refresh()
        }, 20)
      }
    }
  }
</script>
<style scoped lang="stylus" ref="stylesheet/stylus">

</style>
