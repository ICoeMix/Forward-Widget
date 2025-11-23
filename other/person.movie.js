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
// 全局缓存
const MAX_CACHE = 200;
const personWorksCache = new Map();
const personIdCache = new Map();
const tmdbGenresCache = { movie: {}, tv: {} };

// -----------------------------
// 日志函数（修正了不同等级的输出控制）
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
// 防抖函数（修复：支持多个并发调用的 Promise 都能被 resolve）
function debounce(fn, wait = 400) {
    let timer = null;
    let resolvers = []; // 存储多个待 resolve 的回调
    return function(...args) {
        return new Promise((resolve, reject) => {
            resolvers.push({ resolve, reject });
            if (timer) clearTimeout(timer);
            timer = setTimeout(async () => {
                timer = null;
                const currentResolvers = resolvers.slice();
                resolvers = [];
                try {
                    const result = await fn.apply(this, args);
                    currentResolvers.forEach(r => r.resolve(result));
                } catch (e) {
                    currentResolvers.forEach(r => r.reject(e));
                }
            }, wait);
        });
    };
}

// -----------------------------
// resolvePersonId（动态监控）
async function resolvePersonId(personInput, language = "zh-CN", logMode = "info") {
    const logger = createLogger(logMode);
    if (personInput === undefined || personInput === null) return null;
    const s = personInput.toString().trim();
    if (!s) return null;
    // 数字字符串直接返回数字 id
    if (!isNaN(s)) return Number(s);

    const cacheKey = `${s}_${language}`;
    if (personIdCache.has(cacheKey)) {
        logger.info(`人物ID缓存命中: ${s}`);
        return await personIdCache.get(cacheKey);
    }

    logger.info(`开始搜索人物ID: ${s}`);
    const promise = (async () => {
        try {
            const res = await Widget.tmdb.get("search/person", { params: { query: s, language } });
            // 更安全地取第一个结果的 id
            const id = (Array.isArray(res?.results) && res.results.length) ? res.results[0].id : null;
            logger.info(`搜索人物ID完成: ${s} -> ${id}`);
            return id;
        } catch (err) {
            logger.warning("resolvePersonId 获取人物ID失败", err);
            return null;
        }
    })();
    personIdCache.set(cacheKey, promise);
    return await promise;
}

// -----------------------------
// initTmdbGenres（动态监控）
async function initTmdbGenres(language = "zh-CN", logMode = "info") {
    const logger = createLogger(logMode);
    if (tmdbGenresCache.movie && tmdbGenresCache.tv &&
        Object.keys(tmdbGenresCache.movie).length && Object.keys(tmdbGenresCache.tv).length) {
        logger.info("TMDB类型缓存已存在，跳过初始化");
        return;
    }

    logger.info("初始化TMDB类型缓存...");
    try {
        const [movieGenres, tvGenres] = await Promise.all([
            Widget.tmdb.get("genre/movie/list", { params: { language } }),
            Widget.tmdb.get("genre/tv/list", { params: { language } })
        ]);
        tmdbGenresCache.movie = (movieGenres?.genres || []).reduce((acc, g) => { acc[g.id] = g.name; return acc; }, {});
        tmdbGenresCache.tv = (tvGenres?.genres || []).reduce((acc, g) => { acc[g.id] = g.name; return acc; }, {});
        logger.info(`TMDB类型缓存完成: movie(${Object.keys(tmdbGenresCache.movie).length}), tv(${Object.keys(tmdbGenresCache.tv).length})`);
    } catch (err) {
        logger.warning("初始化TMDB类型失败", err);
        tmdbGenresCache.movie = {};
        tmdbGenresCache.tv = {};
    }
}

// -----------------------------
// fetchCredits（动态监控）
async function fetchCredits(personId, language = "zh-CN", logMode = "info") {
    const logger = createLogger(logMode);
    logger.info(`开始抓取人物作品 personId=${personId}`);

    try {
        const res = await Widget.tmdb.get(`person/${personId}/combined_credits`, {
            params: { language }
        });

        const cast = Array.isArray(res?.cast) ? res.cast : [];
        const crew = Array.isArray(res?.crew) ? res.crew : [];

        const allTitles = [...cast, ...crew].map(i => i?.title || i?.name || "未知");
        logger.info(`抓取作品完成 personId=${personId}，共抓取 ${allTitles.length} 部作品:`, allTitles);

        return { cast, crew };

    } catch (err) {
        logger.warning("fetchCredits 获取作品失败", err);
        return { cast: [], crew: [] };   // ⚠始终返回对象，避免 undefined
    }
}

// -----------------------------
// 数据标准化
function normalizeItem(item) {
    if (!item || typeof item !== "object") {
        return {
            id: null, title: "未知", overview: "",
            posterPath: "", backdropPath: "",
            mediaType: "movie", releaseDate: "",
            popularity: 0, rating: 0,
            jobs: [], characters: [], genre_ids: [],
            _normalizedTitle: "", _genreTitleCache: {}
        };
    }

    try {
        const title = item?.title || item?.name || "未知";

        const mediaType =
            item?.media_type ||
            (item?.release_date ? "movie" : (item?.first_air_date ? "tv" : "movie"));

        return {
            id: item?.id || null,
            title,
            overview: item?.overview || "",
            posterPath: item?.poster_path || "",
            backdropPath: item?.backdrop_path || "",
            mediaType,
            releaseDate: item?.release_date || item?.first_air_date || "",
            popularity: item?.popularity || 0,
            rating: item?.vote_average || 0,
            jobs: Array.isArray(item?.jobs) ? item.jobs : (item?.job ? [item.job] : []),
            characters: Array.isArray(item?.characters) ? item.characters : (item?.character ? [item.character] : []),
            genre_ids: Array.isArray(item?.genre_ids) ? item.genre_ids : [],
            _normalizedTitle: title.toLowerCase(),
            _genreTitleCache: item?._genreTitleCache || {}
        };

    } catch (err) {
        return {
            id: null, title: "未知", overview: "",
            posterPath: "", backdropPath: "",
            mediaType: "movie", releaseDate: "",
            popularity: 0, rating: 0,
            jobs: [], characters: [], genre_ids: [],
            _normalizedTitle: "", _genreTitleCache: {}
        };
    }
}

// -----------------------------
// 格式化输出（修复：排序的日期处理更健壮）
function formatOutput(list) {
    // 辅助：安全解析日期（返回时间戳）
    function safeTime(s) {
        const t = Date.parse(s || "");
        return isNaN(t) ? 0 : t;
    }

    return [...(Array.isArray(list) ? list : [])]
        .filter(i => i && typeof i === "object")
        .sort((a, b) => safeTime(b.releaseDate) - safeTime(a.releaseDate))
        .map(i => {
            const mediaType = i.mediaType || "movie";
            const genreMap = tmdbGenresCache[mediaType] || {};
            const genreTitle = Array.isArray(i.genre_ids)
                ? i.genre_ids.map(id => genreMap[id] || `未知类型(${id})`).join("•")
                : "";

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
// AC 自动机 + 正则过滤器（安全）
// -----------------------------
const acCache = new Map();
const regexCache = new Map();
const filterUnitCache = new Map();

function normalizeTitleForMatch(s) { return s ? s.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().normalize('NFC').toLowerCase() : ""; }

class ACAutomaton {
    constructor() { this.root = { next: Object.create(null), fail: null, output: [] }; }
    insert(word) {
        // 插入时期望 word 已经是标准化（小写、NFC 等）
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
        for (const k of Object.keys(this.root.next)) {
            const n = this.root.next[k];
            n.fail = this.root;
            q.push(n);
        }
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
function getRegex(term) {
    if (regexCache.has(term)) return regexCache.get(term);
    let re = null;
    try { re = new RegExp(term, 'i'); } catch (e) { re = null; }
    regexCache.set(term, re);
    return re;
}

function buildFilterUnit(filterStr) {
    if (!filterStr?.trim()) return null;
    if (filterUnitCache.has(filterStr)) return filterUnitCache.get(filterStr);

    // 支持 "|" 或 "||" 作为分隔（更灵活）
    const terms = filterStr.split(/\s*\|\|?\s*/).map(t => t.trim()).filter(Boolean);
    const plainTerms = [], regexTerms = [];
    for (const t of terms) {
        if (isPlainText(t)) plainTerms.push(t);
        else regexTerms.push(t);
    }

    let ac = null;
    if (plainTerms.length) {
        // 规范化 plain terms（小写、NFC）
        const normalizedPlain = plainTerms.map(p => p.normalize('NFC').toLowerCase());
        const key = normalizedPlain.slice().sort().join("\u0001");
        if (acCache.has(key)) ac = acCache.get(key);
        else {
            ac = new ACAutomaton();
            normalizedPlain.forEach(p => ac.insert(p));
            ac.build();
            acCache.set(key, ac);
        }
    }
    const unit = { ac, regexTerms };
    filterUnitCache.set(filterStr, unit);
    return unit;
}

function filterByKeywords(list, filterStr, logMode="info") {
    if (!filterStr?.trim() || !Array.isArray(list) || !list.length) return list;
    const logger = createLogger(logMode);
    const unit = buildFilterUnit(filterStr); if (!unit) return list;
    const { ac, regexTerms } = unit;
    const filteredOut = [];

    const filteredList = list.filter(item => {
        try {
            if (!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title || "");
            const title = item._normalizedTitle || "";
            let excluded = false;
            if (ac && ac.match(title).size) excluded = true;
            if (!excluded) {
                for (const r of regexTerms) {
                    const re = getRegex(r);
                    if (re?.test(title)) { excluded = true; break; }
                }
            }
            if (excluded && logMode === "debug") filteredOut.push(item);
            return !excluded;
        } catch (err) {
            // 过滤异常安全：出现异常则不过滤该项
            return true;
        }
    });

    if (logMode === "debug" && filteredOut.length) logger.debug("过滤掉的作品:", filteredOut.map(i => i.title));
    return filteredList;
}

// -----------------------------
// loadPersonWorks（全流程动态追踪）
async function loadPersonWorks(params) {
    const logger = createLogger(params?.logMode || "info");
    const personKey = `${params.personId}_${params.language || "zh-CN"}`;
    const now = Date.now();

    // 命中缓存
    if (personWorksCache.has(personKey)) {
        const entry = personWorksCache.get(personKey);
        entry.timestamp = now;
        logger.info(`作品缓存命中: ${personKey}`);
        return await entry.promise;
    }

    const promise = (async () => {
        let finalList = [];
        try {
            // 1️⃣ 解析人物ID
            logger.info("阶段[解析人物ID]开始...");
            const personId = await resolvePersonId(params.personId, params.language, params.logMode);
            if (!personId) {
                logger.info("未解析出人物ID，返回空数组");
                return [];
            }
            logger.info(`阶段[解析人物ID]完成: personId=${personId}`);

            // 2️⃣ 初始化类型缓存
            logger.info("阶段[初始化类型缓存]开始...");
            await initTmdbGenres(params.language || "zh-CN", params.logMode);
            logger.info(`阶段[初始化类型缓存]完成: movie(${Object.keys(tmdbGenresCache.movie).length}), tv(${Object.keys(tmdbGenresCache.tv).length})`);

            // 3️⃣ 抓取作品
            logger.info("阶段[抓取作品]开始...");
            const credits = await fetchCredits(personId, params.language, params.logMode);
            let works = [...credits.cast, ...credits.crew].map(normalizeItem);
            logger.info(`阶段[标准化作品]完成，共 ${works.length} 部作品，前10个标题:`, works.slice(0,10).map(i=>i.title));

            // 4️⃣ 上映状态过滤
            if (params.type && params.type !== "all") {
                logger.info(`阶段[上映状态过滤]开始，类型=${params.type}`);
                const nowDate = new Date();
                works = works.filter(i => {
                    if (!i.releaseDate) return false;
                    const t = Date.parse(i.releaseDate);
                    if (isNaN(t)) return false;
                    return (params.type === "released") ? (new Date(t) <= nowDate) : (new Date(t) > nowDate);
                });
                logger.info(`阶段[上映状态过滤]完成，共 ${works.length} 部作品`);
            }

            // 5️⃣ AC + 正则关键词过滤
            if (params.filter?.trim()) {
                logger.info(`阶段[关键词过滤]开始，filter="${params.filter}"`);
                works = filterByKeywords(works, params.filter, params.logMode);
                logger.info(`阶段[关键词过滤]完成，共 ${works.length} 部作品`);
            }

            // 6️⃣ 格式化输出
            finalList = formatOutput(works);
            logger.info(`阶段[最终返回作品]完成，共 ${finalList.length} 部作品，前10个标题:`, finalList.slice(0,10).map(i=>i.title));

        } catch (err) {
            logger.warning("loadPersonWorks 捕获异常:", err);
        }
        return finalList;
    })();

    // 缓存结果
    personWorksCache.set(personKey, { promise, timestamp: now });

    // 7️⃣ LRU 清理
    if (personWorksCache.size > MAX_CACHE) {
        let oldestKey = null, oldestTime = Infinity;
        for (const [k, v] of personWorksCache.entries()) {
            if (v.timestamp < oldestTime) { oldestKey = k; oldestTime = v.timestamp; }
        }
        if (oldestKey) personWorksCache.delete(oldestKey);
    }

    return await promise;
}

// -----------------------------
// 安全包装
async function loadSharedWorksSafe(params) {
    try {
        return await loadPersonWorks(params);
    } catch (err) {
        const logger = createLogger(params?.logMode || "info");
        logger.warning("loadSharedWorksSafe 捕获异常:", err);
        return formatOutput([]);
    }
}

// -----------------------------
// 模块接口
async function getAllWorks(params) { return await loadSharedWorksSafe(params); }
async function getActorWorks(params) { return (await loadSharedWorksSafe(params)).filter(i => i.characters.length); }
async function getDirectorWorks(params) { return (await loadSharedWorksSafe(params)).filter(i => i.jobs.some(j => /director/i.test(j))); }
async function getOtherWorks(params) {
    return (await loadSharedWorksSafe(params)).filter(i => !(i.characters.length) && !(i.jobs.some(j => /director/i.test(j))));
}
