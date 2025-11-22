// -----------------------------
// TMDB 人物作品 Widget（修复与加固版）
// 主要修复点：日志、输入校验、正则/过滤防护、缓存安全、异常捕获。
// -----------------------------
(function () {
    // -----------------------------
    // Widget Metadata
    // -----------------------------
    const WidgetMetadata = {
        id: "tmdb.person.movie",
        title: "TMDB人物影视作品",
        version: "2.3.8",
        requiredVersion: "0.0.1",
        description: "获取 TMDB 人物作品（强化版）",
        author: "ICoeMix (Optimized & Hardened by ChatGPT)",
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
    // 参数模板 Params（修正默认值 trim）
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
            description: "过滤标题中包含指定关键词的作品（支持 || 分隔的多个过滤项，支持正则，但受长度限制以防 ReDoS）",
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
    ];

    WidgetMetadata.modules.forEach(m => m.params = JSON.parse(JSON.stringify(Params)));

    // -----------------------------
    // 全局共享缓存（局部封装）
    // -----------------------------
    const MAX_PERSON_CACHE = 200; // 最大人物缓存数量
    const sharedPersonCache = new Map(); // key=personKey, value=作品数组（内部缓存）
    let tmdbGenresCache = { movie: {}, tv: {} };           // TMDB 类型缓存
    const personIdCache = new Map();    // 人物ID缓存

    // -----------------------------
    // 配置限制（防护）
    // -----------------------------
    const FILTER_MAX_TOTAL_LENGTH = 1000; // filter 字符串整体限制
    const FILTER_MAX_TERM_LENGTH = 200;   // 单个 regex term 最大长度
    const FILTER_MAX_PLAIN_TERMS = 50;    // 普通词数量上限
    const FILTER_MAX_PLAIN_TOTAL_CHARS = 2000; // plain term 总字符上限
    const REGEX_SAFE_CACHE_LIMIT = 500;   // 正则缓存数量上限

    // -----------------------------
    // 日志函数（强化）
    // warning/notify 始终输出；info 在 info/debug 生效；debug 仅在 debug 生效
    // -----------------------------
    function createLogger(mode) {
        const m = (mode || "info").toLowerCase();
        return {
            debug: (...args) => { if (m === "debug") console.log("[DEBUG]", ...args); },
            info: (...args) => { if (m === "debug" || m === "info") console.log("[INFO]", ...args); },
            warning: (...args) => { console.warn("[WARN]", ...args); },
            notify: (...args) => { console.info("[NOTIFY]", ...args); }
        };
    }

    // -----------------------------
    // TMDB 类型缓存初始化
    // -----------------------------
    async function initTmdbGenres(language = "zh-CN", logMode = "info") {
        const logger = createLogger(logMode);
        if (tmdbGenresCache.movie && tmdbGenresCache.tv && Object.keys(tmdbGenresCache.movie).length && Object.keys(tmdbGenresCache.tv).length) return;
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
            logger.debug("TMDB 类型缓存完成:", tmdbGenresCache);
        } catch (err) {
            logger.warning("初始化 TMDB 类型失败", err);
            tmdbGenresCache = { movie: {}, tv: {} };
        }
    }

    // -----------------------------
    // resolvePersonId（增加缓存 & 宽松空值判定 & 数字字符串识别）
    // -----------------------------
    async function resolvePersonId(personInput, language = "zh-CN", logMode = "info") {
        const logger = createLogger(logMode);
        if (personInput === null || personInput === undefined) return null;
        const raw = (typeof personInput === "string") ? personInput.trim() : String(personInput).trim();
        if (!raw) return null;

        // 纯数字 ID（仅当完全为数字时视为 ID）
        if (/^\d+$/.test(raw)) {
            return Number(raw);
        }

        const cacheKey = `${raw}_${language}`;
        if (personIdCache.has(cacheKey)) return personIdCache.get(cacheKey);

        try {
            logger.debug("搜索人物:", raw, "语言:", language);
            const res = await Widget.tmdb.get("search/person", { params: { query: raw, language } });
            const id = res?.results?.[0]?.id || null;
            if (id) personIdCache.set(cacheKey, id);
            logger.debug("获取人物ID:", id);
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
    // 获取作品（增强空值保护）
    // -----------------------------
    async function fetchCredits(personId, language = "zh-CN", logMode = "info") {
        const logger = createLogger(logMode);
        try {
            logger.debug("获取人物作品 personId:", personId, "语言:", language);
            const response = await Widget.tmdb.get(`person/${personId}/combined_credits`, { params: { language } });
            const safe = (v) => Array.isArray(v) ? v : [];
            return {
                cast: safe(response?.cast),
                crew: safe(response?.crew)
            };
        } catch (err) {
            logger.warning("TMDB 获取作品失败", err);
            return { cast: [], crew: [] };
        }
    }

    // -----------------------------
    // 数据标准化（加强空项保护）
    // -----------------------------
    function normalizeItem(item) {
        if (!item || typeof item !== "object") {
            return {
                id: null,
                title: "未知",
                overview: "",
                posterPath: "",
                backdropPath: "",
                mediaType: "",
                releaseDate: "",
                popularity: 0,
                rating: 0,
                jobs: [],
                characters: [],
                genre_ids: [],
                _normalizedTitle: "未知",
                _genreTitleCache: {}
            };
        }
        const title = item.title || item.name || "未知";
        return {
            id: item.id || null,
            title,
            overview: item.overview || "",
            posterPath: item.poster_path || "",
            backdropPath: item.backdrop_path || "",
            mediaType: item.media_type || (item.release_date ? "movie" : "tv"),
            releaseDate: item.release_date || item.first_air_date || "",
            popularity: typeof item.popularity === "number" ? item.popularity : (Number(item.popularity) || 0),
            rating: typeof item.vote_average === "number" ? item.vote_average : (Number(item.vote_average) || 0),
            jobs: item.job ? [item.job] : (Array.isArray(item.jobs) ? item.jobs : []),
            characters: item.character ? [item.character] : (Array.isArray(item.characters) ? item.characters : []),
            genre_ids: Array.isArray(item.genre_ids) ? item.genre_ids : [],
            _normalizedTitle: (title || "未知").toLocaleLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, "").trim(),
            _genreTitleCache: {}
        };
    }

    function getTmdbGenreTitles(item) {
        if (!item || !Array.isArray(item.genre_ids) || !item.mediaType) return "";
        const genres = tmdbGenresCache?.[item.mediaType] || {};
        const key = item.genre_ids.join(",");
        if (item._genreTitleCache && item._genreTitleCache[key]) return item._genreTitleCache[key];

        const title = item.genre_ids
            .map(id => (genres[id] || "").toString().trim() || `未知类型(${id})`)
            .filter(Boolean)
            .join('•');

        if (!item._genreTitleCache) item._genreTitleCache = {};
        item._genreTitleCache[key] = title;
        return title;
    }

    // -----------------------------
    // 格式化输出（增强日期处理，返回深拷贝以避免外部修改缓存对象）
    // -----------------------------
    function formatOutput(list, logMode = "info") {
        const logger = createLogger(logMode);
        const safeList = Array.isArray(list) ? list : [];
        // 稳健排序
        const sortedList = [...safeList].sort((a, b) => {
            const da = new Date(a?.releaseDate || "");
            const db = new Date(b?.releaseDate || "");
            const ta = isNaN(da.getTime()) ? 0 : da.getTime();
            const tb = isNaN(db.getTime()) ? 0 : db.getTime();
            return tb - ta;
        });

        const formatted = sortedList.map(i => ({
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
            jobs: Array.isArray(i.jobs) ? [...i.jobs] : [],
            characters: Array.isArray(i.characters) ? [...i.characters] : [],
            genreTitle: (Array.isArray(i.genre_ids) && i.genre_ids.length) ? (() => {
                const full = getTmdbGenreTitles(i);
                const match = full.match(/•(.+)$/);
                return match ? match[1] : full;
            })() : ""
        }));

        if (logMode === "debug") logger.debug("格式化输出完成，数量:", formatted.length);
        return formatted;
    }

    // -----------------------------
    // 高性能 AC + 正则过滤器（有限制与缓存上限）
    // -----------------------------
    const acCache = new Map();
    const regexCache = new Map(); // key -> RegExp or null
    // 限制正则缓存大小，防止内存无限增长
    function ensureRegexCacheLimit() {
        if (regexCache.size > REGEX_SAFE_CACHE_LIMIT) {
            // 简单策略：清空缓存（可替换为 LRU）
            regexCache.clear();
        }
    }

    function normalizeTitleForMatch(s) {
        if (!s) return "";
        return s.toString().replace(/[\u200B-\u200D\uFEFF]/g, "").trim().normalize('NFC').toLocaleLowerCase();
    }

    class ACAutomaton {
        constructor() { this.root = { next: Object.create(null), fail: null, output: [] }; }
        insert(word) {
            if (!word) return;
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
                const n = this.root.next[k]; n.fail = this.root; q.push(n);
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
                if (node.output && node.output.length) node.output.forEach(w => found.add(w));
            }
            return found;
        }
    }

    function isPlainText(term) {
        if (!term) return true;
        // 如果含有正则特殊字符则判为 regex
        return !/[\*\?\^\$\.\+\|\(\)\[\]\{\}\\]/.test(term);
    }

    function getRegex(term) {
        if (!term) return null;
        if (regexCache.has(term)) return regexCache.get(term);
        // 防护：限制长度
        if (term.length > FILTER_MAX_TERM_LENGTH) {
            regexCache.set(term, null);
            return null;
        }
        try {
            // 尝试构建不带 g 标志的正则（使用 i 忽略大小写）
            const re = new RegExp(term, 'i');
            regexCache.set(term, re);
            ensureRegexCacheLimit();
            return re;
        } catch (e) {
            // 构建失败，缓存 null，避免重复尝试
            regexCache.set(term, null);
            return null;
        }
    }

    function buildFilterUnit(filterStr) {
        if (!filterStr || !filterStr.trim()) return null;
        const trimmed = filterStr.trim();
        // 总长度限制
        if (trimmed.length > FILTER_MAX_TOTAL_LENGTH) {
            return null;
        }
        if (filterUnitCacheHas(trimmed)) return filterUnitCacheGet(trimmed);

        const terms = trimmed.split(/\s*\|\|\s*/).map(t => t.trim()).filter(Boolean);
        if (terms.length === 0) return null;

        const plainTerms = [];
        const regexTerms = [];

        let totalPlainChars = 0;
        for (const t of terms) {
            if (isPlainText(t)) {
                if (plainTerms.length >= FILTER_MAX_PLAIN_TERMS) continue; // 超限跳过
                totalPlainChars += t.length;
                if (totalPlainChars > FILTER_MAX_PLAIN_TOTAL_CHARS) break;
                plainTerms.push(t.toLocaleLowerCase());
            } else {
                if (t.length <= FILTER_MAX_TERM_LENGTH) regexTerms.push(t);
            }
        }

        // 如果没有任何有效 term，则返回 null（表示不过滤）
        if (!plainTerms.length && !regexTerms.length) return null;

        // AC 自动机构建（使用 key 做缓存）
        let ac = null;
        if (plainTerms.length) {
            const key = plainTerms.slice().sort().join("\u0001");
            if (acCache.has(key)) ac = acCache.get(key);
            else {
                ac = new ACAutomaton();
                for (const p of plainTerms) {
                    // 插入前做最小清理
                    const safeP = p.replace(/[\u0000-\u001f]/g, "").toLocaleLowerCase();
                    if (safeP) ac.insert(safeP);
                }
                ac.build();
                acCache.set(key, ac);
                // 限制 AC 缓存大小（简单清理策略）
                if (acCache.size > 200) {
                    acCache.clear();
                }
            }
        }

        const unit = { ac, regexTerms };
        filterUnitCacheSet(trimmed, unit);
        return unit;
    }

    // 简单封装 filterUnit 缓存（避免直接暴露 Map）
    const filterUnitCache = new Map();
    function filterUnitCacheHas(k) { return filterUnitCache.has(k); }
    function filterUnitCacheGet(k) { return filterUnitCache.get(k); }
    function filterUnitCacheSet(k, v) { filterUnitCache.set(k, v); if (filterUnitCache.size > 500) filterUnitCache.clear(); }

    function filterByKeywords(list, filterStr, logMode = "info") {
        if (!filterStr || !filterStr.trim()) return list;
        if (!Array.isArray(list) || list.length === 0) return list;

        const logger = createLogger(logMode);
        const unit = buildFilterUnit(filterStr);
        if (!unit) return list;

        const { ac, regexTerms } = unit;
        const filteredOut = [];

        const filteredList = list.filter(item => {
            if (!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title || "");
            const title = item._normalizedTitle || "";

            let excluded = false;
            if (ac && ac.match(title).size) excluded = true;
            if (!excluded && regexTerms.length) {
                for (const r of regexTerms) {
                    const re = getRegex(r);
                    if (re && re.test(title)) { excluded = true; break; }
                }
            }

            if (excluded && logMode === "debug") filteredOut.push(item);
            return !excluded;
        });

        if (logMode === "debug" && filteredOut.length) {
            logger.debug("过滤掉的作品:", filteredOut.map(i => i.title));
        }

        return filteredList;
    }

    // -----------------------------
    // 获取人物作品（loadSharedWorks）
    // -----------------------------
    async function loadSharedWorks(params) {
        // 守护：确保 params 为对象
        const p = (params && typeof params === "object") ? Object.assign({}, params) : {};
        p.personId = (p.personId === undefined || p.personId === null) ? "" : String(p.personId);
        p.language = p.language || "zh-CN";
        p.logMode = p.logMode || "info";
        p.type = p.type || "all";
        p.filter = (typeof p.filter === "string") ? p.filter : "";

        const logger = createLogger(p.logMode || "info");
        const personKey = `${p.personId}_${p.language}`;

        try {
            // 并发初始化 TMDB 类型 + 获取人物ID
            const [personId] = await Promise.all([
                getCachedPersonId(p.personId, p.language, p.logMode),
                initTmdbGenres(p.language || "zh-CN", p.logMode)
            ]);

            if (!personId) {
                logger.warning("未获取到人物ID");
                // 不抛异常，统一返回格式化的空数组结果，保持接口一致
                sharedPersonCache.set(personKey, []);
                return formatOutput([], p.logMode);
            }

            // 获取共享缓存或加载新作品
            if (!sharedPersonCache.has(personKey)) {
                const credits = await fetchCredits(personId, p.language, p.logMode);
                // 规范化条目
                const worksArray = [...(Array.isArray(credits.cast) ? credits.cast : []), ...(Array.isArray(credits.crew) ? credits.crew : [])]
                    .map(normalizeItem);

                sharedPersonCache.set(personKey, worksArray);

                if (sharedPersonCache.size > MAX_PERSON_CACHE) {
                    // 简单 FIFO 删除最早插入项
                    const firstKey = sharedPersonCache.keys().next().value;
                    sharedPersonCache.delete(firstKey);
                }

                if (p.logMode === "debug") logger.debug("共享缓存加载完成，作品数量:", worksArray.length);
            } else {
                if (p.logMode === "debug") logger.debug("使用共享缓存，作品数量:", sharedPersonCache.get(personKey).length);
            }

            // 使用缓存副本进行后续处理，避免直接操作缓存内部对象
            const cachedWorks = sharedPersonCache.get(personKey) || [];
            let works = cachedWorks.map(w => Object.assign({}, w, { jobs: Array.isArray(w.jobs) ? [...w.jobs] : [], characters: Array.isArray(w.characters) ? [...w.characters] : [] }));

            // 按上映状态过滤
            if (p.type && p.type !== "all") {
                const now = new Date();
                works = works.filter(i => {
                    if (!i || !i.releaseDate) return false;
                    const d = new Date(i.releaseDate);
                    if (isNaN(d.getTime())) return false;
                    return (p.type === "released") ? d <= now : d > now;
                });
                if (p.logMode === "debug") logger.debug("按上映状态过滤后作品数量:", works.length);
            }

            // AC+正则过滤（若 filter 非空）
            if (p.filter && p.filter.trim()) works = filterByKeywords(works, p.filter, p.logMode);

            // 格式化输出并返回（formatOutput 返回新的数组副本）
            return formatOutput(works, p.logMode);
        } catch (err) {
            logger.warning("loadSharedWorks 捕获异常:", err);
            // 发生异常时保证返回空数组格式
            return formatOutput([], p.logMode);
        }
    }

    // -----------------------------
    // 安全包装：loadSharedWorksSafe（防止上层误用未捕获异常）
    // -----------------------------
    async function loadSharedWorksSafe(params) {
        try {
            return await loadSharedWorks(params);
        } catch (err) {
            const logger = createLogger(params?.logMode || "info");
            logger.warning("loadSharedWorksSafe 捕获异常:", err);
            return formatOutput([], params?.logMode || "info");
        }
    }

    // -----------------------------
    // 模块函数（对外 API）
    // -----------------------------
    async function getAllWorks(params) {
        return await loadSharedWorksSafe(params);
    }

    async function getActorWorks(params) {
        const allWorks = await loadSharedWorksSafe(params);
        // allWorks 已是格式化输出，字符数组在 characters 字段
        return allWorks.filter(i => Array.isArray(i.characters) && i.characters.length);
    }

    async function getDirectorWorks(params) {
        const allWorks = await loadSharedWorksSafe(params);
        return allWorks.filter(i => Array.isArray(i.jobs) && i.jobs.some(j => /director/i.test(j)));
    }

    async function getOtherWorks(params) {
        const allWorks = await loadSharedWorksSafe(params);
        return allWorks.filter(i => !(Array.isArray(i.characters) && i.characters.length) && !(Array.isArray(i.jobs) && i.jobs.some(j => /director/i.test(j))));
    }

    // -----------------------------
    // 导出到 Widget 全局（如平台期望的挂载方式）
    // -----------------------------
    // 这里假设运行环境为 Forward Widgets 平台，直接导出到 Widget 对象
    if (typeof Widget !== "undefined") {
        Widget.Metadata = Widget.Metadata || {};
        Widget.Metadata.tmdbPersonMovie = WidgetMetadata;

        // 将模块注入（如果平台期望的不同，请根据平台改写）
        Widget.tmdbPersonMovie = {
            getAllWorks,
            getActorWorks,
            getDirectorWorks,
            getOtherWorks,
            // 若需要暴露内部工具用于调试，可在 debug 模式下访问
            _internal: {
                normalizeItem,
                formatOutput,
                initTmdbGenres,
                // 只在 debug 或维护时使用下列缓存（谨慎）
                _caches: {
                    sharedPersonCache,
                    tmdbGenresCache,
                    personIdCache
                }
            }
        };
    } else {
        // 如果没有 Widget 对象，将函数暴露为全局（谨慎）
        if (typeof window !== "undefined") {
            window.tmdbPersonMovie = { getAllWorks, getActorWorks, getDirectorWorks, getOtherWorks };
        } else if (typeof global !== "undefined") {
            global.tmdbPersonMovie = { getAllWorks, getActorWorks, getDirectorWorks, getOtherWorks };
        }
    }

    // end IIFE
})();