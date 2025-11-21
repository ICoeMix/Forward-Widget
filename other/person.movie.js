// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "tmdb.person.movie",
    title: "TMDB人物影视作品",
    version: "2.3.1",
    requiredVersion: "0.0.1",
    description: "获取 TMDB 人物作品数据（高性能关键词排除：AC 自动机 + 完全正则 + 忽略大小写）",
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
            { title: "吴京", value: "78871" }
        ]
    },
    {
        name: "language",
        title: "语言",
        type: "language",
        value: "zh-CN",
        placeholders: [
            { title: "中文", value: "zh-CN" },
            { title: "英文", value: "en-US" }
        ]
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
            { title: "关键词过滤", value: " " },
            { title: "完全匹配 A", value: "^A$" },
            { title: "以 A 开头", value: "^A.*" },
            { title: "以 B 结尾", value: ".*B$" },
            { title: "包含 A 或 B", value: "A|B" },
            { title: "包含 A 和 B", value: "^(?=.*A)(?=.*B).*$" },
            { title: "不包含 A 但包含 B", value: "^(?:(?!A).)*B.*$" },
            { title: "以 A 开头，任意字符，B 结尾", value: "^A.*B$" },
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

WidgetMetadata.modules.forEach(m => m.params = JSON.parse(JSON.stringify(Params)));

// -----------------------------
// TMDB 数据获取及处理函数
// -----------------------------
async function fetchCredits(personId, language) {
    try {
        const response = await Widget.tmdb.get(`person/${personId}/combined_credits`, { params: { language } });
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
// 高性能 AC + 完全正则过滤器（忽略大小写）
// -----------------------------
const acCache = new Map();
const regexCache = new Map();
const filterUnitCache = new Map();

function normalizeTitleForMatch(s) {
    if (!s) return "";
    return s.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().normalize('NFC').toLowerCase();
}

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
            node.output.forEach(w => found.add(w));
        }
        return found;
    }
}

function isPlainText(term) { return !/[\*\?\^\$\.\+\|\(\)\[\]\{\}\\]/.test(term); }

function getRegex(term) {
    if (regexCache.has(term)) return regexCache.get(term);
    let re = null;
    try { re = new RegExp(term, 'i'); } catch(e) { re = null; }
    regexCache.set(term, re);
    return re;
}

function buildFilterUnit(filterStr) {
    if (!filterStr || !filterStr.trim()) return null;
    if (filterUnitCache.has(filterStr)) return filterUnitCache.get(filterStr);

    const terms = filterStr.split(/\s*\|\|\s*/).map(t => t.trim()).filter(Boolean);
    const plainTerms = [];
    const regexTerms = [];

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

function filterByKeywords(list, filterStr) {
    if (!filterStr || !filterStr.trim()) return list;
    if (!Array.isArray(list) || list.length === 0) return list;

    const unit = buildFilterUnit(filterStr);
    if (!unit) return list;

    const { ac, regexTerms } = unit;

    return list.filter(item => {
        if (!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title || "");
        const title = item._normalizedTitle;

        if (ac && ac.match(title).size) return false;
        for (const r of regexTerms) {
            const re = getRegex(r);
            if (re && re.test(title)) return false;
        }
        return true;
    });
}

// -----------------------------
// 输出格式化
// -----------------------------
function formatOutput(list) {
    return list.map(i=>({
        id:i.id,
        type:"tmdb",
        title:i.title,
        description:i.overview,
        releaseDate:i.releaseDate,
        rating:i.rating,
        popularity:i.popularity,
        posterPath:i.posterPath,
        backdropPath:i.backdropPath,
        mediaType:i.mediaType,
        jobs:i.jobs,
        characters:i.characters
    }));
}

// -----------------------------
// 名字搜索 → 返回 ID
// -----------------------------
async function getPersonIdByName(name, language="zh-CN") {
    if(!name) return null;
    try {
        const response = await Widget.tmdb.get("search/person",{params:{query:name,language}});
        return response.results && response.results.length>0?response.results[0].id:null;
    } catch(err) {
        console.error("TMDB 搜索人物失败:",err);
        return null;
    }
}

async function resolvePersonId(input, language){
    if(!input) return null;
    if(!isNaN(Number(input))) return Number(input);
    return await getPersonIdByName(input, language);
}

// -----------------------------
// 核心模块方法
// -----------------------------
async function loadWorks(params){
    const p = params||{};
    const personId = await resolvePersonId(p.personId,p.language);
    if(!personId) return [];
    let credits = await fetchCredits(personId,p.language);
    let merged = mergeCredits(credits.cast,credits.crew);
    merged.forEach(item=>{ if(!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title||""); });
    merged = filterByType(merged,p.type);
    merged = sortResults(merged,p.sort_by);
    merged = filterByKeywords(merged,p.filter);
    return formatOutput(merged);
}

async function getAllWorks(params){ return loadWorks(params); }
async function getActorWorks(params){
    const p = params||{};
    const personId = await resolvePersonId(p.personId,p.language);
    if(!personId) return [];
    let list = (await fetchCredits(personId,p.language)).cast;
    list.forEach(item=>{ if(!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title||""); });
    list = filterByType(list,p.type);
    list = sortResults(list,p.sort_by);
    list = filterByKeywords(list,p.filter);
    return formatOutput(list);
}
async function getDirectorWorks(params){
    const p = params||{};
    const personId = await resolvePersonId(p.personId,p.language);
    if(!personId) return [];
    let list = (await fetchCredits(personId,p.language)).crew.filter(i=>i.job && i.job.toLowerCase().includes("director"));
    list.forEach(item=>{ if(!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title||""); });
    list = filterByType(list,p.type);
    list = sortResults(list,p.sort_by);
    list = filterByKeywords(list,p.filter);
    return formatOutput(list);
}
async function getOtherWorks(params){
    const p = params||{};
    const personId = await resolvePersonId(p.personId,p.language);
    if(!personId) return [];
    let list = (await fetchCredits(personId,p.language)).crew.filter(i=>!(i.job && i.job.toLowerCase().includes("director")));
    list.forEach(item=>{ if(!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title||""); });
    list = filterByType(list,p.type);
    list = sortResults(list,p.sort_by);
    list = filterByKeywords(list,p.filter);
    return formatOutput(list);
}
