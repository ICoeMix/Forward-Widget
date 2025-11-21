// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "tmdb.person.movie",
    title: "TMDB人物影视作品",
    version: "2.2.5",
    requiredVersion: "0.0.1",
    description: "获取 TMDB 人物作品数据，支持关键词和正则过滤",
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
        description: "填写关键词，用逗号分隔，返回中会去掉包含这些关键词的条目。例如：爱情, 喜剧, /202[0-9]/ 表示过滤标题中包含 '爱情' 或 '喜剧' 或 2020-2029 年的正则匹配条目"
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
    if (type === "released") {
        return list.filter(i => i.releaseDate && new Date(i.releaseDate) <= today);
    }
    if (type === "upcoming") {
        return list.filter(i => i.releaseDate && new Date(i.releaseDate) > today);
    }
    return list;
}

function sortResults(list, sortBy) {
    return list.slice().sort((a, b) => {
        if (sortBy === "popularity.desc") return b.popularity - a.popularity;
        if (sortBy === "vote_average.desc") return b.rating - a.rating;
        if (sortBy === "release_date.desc")
            return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        return 0;
    });
}

// -----------------------------
// 支持正则的关键词过滤
// -----------------------------
function filterByKeywords(list, keywordsStr) {
    if (!keywordsStr) return list;
    const keywords = keywordsStr.split(",").map(k => k.trim()).filter(Boolean);
    return list.filter(item => {
        return !keywords.some(k => {
            if (k.startsWith("/") && k.endsWith("/")) {
                const pattern = k.slice(1, -1);
                try {
                    return new RegExp(pattern, "i").test(item.title);
                } catch (err) {
                    console.warn("无效正则:", k, err);
                    return false;
                }
            } else {
                return item.title.includes(k);
            }
        });
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
