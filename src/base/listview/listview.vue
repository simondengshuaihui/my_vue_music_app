<template>
  <scroll class="listview"
          :listen-scroll="listenScroll"
          :data="data"
          ref="listview"
          :probeType="probeType"
          @scroll="scroll">
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img v-lazy="item.avatar" alt="" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut">
      <ul>
        <li v-for="(item,index) in shortCutList" class="item" :data-index="index"
            :class="{'current':currentIndex===index}"
            @touchstart.stop.prevent="onStartcutTouchStart"
            @touchmove.stop.prevent="onStartcutTouchMove">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div class="loading-container" v-show="!data.length">

    </div>
  </scroll>
</template>
<script type="text/ecmascript-6">
  import Scroll from '@/base/scroll/scroll'
  import {getData} from '@/common/js/dom'
  import Loading from '@/base/loading/loading'

  const ANCHOR_HEIGHT = 18  //每个字母高度
  const TITLE_HEIGHT = 30  //title的高度

  export default {
    props: {
      data: {
        data: {
          type: Array,
          default: []
        }
      }
    },
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff:-1
      }
    },
    created() {
      this.touch = {}   //不用让vue监听，只是获取数据功能
      this.listHeight = []  //保存每个listGroup的高度
      this.probeType = 3  //让better-scroll监听swip，惯性滑动
      this.listenScroll = true  //传递参数给scroll让scroll监听滚动
    },
    components: {
      Scroll,
      Loading
    },
    computed: {
      shortCutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle() {  //实现title的交替
        if (this.scrollY > 0) {  //在热门位置下拉，则返回空，用v-show绑定了fixedTitle
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ""
      }
    },
    methods: {
      selectItem(item){  //派发select事件，传递item歌手
        this.$emit('select',item)
      },
      onStartcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY  //记录起始点位置
        this.touch.anchorIndex = anchorIndex //记录起始锚点
        this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex], 0)
        this._scrollTo(anchorIndex)
      },
      onStartcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY   //记录结束点位置
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0  //  |0 相对于math.floor()
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta  //加上移动的几个字母，且this.touch.anchorIndex为字符串
        // console.log(typeof anchorIndex)
        this._scrollTo(anchorIndex)
      },
      _scrollTo(index) {  //封装一个方法滚动到index的那个元素
        if (index === null) {  //点到头部padding空间后不做操作
          return
        }
        if (index < 0) { //处理边界问题，当向上滑出滚动条时
          index = 0
        } else if (index > this.listHeight - 2) {  //当向下划出滚动条时
          index = this.listHeight - 2
        }
        this.scrollY = -this.listHeight[index]  //改变scrollY的值来高亮文字
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      scroll(pos) {
        this.scrollY = pos.y  //传递scrollTop值
        // console.log(pos.y)
      },
      _caculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height) //起始高度为0
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight  //累加计算每个listGroup的高度
          this.listHeight.push(height)
        }
      },
      refresh(){  //暴露方法出去刷新scroll组件
        this.$refs.listview.refresh()
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._caculateHeight()
        }, 20)
      },
      scrollY(newY) {  //watch自动获取新的y值
        const listHeight = this.listHeight
        //滚动到顶部，当newY为正数的时候，就是上拉的时候
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        //滚动到中部的时候
        for (let i = 0; i < listHeight.length - 1; i++) {   //listHeight.lenght-1保证heigth2是有的
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]

          if (-newY >= height1 && -newY < height2) {  //!height2是滑到最后一个  向下滚动newY为负值
            this.currentIndex = i
            this.diff = height2 + newY  //计算偏移差
            // console.log(this)
            // console.log(this.currentIndex + 'newY:' + newY)
            return
          }
        }
        //滚动到底部的时候,且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {  //解决title替换时的顺滑效果
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {   //在区间停住时，不做处理
          return
        }
        this.fixedTop = fixedTop
        // console.log(fixedTop)
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
          font-size: 1.03em
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
