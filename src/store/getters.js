export const singer = (state)=>{return state.singer}

export const playing = (state)=>{return state.playing}

export const fullScreen = (state)=>{return state.fullScreen}

export const playlist = (state)=>{return state.playlist}

export const sequenceList = (state)=>{return state.sequenceList}

export const mode = (state)=>{return state.mode}

export const currentIndex = (state)=>{return state.currentIndex}

export const currentSong = (state)=>{return state.playlist[state.currentIndex] || {}}  //播放歌曲可由播放列表和currentIndex计算得出

export const disc = (state) => { return state.disc }

export const topList = (state) => {return state.topList}
