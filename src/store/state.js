import {playMode} from 'common/js/config'

const state =
{
  singer: {},
  playing: false,
  fullScreen:false,
  playlist:[],
  sequenceList:[],
  mode:playMode.sequence,   //默认顺序播放
  currentIndex:-1,
  disc:{},
  disc:{},
  topList:[]
}

export default state
