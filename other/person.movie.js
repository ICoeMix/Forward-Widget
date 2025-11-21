// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "tmdb.person.movie",
    title: "TMDB人物影视作品",
    version: "2.2.6",
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
        description: "在 TMDB 网站获取的数字 ID，或输入名字自动搜索",
        placeholders: [
            { title: "张艺谋", value: "607" },
            { title: "李安", value: "1614" },
            { title: "周星驰", value: "57607" },
            { title: "成龙", value: "18897" },
            { title: "吴京", value: "78871" }
        ]
    },
    {
        name: "language",
        title: "语言",
        type: "language",
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
        description: "过滤标题中包含指定关键字的作品",
        placeholders: [
            { title: "默认（不过滤）", value: "" },
            { title: "AND组合（标题同时包含 A 和 B）", value: "A&&B" },
            { title: "OR组合（标题包含 A 或 B）", value: "A||B" },
            { title: "排除组合（包含 A，但不包含 X）", value: "!X&&A" },
            { title: "复杂组合（“A和B同时出现 或 C出现”且不包含 X）", value: "(A&&B)||C&&!X" },
            { title: "嵌套组合（可任意嵌套括号，支持通配符*和?）", value: "((A||B)&&C)||(!X&&!Y)" },
            { title: "通配符匹配（A开头，任意字符，B结尾）", value: "^A*B$" },
            { title: "通配符任意位置（标题包含 A，中间任意字符，后面包含 B）", value: "*A*B*" },
            { title: "嵌套通配符组合（高级逻辑，支持 AND/OR/排除）", value: "((^A*B$||C)&&!X)||(!Y&&*Z*)" }
        ]
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

// 所有模块共享 Params
WidgetMetadata.modules.forEach(m => m.params = JSON.parse(JSON.stringify(Params)));

// -----------------------------
// TMDB 数据获取及处理函数
// -----------------------------
async function fetchCredits(personId, language) {
    try {
        const response = await Widget.tmdb.get(`person/${personId}/combined_credits`, {
            params: { language }
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

function filterByType(list, type) {
    const today = new Date();
    if (type === "released") return list.filter(i => i.releaseDate && new Date(i.releaseDate) <= today);
    if (type === "upcoming") return list.filter(i => i.releaseDate && new Date(i.releaseDate) > today);
    return list;
}

function sortResults(list, sortBy) {
    return list.slice().sort((a, b) => {
        if (sortBy === "popularity.desc") return b.popularity - a.popularity;
        if (sortBy === "vote_average.desc") return b.rating - a.rating;
        if (sortBy === "release_date.desc") return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        return 0;
    });
}

// -----------------------------
// 高级关键词过滤器（支持 AND/OR/排除/嵌套/通配符 * ?）
// -----------------------------
function filterByKeywords(list, filterStr) {
    if (!filterStr || !list.length) return list;

    list.forEach(item => {
        if (!item._title) item._title = item.title.toLowerCase();
    });

    const wildcardToRegex = str => {
        const escaped = str.replace(/([.+^=!:${}()|[\]\/\\])/g, "\\$1");
        const regexStr = escaped.replace(/\*/g, ".*").replace(/\?/g, ".");
        return new RegExp(regexStr, "i");
    };

    let expr = filterStr
        .replace(/([A-Za-z0-9_\*\?\u4e00-\u9fa5]+)/g, match => {
            const regex = wildcardToRegex(match.toLowerCase());
            return `(regexTest(item._title, ${regex}))`;
        })
        .replace(/\&\&/g, "&&")
        .replace(/\|\|/g, "||")
        .replace(/!/g, "!");

    function regexTest(title, regex) {
        return regex.test(title);
    }

    const matchFunc = new Function("item", "return " + expr + ";");

    return list.filter(item => {
        try {
            return matchFunc(item);
        } catch (e) {
            console.error("关键词过滤表达式错误:", e, filterStr);
            return true;
        }
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
        jobs: i.jobs,
        characters: i.characters
    }));
}

// -----------------------------
// 名字搜索 → 返回 ID
// -----------------------------
async function getPersonIdByName(name, language = "zh-CN") {
    if (!name) return null;
    try {
        const response = await Widget.tmdb.get("search/person", { params: { query: name, language } });
        return response.results && response.results.length > 0 ? response.results[0].id : null;
    } catch (err) {
        console.error("TMDB 搜索人物失败:", err);
        return null;
    }
}

async function resolvePersonId(input, language) {
    if (!input) return null;
    if (!isNaN(Number(input))) return Number(input);
    return await getPersonIdByName(input, language);
}

// -----------------------------
// 核心模块方法
// -----------------------------
async function loadWorks(params) {
    const p = params || {};
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) return [];

    let credits = await fetchCredits(personId, p.language);
    let merged = mergeCredits(credits.cast, credits.crew);
    merged = filterByType(merged, p.type);
    merged = sortResults(merged, p.sort_by);
    merged = filterByKeywords(merged, p.filter);
    return formatOutput(merged);
}

async function getAllWorks(params) { return loadWorks(params); }

async function getActorWorks(params) {
    const p = params || {};
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) return [];
    let list = (await fetchCredits(personId, p.language)).cast;
    list = filterByType(list, p.type);
    list = sortResults(list, p.sort_by);
    list = filterByKeywords(list, p.filter);
    return formatOutput(list);
}

async function getDirectorWorks(params) {
    const p = params || {};
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) return [];
    let list = (await fetchCredits(personId, p.language)).crew.filter(i => i.job && i.job.toLowerCase().includes("director"));
    list = filterByType(list, p.type);
    list = sortResults(list, p.sort_by);
    list = filterByKeywords(list, p.filter);
    return formatOutput(list);
}

async function getOtherWorks(params) {
    const p = params || {};
    const personId = await resolvePersonId(p.personId, p.language);
    if (!personId) return [];
    let list = (await fetchCredits(personId, p.language)).crew.filter(i => !(i.job && i.job.toLowerCase().includes("director")));
    list = filterByType(list, p.type);
    list = sortResults(list, p.sort_by);
    list = filterByKeywords(list, p.filter);
    return formatOutput(list);
}
