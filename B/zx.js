/**
 * 支持本地包直播链接
 * 传参 ?type=url&params=../json/live2cms.json
 live2cms.json
 支持m3u类直播，支持线路归并。支持筛选切换显示模式
 [
 {
    "name": "GitHub",
    "url": "https://ghproxy.net/https://raw.githubusercontent.com/ssili126/tv/main/itvlist.txt"
  },
 {
    "name": "CNTV",
    "url": "./live_cntv.txt"
  }
 ]
 */

/**
 * m3u直播格式转一般直播格式
 * @param m3u
 * @returns {string}
 */
function convertM3uToNormal(m3u) {
    try {
        const lines = m3u.split('\n');
        let result = '';
        let TV = '';
        // let flag='#genre#';
        let flag = '#m3u#';
        let currentGroupTitle = '';
        lines.forEach((line) => {
            if (line.startsWith('#EXTINF:')) {
                line = line.replace(/'/g, '"');
                let groupTitle = '未知频道';
                let tvg_name = '';
                let tvg_logo = '';
                try {
                    groupTitle = line.match(/group-title="(.*?)"/)[1].trim();
                } catch (e) {
                }
                try {
                    tvg_name = line.match(/tvg-name="(.*?)"/)[1].trim();
                } catch (e) {
                }
                try {
                    tvg_logo = line.match(/tvg-logo="(.*?)"/)[1].trim();
                } catch (e) {
                }
                TV = line.split(',').slice(-1)[0].trim();
                if (currentGroupTitle !== groupTitle) {
                    currentGroupTitle = groupTitle;
                    let ret_list = [currentGroupTitle, flag];
                    // if(tvg_name){
                    //     ret_list.push(tvg_name);
                    // }
                    // if(tvg_logo){
                    //     ret_list.push(tvg_logo);
                    // }
                    result += `\n${ret_list.join(",")}\n`;
                }
            } else if (line.startsWith('http')) {
                const splitLine = line.split(',');
                result += `${TV}\,${splitLine[0]}\n`;
            }
        });
        // result = result.trim();
        result = mergeChannels(result);
        // log(result);
        return result
    } catch (e) {
        log(`m3u直播转普通直播发生错误:${e.message}`);
        return m3u
    }
}

/**
 * 线路归类/小棉袄算法
 * @param arr 数组
 * @param parse 解析式
 * @returns {[[*]]}
 */
function splitArray(arr, parse) {
    parse = parse && typeof (parse) == 'function' ? parse : '';
    let result = [[arr[0]]];
    for (let i = 1; i < arr.length; i++) {
        let index = -1;
        for (let j = 0; j < result.length; j++) {
            if (parse && result[j].map(parse).includes(parse(arr[i]))) {
                index = j;
            } else if ((!parse) && result[j].includes(arr[i])) {
                index = j;
            }
        }
        if (index >= result.length - 1) {
            result.push([]);
            result[result.length - 1].push(arr[i]);
        } else {
            result[index + 1].push(arr[i]);
        }
    }
    return result;
}

/**
 * 搜索结果生成分组字典
 * @param arr
 * @param parse x=>x.split(',')[0]
 * @returns {{}}
 */
function gen_group_dict(arr, parse) {
    let dict = {};
    arr.forEach((it) => {
        let k = it.split(',')[0];
        if (parse && typeof (parse) === 'function') {
            k = parse(k);
        }
        if (!dict[k]) {
            dict[k] = [it];
        } else {
            dict[k].push(it);
        }
    });
    return dict
}

/**
 * txt格式直播自动合并频道链接
 * @param text
 * @returns {string}
 */
function mergeChannels(text) {
    const lines = text.split('\n');
    const channelMap = new Map();
    let currentChannel = ''; // 当前处理的频道

    lines.forEach(line => {
        // 使用正则表达式匹配频道行，假设频道行包含",#"即可识别为频道行
        if (/,#/.test(line)) {
            // 如果是频道名称，作为键值存储，初始化为空数组
            currentChannel = line;
            if (!channelMap.has(line)) {
                channelMap.set(line, []);
            }
        } else if (line) { // 忽略空行
            // 将当前行（链接）添加到当前频道数组中
            if (currentChannel) {
                channelMap.get(currentChannel).push(line);
            }
        }
    });

    // 构建结果字符串
    let result = '';
    channelMap.forEach((value, key) => {
        result += key + '\n' + value.join('\n') + '\n\n';
    });

    return result.trim(); // 移除尾部的多余换行符
}

globalThis.mergeChannels = mergeChannels;
globalThis.convertM3uToNormal = convertM3uToNormal;
globalThis.splitArray = splitArray;
globalThis.gen_group_dict = gen_group_dict;
globalThis.getRandomItem = function (items) {//从列表随机取出一个元素
    return items[Math.random() * items.length | 0];
}
globalThis.__ext = {data_dict: {}};
var rule = {
    title: '💻m3u8视频链接资源💻｜',
    author: '☯️道长☯️',
    version: '网络作者',
    update_info: `影视资源接口｜软件｜Max宝盒-521影视-影迷-宝全影院
`,
    host: '',
    homeUrl: '',
    searchUrl: '#wd=**&pg=#TruePage##page=fypage',
    url: 'fyclass#pg=fypage&t=fyfilter',
    filter_url: '{{fl.show}}',
    headers: {'User-Agent': 'MOBILE_UA'},
    timeout: 0, // class_name: '电影&电视剧&综艺&动漫',
    limit: 0,
    search_limit: 0, // 搜索限制取前5个，可以注释掉，就不限制搜索
    searchable: 1,//是否启用全局搜索,
    quickSearch: 0,//是否启用快速搜索,
    filterable: 1,//是否启用分类筛选,
    play_parse: true,
    // params: 'http://127.0.0.1:5707/files/json/live2cms.json',
    // 下面自定义一些源的配置
    // def_pic: 'https://avatars.githubusercontent.com/u/97389433?s=120&v=4', //默认列表图片
    def_pic: 'https://api.uuz.bid/random/', //默认列表图片
    showMode: 'groups',// groups按组分类显示 all全部一条线路展示
    groupDict: {},// 搜索分组字典
    tips: '', //二级提示信息
    预处理: $js.toString(() => {
        // 初始化保存的数据
        rule.showMode = getItem('showMode', 'groups');
        rule.groupDict = JSON.parse(getItem('groupDict', '{}'));
        rule.tips = `📺m3u8源直播转点播📺${rule.version}`;

        if (typeof (batchFetch) === 'function') {
            // 支持批量请求直接放飞自我。搜索限制最大线程数量16
            rule.search_limit = 0;
            log('当前程序支持批量请求[batchFetch],搜索限制已设置为16');
        }
        let _url = rule.params;
        if (_url && typeof (_url) === 'string' && /^(http|file)/.test(_url)) {
            let html = request(_url);
            let json = JSON.parse(html);

            let _classes = [];
            rule.filter = {};
            rule.filter_def = {};
            json.forEach(it => {
                if (it.url && !/^(http|file)/.test(it.url)) {
                    it.url = urljoin(_url, it.url);
                }
                if (it.img && !/^(http|file)/.test(it.img)) {
                    it.img = urljoin(_url, it.img);
                }
                let _obj = {
                    type_name: it.name,
                    type_id: it.url,
                    img: it.img,
                };
                _classes.push(_obj);
                let json1 = [{'n': '多线路分组', 'v': 'groups'}, {'n': '单线路', 'v': 'all'}];
                try {
                    rule.filter[_obj.type_id] = [
                        {'key': 'show', 'name': '播放展示', 'value': json1}
                    ];
                    if (json1.length > 0) {
                        rule.filter_def[it.url] = {"show": json1[0].v};
                    }
                } catch (e) {
                    rule.filter[it.url] = json1
                }
            });
            __ext.data = json;
            rule.classes = _classes;
        }
    }),
    class_parse: $js.toString(() => {
        input = rule.classes;
    }),
    推荐: $js.toString(() => {
        let update_info = [{
            vod_name: '更新日志',
            vod_id: 'update_info',
            vod_remarks: `版本:${rule.version}`,
            vod_pic: 'https://ghproxy.net/https://raw.githubusercontent.com/hjdhnx/hipy-server/master/app/static/img/logo.png'
        }];
        VODS = [];
        if (rule.classes) {
            let randomClass = getRandomItem(rule.classes);
            let _get_url = randomClass.type_id;
            // let current_vod = rule.classes.find(item => item.type_id === _get_url);
            // let _pic = current_vod ? current_vod.img : '';
            let _pic = randomClass.img;
            let html;
            if (__ext.data_dict[_get_url]) {
                html = __ext.data_dict[_get_url];
            } else {
                html = request(_get_url);
                if (/#EXTM3U/.test(html)) {
                    html = convertM3uToNormal(html);
                } else {
                    html = mergeChannels(html);
                }
                __ext.data_dict[_get_url] = html;
            }
            let arr = html.match(/.*?[,，]#[\s\S].*?#/g); // 可能存在中文逗号
            try {
                arr.forEach(it => {
                    let vname = it.split(/[,，]/)[0];
                    let vtab = it.match(/#(.*?)#/)[0];
                    VODS.push({
                        vod_name: vname,
                        vod_id: _get_url + '$' + vname,
                        vod_pic: _pic || rule.def_pic,
                        vod_remarks: vtab,
                    });
                });
            } catch (e) {
                log(`直播转点播获取首页推荐发送错误:${e.message}`);
            }
        }
        VODS = update_info.concat(VODS);
    }),
    一级: $js.toString(() => {
        VODS = [];
        // 一级限制页数不允许翻页
        if (rule.classes && MY_PAGE <= 1) {
            if (MY_FL.show) {
                rule.showMode = MY_FL.show;
                setItem('showMode', rule.showMode);
            }
            let _get_url = input.split('#')[0];
            let current_vod = rule.classes.find(item => item.type_id === MY_CATE);
            let _pic = current_vod ? current_vod.img : '';
            let html;
            if (__ext.data_dict[_get_url]) {
                html = __ext.data_dict[_get_url];
            } else {
                html = request(_get_url);
                if (/#EXTM3U/.test(html)) {
                    html = convertM3uToNormal(html);
                } else {
                    html = mergeChannels(html);
                }
                __ext.data_dict[_get_url] = html;
            }
            let arr = html.match(/.*?[,，]#[\s\S].*?#/g); // 可能存在中文逗号
            try {
                arr.forEach(it => {
                    let vname = it.split(/[,，]/)[0];
                    let vtab = it.match(/#(.*?)#/)[0];
                    VODS.push({
                        // vod_name:it.split(',')[0],
                        vod_name: vname,
                        vod_id: _get_url + '$' + vname,
                        vod_pic: _pic || rule.def_pic,
                        vod_remarks: vtab,
                    });
                });
            } catch (e) {
                log(`直播转点播获取一级分类页发生错误:${e.message}`);
            }
        }
    }),
    二级: $js.toString(() => {
        VOD = {};
        if (orId === 'update_info') {
            VOD = {
                vod_content: rule.update_info.trim(),
                vod_name: '更新日志',
                type_name: '更新日志',
                vod_pic: 'https://api.uuz.bid/random/',
                vod_remarks: `版本:${rule.version}`,
                vod_play_from: '☯️道长在线☯️',
                // vod_play_url: '嗅探播放$https://resource-cdn.tuxiaobei.com/video/10/8f/108fc9d1ac3f69d29a738cdc097c9018.mp4',
                vod_play_url: '随机小视频$http://api.yujn.cn/api/zzxjj.php',
            };
        } else {
            if (rule.classes) {
                let _get_url = orId.split('$')[0];
                let _tab = orId.split('$')[1];
                if (orId.includes('#search#')) {
                    let vod_name = _tab.replace('#search#', '');
                    let vod_play_from = '来自搜索';
                    vod_play_from += `:${_get_url}`;
                    let vod_play_url = rule.groupDict[_get_url].map(x => x.replace(',', '$')).join('#');
                    log(orId);
                    VOD = {
                        vod_name: '搜索:' + vod_name,
                        type_name: "🇨🇳国产视频合集🇨🇳",
                        vod_pic: rule.def_pic,
                        // vod_content: orId,
                        vod_content: orId.replace(getHome(orId), 'http://***'),
                        vod_play_from: vod_play_from,
                        vod_play_url: vod_play_url,
                        vod_director: rule.tips,
                        vod_remarks: rule.tips,
                    }
                } else {
                    let current_vod = rule.classes.find(item => item.type_id === _get_url);
                    let _pic = current_vod ? current_vod.img : '';
                    let html;
                    if (__ext.data_dict[_get_url]) {
                        html = __ext.data_dict[_get_url];
                    } else {
                        html = request(_get_url);
                        if (/#EXTM3U/.test(html)) {
                            html = convertM3uToNormal(html);
                        } else {
                            html = mergeChannels(html);
                        }
                        __ext.data_dict[_get_url] = html;
                    }
                    let a = new RegExp(`.*?${_tab.replace('(','\\(').replace(')','\\)')}[,，]#[\\s\\S].*?#`);
                    let b = html.match(a)[0];
                    let c = html.split(b)[1];
                    if (c.match(/.*?[,，]#[\s\S].*?#/)) {
                        let d = c.match(/.*?[,，]#[\s\S].*?#/)[0];
                        c = c.split(d)[0];
                    }
                    let arr = c.trim().split('\n');
                    let _list = [];
                    arr.forEach((it) => {
                        if (it.trim()) {
                            let t = it.trim().split(',')[0];
                            let u = it.trim().split(',')[1];
                            _list.push(t + '$' + u);
                        }
                    });

                    let vod_name = __ext.data.find(x => x.url === _get_url).name;
                    let vod_play_url;
                    let vod_play_from;

                    if (rule.showMode === 'groups') {
                        let groups = splitArray(_list, x => x.split('$')[0]);
                        let tabs = [];
                        for (let i = 0; i < groups.length; i++) {
                            if (i === 0) {
                                tabs.push(vod_name + '@1');
                            } else {
                                tabs.push(`@${i + 1}`);
                            }
                        }
                        vod_play_url = groups.map(it => it.join('#')).join('$$$');
                        vod_play_from = tabs.join('$$$');
                    } else {
                        vod_play_url = _list.join('#');
                        vod_play_from = vod_name;
                    }
                    log(orId);
                    VOD = {
                        vod_id: orId,
                        vod_name: vod_name + '|' + _tab,
                        type_name: "🇨🇳国产视频合集🇨🇳",
                        vod_pic: _pic || rule.def_pic,
                        // vod_content: orId,
                        vod_content: orId.replace(getHome(orId), 'http://***'),
                        vod_play_from: vod_play_from,
                        vod_play_url: vod_play_url,
                        vod_director: rule.tips,
                        vod_remarks: rule.tips,
                    };

                }
            }
        }
    }),
    搜索: $js.toString(() => {
        VODS = [];
        if (rule.classes && MY_PAGE <= 1) {
            let _get_url = __ext.data[0].url;
            let current_vod = rule.classes.find(item => item.type_id === _get_url);
            let _pic = current_vod ? current_vod.img : '';
            let html;
            if (__ext.data_dict[_get_url]) {
                html = __ext.data_dict[_get_url];
            } else {
                html = request(_get_url);
                if (/#EXTM3U/.test(html)) {
                    html = convertM3uToNormal(html);
                } else {
                    html = mergeChannels(html);
                }
                __ext.data_dict[_get_url] = html;
            }
            let str = '';
            Object.keys(__ext.data_dict).forEach(() => {
                str += __ext.data_dict[_get_url];
            });
            let links = str.split('\n').filter(it => it.trim() && it.includes(',') && it.split(',')[1].trim().startsWith('http'));
            links = links.map(it => it.trim());
            let plays = Array.from(new Set(links));
            log('搜索关键词:' + KEY);
            log('过滤前:' + plays.length);
            // plays = plays.filter(it => it.includes(KEY));
            plays = plays.filter(it => new RegExp(KEY, 'i').test(it));
            log('过滤后:' + plays.length);
            log(plays);
            let new_group = gen_group_dict(plays);
            rule.groupDict = Object.assign(rule.groupDict, new_group);
            // 搜索分组结果存至本地方便二级调用
            setItem('groupDict', JSON.stringify(rule.groupDict));
            // 返回的还是搜索的new_group
            Object.keys(new_group).forEach((it) => {
                VODS.push({
                    'vod_name': it,
                    'vod_id': it + '$' + KEY + '#search#',
                    'vod_pic': _pic || rule.def_pic,
                });
            });
        }
    }),
    lazy: $js.toString(() => {
        if (/\.(m3u8|mp4)/.test(input)) {
            if (input.includes('?') && typeof (playObj) == 'object' && playObj.url) {
                input = playObj.url;
            }
            input = {parse: 0, url: input}
        } else if (/yangshipin|1905\.com/.test(input)) {
            input = {parse: 1, jx: 0, url: input, js: '', header: {'User-Agent': PC_UA}, parse_extra: '&is_pc=1'};
        } else {
            input
        }
    }),
}