// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "person.movie.tmdb",
    title: "TMDB人物影视作品",
    version: "2.2.5",
    requiredVersion: "0.0.1",
    description: "精准获取 TMDB 人物影视作品，支持名字搜索、上映状态、关键词过滤",
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
// 参数模板
// -----------------------------
const defaultParams = [
    {
        name: "personId",
        title: "个人ID",
        type: "input",
        description: "在 TMDB 网站获取的数字 ID，或输入名字自动搜索",
        placeholders: [
            { title: "张艺谋", value: "607" },
            { title: "李安", value: "1614" },
            { title: "周星驰", value: "57607" },
            { title: "成龙", value: "18897" }
            // 可继续扩充完整推荐列表
        ]
    },
    { name: "language", title: "语言", type: "language", value: "zh-CN" },
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
        description: "填写关键词，用逗号分隔，返回中会去掉包含这些关键词的条目"
    },
    {
        name: "sort_by",
        title: "排序方式",
        type: "enumeration",
        enumOptions: [
            { title: "发行日期降序", value: "release_date.desc" },
            { title: "评分降序", value: "vote_average.desc" },
            { title: "热门降序", value: "popularity.desc" }
        ],
        value: "popularity.desc"
    }
];

// -----------------------------
// 复制 params 给各模块
// -----------------------------
WidgetMetadata.modules.forEach(m => m.params = JSON.parse(JSON.stringify(defaultParams)));

// -----------------------------
// 数据处理函数
// -----------------------------
async function fetchCredits(personId, language) {
    try {
        const response = await Widget.tmdb.get(`person/${personId}/combined_credits`, {
            params: { language: language || "zh-CN" }
        });
        return {
            cast: Array.isArray(response.cast) ? response.cast.map(normalizeItem) : [],
            crew: Array.isArray(response.crew) ? response.crew.map(normalizeItem) : []
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
        mediaType: item.media_type || guessMediaType(item),
        releaseDate: item.release_date || item.first_air_date || "",
        popularity: item.popularity || 0,
        rating: item.vote_average || 0,
        job: item.job || null,
        character: item.character || null
    };
}

function guessMediaType(item) {
    if (item.release_date) return "movie";
    if (item.first_air_date) return "tv";
    return "movie";
}

function filterByType(list, type) {
    const today = new Date();
    if (type === "released") return list.filter(i => i.releaseDate && new Date(i.releaseDate) <= today);
    if (type === "upcoming") return list.filter(i => i.releaseDate && new Date(i.releaseDate) > today);
    return list;
}

function filterByKeyword(list, keywords) {
    if (!keywords) return list;
    const kwArr = keywords.split(",").map(k => k.trim()).filter(k => k);
    if (kwArr.length === 0) return list;
    return list.filter(item => !kwArr.some(k => item.title.includes(k)));
}

function sortResults(list, sortBy) {
    return list.slice().sort((a, b) => {
        if (sortBy === "popularity.desc") return b.popularity - a.popularity;
        if (sortBy === "vote_average.desc") return b.rating - a.rating;
        if (sortBy === "release_date.desc") return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        return 0;
    });
}

function formatOutput(list) {
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
        jobs: i.jobs || [],
        characters: i.characters || []
    }));
}

// -----------------------------
// 动态获取 ID
// -----------------------------
async function getPersonIdByName(name, language = "zh-CN") {
    if (!name) return null;
    try {
        const response = await Widget.tmdb.get("search/person", {
            params: { query: name, language }
        });
        return response.results && response.results.length > 0 ? response.results[0].id : null;
    } catch (err) {
        console.error("TMDB 搜索人物失败:", err);
        return null;
    }
}

// -----------------------------
// 模块通用加载函数
// -----------------------------
async function loadWorks(params, filterFn) {
    const p = params || {};
    let personId = p.personId;

    if (isNaN(Number(personId))) {
        const id = await getPersonIdByName(personId, p.language);
        if (!id) return [];
        personId = id;
    }

    const credits = await fetchCredits(personId, p.language);
    let cast = credits.cast;
    let crew = credits.crew;

    if (filterFn) crew = crew.filter(filterFn);

    let merged = mergeCredits(cast, crew);
    merged = filterByType(merged, p.type);
    merged = filterByKeyword(merged, p.filter);
    merged = sortResults(merged, p.sort_by);
    return formatOutput(merged);
}

function mergeCredits(cast, crew) {
    const dict = {};
    function add(item) {
        if (!dict[item.id]) dict[item.id] = { ...item, jobs: [], characters: [] };
        if (item.job) dict[item.id].jobs.push(item.job);
        if (item.character) dict[item.id].characters.push(item.character);
    }
    cast.forEach(add);
    crew.forEach(add);
    return Object.values(dict);
}

// -----------------------------
// 各模块方法
// -----------------------------
async function getAllWorks(params) {
    return loadWorks(params); // 全部作品
}

async function getActorWorks(params) {
    return loadWorks(params, () => false); // 过滤掉 crew，只显示 cast
}

async function getDirectorWorks(params) {
    return loadWorks(params, i => i.job && i.job.toLowerCase().includes("director")); // 只显示导演
}

async function getOtherWorks(params) {
    return loadWorks(params, i => !(i.job && i.job.toLowerCase().includes("director"))); // 非导演 crew
}
