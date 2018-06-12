<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>
<script>
  import {getSingerList} from '@/api/singer'
  import {ERR_OK} from '@/api/config'

  import Singer from '@/common/js/singer'  //引入singer构造函数
  import ListView from '@/base/listview/listview'
  import {playlistMixin} from "common/js/mixin";

  import {mapMutations} from 'vuex'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN=10
  export default {
    mixins:[playlistMixin],
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playlist){
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()   //调用组件里的refresh方法
      },
      selectSinger(singer){  //跳转路由
        this.$router.push({path:`/singer/:${singer.id}`})
        this.setSinger(singer)  //调用mutation写数据
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalLizeSinger(res.data.list)
            // console.log(this.singers)
          }
        })
      },
      _normalLizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }

        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {    //push前10位热门歌手
            map.hot.items.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
          }
          //push 每个A-Z歌手
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer(item.Fsinger_mid, item.Fsinger_name))
        })

        //  为了得到有序列表，需要处理map
        let hot = []
        let ret = []

        for (var key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) { //如果item的title mach到A-Z
            ret.push(val)
          } else if (val.title === HOT_NAME) { //如果title是热门
            hot.push(val)
          }
        }

      //  ret排序
        ret.sort((a,b)=>{
          return a.title.charCodeAt(0)-b.title.charCodeAt(0)
        })
        return hot.concat(ret)  //拼接
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'   //映射this.setSinger为store.mutations.SET_SINGER
      })

    },
    components:{
      ListView
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer {
    position: fixed;
    top: 88px;
    bottom 0;
    width: 100%;
  }
</style>
