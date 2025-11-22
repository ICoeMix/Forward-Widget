// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "tmdb.person.movie",
    title: "TMDB人物影视作品",
    version: "2.3.4",
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
        ]
    },
    {
        name: "language",
        title: "语言",
        description: "选择 TMDB 数据返回的语言",
        type: "enumeration",
        enumOptions: [
            { title: "中文", value: "zh-CN" },
            { title: "英文", value: "en-US" },
            { title: "日文", value: "ja-JP" },
            { title: "韩文", value: "ko-KR" },
            { title: "法文", value: "fr-FR" }
        ],
        value: "zh-CN",
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
        value: "all",
    },
    {
        name: "filter",
        title: "关键词过滤",
        type: "input",
        description: "过滤标题中包含指定关键词的作品",
        placeholders: [
            { title: "关键词过滤", value: "A" },
            { title: "完全匹配 A", value: "^A$" },
            { title: "以 A 开头", value: "^A.*" },
            { title: "以 B 结尾", value: ".*B$" },
            { title: "包含 A 或 B", value: "A|B" },
            { title: "包含 A 和 B", value: "^(?=.*A)(?=.*B).*$" },
            { title: "不包含 A 但包含 B", value: "^(?:(?!A).)*B.*$" },
            { title: "以 A 开头，任意字符，B 结尾", value: "^A.*B$" },
        ],
        value: "",
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
        ],
        description: "选择日志输出模式，可实时切换"
    }
];

WidgetMetadata.modules.forEach(m => m.params = JSON.parse(JSON.stringify(Params)));

// -----------------------------
// 日志函数（全局复用）
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
// resolvePersonId：名字转ID
// -----------------------------
async function resolvePersonId(personInput, language = "zh-CN") {
    if (!personInput) return null;
    if (!isNaN(personInput)) return personInput; // 输入就是数字ID
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
// TMDB 数据处理
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
    const normalizedTitle = (item.title || item.name || "未知").toLowerCase();
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
        _normalizedTitle: normalizedTitle
    };
}

function formatOutput(list, logMode="info") {
    const logger = createLogger(logMode);
    logger.debug("开始格式化输出, 条目数:", list.length);
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
        genreTitle: (i.genre_ids?.length ? `EU1*•${i.genre_ids.join("•")}` : "")
    }));
}

// -----------------------------
// 核心模块
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

    // 排序
    if (p.sort_by) {
        const [key, order] = p.sort_by.split(".");
        merged.sort((a, b) => order === "desc" ? b[key] - a[key] : a[key] - b[key]);
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
    let list = (await fetchCredits(personId, p.language)).cast.map(normalizeItem);
    return formatOutput(list, p.logMode);
}

async function getDirectorWorks(params) {
    const p = params || {};
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) return [];
    let list = (await fetchCredits(personId, p.language))
        .crew.filter(i => i.job?.toLowerCase().includes("director"))
        .map(normalizeItem);
    return formatOutput(list, p.logMode);
}

async function getOtherWorks(params) {
    const p = params || {};
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) return [];
    let list = (await fetchCredits(personId, p.language))
        .crew.filter(i => !(i.job?.toLowerCase().includes("director")))
        .map(normalizeItem);
    return formatOutput(list, p.logMode);
}
