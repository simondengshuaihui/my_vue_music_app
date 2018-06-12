//把mixin添加到其他组件中，组件中的同名方法会覆盖mixin的方法
import {mapGetters} from 'vuex'

export const playlistMixin = {
  computed: {
    ...mapGetters(['playlist'])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {  //keepalive组件切换回来触发的事件
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {  //如果组件中没有定义handlePlaylist方法就抛出错误
      throw new Error('component must emplement handlePlaylist methode')
    }
  }

}
