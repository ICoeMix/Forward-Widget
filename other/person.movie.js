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
// 高级缓存管理器
class CacheManager {
    constructor(maxSize = 200) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        entry.ts = Date.now();
        return await entry.value;
    }
    set(key, value) {
        const ts = Date.now();
        this.cache.set(key, { value, ts });
        this._evictIfNeeded();
    }
    has(key) { return this.cache.has(key); }
    delete(key) { this.cache.delete(key); }
    _evictIfNeeded() {
        if (this.cache.size <= this.maxSize) return;
        const oldest = [...this.cache.entries()].reduce((acc, [k, v]) => v.ts < acc[1] ? [k, v.ts] : acc, [null, Infinity])[0];
        if (oldest) this.cache.delete(oldest);
    }
}

const personWorksCache = new CacheManager(200);
const personIdCache = new CacheManager(200);
const tmdbGenresCache = { movie: {}, tv: {} };

// -----------------------------
// 日志函数
function createLogger(mode) {
    const m = mode || "info";
    return {
        debug: (...args) => (m === "debug") && console.log("[DEBUG]", ...args),
        info: (...args) => (["debug","info"].includes(m)) && console.log("[INFO]", ...args),
        warning: (...args) => (["debug","info","warning"].includes(m)) && console.warn("[WARN]", ...args),
        notify: (...args) => (["debug","info","warning"].includes(m)) && console.info("[NOTIFY]", ...args)
    };
}

// -----------------------------
// resolvePersonId 安全版本（替代防抖）
const resolvePersonIdPending = new Map();
async function resolvePersonIdSafe(personInput, language = "zh-CN", logMode = "debug") {
    const logger = createLogger(logMode);
    if (!personInput?.toString().trim()) { 
        logger.warning("输入为空或仅空白，无法解析人物ID"); 
        return null; 
    }

    const s = personInput.toString().trim();
    if (!isNaN(s)) return Number(s);

    const cacheKey = `${s}_${language}`;
    if (personIdCache.has(cacheKey)) return await personIdCache.get(cacheKey);

    if (resolvePersonIdPending.has(cacheKey)) {
        return await resolvePersonIdPending.get(cacheKey);
    }

    const promise = (async () => {
        try {
            logger.info(`搜索人物ID: "${s}"`);
            const res = await Widget.tmdb.get("search/person", { params: { query: s, language } });
            const id = res?.results?.[0]?.id || null;
            if (id) personIdCache.set(cacheKey, Promise.resolve(id));
            return id;
        } catch (err) {
            logger.warning("resolvePersonId 请求失败", err);
            return null;
        } finally {
            resolvePersonIdPending.delete(cacheKey);
        }
    })();

    resolvePersonIdPending.set(cacheKey, promise);
    return await promise;
}

// -----------------------------
// initTmdbGenres
async function initTmdbGenres(language = "zh-CN", logMode = "debug") {
    const logger = createLogger(logMode);
    if (Object.keys(tmdbGenresCache.movie).length && Object.keys(tmdbGenresCache.tv).length) return;

    try {
        const [movieGenres, tvGenres] = await Promise.all([
            Widget.tmdb.get("genre/movie/list", { params: { language } }),
            Widget.tmdb.get("genre/tv/list", { params: { language } })
        ]);
        tmdbGenresCache.movie = Object.fromEntries((movieGenres?.genres || []).map(g => [g.id, g.name]));
        tmdbGenresCache.tv = Object.fromEntries((tvGenres?.genres || []).map(g => [g.id, g.name]));
    } catch (err) {
        logger.warning("初始化TMDB类型失败", err);
        tmdbGenresCache.movie = {};
        tmdbGenresCache.tv = {};
    }
}

// -----------------------------
// fetchCredits
async function fetchCredits(personId, language = "zh-CN", logMode = "debug") {
    try {
        const res = await Widget.tmdb.get(`person/${personId}/combined_credits`, { params: { language } });
        return { cast: res?.cast || [], crew: res?.crew || [] };
    } catch (err) {
        createLogger(logMode).warning("fetchCredits 获取作品失败", err);
        return { cast: [], crew: [] };
    }
}

// -----------------------------
// normalizeItem
function normalizeItem(item) {
    if (!item || typeof item !== "object") return { id:null,title:"未知",overview:"",posterPath:"",backdropPath:"",mediaType:"movie",releaseDate:"",popularity:0,rating:0,jobs:[],characters:[],genre_ids:[],_normalizedTitle:"",_genreTitleCache:{} };
    const title = item.title || item.name || "未知";
    const mediaType = item.media_type || (item.release_date ? "movie" : (item.first_air_date ? "tv" : "movie"));
    return {
        id: item.id || null,
        title,
        overview: item.overview || "",
        posterPath: item.poster_path || "",
        backdropPath: item.backdrop_path || "",
        mediaType,
        releaseDate: item.release_date || item.first_air_date || "",
        popularity: item.popularity || 0,
        rating: item.vote_average || 0,
        jobs: Array.isArray(item.jobs) ? item.jobs : (item.job ? [item.job] : []),
        characters: Array.isArray(item.characters) ? item.characters : (item.character ? [item.character] : []),
        genre_ids: Array.isArray(item.genre_ids) ? item.genre_ids : [],
        _normalizedTitle: title.toLowerCase(),
        _genreTitleCache: item._genreTitleCache || {}
    };
}

// -----------------------------
// formatOutput
function formatOutput(list) {
    const safeTime = s => { const t = Date.parse(s||""); return isNaN(t)?0:t; };
    return (Array.isArray(list)?list:[]).filter(Boolean)
        .sort((a,b)=>safeTime(b.releaseDate)-safeTime(a.releaseDate))
        .map(i=>{
            const mediaType = i.mediaType || "movie";
            const genreMap = tmdbGenresCache[mediaType] || {};
            return {
                id:i.id,
                type:"tmdb",
                title:i.title||"未知",
                description:i.overview||"",
                releaseDate:i.releaseDate||"",
                rating:i.rating||0,
                popularity:i.popularity||0,
                posterPath:i.posterPath||"",
                backdropPath:i.backdropPath||"",
                mediaType,
                jobs:i.jobs||[],
                characters:i.characters||[],
                genreTitle:Array.isArray(i.genre_ids)?i.genre_ids.map(id=>genreMap[id]||`未知类型(${id})`).join("•"):""
            };
        });
}

// -----------------------------
// AC 自动机 + 正则过滤器（不变）
const acCache = new Map();
const regexCache = new Map();
const filterUnitCache = new Map();
function normalizeTitleForMatch(s) { return s ? s.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().normalize('NFC').toLowerCase() : ""; }
class ACAutomaton {
    constructor() { this.root = { next: Object.create(null), fail: null, output: [] }; }
    insert(word) { let node = this.root; for (const ch of word) { if (!node.next[ch]) node.next[ch] = { next: Object.create(null), fail: null, output: [] }; node = node.next[ch]; } node.output.push(word); }
    build() { const q=[]; this.root.fail=this.root; for(const k of Object.keys(this.root.next)){const n=this.root.next[k]; n.fail=this.root; q.push(n);} while(q.length){const node=q.shift(); for(const ch of Object.keys(node.next)){const child=node.next[ch]; let f=node.fail; while(f!==this.root&&!f.next[ch])f=f.fail; child.fail=f.next[ch]||this.root; child.output=child.output.concat(child.fail.output); q.push(child);}} }
    match(text){const found=new Set(); if(!text) return found; let node=this.root; for(const ch of text){while(node!==this.root&&!node.next[ch]) node=node.fail; node=node.next[ch]||this.root; node.output.forEach(w=>found.add(w)); } return found; }
}
function isPlainText(term){ return !/[\*\?\^\$\.\+\|\(\)\[\]\{\}\\]/.test(term); }
function getRegex(term){ if(regexCache.has(term)) return regexCache.get(term); let re=null; try{re=new RegExp(term,'i');}catch(e){re=null;} regexCache.set(term,re); return re; }
function buildFilterUnit(filterStr){ if(!filterStr?.trim()) return null; if(filterUnitCache.has(filterStr)) return filterUnitCache.get(filterStr); const terms=filterStr.split(/\s*\|\|?\s*/).map(t=>t.trim()).filter(Boolean); const plainTerms=[],regexTerms=[]; for(const t of terms){isPlainText(t)?plainTerms.push(t):regexTerms.push(t);} let ac=null; if(plainTerms.length){const normalizedPlain=plainTerms.map(p=>p.normalize('NFC').toLowerCase()); const key=normalizedPlain.slice().sort().join("\u0001"); if(acCache.has(key)) ac=acCache.get(key); else{ac=new ACAutomaton(); normalizedPlain.forEach(p=>ac.insert(p)); ac.build(); acCache.set(key,ac);}} const unit={ac,regexTerms}; filterUnitCache.set(filterStr,unit); return unit;}
function filterByKeywords(list,filterStr,logMode="info"){if(!filterStr?.trim()||!Array.isArray(list)||!list.length)return list; const logger=createLogger(logMode); const unit=buildFilterUnit(filterStr); if(!unit)return list; const {ac,regexTerms}=unit; const filteredOut=[]; const filteredList=list.filter(item=>{try{if(!item._normalizedTitle)item._normalizedTitle=normalizeTitleForMatch(item.title||""); const title=item._normalizedTitle; let excluded=false; if(ac&&ac.match(title).size) excluded=true; if(!excluded){for(const r of regexTerms){const re=getRegex(r); if(re?.test(title)){excluded=true; break;}}} if(excluded&&logMode==="debug") filteredOut.push(item); return !excluded;}catch(err){return true;}}); if(logMode==="debug"&&filteredOut.length) logger.debug("过滤掉的作品:",filteredOut.map(i=>i.title)); return filteredList;}

// -----------------------------
// loadPersonWorks（使用 resolvePersonIdSafe）
async function loadPersonWorks(params) {
    const logger = createLogger(params.logMode);
    if (!params.personId) { logger.warning("没有输入人物ID"); return []; }

    await initTmdbGenres(params.language, params.logMode);
    logger.info("阶段[解析人物ID]开始...");
    const personId = await resolvePersonIdSafe(params.personId, params.language, params.logMode);
    if (!personId) return [];
    logger.info(`阶段[解析人物ID]完成: personId=${personId}`);

    if (personWorksCache.has(personId)) {
        logger.info("命中人物作品缓存");
        return await personWorksCache.get(personId);
    }

    logger.info("阶段[获取人物作品]开始...");
    const { cast, crew } = await fetchCredits(personId, params.language, params.logMode);
    const allWorks = [...cast.map(i => normalizeItem(i)), ...crew.map(i => normalizeItem(i))];

    const filteredWorks = filterByKeywords(allWorks, params.filter, params.logMode) || allWorks;
    personWorksCache.set(personId, Promise.resolve(filteredWorks));
    logger.info("阶段[获取人物作品]完成");

    return filteredWorks;
}

// -----------------------------
// 导出接口
async function getAllWorks(params) { return loadPersonWorks(params); }
async function getActorWorks(params) {
    const works = await loadPersonWorks(params);
    return works.filter(w => w.jobs.length === 0 || w.characters.length > 0);
}
async function getDirectorWorks(params) {
    const works = await loadPersonWorks(params);
    return works.filter(w => w.jobs.includes("Director"));
}
async function getOtherWorks(params) {
    const works = await loadPersonWorks(params);
    return works.filter(w => w.jobs.length > 0 && !w.jobs.includes("Director"));
}
