// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "tmdb.person.movie",
    title: "TMDB人物影视作品",
    version: "2.3.7",
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
        value: "info",
        enumOptions: [
            { title: "关闭", value: "off" },
            { title: "调试", value: "debug" },
            { title: "信息", value: "info" },
            { title: "警告", value: "warning" },
            { title: "通知", value: "notify" }
        ]
    }
];

WidgetMetadata.modules.forEach(m => m.params = JSON.parse(JSON.stringify(Params)));

// -----------------------------
// 日志函数
// -----------------------------
function createLogger(mode) {
    const m = mode || "info";
    return {
        debug: (...args) => (m === "debug") && console.log("[DEBUG]", ...args),
        info: (...args) => (["debug","info"].includes(m)) && console.log("[INFO]", ...args),
        warning: (...args) => (["debug","info","warning"].includes(m)) && console.warn("[WARN]", ...args),
        notify: (...args) => (["debug","info","warning","notify"].includes(m)) && console.info("[NOTIFY]", ...args)
    };
}

// -----------------------------
// resolvePersonId 函数
// -----------------------------
async function resolvePersonId(personInput, language = "zh-CN") {
    if (!personInput) return null;
    if (!isNaN(personInput)) return personInput; // 输入即 ID
    try {
        const res = await Widget.tmdb.get("search/person", { params: { query: personInput, language } });
        if (res?.results?.length) return res.results[0].id;
        return null;
    } catch (err) {
        console.error("resolvePersonId 获取人物ID失败", err);
        return null;
    }
}

// -----------------------------
// TMDB 数据获取和处理
// -----------------------------
async function fetchCredits(personId, language) {
    try {
        const response = await Widget.tmdb.get(`person/${personId}/combined_credits`, { params: { language } });
        return {
            cast: Array.isArray(response.cast) ? response.cast : [],
            crew: Array.isArray(response.crew) ? response.crew : []
        };
    } catch (err) {
        console.error("TMDB 获取作品失败", err);
        return { cast: [], crew: [] };
    }
}

function normalizeItem(item) {
    return {
        id: item.id,
        title: item.title || item.name || "未知",
        overview: item.overview || "",
        posterPath: item.poster_path || "",
        backdropPath: item.backdrop_path || "",
        mediaType: item.media_type || (item.release_date ? "movie" : "tv"),
        releaseDate: item.release_date || item.first_air_date || "",
        popularity: item.popularity || 0,
        rating: item.vote_average || 0,
        jobs: item.job ? [item.job] : [],
        characters: item.character ? [item.character] : [],
        genre_ids: item.genre_ids || [],
        _normalizedTitle: (item.title || item.name || "未知").toLowerCase()
    };
}

function getTmdbGenreTitles(genreIds, mediaType) {
    const genres = tmdbGenresCache?.[mediaType] || {};
    return genreIds
        .map(id => genres[id]?.trim() || `未知类型(${id})`)
        .filter(Boolean)
        .join('•');
}

// -----------------------------
// 格式化输出
// -----------------------------
function formatOutput(list, logMode="info") {
    const logger = createLogger(logMode);
    logger.debug("开始格式化输出, 条目数:", list.length);

    // 默认按发行日期降序
    list.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));

    return list.map(i => ({
        id: i.id,
        type: "tmdb",
        title: i.title,
        description: i.overview,
        releaseDate: i.releaseDate,
        rating: i.rating,
        popularity: i.popularity,
        posterPath: i.posterPath,
        backdropPath: i.backdropPath,
        mediaType: i.mediaType,
        jobs: i.jobs,
        characters: i.characters,
        genreTitle: (i.genre_ids.length ? (() => {
            const full = getTmdbGenreTitles(i.genre_ids, i.mediaType);
            const match = full.match(/•(.+)$/); // 只取最后一个 • 后面的内容
            return match ? match[1] : full;
        })() : "")
    }));
}

// -----------------------------
// 核心模块方法
// -----------------------------
async function loadWorks(params) {
    const p = params || {};
    const logger = createLogger(p.logMode || "info");
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) { logger.warning("未获取到人物ID"); return []; }

    let credits = await fetchCredits(personId, p.language);
    let merged = [...credits.cast, ...credits.crew].map(normalizeItem);

    // 上映状态筛选
    if (p.type && p.type !== "all") {
        const now = new Date();
        merged = merged.filter(i => {
            if (!i.releaseDate) return false;
            const d = new Date(i.releaseDate);
            return (p.type === "released") ? d <= now : d > now;
        });
    }

    // 关键词过滤
    if (p.filter?.trim()) {
        const regex = new RegExp(p.filter.toLowerCase());
        merged = merged.filter(i => regex.test(i._normalizedTitle));
    }

    logger.info("返回作品条目:", merged.length);
    return formatOutput(merged, p.logMode);
}

async function getAllWorks(params) { return loadWorks(params); }
async function getActorWorks(params) {
    const p = params || {};
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) return [];
    return formatOutput((await fetchCredits(personId, p.language)).cast.map(normalizeItem), p.logMode);
}
async function getDirectorWorks(params) {
    const p = params || {};
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) return [];
    return formatOutput(
        (await fetchCredits(personId, p.language)).crew.filter(i => i.job?.toLowerCase().includes("director")).map(normalizeItem),
        p.logMode
    );
}
async function getOtherWorks(params) {
    const p = params || {};
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) return [];
    return formatOutput(
        (await fetchCredits(personId, p.language)).crew.filter(i => !(i.job?.toLowerCase().includes("director"))).map(normalizeItem),
        p.logMode
    );
}
