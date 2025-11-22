// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "tmdb.person.movie",
    title: "TMDB人物影视作品",
    version: "2.3.8",
    requiredVersion: "0.0.1",
    description: "获取 TMDB 人物作品数据",
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
            { title: "张艺谋", value: "607" },
            { title: "李安", value: "1614" },
            { title: "周星驰", value: "57607" },
            { title: "成龙", value: "18897" },
            { title: "吴京", value: "78871" },
            { title: "王家卫", value: "12453" },
            { title: "姜文", value: "77301" },
            { title: "贾樟柯", value: "24011" },
            { title: "陈凯歌", value: "20640" },
            { title: "徐峥", value: "118711" },
            { title: "宁浩", value: "17295" },
            { title: "黄渤", value: "128026" },
            { title: "葛优", value: "76913" },
            { title: "胡歌", value: "1106514" },
            { title: "张译", value: "146098" },
            { title: "沈腾", value: "1519026" },
            { title: "王宝强", value: "71051" },
            { title: "赵丽颖", value: "1260868" },
            { title: "孙俪", value: "52898" },
            { title: "张若昀", value: "1675905" },
            { title: "秦昊", value: "1016315" },
            { title: "易烊千玺", value: "2223265" },
            { title: "王倦", value: "2467977" },
            { title: "孔笙", value: "1494556" },
            { title: "张国立", value: "543178" },
            { title: "陈思诚", value: "1065761" },
            { title: "徐克", value: "26760" },
            { title: "林超贤", value: "81220" },
            { title: "郭帆", value: "1100748" },
            { title: "史蒂文·斯皮尔伯格", value: "488" },
            { title: "詹姆斯·卡梅隆", value: "2710" },
            { title: "克里斯托弗·诺兰", value: "525" },
            { title: "阿尔弗雷德·希区柯克", value: "2636" },
            { title: "斯坦利·库布里克", value: "240" },
            { title: "黑泽明", value: "5026" },
            { title: "莱昂纳多·迪卡普里奥", value: "6193" },
            { title: "阿米尔·汗", value: "52763" },
            { title: "宫崎骏", value: "608" },
            { title: "蒂姆·伯顿", value: "510" },
            { title: "杨紫琼", value: "1620" },
            { title: "凯特·布兰切特", value: "112" },
            { title: "丹尼尔·戴·刘易斯", value: "11856" },
            { title: "宋康昊", value: "20738" }
        ],
        value: " "
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
            { title: "默认（不过滤）", value: " " },
            { title: "关键词过滤", value: "A" },
            { title: "完全匹配 A", value: "^A$" },
            { title: "以 A 开头", value: "^A.*" },
            { title: "以 B 结尾", value: ".*B$" },
            { title: "包含 A 或 B", value: "A|B" },
            { title: "包含 A 和 B", value: "^(?=.*A)(?=.*B).*$" },
            { title: "不包含 A 但包含 B", value: "^(?:(?!A).)*B.*$" },
            { title: "以 A 开头，任意字符，B 结尾", value: "^A.*B$" }
        ],
        value: " "
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
            { title: "调试", value: "debug" }
        ],
        value: "info",
    }
];

WidgetMetadata.modules.forEach(m => m.params = JSON.parse(JSON.stringify(Params)));
// -----------------------------
// 全局缓存
// -----------------------------
const MAX_PERSON_CACHE=200, sharedPersonCache=new Map(), tmdbGenresCache={}, personIdCache=new Map();
const acCache=new Map(), regexCache=new Map(), filterUnitCache=new Map();

// -----------------------------
// 日志
// -----------------------------
const createLogger=m=>({debug:(...a)=>(m==="debug")&&console.log("[DEBUG]",...a),info:(...a)=>(["debug","info"].includes(m))&&console.log("[INFO]",...a),warning:(...a)=>(["debug","info"].includes(m))&&console.warn("[WARN]",...a),notify:(...a)=>(["debug","info"].includes(m))&&console.info("[NOTIFY]",...a)});

// -----------------------------
// TMDB类型
// -----------------------------
async function initTmdbGenres(lang="zh-CN", logMode="info"){const l=createLogger(logMode);if(tmdbGenresCache.movie&&tmdbGenresCache.tv)return;try{l.debug("初始化 TMDB 类型",lang);const[movie,tv]=await Promise.all([Widget.tmdb.get("genre/movie/list",{params:{language:lang}}),Widget.tmdb.get("genre/tv/list",{params:{language:lang}})]);tmdbGenresCache={movie:movie.genres?.reduce((a,g)=>{a[g.id]=g.name;return a},{})||{},tv:tv.genres?.reduce((a,g)=>{a[g.id]=g.name;return a},{})||{}};logMode==="debug"&&l.debug("TMDB 类型缓存完成",JSON.stringify(tmdbGenresCache,null,2))}catch(e){l.warning("TMDB 类型初始化失败",e);tmdbGenresCache={movie:{},tv:{}}}}

// -----------------------------
// 人物ID
// -----------------------------
async function getCachedPersonId(input,lang="zh-CN",logMode="info"){if(!input)return null;if(!isNaN(input))return input;const key=`${input}_${lang}`;if(personIdCache.has(key))return personIdCache.get(key);const l=createLogger(logMode);try{l.debug("搜索人物",input,lang);const res=await Widget.tmdb.get("search/person",{params:{query:input,language:lang}});const id=res?.results?.[0]?.id||null;if(id)personIdCache.set(key,id);l.debug("获取人物ID",id);return id}catch(e){l.warning("获取人物ID失败",e);return null}}

// -----------------------------
// 获取作品
// -----------------------------
async function fetchCredits(id,lang="zh-CN",logMode="info"){const l=createLogger(logMode);try{l.debug("获取人物作品",id,lang);const r=await Widget.tmdb.get(`person/${id}/combined_credits`,{params:{language:lang}});return{cast:Array.isArray(r.cast)?r.cast:[],crew:Array.isArray(r.crew)?r.crew:[]}}catch(e){l.warning("获取作品失败",e);return{cast:[],crew:[]}}}

// -----------------------------
// 标准化
// -----------------------------
const normalizeItem=i=>{const t=i.title||i.name||"未知";return{id:i.id,title:t,overview:i.overview||"",posterPath:i.poster_path||"",backdropPath:i.backdrop_path||"",mediaType:i.media_type||(i.release_date?"movie":"tv"),releaseDate:i.release_date||i.first_air_date||"",popularity:i.popularity||0,rating:i.vote_average||0,jobs:i.job?[i.job]:[],characters:i.character?[i.character]:[],genre_ids:i.genre_ids||[],_normalizedTitle:t.toLowerCase(),_genreTitleCache:{}}};
const getTmdbGenreTitles=i=>{const g=tmdbGenresCache[i.mediaType]||{};const k=i.genre_ids.join(",");if(i._genreTitleCache[k])return i._genreTitleCache[k];const t=i.genre_ids.map(id=>g[id]?.trim()||`未知类型(${id})`).filter(Boolean).join("•");i._genreTitleCache[k]=t;return t};

// -----------------------------
// 格式化输出
// -----------------------------
const formatOutput=(list,logMode="info")=>{const l=createLogger(logMode),s=[...list].sort((a,b)=>new Date(b.releaseDate||0)-new Date(a.releaseDate||0));const f=s.map(i=>({id:i.id,type:"tmdb",title:i.title,description:i.overview,releaseDate:i.releaseDate,rating:i.rating,popularity:i.popularity,posterPath:i.posterPath,backdropPath:i.backdropPath,mediaType:i.mediaType,jobs:i.jobs,characters:i.characters,genreTitle:i.genre_ids.length?(()=>{const full=getTmdbGenreTitles(i);const m=full.match(/•(.+)$/);return m?m[1]:full})():""}));logMode==="debug"&&l.debug("格式化输出完成",f.length);return f};

// -----------------------------
// AC + 正则过滤
// -----------------------------
function normalizeTitleForMatch(s){return s?s.replace(/[\u200B-\u200D\uFEFF]/g,"").trim().normalize('NFC').toLowerCase():""}
class ACAutomaton{constructor(){this.root={next:Object.create(null),fail:null,output:[]}}insert(w){let n=this.root;for(const c of w){if(!n.next[c])n.next[c]={next:Object.create(null),fail:null,output:[]};n=n.next[c]}n.output.push(w)}build(){const q=[];this.root.fail=this.root;for(const k of Object.keys(this.root.next)){const n=this.root.next[k];n.fail=this.root;q.push(n)}while(q.length){const node=q.shift();for(const ch of Object.keys(node.next)){const child=node.next[ch];let f=node.fail;while(f!==this.root&&!f.next[ch])f=f.fail;child.fail=f.next[ch]||this.root;child.output=child.output.concat(child.fail.output);q.push(child)}}}match(text){const found=new Set();if(!text)return found;let n=this.root;for(const ch of text){while(n!==this.root&&!n.next[ch])n=n.fail;n=n.next[ch]||this.root;n.output.forEach(w=>found.add(w))}return found}}
const isPlainText=t=>!/[\*\?\^\$\.\+\|\(\)\[\]\{\}\\]/.test(t);
const getRegex=t=>regexCache.has(t)?regexCache.get(t):(regexCache.set(t,new RegExp(t,"i")),regexCache.get(t));
const buildFilterUnit=s=>{if(!s||!s.trim())return null;if(filterUnitCache.has(s))return filterUnitCache.get(s);const terms=s.split(/\s*\|\|\s*/).map(t=>t.trim()).filter(Boolean),plain=[],regex=[];for(const t of terms)(isPlainText(t)?plain:regex).push(t);let ac=null;if(plain.length){const key=plain.slice().sort().join("\u0001");if(acCache.has(key))ac=acCache.get(key);else{ac=new ACAutomaton();plain.forEach(p=>ac.insert(p.toLowerCase()));ac.build();acCache.set(key,ac)}}const unit={ac,regexTerms:regex};filterUnitCache.set(s,unit);return unit}
const filterByKeywords=(list,s,logMode="info")=>{if(!s||!s.trim()||!Array.isArray(list)||!list.length)return list;const l=createLogger(logMode),unit=buildFilterUnit(s);if(!unit)return list;const {ac,regexTerms}=unit,filteredOut=[];const r=list.filter(i=>{if(!i._normalizedTitle)i._normalizedTitle=normalizeTitleForMatch(i.title||"");const t=i._normalizedTitle;let ex=false;if(ac&&ac.match(t).size)ex=true;if(!ex)for(const r of regexTerms){const re=getRegex(r);if(re&&re.test(t)){ex=true;break}};ex&&logMode==="debug"&&filteredOut.push(i);return!ex});logMode==="debug"&&filteredOut.length&&l.debug("过滤掉的作品",filteredOut.map(i=>i.title));return r};

// -----------------------------
// 加载作品（并发ID和类型）
async function loadSharedWorks(p={}){const l=createLogger(p.logMode||"info"),personKey=`${p.personId}_${p.language}`;const [id]=await Promise.all([getCachedPersonId(p.personId,p.language,p.logMode),initTmdbGenres(p.language,p.logMode)]);if(!id){l.warning("未获取到人物ID");sharedPersonCache.set(personKey,[]);return[]}if(!sharedPersonCache.has(personKey)){const c=await fetchCredits(id,p.language,p.logMode);const arr=[...c.cast,...c.crew].map(normalizeItem);sharedPersonCache.set(personKey,arr);if(sharedPersonCache.size>MAX_PERSON_CACHE){sharedPersonCache.delete(sharedPersonCache.keys().next().value)}p.logMode==="debug"&&l.debug("共享缓存加载完成",arr.length)}else{p.logMode==="debug"&&l.debug("使用共享缓存",sharedPersonCache.get(personKey).length)}let works=[...sharedPersonCache.get(personKey)];if(p.type&&p.type!=="all"){const now=new Date();works=works.filter(i=>i.releaseDate&&((p.type==="released")?new Date(i.releaseDate)<=now:new Date(i.releaseDate)>now));p.logMode==="debug"&&l.debug("按上映状态过滤后作品数量",works.length)}if(p.filter?.trim())works=filterByKeywords(works,p.filter,p.logMode);return formatOutput(works,p.logMode)}

// -----------------------------
// 模块函数
// -----------------------------
const getAllWorks=loadSharedWorks;
const getActorWorks=async p=>{const a=await loadSharedWorks(p);return a.filter(i=>i.characters.length)};
const getDirectorWorks=async p=>{const a=await loadSharedWorks(p);return a.filter(i=>i.jobs.some(j=>/director/i.test(j)))};
const getOtherWorks=async p=>{const a=await loadSharedWorks(p);return a.filter(i=>!i.characters.length&&!i.jobs.some(j=>/director/i.test(j)))};