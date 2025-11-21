// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "person.movie.tmdb",
    title: "TMDB人物影视作品",
    version: "2.1.0",
    requiredVersion: "0.0.1",
    description: "精准获取 TMDB 人物作品数据，含相似人物推荐",
    author: "ICoeMix (Optimized by ChatGPT)",
    site: "https://github.com/ICoeMix/ForwardWidgets",
    cacheDuration: 172800,
    modules: [
        {
            id: "allWorks",
            title: "全部作品",
            functionName: "getAllWorks",
            cacheDuration: 172800,
            params: [
                {
                    name: "personId",
                    title: "个人ID",
                    type: "input",
                    description: "在 TMDB 网站获取的数字 ID",
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
                        { title: "张译", value: "3963465" },
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
                    title: "类型",
                    type: "enumeration",
                    enumOptions: [
                        { title: "全部", value: "all" },
                        { title: "电影", value: "movie" },
                        { title: "电视剧", value: "tv" }
                    ],
                    value: "all"
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
            ]
        },
        { id: "actorWorks", title: "演员作品", functionName: "getActorWorks", cacheDuration: 172800 },
        { id: "directorWorks", title: "导演作品", functionName: "getDirectorWorks", cacheDuration: 172800 },
        { id: "otherWorks", title: "其他作品", functionName: "getOtherWorks", cacheDuration: 172800 }
    ]
};

// -----------------------------
// 参数复用
// -----------------------------
["actorWorks", "directorWorks", "otherWorks"].forEach(id => {
    var module = WidgetMetadata.modules.find(m => m.id === id);
    module.params = JSON.parse(JSON.stringify(WidgetMetadata.modules[0].params));
});

// -----------------------------
// 1. 获取作品 (combined_credits)
// -----------------------------
async function fetchCredits(personId, language) {
    var api = `person/${personId}/combined_credits`;
    var response = await Widget.tmdb.get(api, { params: { language: language || "zh-CN" } });

    if (!response) throw new Error("获取作品失败");

    return {
        cast: (response.cast || []).map(normalizeItem),
        crew: (response.crew || []).map(normalizeItem)
    };
}

// -----------------------------
// 2. 获取推荐演员（补丁新增）
// -----------------------------
async function fetchRecommendations(personId) {
    try {
        var api = `person/${personId}/recommendations`;
        var response = await Widget.tmdb.get(api, { params: {} });

        if (!response || !response.results) return [];

        return response.results.map(item => ({
            id: item.id,
            name: item.name,
            profilePath: item.profile_path || null
        }));
    } catch {
        return [];
    }
}

// -----------------------------
// 数据归一化
// -----------------------------
function normalizeItem(item) {
    return {
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        mediaType: item.media_type || guessMediaType(item),
        releaseDate: item.release_date || item.first_air_date || null,
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

// -----------------------------
// 合并 cast + crew
// -----------------------------
function mergeCredits(cast, crew) {
    var dict = {};

    function add(item) {
        if (!dict[item.id]) {
            dict[item.id] = { ...item, jobs: [], characters: [] };
        }
        if (item.job) dict[item.id].jobs.push(item.job);
        if (item.character) dict[item.id].characters.push(item.character);
    }

    cast.forEach(add);
    crew.forEach(add);

    return Object.values(dict);
}

// -----------------------------
// 筛选
// -----------------------------
function filterByType(list, type) {
    return type === "all" ? list : list.filter(i => i.mediaType === type);
}

// -----------------------------
// 排序
// -----------------------------
function sortResults(list, sortBy) {
    var sorted = list.slice();

    if (sortBy === "popularity.desc") {
        sorted.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === "vote_average.desc") {
        sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "release_date.desc") {
        sorted.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    }

    return sorted;
}

// -----------------------------
// 输出格式
// -----------------------------
function formatOutput(list) {
    return list.map(item => ({
        id: item.id,
        type: "tmdb",
        title: item.title,
        description: item.overview,
        releaseDate: item.releaseDate,
        rating: item.rating,
        popularity: item.popularity,
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        mediaType: item.mediaType,
        jobs: item.jobs,
        characters: item.characters
    }));
}

// -----------------------------
// 模块方法
// -----------------------------
async function loadWorks(params) {
    var p = params || {};
    var credits = await fetchCredits(p.personId, p.language);
    var recommended = await fetchRecommendations(p.personId);

    var merged = mergeCredits(credits.cast, credits.crew);
    merged = filterByType(merged, p.type);
    merged = sortResults(merged, p.sort_by);

    return {
        results: formatOutput(merged),
        recommendedActors: recommended
    };
}

async function getAllWorks(params) {
    return loadWorks(params);
}

async function getActorWorks(params) {
    var p = params || {};
    var credits = await fetchCredits(p.personId, p.language);
    var recommended = await fetchRecommendations(p.personId);

    var list = credits.cast;
    list = filterByType(list, p.type);
    list = sortResults(list, p.sort_by);

    return {
        results: formatOutput(list),
        recommendedActors: recommended
    };
}

async function getDirectorWorks(params) {
    var p = params || {};
    var credits = await fetchCredits(p.personId, p.language);
    var recommended = await fetchRecommendations(p.personId);

    var list = credits.crew.filter(i => i.job && i.job.toLowerCase().includes("director"));
    list = filterByType(list, p.type);
    list = sortResults(list, p.sort_by);

    return {
        results: formatOutput(list),
        recommendedActors: recommended
    };
}

async function getOtherWorks(params) {
    var p = params || {};
    var credits = await fetchCredits(p.personId, p.language);
    var recommended = await fetchRecommendations(p.personId);

    var list = credits.crew.filter(i => !(i.job && i.job.toLowerCase().includes("director")));
    list = filterByType(list, p.type);
    list = sortResults(list, p.sort_by);

    return {
        results: formatOutput(list),
        recommendedActors: recommended
    };
}
