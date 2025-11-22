// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "tmdb.person.movie",
    title: "TMDB人物影视作品",
    version: "2.3.8",
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
            { title: "张艺谋", value: "607" }, { title: "李安", value: "1614" }, { title: "周星驰", value: "57607" }, { title: "成龙", value: "18897" }, { title: "吴京", value: "78871" }, { title: "王家卫", value: "12453" }, { title: "姜文", value: "77301" }, { title: "贾樟柯", value: "24011" }, { title: "陈凯歌", value: "20640" }, { title: "徐峥", value: "118711" },
            { title: "宁浩", value: "17295" }, { title: "黄渤", value: "128026" }, { title: "葛优", value: "76913" }, { title: "胡歌", value: "1106514" }, { title: "张译", value: "146098" }, { title: "沈腾", value: "1519026" }, { title: "王宝强", value: "71051" }, { title: "赵丽颖", value: "1260868" }, { title: "孙俪", value: "52898" }, { title: "张若昀", value: "1675905" },
            { title: "秦昊", value: "1016315" }, { title: "易烊千玺", value: "2223265" }, { title: "王倦", value: "2467977" }, { title: "孔笙", value: "1494556" }, { title: "张国立", value: "543178" }, { title: "陈思诚", value: "1065761" }, { title: "徐克", value: "26760" }, { title: "林超贤", value: "81220" }, { title: "郭帆", value: "1100748" }, { title: "史蒂文·斯皮尔伯格", value: "488" },
            { title: "詹姆斯·卡梅隆", value: "2710" }, { title: "克里斯托弗·诺兰", value: "525" }, { title: "阿尔弗雷德·希区柯克", value: "2636" }, { title: "斯坦利·库布里克", value: "240" }, { title: "黑泽明", value: "5026" }, { title: "莱昂纳多·迪卡普里奥", value: "6193" }, { title: "阿米尔·汗", value: "52763" }, { title: "宫崎骏", value: "608" }, { title: "蒂姆·伯顿", value: "510" }, { title: "杨紫琼", value: "1620" },
            { title: "凯特·布兰切特", value: "112" }, { title: "丹尼尔·戴·刘易斯", value: "11856" }, { title: "宋康昊", value: "20738" }
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
            { title: "调试", value: "debug" }
        ],
        value: "info",
    }
]

WidgetMetadata.modules.forEach(m => m.params = JSON.parse(JSON.stringify(Params)));

// -----------------------------
// 全局共享缓存
// -----------------------------
const MAX_PERSON_CACHE = 200;
let sharedPersonCache = new Map();
let tmdbGenresCache = {};
const personIdCache = new Map();

// -----------------------------
// 日志函数
// -----------------------------
function createLogger(mode) {
    const m = mode || "info";
    return {
        debug: (...args) => (m === "debug") && console.log("[DEBUG]", ...args),
        info: (...args) => (["debug","info"].includes(m)) && console.log("[INFO]", ...args),
        warning: (...args) => (["debug","info"].includes(m)) && console.warn("[WARN]", ...args),
        notify: (...args) => (["debug","info"].includes(m)) && console.info("[NOTIFY]", ...args)
    };
}

// -----------------------------
// TMDB 类型缓存
// -----------------------------
async function initTmdbGenres(language = "zh-CN", logMode = "info") {
    const logger = createLogger(logMode);
    if (tmdbGenresCache.movie && tmdbGenresCache.tv) return;

    try {
        logger.debug("初始化 TMDB 类型，语言:", language);
        const [movieGenres, tvGenres] = await Promise.all([
            Widget.tmdb.get("genre/movie/list", { params: { language } }),
            Widget.tmdb.get("genre/tv/list", { params: { language } })
        ]);

        tmdbGenresCache = {
            movie: (movieGenres?.genres || []).reduce((acc, g) => { acc[g.id] = g.name; return acc; }, {}),
            tv: (tvGenres?.genres || []).reduce((acc, g) => { acc[g.id] = g.name; return acc; }, {})
        };

        if (logMode === "debug") logger.debug("TMDB 类型缓存完成:", tmdbGenresCache);
    } catch (err) {
        logger.warning("初始化 TMDB 类型失败", err);
        tmdbGenresCache = { movie: {}, tv: {} };
    }
}

// -----------------------------
// resolvePersonId
// -----------------------------
async function resolvePersonId(personInput, language = "zh-CN", logMode = "info") {
    const logger = createLogger(logMode);
    if (!personInput || !personInput.toString().trim()) return null;
    if (!isNaN(personInput)) return Number(personInput);

    const cacheKey = `${personInput}_${language}`;
    if (personIdCache.has(cacheKey)) return personIdCache.get(cacheKey);

    try {
        logger.debug("搜索人物:", personInput);
        const res = await Widget.tmdb.get("search/person", { params: { query: personInput, language } });
        const id = res?.results?.[0]?.id || null;
        if (id) personIdCache.set(cacheKey, id);
        return id;
    } catch (err) {
        logger.warning("resolvePersonId 获取人物ID失败", err);
        return null;
    }
}

async function getCachedPersonId(personInput, language = "zh-CN", logMode = "info") {
    return await resolvePersonId(personInput, language, logMode);
}

// -----------------------------
// 获取作品
// -----------------------------
async function fetchCredits(personId, language = "zh-CN", logMode = "info") {
    const logger = createLogger(logMode);
    try {
        logger.debug("获取人物作品 personId:", personId);
        const response = await Widget.tmdb.get(`person/${personId}/combined_credits`, { params: { language } });
        const safe = v => Array.isArray(v) ? v : [];
        return { cast: safe(response?.cast), crew: safe(response?.crew) };
    } catch (err) {
        logger.warning("TMDB 获取作品失败", err);
        return { cast: [], crew: [] };
    }
}

// -----------------------------
// 数据标准化
// -----------------------------
function normalizeItem(item) {
    if (!item || typeof item !== "object") item = {};
    const title = item.title || item.name || "未知";
    return {
        id: item.id || null,
        title,
        overview: item.overview || "",
        posterPath: item.poster_path || "",
        backdropPath: item.backdrop_path || "",
        mediaType: item.media_type || (item.release_date ? "movie" : (item.first_air_date ? "tv" : "")),
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
// 获取类型名称
// -----------------------------
function getTmdbGenreTitles(item) {
    if (!item || !Array.isArray(item.genre_ids) || !item.mediaType) return "";
    const genres = tmdbGenresCache[item.mediaType] || {};
    const key = item.genre_ids.join(",");
    if (item._genreTitleCache && item._genreTitleCache[key]) return item._genreTitleCache[key];

    const title = item.genre_ids.map(id => genres[id] || `未知类型(${id})`).join('•');
    item._genreTitleCache[key] = title;
    return title;
}

// -----------------------------
// 格式化输出
// -----------------------------
function formatOutput(list, logMode="info") {
    const logger = createLogger(logMode);
    const sortedList = [...(Array.isArray(list) ? list : [])].sort((a, b) => {
        const ta = isNaN(new Date(a?.releaseDate)) ? 0 : new Date(a.releaseDate).getTime();
        const tb = isNaN(new Date(b?.releaseDate)) ? 0 : new Date(b.releaseDate).getTime();
        return tb - ta;
    });

    return sortedList.map(i => ({
        id: i.id,
        type: "tmdb",
        title: i.title || "未知",
        description: i.overview || "",
        releaseDate: i.releaseDate || "",
        rating: i.rating || 0,
        popularity: i.popularity || 0,
        posterPath: i.posterPath || "",
        backdropPath: i.backdropPath || "",
        mediaType: i.mediaType || "",
        jobs: Array.isArray(i.jobs) ? i.jobs : [],
        characters: Array.isArray(i.characters) ? i.characters : [],
        genreTitle: Array.isArray(i.genre_ids) && i.genre_ids.length ? getTmdbGenreTitles(i) : ""
    }));
}

// -----------------------------
// AC + 正则过滤器
// -----------------------------
const acCache = new Map();
const regexCache = new Map();
const filterUnitCache = new Map();

function normalizeTitleForMatch(s) { return s ? s.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().normalize('NFC').toLowerCase() : ""; }

class ACAutomaton {
    constructor() { this.root = { next: Object.create(null), fail: null, output: [] }; }
    insert(word) {
        let node = this.root;
        for (const ch of word) {
            if (!node.next[ch]) node.next[ch] = { next: Object.create(null), fail: null, output: [] };
            node = node.next[ch];
        }
        node.output.push(word);
    }
    build() {
        const q = [];
        this.root.fail = this.root;
        for (const k of Object.keys(this.root.next)) { const n = this.root.next[k]; n.fail = this.root; q.push(n); }
        while (q.length) {
            const node = q.shift();
            for (const ch of Object.keys(node.next)) {
                const child = node.next[ch];
                let f = node.fail;
                while (f !== this.root && !f.next[ch]) f = f.fail;
                child.fail = f.next[ch] || this.root;
                child.output = child.output.concat(child.fail.output);
                q.push(child);
            }
        }
    }
    match(text) {
        const found = new Set();
        if (!text) return found;
        let node = this.root;
        for (const ch of text) {
            while (node !== this.root && !node.next[ch]) node = node.fail;
            node = node.next[ch] || this.root;
            node.output.forEach(w => found.add(w));
        }
        return found;
    }
}

function isPlainText(term) { return !/[\*\?\^\$\.\+\|\(\)\[\]\{\}\\]/.test(term); }
function getRegex(term) { if (regexCache.has(term)) return regexCache.get(term); let re = null; try { re = new RegExp(term, 'i'); } catch(e) { re = null; } regexCache.set(term, re); return re; }
function buildFilterUnit(filterStr) {
    if (!filterStr || !filterStr.trim()) return null;
    if (filterUnitCache.has(filterStr)) return filterUnitCache.get(filterStr);

    const terms = filterStr.split(/\s*\|\|\s*/).map(t => t.trim()).filter(Boolean);
    const plainTerms = [], regexTerms = [];
    for (const t of terms) (isPlainText(t) ? plainTerms : regexTerms).push(t);

    let ac = null;
    if (plainTerms.length) {
        const key = plainTerms.slice().sort().join("\u0001");
        if (acCache.has(key)) ac = acCache.get(key);
        else {
            ac = new ACAutomaton();
            plainTerms.forEach(p => ac.insert(p.toLowerCase()));
            ac.build();
            acCache.set(key, ac);
        }
    }
    const unit = { ac, regexTerms };
    filterUnitCache.set(filterStr, unit);
    return unit;
}

function filterByKeywords(list, filterStr, logMode="info") {
    if (!filterStr || !filterStr.trim() || !Array.isArray(list) || !list.length) return list;
    const logger = createLogger(logMode);
    const unit = buildFilterUnit(filterStr); if (!unit) return list;
    const { ac, regexTerms } = unit;
    const filteredOut = [];

    const filteredList = list.filter(item => {
        if (!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title || "");
        const title = item._normalizedTitle || "";

        let excluded = ac && ac.match(title).size ? true : false;
        if (!excluded) for (const r of regexTerms) { const re = getRegex(r); if (re && re.test(title)) { excluded = true; break; } }
        if (excluded && logMode === "debug") filteredOut.push(item);
        return !excluded;
    });

    if (logMode === "debug" && filteredOut.length) logger.debug("过滤掉的作品:", filteredOut.map(i => i.title));
    return filteredList;
}

// -----------------------------
// 获取人物作品
// -----------------------------
async function loadSharedWorks(params) {
    const p = params || {};
    const logger = createLogger(p.logMode || "info");
    const personKey = `${p.personId}_${p.language}`;

    const [personId] = await Promise.all([
        getCachedPersonId(p.personId, p.language, p.logMode),
        initTmdbGenres(p.language || "zh-CN", p.logMode)
    ]);

    if (!personId) {
        logger.warning("未获取到人物ID");
        sharedPersonCache.set(personKey, []);
        return formatOutput([], p.logMode);
    }

    if (!sharedPersonCache.has(personKey)) {
        const credits = await fetchCredits(personId, p.language, p.logMode);
        const worksArray = [...credits.cast, ...credits.crew].map(normalizeItem);
        sharedPersonCache.set(personKey, worksArray);

        // 删除最旧缓存
        if (sharedPersonCache.size > MAX_PERSON_CACHE) {
            const oldestKey = sharedPersonCache.keys().next().value;
            sharedPersonCache.delete(oldestKey);
        }

        if (p.logMode === "debug") logger.debug("共享缓存加载完成，作品数量:", worksArray.length);
    } else if (p.logMode === "debug") logger.debug("使用共享缓存，作品数量:", sharedPersonCache.get(personKey).length);

    let works = [...(sharedPersonCache.get(personKey) || [])];

    if (p.type && p.type !== "all") {
        const now = new Date();
        works = works.filter(i => i.releaseDate ? (p.type === "released" ? new Date(i.releaseDate) <= now : new Date(i.releaseDate) > now) : false);
        if (p.logMode === "debug") logger.debug("按上映状态过滤后作品数量:", works.length);
    }

    if (p.filter?.trim()) works = filterByKeywords(works, p.filter, p.logMode);
    return formatOutput(works, p.logMode);
}

async function loadSharedWorksSafe(params) {
    try { return await loadSharedWorks(params); }
    catch (err) { const logger = createLogger(params?.logMode || "info"); logger.warning("loadSharedWorksSafe 捕获异常:", err); return formatOutput([], params?.logMode || "info"); }
}

// -----------------------------
// 模块函数
// -----------------------------
async function getAllWorks(params) { return await loadSharedWorksSafe(params); }
async function getActorWorks(params) { return (await loadSharedWorksSafe(params)).filter(i => Array.isArray(i.characters) && i.characters.length); }
async function getDirectorWorks(params) { return (await loadSharedWorksSafe(params)).filter(i => Array.isArray(i.jobs) && i.jobs.some(j => /director/i.test(j))); }
async function getOtherWorks(params) { return (await loadSharedWorksSafe(params)).filter(i => !(Array.isArray(i.characters) && i.characters.length) && !(Array.isArray(i.jobs) && i.jobs.some(j => /director/i.test(j)))); }