import {commonParams, options, ERR_OK} from "./config";
import jsonp from 'common/js/jsonp'

export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'
  const data = Object.assign({}, commonParams, {
    g_tk: 1928093487,
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })
  return jsonp(url, data, options)
}

export function getSingerDetial(singerId) {
  const url='https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

  const data=Object.assign({},commonParams,{
    g_tk: 852107509,
    format: 'json',
    platform: 'h5page',
    needNewCode: 1,
    order: 'listen',
    from: 'h5',
    num: 30,
    begin: 0,
    singermid: singerId
  })

  return jsonp(url,data,options)
}
