// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "tmdb.person.movie",
    title: "TMDB人物影视作品",
    version: "2.3.9",
    requiredVersion: "0.0.1",
    description: "获取 TMDB 人物作品",
    author: "ICoeMix (Optimized by ChatGPT)",
    site: "https://github.com/ICoeMix/ForwardWidgets",
    cacheDuration: 172800,
    modules: [
        { id: "allWorks", title: "全部作品", functionName: "getAllWorks", cacheDuration: 172800 },
        { id: "actorWorks", title: "演员作品", functionName: "getActorWorks", cacheDuration: 172800 },
        { id: "directorWorks", title: "导演作品", functionName: "getDirectorWorks", cacheDuration: 172800 },
        { id: "otherWorks", title: "其他作品", functionName: "getOtherWorks", cacheDuration: 172800 }
    ]
};

// -----------------------------
// 参数模板 Params
// -----------------------------
const Params = [
    {
        name: "personId",
        title: "人物搜索",
        type: "input",
        description: "输入名字自动获取 TMDB 网站人物的个人 ID，失效请手动输入个人 ID",
        placeholders: [
            { title: "张艺谋", value: "607" }, { title: "李安", value: "1614" }, { title: "周星驰", value: "57607" },
            { title: "成龙", value: "18897" }, { title: "吴京", value: "78871" }, { title: "王家卫", value: "12453" },
            { title: "姜文", value: "77301" }, { title: "贾樟柯", value: "24011" }, { title: "陈凯歌", value: "20640" },
            { title: "徐峥", value: "118711" }, { title: "宁浩", value: "17295" }, { title: "黄渤", value: "128026" },
            { title: "葛优", value: "76913" }, { title: "胡歌", value: "1106514" }, { title: "张译", value: "146098" },
            { title: "沈腾", value: "1519026" }, { title: "王宝强", value: "71051" }, { title: "赵丽颖", value: "1260868" },
            { title: "孙俪", value: "52898" }, { title: "张若昀", value: "1675905" }, { title: "秦昊", value: "1016315" },
            { title: "易烊千玺", value: "2223265" }, { title: "王倦", value: "2467977" }, { title: "孔笙", value: "1494556" },
            { title: "张国立", value: "543178" }, { title: "陈思诚", value: "1065761" }, { title: "徐克", value: "26760" },
            { title: "林超贤", value: "81220" }, { title: "郭帆", value: "1100748" }, { title: "史蒂文·斯皮尔伯格", value: "488" },
            { title: "詹姆斯·卡梅隆", value: "2710" }, { title: "克里斯托弗·诺兰", value: "525" },
            { title: "阿尔弗雷德·希区柯克", value: "2636" }, { title: "斯坦利·库布里克", value: "240" },
            { title: "黑泽明", value: "5026" }, { title: "莱昂纳多·迪卡普里奥", value: "6193" },
            { title: "阿米尔·汗", value: "52763" }, { title: "宫崎骏", value: "608" }, { title: "蒂姆·伯顿", value: "510" },
            { title: "杨紫琼", value: "1620" }, { title: "凯特·布兰切特", value: "112" }, { title: "丹尼尔·戴·刘易斯", value: "11856" },
            { title: "宋康昊", value: "20738" }
        ],
        value: ""
    },
    {
        name: "language",
        title: "语言",
        type: "enumeration",
        enumOptions: [
            { title: "中文", value: "zh-CN" },
            { title: "英文", value: "en-US" },
            { title: "日文", value: "ja-JP" },
            { title: "韩文", value: "ko-KR" },
            { title: "法文", value: "fr-FR" }
        ],
        value: "zh-CN"
    },
    {
        name: "type",
        title: "上映状态",
        type: "enumeration",
        enumOptions: [
            { title: "全部作品", value: "all" },
            { title: "已上映", value: "released" },
            { title: "即将上映", value: "upcoming" }
        ],
        value: "all"
    },
    {
        name: "filter",
        title: "关键词过滤",
        type: "input",
        description: "过滤标题中包含指定关键词的作品",
        placeholders: [
            { title: "默认（不过滤）", value: "" },
            { title: "关键词过滤", value: "A" },
            { title: "完全匹配 A", value: "^A$" },
            { title: "以 A 开头", value: "^A.*" },
            { title: "以 B 结尾", value: ".*B$" },
            { title: "包含 A 或 B", value: "A|B" },
            { title: "包含 A 和 B", value: "^(?=.*A)(?=.*B).*$" },
            { title: "不包含 A 但包含 B", value: "^(?:(?!A).)*B.*$" },
            { title: "以 A 开头，任意字符，B 结尾", value: "^A.*B$" }
        ],
        value: ""
    },
    {
        name: "sort_by",
        title: "排序方式",
        type: "enumeration",
        value: "release_date.desc",
        enumOptions: [
            { title: "发行日期降序", value: "release_date.desc" },
            { title: "评分降序", value: "vote_average.desc" },
            { title: "热门降序", value: "popularity.desc" }
        ]
    },
    {
        name: "logMode",
        title: "日志模式",
        type: "enumeration",
        enumOptions: [
            { title: "信息", value: "info" },
            { title: "调试", value: "debug" },
            { title: "警告", value: "warning" }
        ],
        value: "info"
    }
];

WidgetMetadata.modules.forEach(m => m.params = JSON.parse(JSON.stringify(Params)));

// -----------------------------
// Logger 安全实例
const LoggerLevels = { debug: 0, info: 1, warn: 2, notify: 3 };
const logger = {
    level: LoggerLevels.info,
    setLevel(level) {
        if (level in LoggerLevels) this.level = LoggerLevels[level];
    },
    debug(...args) { if (this.level <= LoggerLevels.debug) console.log("[DEBUG]", ...args); },
    info(...args) { if (this.level <= LoggerLevels.info) console.log("[INFO]", ...args); },
    warn(...args) { if (this.level <= LoggerLevels.warn) console.warn("[WARN]", ...args); },
    notify(...args) { if (this.level <= LoggerLevels.notify) console.info("[NOTIFY]", ...args); }
};

// -----------------------------
// 根据 logMode 设置全局 logger
function setLoggerMode(logMode) {
    switch(logMode){
        case "debug": logger.setLevel("debug"); break;
        case "info": logger.setLevel("info"); break;
        case "warning": logger.setLevel("warn"); break;
        default: logger.setLevel("info");
    }
}

// -----------------------------
// LRU 异步缓存
class LRUCache {
    constructor(maxSize = 200) { this.maxSize = maxSize; this.cache = new Map(); this.head = null; this.tail = null; }
    _removeNode(n) { if (!n) return; if (n.prev) n.prev.next = n.next; else this.head = n.next; if (n.next) n.next.prev = n.prev; else this.tail = n.prev; }
    _addNodeToHead(n) { n.next = this.head; n.prev = null; if (this.head) this.head.prev = n; this.head = n; if (!this.tail) this.tail = n; }
    _touchNode(n) { this._removeNode(n); this._addNodeToHead(n); }
    _evictIfNeeded() { while (this.cache.size > this.maxSize) { const k = this.tail?.key; if (!k) break; this._removeNode(this.tail); this.cache.delete(k); } }

    async get(key) { const n = this.cache.get(key); if (!n) return null; this._touchNode(n); return n.value; }
    set(key, value) { let n = this.cache.get(key); if (n) { n.value = value; this._touchNode(n); } else { n = { key, value, prev: null, next: null }; this.cache.set(key, n); this._addNodeToHead(n); } this._evictIfNeeded(); }
    has(key) { return this.cache.has(key); }
    delete(key) { const n = this.cache.get(key); if (n) { this._removeNode(n); this.cache.delete(key); } }

    async getOrSet(key, fetcher) {
        if (this.has(key)) return await this.get(key);
        try { const r = await fetcher(); this.set(key, r); return r; } 
        catch (e) { this.delete(key); logger.warn("缓存 fetcher 异常:", e); throw e; }
    }
}

// -----------------------------
// 缓存实例
const personIdCache = new LRUCache(200);
const personWorksCache = new LRUCache(200);
const tmdbGenresCache = { movie:{}, tv:{} };

// -----------------------------
// 安全获取人物ID
async function resolvePersonIdSafe(personInput, language="zh-CN", logMode="debug") {
    let s = personInput?.toString().trim();

    // 输入为空时，默认搜索“张艺谋”
    if (!s) {
        s = "张艺谋";
        logger.info(`输入为空，使用默认搜索人物: "${s}"`);
    }

    // 如果输入的是数字，直接返回
    if (/^\d+$/.test(s)) return Number(s);

    const cacheKey = `${s}_${language}`;
    return await personIdCache.getOrSet(cacheKey, async () => {
        logger.info(`搜索人物ID: "${s}"`);
        try {
            const res = await Widget.tmdb.get("search/person", { params: { query: s, language } });
            return res?.results?.[0]?.id || null;  // 找不到就返回 null
        } catch (e) {
            logger.warn("resolvePersonId失败", e);
            return null;
        }
    });
}

// -----------------------------
// 初始化 TMDB 类型
async function initTmdbGenres(language="zh-CN"){
    if(Object.keys(tmdbGenresCache.movie).length && Object.keys(tmdbGenresCache.tv).length) {
        console.log("[DEBUG] tmdbGenresCache 已初始化，无需重复请求");
        return;
    }

    try {
        const [movieResp, tvResp] = await Promise.all([
            Widget.tmdb.get("genre/movie/list",{params:{language}}),
            Widget.tmdb.get("genre/tv/list",{params:{language}})
        ]);

        const movieGenres = movieResp?.genres || [];
        const tvGenres = tvResp?.genres || [];

        // 保证原对象引用不变并填充数据
        Object.assign(tmdbGenresCache.movie, Object.fromEntries(movieGenres.map(g => [g.id, g.name])));
        Object.assign(tmdbGenresCache.tv, Object.fromEntries(tvGenres.map(g => [g.id, g.name])));

        console.log("[DEBUG] tmdbGenresCache 初始化完成",
            { movie: tmdbGenresCache.movie, tv: tmdbGenresCache.tv, movieCount: movieGenres.length, tvCount: tvGenres.length }
        );

    } catch(e) {
        logger.warn("初始化 TMDB 类型失败", e);
        tmdbGenresCache.movie = {};
        tmdbGenresCache.tv = {};
    }
}

// -----------------------------
// 获取人物作品
async function fetchCreditsCached(personId, language="zh-CN"){
    const cacheKey = `credits_${personId}_${language}`;
    return await personWorksCache.getOrSet(cacheKey, async ()=>{
        try{
            const res = await Widget.tmdb.get(`person/${personId}/combined_credits`, { params: { language } });
            const cast = normalizeItems(res?.cast || []);
            const crew = normalizeItems(res?.crew || []);
            return [...cast, ...crew];
        } catch(e){
            logger.warn("fetchCredits 获取作品失败", e);
            return [];
        }
    });
}

// -----------------------------
// 规范化处理
function normalizeItem(item){
    if(!item || typeof item!=="object") return { 
        id:null, type:"tmdb", title:"未知", overview:"", posterPath:"", backdropPath:"", 
        mediaType:"movie", releaseDate:"", popularity:0, rating:0, jobs:[], characters:[], genre_ids:[], 
        _normalizedTitle:"", _releaseTime:0, _popularity:0, _rating:0 
    };
    const title = item.title || item.name || "未知";
    const mediaType = item.media_type || (item.release_date ? "movie" : (item.first_air_date ? "tv" : "movie"));
    const release = item.release_date || item.first_air_date || "";
    return {
        id: item.id || null,
        type: "tmdb",
        title,
        overview: item.overview || "",
        posterPath: item.poster_path || "",
        backdropPath: item.backdrop_path || "",
        mediaType,
        releaseDate: release,
        popularity: Number(item.popularity || 0),
        rating: Number(item.vote_average || 0),
        jobs: Array.isArray(item.jobs) ? item.jobs : (item.job ? [item.job] : []),
        characters: Array.isArray(item.characters) ? item.characters : (item.character ? [item.character] : []),
        genre_ids: Array.isArray(item.genre_ids) ? item.genre_ids : [],
        _normalizedTitle: title.toLowerCase(),
        _releaseTime: release ? new Date(release).getTime() : 0,
        _popularity: Number(item.popularity || 0),
        _rating: Number(item.vote_average || 0)
    };
}

function normalizeItems(list){ return Array.isArray(list)?list.map(normalizeItem):[]; }

// -----------------------------
// 输出格式化
function formatOutput(list){
    return [...(Array.isArray(list)?list:[])]
        .filter(i => i && typeof i==="object")
        .sort((a,b)=>new Date(b.releaseDate||0) - new Date(a.releaseDate||0))
        .map(i=>{
            const mediaType = i.mediaType || "movie";
            const genreMap = tmdbGenresCache[mediaType] || {};
            const genreTitle = Array.isArray(i.genre_ids) ? i.genre_ids.map(id=>genreMap[id] || `未知类型(${id})`).join("•") : "";
            return {
                id: i.id,
                type: "tmdb",
                title: i.title || "未知",
                description: i.overview || "",
                releaseDate: i.releaseDate || "",
                rating: i.rating || 0,
                popularity: i.popularity || 0,
                posterPath: i.posterPath || "",
                backdropPath: i.backdropPath || "",
                mediaType,
                jobs: i.jobs || [],
                characters: i.characters || [],
                genreTitle
            };
        });
}

// -----------------------------
// 带 debug 的通用过滤函数
function filterWithDebug(list, predicate, debugInfo){
    if(!Array.isArray(list) || !list.length) return [];
    return list.filter(item => {
        try {
            const keep = predicate(item);
            if(!keep && debugInfo) debugInfo.filteredOutTitles.push(item.title || "(no title)");
            return keep;
        } catch(e){ return true; }
    });
}

// -----------------------------
// AC 自动机 + 正则过滤
const acCache=new Map(),regexCache=new Map(),filterUnitCache=new Map();
class ACAutomaton{constructor(){this.root={next:Object.create(null),fail:null,output:[]}};insert(w){let n=this.root;for(const c of w){if(!n.next[c])n.next[c]={next:Object.create(null),fail:null,output:[]};n=n.next[c]}n.output.push(w)};build(){const q=[];this.root.fail=this.root;for(const k of Object.keys(this.root.next)){const n=this.root.next[k];n.fail=this.root;q.push(n)}while(q.length){const node=q.shift();for(const c of Object.keys(node.next)){const ch=node.next[c];let f=node.fail;while(f!==this.root&&!f.next[c])f=f.fail;ch.fail=f.next[c]||this.root;ch.output=ch.output.concat(ch.fail.output);q.push(ch)}}};matchAny(text){if(!text)return false;let n=this.root;for(const c of text){while(n!==this.root&&!n.next[c])n=n.fail;n=n.next[c]||this.root;if(n.output.length)return true}return false}}
const normalizeTitleForMatch = s => s?s.replace(/[\u200B-\u200D\uFEFF]/g,"").trim().toLowerCase():"";
const isPlainText = t => !/[\*\?\^\$\.\+\|\(\)\[\]\{\}\\]/.test(t);
const getRegex = t => regexCache.has(t)?regexCache.get(t):(regexCache.set(t,(r=>{try{return new RegExp(t,'i')}catch(e){return null}})()),regexCache.get(t));
const buildFilterUnit = s => !s?.trim()?null:filterUnitCache.has(s)?filterUnitCache.get(s):(filterUnitCache.set(s,(()=>{const terms=s.split(/\s*\|\|?\s*/).map(t=>t.trim()).filter(Boolean),plain=[],regex=[];for(const t of terms)isPlainText(t)?plain.push(t):regex.push(t);let ac=null;if(plain.length){const np=plain.map(p=>p.toLowerCase()),key=np.slice().sort().join("\u0001");ac=acCache.get(key)||new ACAutomaton();if(!acCache.has(key)){np.forEach(p=>ac.insert(p));ac.build();acCache.set(key,ac)}};let bigRegex=null;if(regex.length){const valid=[];for(const r of regex){const re=getRegex(r);if(re)valid.push(r)}if(valid.length){try{bigRegex=new RegExp(valid.join("|"),"i")}catch(e){bigRegex=null}}}const unit={ac,regexTerms:regex,bigRegex};return unit})()),filterUnitCache.get(s));
const filterByKeywords = (list, s) => !s?.trim()||!Array.isArray(list)||!list.length ? {filtered:list, filteredOut:[]} : (()=>{ const u=buildFilterUnit(s); if(!u) return {filtered:list, filteredOut:[]}; const {ac,bigRegex}=u,fo=[]; const f=list.filter(i=>{try{i._normalizedTitle||(i._normalizedTitle=normalizeTitleForMatch(i.title||"")); const t=i._normalizedTitle; let hit=false; if(ac&&ac.matchAny(t)) hit=true; if(!hit&&bigRegex&&bigRegex.test(t)) hit=true; if(hit) fo.push(i.title||"(no title)"); return !hit}catch(e){return true}}); return {filtered:f, filteredOut:fo}; })();

// -----------------------------
// 核心加载流程
// -----------------------------
async function loadPersonWorks(params) {
    setLoggerMode(params.logMode);

    const language = params.language || "zh-CN";
    const type = params.type || "all";
    const filter = params.filter || "";
    const sort_by = params.sort_by || "";
    const debugMode = logger.level === LoggerLevels.debug;
    const debugInfo = { filteredOutTitles: [] };
    const personKey = `${params.personId}_${language}`;

    // 支持 signal 取消请求
    const { signal } = params;

    // 初始化 genre cache
    await initTmdbGenres(language);

    // 获取缓存或请求作品
    let works = await personWorksCache.getOrSet(personKey, async () => {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const personId = await resolvePersonIdSafe(params.personId, language);
        if (!personId) return [];

        const credits = await fetchCreditsCached(personId, language, signal);
        (credits || []).forEach(w => { if (w.releaseDate) w._releaseDateObj = new Date(w.releaseDate); });
        return credits || [];
    });

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    // 上映状态过滤
    const nowDate = new Date();
    works = filterWithDebug(works, w => type === "all" || ((w._releaseDateObj && w._releaseDateObj <= nowDate) === (type === "released")), debugInfo);

    // 关键词过滤
    if (filter.trim()) {
        const { filtered, filteredOut } = filterByKeywords(works, filter);
        works = filtered;
        if (debugMode) debugInfo.filteredOutTitles.push(...filteredOut);
    }

    // 排序
    if (sort_by) {
        const [field, order] = sort_by.split('.');
        works.sort((a, b) => ((a[field] ?? 0) - (b[field] ?? 0)) * (order === 'desc' ? -1 : 1));
        if (debugMode) logger.debug(`[排序] 字段: ${field}, 顺序: ${order}`);
    }

    // 格式化输出
    const finalList = formatOutput(works);

    // debug 输出
    if (debugMode) {
        const isCacheEmpty = !Object.keys(tmdbGenresCache.movie).length || !Object.keys(tmdbGenresCache.tv).length;
        logger.debug("loadPersonWorks Debug Info:", {
            type,
            filter,
            sort_by,
            filteredOutTitles: debugInfo.filteredOutTitles.length ? [...new Set(debugInfo.filteredOutTitles)] : null,
            tmdbGenresCacheStatus: isCacheEmpty ? "EMPTY" : "OK",
            tmdbGenresCache
        });
        if (isCacheEmpty) logger.warn("tmdbGenresCache 为空，可能没有正确初始化！");
    }

    return finalList;
}

// -----------------------------
// loadSharedWorksSafe
// -----------------------------
async function loadSharedWorksSafe(params) {
    setLoggerMode(params.logMode);
    try {
        const r = await loadPersonWorks({ ...params });
        return Array.isArray(r) ? r : [];
    } catch (err) {
        logger.warn("loadSharedWorksSafe 捕获异常:", err);
        return [];
    }
}


// -----------------------------
// getWorks（内部使用，过滤函数可选）
// -----------------------------
const getWorks = (params, filterFn) =>
    loadSharedWorksSafe({ ...params }).then(r => Array.isArray(r) ? r.filter(i => i && filterFn(i)) : []);

// -----------------------------
// 最优防抖 + 自动取消
// -----------------------------
const createDebounced = (fn, delay = 500) => {
    let timer = null, controller = null;
    return (params = {}) => new Promise((resolve, reject) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(async () => {
            if (controller) controller.abort();
            controller = new AbortController();
            params.signal = controller.signal;
            try {
                const result = await fn(params);
                resolve(result);
            } catch (err) {
                if (err.name === "AbortError") resolve([]);
                else reject(err);
            }
        }, delay);
    });
};

// -----------------------------
// 防抖接口（UI 调用这个即可）
// -----------------------------
const debouncedGetAllWorks = createDebounced(p => getWorks(p, () => true), 500);
const debouncedGetActorWorks = createDebounced(p => getWorks(p, w => w.characters.length), 500);
const debouncedGetDirectorWorks = createDebounced(p => getWorks(p, w => w.jobs.some(j => /director/i.test(j))), 500);
const debouncedGetOtherWorks = createDebounced(p => getWorks(p, w => !w.characters.length && !w.jobs.some(j => /director/i.test(j))), 500);


