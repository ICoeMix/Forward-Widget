// -----------------------------
// Widget Metadata
// -----------------------------
WidgetMetadata = {
    id: "tmdb.person.movie",
    title: "TMDB人物影视作品",
    version: "2.2.8",
    requiredVersion: "0.0.1",
    description: "获取 TMDB 人物作品数据（高级高性能关键词过滤：AC 自动机 + RegExp + 逻辑表达式）",
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
        description: "过滤标题中包含指定关键词，支持 AND/OR/NOT/通配符/嵌套）",
        placeholders: [
            { title: "关键词（过滤标题中包含指定关键词）", value: "" },
            { title: "AND组合（标题同时包含 A 和 B）", value: "A&&B" },
            { title: "OR组合（标题包含 A 或 B）", value: "A||B" },
            { title: "排除组合（包含 A，但不包含 X）", value: "!X&&A" },
            { title: "复杂组合（“A和B同时出现 或 C出现”且不包含 X）", value: "(A&&B)||C&&!X" },
            { title: "嵌套组合（可任意嵌套括号，支持通配符*和?）", value: "((A||B)&&C)||(!X&&!Y)" },
            { title: "通配符匹配（A开头，任意字符，B结尾）", value: "^A*B$" },
            { title: "通配符任意位置（标题包含 A，中间任意字符，后面包含 B）", value: "*A*B*" }
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
        if (sortBy === "release_date.desc")
            return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        return 0;
    });
}

// -----------------------------
// 高级关键词过滤器（AC 自动机 + 正则混合 + 逻辑表达式）
// -----------------------------
// 缓存容器
const filterCache = new Map();         // 缓存 filterStr -> unit
const termRegexCache = new Map();      // 缓存 term -> RegExp
const acCache = new Map();             // 缓存 literal keywords -> AC automaton

// 工具：清理并规范化标题（一次性）
function normalizeTitleForMatch(s) {
    if (!s) return "";
    // 去除前后空白，去掉零宽字符，NFC 规范化，保留原大小写（中文无需 lower）
    return s.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().normalize('NFC');
}

// --- Aho-Corasick 自动机实现（字面词多模式最快） ---
class ACAutomaton {
    constructor() {
        this.root = { next: Object.create(null), fail: null, output: [] };
    }
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
                if (f.next[ch]) child.fail = f.next[ch]; else child.fail = this.root;
                child.output = child.output.concat(child.fail.output);
                q.push(child);
            }
        }
    }
    // 返回 Set 已命中的字面词
    match(text) {
        const found = new Set();
        if (!text) return found;
        let node = this.root;
        for (const ch of text) {
            while (node !== this.root && !node.next[ch]) node = node.fail;
            node = node.next[ch] || this.root;
            if (node.output.length) for (const w of node.output) found.add(w);
        }
        return found;
    }
}

// 判断 term 是否需要用正则（含通配符 * ? 或锚点 ^ $ 或其他特殊）
function termNeedsRegex(term) {
    if (!term) return false;
    // 如果含有通配符或显式锚点或正则分隔符，视为 regex
    return /[\*\?\^\$\\\/\.\+\|\(\)\[\]\{\}]/.test(term);
}

// 生成/获取 term 的 RegExp（并缓存）
function getOrCreateRegexForTerm(term) {
    if (termRegexCache.has(term)) return termRegexCache.get(term);
    // 处理：将用户通配符语义转为正则
    // 先转义所有正则敏感字符，再把通配符恢复
    let s = term.replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&");
    // 恢复通配符：\* -> .*  , \? -> .
    s = s.replace(/\\\*/g, ".*").replace(/\\\?/g, ".");
    // 将用户可能写的 ^ 或 $ 保留（它们已经被转义，上面转义会把 ^、$ 转义成 \^, \$; 恢复）
    s = s.replace(/\\\^/g, "^").replace(/\\\$/g, "$");
    const re = new RegExp(s, "i");
    termRegexCache.set(term, re);
    return re;
}

// 解析表达式为树（支持 && || ! 与括号）
function parseExprToTree(expr) {
    expr = (expr || "").trim();
    if (!expr) return null;

    // strip outer parentheses if they match exactly
    while (expr.startsWith('(') && expr.endsWith(')')) {
        let depth = 0, ok = true;
        for (let i = 0; i < expr.length; i++) {
            const ch = expr[i];
            if (ch === '(') depth++;
            else if (ch === ')') {
                depth--;
                if (depth === 0 && i < expr.length - 1) { ok = false; break; }
            }
        }
        if (!ok) break;
        expr = expr.slice(1, -1).trim();
    }

    // split OR at top level
    let depth = 0;
    for (let i = 0; i < expr.length; i++) {
        const a = expr[i], b = expr[i+1];
        if (a === '(') depth++;
        else if (a === ')') depth--;
        else if (a === '|' && b === '|' && depth === 0) {
            return { type: 'OR', left: parseExprToTree(expr.slice(0,i)), right: parseExprToTree(expr.slice(i+2)) };
        }
    }

    // split AND at top level
    depth = 0;
    for (let i = 0; i < expr.length; i++) {
        const a = expr[i], b = expr[i+1];
        if (a === '(') depth++;
        else if (a === ')') depth--;
        else if (a === '&' && b === '&' && depth === 0) {
            return { type: 'AND', left: parseExprToTree(expr.slice(0,i)), right: parseExprToTree(expr.slice(i+2)) };
        }
    }

    // NOT
    if (expr.startsWith('!')) return { type: 'NOT', child: parseExprToTree(expr.slice(1)) };

    // TERM (literal token), keep original token
    return { type: 'TERM', value: expr };
}

// 收集表达式树中所有 TERM（返回 Set）
function collectTermsFromTree(node, out = new Set()) {
    if (!node) return out;
    if (node.type === 'TERM') {
        const v = (node.value || "").trim();
        if (v) out.add(v);
        return out;
    }
    if (node.type === 'NOT') collectTermsFromTree(node.child, out);
    if (node.type === 'AND' || node.type === 'OR') {
        collectTermsFromTree(node.left, out);
        collectTermsFromTree(node.right, out);
    }
    return out;
}

// 构建 filter 执行单元（缓存）
// unit = { tree, ac:AC|null, literalSet:Set, regexList: [{term,regex}] }
function buildFilterUnit(filterStr) {
    if (!filterStr || !filterStr.trim()) return null;
    if (filterCache.has(filterStr)) return filterCache.get(filterStr);

    const tree = parseExprToTree(filterStr);
    const termSet = collectTermsFromTree(tree);
    const literals = [];
    const regexList = [];

    for (const t of termSet) {
        if (termNeedsRegex(t)) {
            regexList.push({ term: t, regex: getOrCreateRegexForTerm(t) });
        } else {
            literals.push(t);
        }
    }

    let ac = null;
    if (literals.length) {
        // cache by sorted literal key to reuse same automaton
        const key = literals.slice().sort().join("\u0001");
        if (acCache.has(key)) ac = acCache.get(key);
        else {
            ac = new ACAutomaton();
            for (const lit of literals) ac.insert(lit);
            ac.build();
            acCache.set(key, ac);
        }
    }

    const unit = { tree, ac, literalSet: new Set(literals), regexList };
    filterCache.set(filterStr, unit);
    return unit;
}

// 评估树：使用 foundLiterals Set 与 regexMatchCache（带 title）进行短路评估
function evalTreeWithMatches(node, foundLiteralsSet, regexMatchCache) {
    if (!node) return true;
    switch (node.type) {
        case 'TERM': {
            const v = (node.value || "").trim();
            if (!v) return true;
            // literal hit?
            if (foundLiteralsSet && foundLiteralsSet.has(v)) return true;
            // regex check cache
            if (regexMatchCache.hasOwnProperty(v)) return regexMatchCache[v];
            // else compute via regex (if compiled), otherwise false
            const re = getOrCreateRegexForTerm(v);
            const res = re.test(regexMatchCache.__title);
            regexMatchCache[v] = res;
            return res;
        }
        case 'NOT':
            return !evalTreeWithMatches(node.child, foundLiteralsSet, regexMatchCache);
        case 'AND':
            // short-circuit left false
            if (!evalTreeWithMatches(node.left, foundLiteralsSet, regexMatchCache)) return false;
            return evalTreeWithMatches(node.right, foundLiteralsSet, regexMatchCache);
        case 'OR':
            // short-circuit left true
            if (evalTreeWithMatches(node.left, foundLiteralsSet, regexMatchCache)) return true;
            return evalTreeWithMatches(node.right, foundLiteralsSet, regexMatchCache);
    }
    return false;
}

// 主过滤函数：使用 unit（AC + regexList + tree），并行快速判断
function filterByKeywords(list, filterStr) {
    if (!filterStr || !filterStr.trim()) return list;
    if (!Array.isArray(list) || list.length === 0) return list;

    const unit = buildFilterUnit(filterStr);
    if (!unit) return list;
    const { tree, ac, literalSet, regexList } = unit;
    const hasAC = !!ac;
    const hasRegex = regexList.length > 0;

    // For each item, ensure title normalized once
    return list.filter(item => {
        if (!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title || "");
        const title = item._normalizedTitle;

        // quick path: if no tree (shouldn't happen) accept
        if (!tree) return true;

        // AC match to get literal hits (fast)
        let foundLiterals = new Set();
        if (hasAC) foundLiterals = ac.match(title);

        // regexMatchCache stores title under __title for getOrCreateRegexForTerm to use
        const regexMatchCache = { __title: title };

        // eval tree using foundLiterals and regex cache (with short-circuit)
        return evalTreeWithMatches(tree, foundLiterals, regexMatchCache);
    });
}

// -----------------------------
// 输出格式化
// -----------------------------
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

    // 预处理标题一次（消除零宽字符、trim、NFC）
    merged.forEach(item => { if (!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title || ""); });

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
    // preprocess titles for sublists too
    list.forEach(item => { if (!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title || ""); });
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
    list.forEach(item => { if (!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title || ""); });
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
    list.forEach(item => { if (!item._normalizedTitle) item._normalizedTitle = normalizeTitleForMatch(item.title || ""); });
    list = filterByType(list, p.type);
    list = sortResults(list, p.sort_by);
    list = filterByKeywords(list, p.filter);
    return formatOutput(list);
}
