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
// LRU 异步缓存（修复 Promise 缓存问题）
class LRUCache{
    constructor(maxSize=200){ this.maxSize=maxSize; this.cache=new Map(); this.head=null; this.tail=null; }
    _removeNode(node){ if(!node) return; if(node.prev) node.prev.next=node.next; else this.head=node.next; if(node.next) node.next.prev=node.prev; else this.tail=node.prev; }
    _addNodeToHead(node){ node.next=this.head; node.prev=null; if(this.head) this.head.prev=node; this.head=node; if(!this.tail) this.tail=node; }
    async get(key){ const node=this.cache.get(key); if(!node) return null; this._removeNode(node); this._addNodeToHead(node); return node.value; }
    set(key,value){ let node=this.cache.get(key); if(node){ node.value=value; this._removeNode(node); this._addNodeToHead(node); } else{ node={key,value,prev:null,next:null}; this.cache.set(key,node); this._addNodeToHead(node); if(this.cache.size>this.maxSize){ this.cache.delete(this.tail.key); this._removeNode(this.tail); } } }
    has(key){ return this.cache.has(key); }
    delete(key){ const node=this.cache.get(key); if(node){ this._removeNode(node); this.cache.delete(key); } }
    async getOrSet(key,fetcher){
        if(this.has(key)) return await this.get(key);
        try{
            const result = await fetcher();
            this.set(key,result); // 只缓存最终结果
            return result;
        } catch(e){
            this.delete(key);
            throw e;
        }
    }
}

// -----------------------------
// Logger
const loggersCache = new Map();
function createLogger(mode="info"){
    if(loggersCache.has(mode)) return loggersCache.get(mode);
    const logger={
        debug:(...args)=>mode==="debug" && console.log("[DEBUG]",...args),
        info:(...args)=>["debug","info"].includes(mode) && console.log("[INFO]",...args),
        warning:(...args)=>["debug","info","warning"].includes(mode) && console.warn("[WARN]",...args),
        notify:(...args)=>["debug","info","warning"].includes(mode) && console.info("[NOTIFY]",...args)
    };
    loggersCache.set(mode,logger);
    return logger;
}

// -----------------------------
// 缓存实例
const personIdCache = new LRUCache(200);
const personWorksCache = new LRUCache(200);
const tmdbGenresCache = { movie:{}, tv:{} };

// -----------------------------
// 安全获取人物ID
async function resolvePersonIdSafe(personInput, language="zh-CN", logMode="debug"){
    const logger = createLogger(logMode);
    const s = personInput?.toString().trim();
    if(!s){ logger.warning("输入为空"); return null; }
    if(/^\d+$/.test(s)) return Number(s);
    const cacheKey = `${s}_${language}`;
    return await personIdCache.getOrSet(cacheKey, async()=>{
        logger.info(`搜索人物ID: "${s}"`);
        try{
            const res = await Widget.tmdb.get("search/person",{params:{query:s,language}});
            return res?.results?.[0]?.id || null;
        } catch(e){
            logger.warning("resolvePersonId失败", e);
            return null;
        }
    });
}

// -----------------------------
// 初始化 TMDB 类型
async function initTmdbGenres(language="zh-CN", logMode="debug"){
    const logger = createLogger(logMode);
    if(Object.keys(tmdbGenresCache.movie).length && Object.keys(tmdbGenresCache.tv).length) return;
    try{
        const [movieGenres, tvGenres] = await Promise.all([
            Widget.tmdb.get("genre/movie/list",{params:{language}}),
            Widget.tmdb.get("genre/tv/list",{params:{language}})
        ]);
        tmdbGenresCache.movie = Object.fromEntries((movieGenres?.genres||[]).map(g=>[g.id,g.name]));
        tmdbGenresCache.tv = Object.fromEntries((tvGenres?.genres||[]).map(g=>[g.id,g.name]));
    } catch(e){
        logger.warning("初始化TMDB类型失败", e);
        tmdbGenresCache.movie={}; tmdbGenresCache.tv={};
    }
}

// -----------------------------
// 获取人物作品（缓存 + 内部规范化）
async function fetchCreditsCached(personId, language="zh-CN", logMode="debug"){
    const cacheKey = `credits_${personId}_${language}`;
    return await personWorksCache.getOrSet(cacheKey, async()=>{
        const logger = createLogger(logMode);
        try{
            const res = await Widget.tmdb.get(`person/${personId}/combined_credits`,{params:{language}});
            const cast = (res?.cast||[]).map(normalizeItem);
            const crew = (res?.crew||[]).map(normalizeItem);
            return [...cast,...crew];
        } catch(e){
            logger.warning("fetchCredits 获取作品失败", e);
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

// -----------------------------
// 最终输出格式化
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
// AC 自动机 + 正则过滤
const acCache=new Map(),regexCache=new Map(),filterUnitCache=new Map();
class ACAutomaton{constructor(){this.root={next:Object.create(null),fail:null,output:[]}};insert(w){let n=this.root;for(const c of w){if(!n.next[c])n.next[c]={next:Object.create(null),fail:null,output:[]};n=n.next[c]}n.output.push(w)};build(){const q=[];this.root.fail=this.root;for(const k of Object.keys(this.root.next)){const n=this.root.next[k];n.fail=this.root;q.push(n)}while(q.length){const node=q.shift();for(const c of Object.keys(node.next)){const ch=node.next[c];let f=node.fail;while(f!==this.root&&!f.next[c])f=f.fail;ch.fail=f.next[c]||this.root;ch.output=ch.output.concat(ch.fail.output);q.push(ch)}}};matchAny(text){if(!text)return false;let n=this.root;for(const c of text){while(n!==this.root&&!n.next[c])n=n.fail;n=n.next[c]||this.root;if(n.output.length)return true}return false}}
function isPlainText(t){return !/[\*\?\^\$\.\+\|\(\)\[\]\{\}\\]/.test(t)}
function getRegex(t){if(regexCache.has(t))return regexCache.get(t);let r=null;try{r=new RegExp(t,'i')}catch(e){r=null}regexCache.set(t,r);return r}
function buildFilterUnit(s){if(!s?.trim())return null;if(filterUnitCache.has(s))return filterUnitCache.get(s);const terms=s.split(/\s*\|\|?\s*/).map(t=>t.trim()).filter(Boolean),plain=[],regex=[];for(const t of terms)isPlainText(t)?plain.push(t):regex.push(t);let ac=null;if(plain.length){const np=plain.map(p=>p.toLowerCase()),key=np.slice().sort().join("\u0001");ac=acCache.get(key)||new ACAutomaton();if(!acCache.has(key)){np.forEach(p=>ac.insert(p));ac.build();acCache.set(key,ac)}};let bigRegex=null;if(regex.length){const valid=[];for(const r of regex){const re=getRegex(r);if(re)valid.push(r)}if(valid.length){try{bigRegex=new RegExp(valid.join("|"),"i")}catch(e){bigRegex=null}}};const unit={ac,regexTerms:regex,bigRegex};filterUnitCache.set(s,unit);return unit}
function normalizeTitleForMatch(s){return s?s.replace(/[\u200B-\u200D\uFEFF]/g,"").trim().toLowerCase():""}
function filterByKeywords(list,s,logMode="info"){if(!s?.trim()||!Array.isArray(list)||!list.length)return list;const logger=createLogger(logMode),unit=buildFilterUnit(s);if(!unit)return list;const {ac,bigRegex}=unit,filteredOut=[];const res=list.filter(item=>{try{if(!item._normalizedTitle)item._normalizedTitle=normalizeTitleForMatch(item.title||"");const t=item._normalizedTitle;let e=false;if(ac&&ac.matchAny(t))e=true;if(!e&&bigRegex&&bigRegex.test(t))e=true;if(e&&logMode==="debug")filteredOut.push(item.title||"(no title)");return !e}catch(err){return true}});if(logMode==="debug"&&filteredOut.length)logger.debug("过滤掉的作品:",filteredOut);return res}
// -----------------------------
// 核心加载流程（修复缓存 Promise 问题）
async function loadPersonWorks(params){
    const logger = createLogger(params?.logMode || "info");
    const personKey = `${params.personId}_${params.language || "zh-CN"}`;

    if(personWorksCache.has(personKey)){
        const cached = await personWorksCache.get(personKey);
        logger.info(`作品缓存命中: ${personKey}`);
        return cached;
    }

    let finalList = [];
    try{
        const personId = await resolvePersonIdSafe(params.personId, params.language, params.logMode);
        if(!personId) return [];

        await initTmdbGenres(params.language || "zh-CN", params.logMode);
        let works = await fetchCreditsCached(personId, params.language, params.logMode);

        // 上映状态过滤
        if(params.type && params.type !== "all"){
            const nowDate = new Date();
            works = works.filter(i => i.releaseDate ? 
                (params.type==="released"? new Date(i.releaseDate)<=nowDate : new Date(i.releaseDate)>nowDate) 
                : false);
        }

        // 关键词过滤
        if(params.filter?.trim()) works = filterByKeywords(works, params.filter, params.logMode);

        // 排序
        if(params.sort_by){
            const [field, order] = params.sort_by.split('.');
            works.sort((a,b)=>{
                const valA = a[field] ?? 0;
                const valB = b[field] ?? 0;
                return order==='desc'? valB-valA : valA-valB;
            });
        }

        finalList = formatOutput(works);

        // 缓存最终结果
        await personWorksCache.set(personKey, finalList);

    } catch(err){
        logger.warning("loadPersonWorks 捕获异常:", err);
    }

    return finalList;
}

// -----------------------------
// 安全包装
async function loadSharedWorksSafe(params){
    try{
        return await loadPersonWorks(params);
    }catch(err){
        const logger = createLogger(params?.logMode || "info");
        logger.warning("loadSharedWorksSafe 捕获异常:", err);
        return formatOutput([]);
    }
}

// -----------------------------
// 模块接口
async function getAllWorks(params){ return await loadSharedWorksSafe(params); }
async function getActorWorks(params){ return (await loadSharedWorksSafe(params)).filter(i=>i.characters.length); }
async function getDirectorWorks(params){ return (await loadSharedWorksSafe(params)).filter(i=>i.jobs.some(j=>/director/i.test(j))); }
async function getOtherWorks(params){ return (await loadSharedWorksSafe(params)).filter(i=>!(i.characters.length) && !(i.jobs.some(j=>/director/i.test(j)))); }
