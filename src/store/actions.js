import * as types from './mutation-type'
import {shuffle} from "common/js/util";
import {playMode} from "common/js/config";

// function findIndex(list, song) {
//   return list.findIndex((item) => {
//     return item.id === song.id
//   })
// }

export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {  //如果是随机播放的时候点击音乐列表
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = randomList.findIndex((item) => {
      return item.id === list[index].id
    })
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function ({commit, state}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_FULL_SCREEN, true)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_PLAYING_STATE, true)
}
