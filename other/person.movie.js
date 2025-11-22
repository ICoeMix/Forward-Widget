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
// TMDB 类型缓存
// -----------------------------
let tmdbGenresCache = {};
async function initTmdbGenres(language = "zh-CN") {
    if (tmdbGenresCache.movie && tmdbGenresCache.tv) return;
    try {
        const [movieGenres, tvGenres] = await Promise.all([
            Widget.tmdb.get("genre/movie/list", { params: { language } }),
            Widget.tmdb.get("genre/tv/list", { params: { language } })
        ]);
        tmdbGenresCache = {
            movie: movieGenres.genres?.reduce((acc, g) => { acc[g.id] = g.name; return acc; }, {}) || {},
            tv: tvGenres.genres?.reduce((acc, g) => { acc[g.id] = g.name; return acc; }, {}) || {}
        };
    } catch (err) {
        console.error("初始化 TMDB 类型失败", err);
        tmdbGenresCache = { movie: {}, tv: {} };
    }
}

// -----------------------------
// resolvePersonId
// -----------------------------
async function resolvePersonId(personInput, language = "zh-CN") {
    if (!personInput) return null;
    if (!isNaN(personInput)) return personInput;
    try {
        const res = await Widget.tmdb.get("search/person", { params: { query: personInput, language } });
        return res?.results?.[0]?.id || null;
    } catch (err) {
        console.error("resolvePersonId 获取人物ID失败", err);
        return null;
    }
}

// -----------------------------
// 获取作品
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

// -----------------------------
// 数据标准化
// -----------------------------
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
        genreTitle: i.genre_ids.length ? (() => {
            const full = getTmdbGenreTitles(i.genre_ids, i.mediaType);
            const match = full.match(/•(.+)$/);
            return match ? match[1] : full;
        })() : ""
    }));
}

// -----------------------------
// 高性能 AC + 正则过滤器（忽略大小写）
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

function isPlainText(term) { 
    return !/[\*\?\^\$\.\+\|\(\)\[\]\{\}\\]/.test(term); 
}

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
// 核心加载 + 缓存
// -----------------------------
let personWorksCache = {};

async function loadWorks(params) {
    const p = params || {};
    const logger = createLogger(p.logMode || "info");
    const personKey = `${p.personId}_${p.language}_${p.type}_${p.filter||""}`;

    if (personWorksCache[personKey]) return personWorksCache[personKey];

    const [_, personId] = await Promise.all([
        initTmdbGenres(p.language || "zh-CN"),
        resolvePersonId(p.personId, p.language)
    ]);

    if (!personId) { 
        logger.warning("未获取到人物ID"); 
        return []; 
    }

    const credits = await fetchCredits(personId, p.language);
    let merged = [...credits.cast, ...credits.crew].map(normalizeItem);

    if (p.type && p.type !== "all") {
        const now = new Date();
        merged = merged.filter(i => i.releaseDate && ((p.type === "released") ? new Date(i.releaseDate) <= now : new Date(i.releaseDate) > now));
    }

    if (p.filter?.trim()) merged = filterByKeywords(merged, p.filter);

    const finalData = formatOutput(merged, p.logMode);
    personWorksCache[personKey] = finalData;
    return finalData;
}

async function getAllWorks(params) { return loadWorks(params); }
async function getActorWorks(params) {
    const p = params || {};
    const data = (await loadWorks(p)).filter(i => i.characters.length);
    return data;
}
async function getDirectorWorks(params) {
    const p = params || {};
    const data = (await loadWorks(p)).filter(i => i.jobs.some(j => j.toLowerCase().includes("director")));
    return data;
}
async function getOtherWorks(params) {
    const p = params || {};
    const data = (await loadWorks(p)).filter(i => !i.jobs.some(j => j.toLowerCase().includes("director")));
    return data;
}
