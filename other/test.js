// --- 核心配置 ---
const BASE_DATA_URL = "https://raw.githubusercontent.com/opix-maker/Forward/main";
const RECENT_DATA_URL = `${BASE_DATA_URL}/recent_data.json`;

// --- 动态年份生成 ---
const currentYear = new Date().getFullYear();
const startYear = 2025; 
const yearOptions = [];
for (let year = currentYear; year >= 1940; year--) { 
    yearOptions.push({ title: `${year}`, value: `${year}` });
}

var WidgetMetadata = {
    id: "bangumi-tmdb_v3",
    title: "Bangumi 热门榜单",
    description: "获取Bangumi近期热门、每日放送数据，支持榜单筛选。",
    version: "3.0.0",
    author: "ICoeMix(Optimized by ChatGPT) ",
    site: "https://github.com/ICoeMix/Forward-Widget",
    requiredVersion: "0.0.1",
    detailCacheDuration: 6000,
    modules: [
        
        {
            title: "每日放送",
            description: "查看指定范围的放送（数据来自Bangumi API）",
            requiresWebView: false,
            functionName: "fetchDailyCalendarApi",
            cacheDuration: 20000,
            params: [
                {
                    name: "filterType",
                    title: "筛选范围",
                    type: "enumeration",
                    value: "today",
                    enumOptions: [
                        { title: "今日放送", value: "today" },
                        { title: "指定单日", value: "specific_day" },
                        { title: "本周一至四", value: "mon_thu" },
                        { title: "本周五至日", value: "fri_sun" },
                        { title: "整周放送", value: "all_week" }
                    ]
                },
                {
                    name: "specificWeekday",
                    title: "选择星期",
                    type: "enumeration",
                    value: "1",
                    description: "仅当筛选范围为“指定单日”时有效。",
                    enumOptions: [
                        { title: "星期一", value: "1" }, { title: "星期二", value: "2" },
                        { title: "星期三", value: "3" }, { title: "星期四", value: "4" },
                        { title: "星期五", value: "5" }, { title: "星期六", value: "6" },
                        { title: "星期日", value: "7" }
                    ],
                    belongTo: { paramName: "filterType", value: ["specific_day"] }
                },
                {
                    name: "dailySortOrder", title: "排序方式", type: "enumeration",
                    value: "popularity_rat_bgm",
                    description: "对每日放送结果进行排序",
                    enumOptions: [
                        { title: "热度(评分人数)", value: "popularity_rat_bgm" },
                        { title: "评分", value: "score_bgm_desc" },
                        { title: "放送日(更新日期)", value: "airdate_desc" },
                        { title: "默认", value: "default" }
                    ]
                },
                {
                    name: "dailyRegionFilter", title: "地区筛选", type: "enumeration", value: "all",
                    description: "筛选特定地区的放送内容 (主要依赖TMDB数据)",
                    enumOptions: [
                        { title: "全部地区", value: "all" },
                        { title: "日本", value: "JP" },
                        { title: "中国大陆", value: "CN" },
                        { title: "欧美", value: "US_EU" },
                        { title: "其他/未知", value: "OTHER" }
                    ]
                },
                {
                    name: "keywordFilter",
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
                        { title: "以 A 开头，任意字符，B 结尾", value: "^A.*B$" }
                    ],
                    value: ""
                }
            ]
        }
    ]
};

// ... (所有后续函数，如 fetchAndCacheGlobalData, fetchAirtimeRanking 等，保持不变)
// --- 全局数据管理 ---
let globalData = null;
let dataFetchPromise = null;
const archiveFetchPromises = {};

async function fetchAndCacheGlobalData() {
    if (globalData) return globalData;
    if (dataFetchPromise) return await dataFetchPromise;

    dataFetchPromise = (async () => {
        console.log(`[BGM Widget v10.4] 开始获取近期数据...`);
        try {
            const response = await Widget.http.get(RECENT_DATA_URL, { headers: { 'Cache-Control': 'no-cache' } });
            globalData = response.data;
            globalData.dynamic = {};
            console.log(`[BGM Widget v10.4] 近期数据初始化完成。`);
            return globalData;
        } catch (e) {
            console.error("[BGM Widget v10.4] 获取近期数据失败! 将完全回退到动态模式。", e.message);
            globalData = { airtimeRanking: {}, recentHot: {}, dailyCalendar: {}, dynamic: {} };
            return globalData;
        }
    })();

    return await dataFetchPromise;
}

const acCache=new Map(),regexCache=new Map(),filterUnitCache=new Map(); 
const normalizeTitleForMatch=s=>!s?"":s.replace(/[\u200B-\u200D\uFEFF]/g,"").trim().normalize("NFC").toLowerCase(); 
class ACAutomaton{constructor(){this.root={next:Object.create(null),fail:null,output:[]}};insert(word){let n=this.root;for(const c of word){if(!n.next[c])n.next[c]={next:Object.create(null),fail:null,output:[]};n=n.next[c]}n.output.push(word)};build(){const q=[];this.root.fail=this.root;for(const k of Object.keys(this.root.next)){const n=this.root.next[k];n.fail=this.root;q.push(n)}while(q.length){const node=q.shift();for(const ch of Object.keys(node.next)){const child=node.next[ch];let f=node.fail;while(f!==this.root&&!f.next[ch])f=f.fail;child.fail=f.next[ch]||this.root;child.output=child.output.concat(child.fail.output);q.push(child)}}};match(text){const found=new Set();if(!text)return found;let node=this.root;for(const ch of text){while(node!==this.root&&!node.next[ch])node=node.fail;node=node.next[ch]||this.root;node.output.forEach(w=>found.add(w))}return found}} 
const isPlainText=term=>!/[\*\?\^\$\.\+\|\(\)\[\]\{\}\\]/.test(term); 
const getRegex=term=>regexCache.has(term)?regexCache.get(term):(regexCache.set(term,(()=>{try{return new RegExp(term,"i")}catch(e){return null}})()),regexCache.get(term)); 
const buildFilterUnit=filterStr=>{if(!filterStr||!filterStr.trim())return null;if(filterUnitCache.has(filterStr))return filterUnitCache.get(filterStr);const terms=filterStr.split(/\s*\|\|\s*/).map(t=>t.trim()).filter(Boolean),plainTerms=[],regexTerms=[];for(const t of terms)(isPlainText(t)?plainTerms:regexTerms).push(t);let ac=null;if(plainTerms.length){const key=plainTerms.slice().sort().join("\u0001");if(acCache.has(key))ac=acCache.get(key);else{ac=new ACAutomaton();plainTerms.forEach(p=>ac.insert(p.toLowerCase()));ac.build();acCache.set(key,ac)}}const unit={ac,regexTerms};filterUnitCache.set(filterStr,unit);return unit}; 
const filterByKeywords=(list,filterStr)=>{if(!filterStr||!filterStr.trim())return list;if(!Array.isArray(list)||!list.length)return list;const unit=buildFilterUnit(filterStr);if(!unit)return list;const {ac,regexTerms}=unit;return list.filter(item=>{if(!item._normalizedTitle)item._normalizedTitle=normalizeTitleForMatch(item.title||"");const title=item._normalizedTitle;if(ac&&ac.match(title).size)return false;for(const r of regexTerms){const re=getRegex(r);if(re&&re.test(title))return false}return true})};

/* ==================== 优化后的 fetchDailyCalendarApi ==================== */
async function fetchDailyCalendarApi(params = {}) {
    await fetchAndCacheGlobalData();

    let items = globalData.dailyCalendar?.all_week || [];
    if (!items.length && !archiveFetchPromises['daily']) {
        console.log("[BGM Widget vOptimized] 每日放送无预构建数据，尝试动态获取...");
        archiveFetchPromises['daily'] = (async () => {
            const dynamicItems = await DynamicDataProcessor.processDailyCalendar();
            if (!globalData.dailyCalendar) globalData.dailyCalendar = {};
            globalData.dailyCalendar.all_week = dynamicItems;
        })();
    }
    if (archiveFetchPromises['daily']) await archiveFetchPromises['daily'];

    items = globalData.dailyCalendar?.all_week || [];

    const { filterType = "today", specificWeekday = "1", dailySortOrder = "popularity_rat_bgm", dailyRegionFilter = "all", keywordFilter = "" } = params;

    const JS_DAY_TO_BGM_API_ID = {0:7,1:1,2:2,3:3,4:4,5:5,6:6};
    const REGION_FILTER_US_EU_COUNTRIES = ["US","GB","FR","DE","CA","AU","ES","IT"];

    let filteredByDay = [];
    if (filterType === "all_week") filteredByDay = items;
    else {
        const today = new Date();
        const currentJsDay = today.getDay();
        const targetBgmIds = new Set();
        switch (filterType) {
            case "today": targetBgmIds.add(JS_DAY_TO_BGM_API_ID[currentJsDay]); break;
            case "specific_day": targetBgmIds.add(parseInt(specificWeekday,10)); break;
            case "mon_thu": [1,2,3,4].forEach(id=>targetBgmIds.add(id)); break;
            case "fri_sun": [5,6,7].forEach(id=>targetBgmIds.add(id)); break;
        }
        filteredByDay = items.filter(item => item.bgm_weekday_id && targetBgmIds.has(item.bgm_weekday_id));
    }

    let filteredByRegion = filteredByDay.filter(item => {
        if (dailyRegionFilter === "all") return true;
        if (item.type !== "tmdb" || !item.tmdb_id) return dailyRegionFilter === "OTHER";
        const countries = item.tmdb_origin_countries || [];
        if (!countries.length) return dailyRegionFilter === "OTHER";
        if (dailyRegionFilter === "JP") return countries.includes("JP");
        if (dailyRegionFilter === "CN") return countries.includes("CN");
        if (dailyRegionFilter === "US_EU") return countries.some(c => REGION_FILTER_US_EU_COUNTRIES.includes(c));
        if (dailyRegionFilter === "OTHER") return !countries.includes("JP") && !countries.includes("CN") && !countries.some(c=>REGION_FILTER_US_EU_COUNTRIES.includes(c));
        return false;
    });

    let sortedResults = [...filteredByRegion];
    if (dailySortOrder !== "default") {
        sortedResults.sort((a,b)=>{
            if (dailySortOrder==="popularity_rat_bgm") return (b.bgm_rating_total||0)-(a.bgm_rating_total||0);
            if (dailySortOrder==="score_bgm_desc") return (b.bgm_score||0)-(a.bgm_score||0);
            if (dailySortOrder==="airdate_desc"){
                const dateA=a.releaseDate||0,dateB=b.releaseDate||0;
                return new Date(dateB).getTime()-new Date(dateA).getTime();
            }
            return 0;
        });
    }

    const finalResults = filterByKeywords(sortedResults, keywordFilter);

    try {
        await DynamicDataProcessor.enrichWithTmdbAndGenres(finalResults);
    } catch(e) {
        console.error('[BGM Widget] enrichWithTmdbAndGenres error', e);
    }

    console.log('[DEBUG] finalResults after TMDB enrichment:', finalResults);
    return finalResults;
}

const DynamicDataProcessor = (() => {

    const TMDB_GENRES_STATIC = {
        16: "动画",
        35: "喜剧",
        80: "犯罪",
        18: "剧情",
        10751: "家庭",
        10759: "动作与冒险",
        10762: "儿童",
        9648: "悬疑",
        10763: "新闻",
        10764: "真人秀",
        10765: "科幻与奇幻",
        10766: "肥皂剧",
        10767: "脱口秀",
        10768: "战争与政治",
        37: "西部",
        99: "纪录片",
        878: "科幻",
        28: "动作"
    };

    class Processor {
        static BGM_BASE_URL = "https://bgm.tv";
        static TMDB_ANIMATION_GENRE_ID = 16;
        static MAX_CONCURRENT_DETAILS_FETCH = 8;
        static tmdbCache = new Map();

        static async searchTmdb(originalTitle, chineseTitle, year) {
            const cacheKey = `${originalTitle||''}-${chineseTitle||''}-${year||''}`;
            if (Processor.tmdbCache.has(cacheKey)) return Processor.tmdbCache.get(cacheKey);

            let bestMatch = null;
            let maxScore = -1;
            const searchMediaType = 'tv';
            const query = chineseTitle || originalTitle;
            try {
                const response = await Widget.tmdb.get(`/search/${searchMediaType}`, { 
                    params: { query, language: "zh-CN", include_adult: false, year } 
                });
                const results = response?.results || [];
                for (const result of results) {
                    if (!(result.genre_ids && result.genre_ids.includes(Processor.TMDB_ANIMATION_GENRE_ID))) continue;
                    const score = Processor.scoreTmdbResult(result, query, year);
                    if (score > maxScore) {
                        maxScore = score;
                        bestMatch = result;
                    }
                }
            } catch(err){
                console.error('[TMDB] search error', err);
            }
            Processor.tmdbCache.set(cacheKey, bestMatch);
            console.log('[TMDB] search result for', query, bestMatch);
            return bestMatch;
        }

        static scoreTmdbResult(result, query, validYear){
            let score = 0;
            const resTitle = (result.title || result.name || '').toLowerCase().trim();
            const queryNorm = (query||'').toLowerCase().trim();
            if(resTitle===queryNorm) score+=15;
            else if(resTitle.includes(queryNorm)) score+=7;
            if(validYear){
                const resDate = result.release_date || result.first_air_date;
                if(resDate && resDate.startsWith(validYear)) score+=6;
            }
            score += Math.log10((result.popularity||0)+1)*2.2;
            return score;
        }

        static async enrichWithTmdbAndGenres(items){
            if(!items.length) return;

            for(let i=0;i<items.length;i+=Processor.MAX_CONCURRENT_DETAILS_FETCH){
                const batch = items.slice(i,i+Processor.MAX_CONCURRENT_DETAILS_FETCH);
                const promises = batch.map(async item=>{
                    if(item.type!=='link') return item;
                    let tmdbResult = null;
                    try {
                        tmdbResult = await Processor.searchTmdb(item.title,null,item.releaseDate?.substring(0,4));
                    } catch(e){
                        console.error('[TMDB] searchTmdb failed for', item.title, e);
                    }
                    console.log('[TMDB] enriching item:', item.title, tmdbResult);
                    if(tmdbResult){
                        item.id = String(tmdbResult.id);
                        item.type = 'tmdb';
                        item.title = tmdbResult.name || tmdbResult.title || item.title;
                        item.posterPath = tmdbResult.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}` : item.posterPath;
                        item.releaseDate = tmdbResult.first_air_date || tmdbResult.release_date || item.releaseDate;
                        item.rating = tmdbResult.vote_average?.toFixed(1) || item.rating;
                        item.description = tmdbResult.overview || item.description;
                        item.link = null;
                        item.tmdb_id = String(tmdbResult.id);
                        item.tmdb_origin_countries = tmdbResult.origin_country || [];
                        item.tmdb_genres = (tmdbResult.genre_ids||[]).map(id => TMDB_GENRES_STATIC[id]).filter(Boolean);
                        console.log('[TMDB] enriched genres:', item.tmdb_genres);
                    }
                    return item;
                });
                await Promise.all(promises);
            }
        }

        static async processBangumiPage(url, category) {
            try {
                const listHtmlResp = await Widget.http.get(url);
                const pendingItems = Processor.parseBangumiListItems(listHtmlResp.data);
                const enrichedItems = [];
                for (let i = 0; i < pendingItems.length; i += Processor.MAX_CONCURRENT_DETAILS_FETCH) {
                    const batch = pendingItems.slice(i, i + Processor.MAX_CONCURRENT_DETAILS_FETCH);
                    const detailsBatch = await Promise.all(batch.map(item => Processor.fetchItemDetails(item, category)));
                    enrichedItems.push(...detailsBatch);
                }
                await Processor.enrichWithTmdbAndGenres(enrichedItems);
                return enrichedItems;
            } catch (err) {
                console.error(`[BGM Widget] processBangumiPage error: ${err.message}`);
                return [];
            }
        }

        static async processDailyCalendar() {
            try {
                const apiResponse = await Widget.http.get("https://api.bgm.tv/calendar");
                const allItems = [];
                apiResponse.data.forEach(dayData => {
                    if (dayData.items) {
                        dayData.items.forEach(item => {
                            item.bgm_weekday_id = dayData.weekday?.id;
                            allItems.push(item);
                        });
                    }
                });
                const baseItems = allItems.map(item => ({
                    id: String(item.id), type: "link", title: item.name_cn || item.name,
                    posterPath: item.images?.large?.startsWith('//') ? 'https:' + item.images.large : item.images?.large,
                    releaseDate: item.air_date, mediaType: 'anime', rating: item.rating?.score?.toFixed(1) || "N/A",
                    description: `[${item.weekday?.cn || ''}] ${item.summary || ''}`.trim(),
                    link: item.url, bgm_id: String(item.id), bgm_score: item.rating?.score || 0,
                    bgm_rating_total: item.rating?.total || 0, bgm_weekday_id: item.bgm_weekday_id
                }));
                await Processor.enrichWithTmdbAndGenres(baseItems);
                return baseItems;
            } catch (err) {
                console.error(`[BGM Widget] processDailyCalendar error: ${err.message}`);
                return [];
            }
        }
    }

    return {
        searchTmdb: Processor.searchTmdb.bind(Processor),
        enrichWithTmdbAndGenres: Processor.enrichWithTmdbAndGenres.bind(Processor),
        processBangumiPage: Processor.processBangumiPage.bind(Processor),
        processDailyCalendar: Processor.processDailyCalendar.bind(Processor)
    };
})();


