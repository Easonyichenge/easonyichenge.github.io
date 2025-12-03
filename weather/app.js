/**
 * Taiwan Weather App - Apple Design with Leaflet Map
 */

// ========================================
// 設定
// ========================================
const CONFIG = {
    API_BASE: 'https://opendata.cwa.gov.tw/api/v1/rest/datastore',
    API_KEY: 'CWA-B5914331-BEC0-45B6-84B8-7A5A415C2B7D', // 中央氣象署 API 授權碼
    ENDPOINTS: {
        FORECAST: 'F-C0032-001',           // 36小時天氣預報
        FORECAST_WEEK: 'F-D0047-091',      // 一週天氣預報 (全台各縣市)
        FORECAST_TOWN: 'F-D0047-093',      // 鄉鎮市區天氣預報
        WEATHER_STATION: 'O-A0001-001',
        RAIN_STATION: 'O-A0002-001',
        UV_INDEX: 'O-A0005-001',            // 紫外線指數
        EARTHQUAKE: 'E-A0015-001',         // 顯著有感地震
        EARTHQUAKE_SMALL: 'E-A0016-001',   // 小區域有感地震
        WARNING: 'W-C0033-002',  // 使用詳細版警特報（包含 contentText）
        TYPHOON: 'W-C0034-005',
        SUNRISE: 'A-B0062-001',
        MOONRISE: 'A-B0063-001'
    }
};

// 各縣市鄉鎮區域天氣預報 API 對照表
const CITY_FORECAST_ENDPOINTS = {
    '宜蘭縣': 'F-D0047-001',
    '桃園市': 'F-D0047-005',
    '新竹縣': 'F-D0047-009',
    '苗栗縣': 'F-D0047-013',
    '彰化縣': 'F-D0047-017',
    '南投縣': 'F-D0047-021',
    '雲林縣': 'F-D0047-025',
    '嘉義縣': 'F-D0047-029',
    '屏東縣': 'F-D0047-033',
    '臺東縣': 'F-D0047-037',
    '花蓮縣': 'F-D0047-041',
    '澎湖縣': 'F-D0047-045',
    '基隆市': 'F-D0047-049',
    '新竹市': 'F-D0047-053',
    '嘉義市': 'F-D0047-057',
    '臺北市': 'F-D0047-061',
    '高雄市': 'F-D0047-065',
    '新北市': 'F-D0047-069',
    '臺中市': 'F-D0047-073',
    '臺南市': 'F-D0047-077',
    '連江縣': 'F-D0047-081',
    '金門縣': 'F-D0047-085'
};

const CITIES = [
    '臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市',
    '基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣',
    '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
    '臺東縣', '澎湖縣', '金門縣', '連江縣'
];

// 城市由北到南排序（依緯度）
const CITIES_NORTH_TO_SOUTH = [
    '基隆市',    // 25.13
    '臺北市',    // 25.03
    '新北市',    // 25.02
    '桃園市',    // 24.99
    '新竹縣',    // 24.84
    '新竹市',    // 24.81
    '宜蘭縣',    // 24.70
    '苗栗縣',    // 24.56
    '臺中市',    // 24.15
    '彰化縣',    // 24.05
    '花蓮縣',    // 23.99
    '南投縣',    // 23.96
    '雲林縣',    // 23.71
    '嘉義市',    // 23.48
    '嘉義縣',    // 23.45
    '臺南市',    // 23.00
    '臺東縣',    // 22.76
    '高雄市',    // 22.63
    '屏東縣',    // 22.55
    '澎湖縣',    // 23.57 (離島)
    '金門縣',    // 24.45 (離島)
    '連江縣'     // 26.16 (離島)
];

// 城市座標 (經緯度)
// CITY_COORDS moved to townships.js

// UV 測站名稱對照表
const UV_STATION_NAMES = {
    '467420': '臺北',
    '467280': '嘉義',
    '467290': '花蓮',
    '467350': '臺南',
    '467270': '澎湖',
    '467440': '高雄',
    '467490': '臺中',
    '467530': '日月潭',
    '467480': '臺東',
    '467540': '阿里山',
    '467410': '玉山',
    '467550': '大武',
    '467571': '成功',
    '467590': '恆春',
    '467610': '蘭嶼',
    '467620': '金門',
    '467650': '新竹',
    '467660': '彭佳嶼',
    '467770': '梧棲',
    '467080': '宜蘭',
    '467110': '淡水',
    '467300': '馬祖',
    '466920': '鞍部',
    '466910': '竹子湖',
    '466990': '永和',
    'C0A520': '基隆',
    'C0R170': '屏東',
    '467990': '板橋',
    'C0Z100': '東吉島',
    '467060': '蘇澳'
};

// UV 測站所屬縣市對照表
const UV_STATION_CITY = {
    '467420': '臺北市',
    '467280': '嘉義市',
    '467290': '花蓮縣',
    '467350': '臺南市',
    '467270': '澎湖縣',
    '467440': '高雄市',
    '467490': '臺中市',
    '467530': '南投縣',  // 日月潭
    '467480': '臺東縣',
    '467540': '嘉義縣',  // 阿里山
    '467410': '南投縣',  // 玉山
    '467550': '臺東縣',  // 大武
    '467571': '臺東縣',  // 成功
    '467590': '屏東縣',  // 恆春
    '467610': '臺東縣',  // 蘭嶼
    '467620': '金門縣',
    '467650': '新竹市',
    '467660': '基隆市',  // 彭佳嶼
    '467770': '臺中市',  // 梧棲
    '467080': '宜蘭縣',
    '467110': '新北市',  // 淡水
    '467300': '連江縣',  // 馬祖
    '466920': '臺北市',  // 鞍部
    '466910': '臺北市',  // 竹子湖
    '466990': '新北市',  // 永和
    'C0A520': '基隆市',
    'C0R170': '屏東縣',
    '467990': '新北市',  // 板橋
    'C0Z100': '澎湖縣',  // 東吉島
    '467060': '宜蘭縣'   // 蘇澳
};
// ========================================
// SVG Icons
// ========================================
const ICONS = {
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="2">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>`,

    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="#86868b" stroke-width="2">
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
    </svg>`,

    cloudSun: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="2">
        <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M17.66 17.66l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41M17.07 4.93l1.41-1.41"/>
        <circle cx="12" cy="10" r="4"/>
        <path d="M16 18H8a4 4 0 01-.5-7.97" stroke="#86868b"/>
    </svg>`,

    rain: `<svg viewBox="0 0 24 24" fill="none" stroke="#32ade6" stroke-width="2">
        <path d="M16 13v8M8 13v8M12 15v8"/>
        <path d="M20 10.5A4.5 4.5 0 0016.5 6a6 6 0 00-11.5.5A4 4 0 006 15h12a4 4 0 002-8.5z"/>
    </svg>`,

    thunder: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffcc00" stroke-width="2">
        <path d="M19 16.9A5 5 0 0018 7h-1.26a8 8 0 10-11.62 9"/>
        <polyline points="13 11 9 17 15 17 11 23"/>
    </svg>`,

    snow: `<svg viewBox="0 0 24 24" fill="none" stroke="#5ac8fa" stroke-width="2">
        <path d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 16.25"/>
        <path d="M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01"/>
    </svg>`,

    fog: `<svg viewBox="0 0 24 24" fill="none" stroke="#86868b" stroke-width="2">
        <path d="M3 10h18M3 14h18M5 18h14M7 6h10"/>
    </svg>`,

    sunrise: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="2">
        <path d="M17 18a5 5 0 00-10 0"/>
        <line x1="12" y1="2" x2="12" y2="9"/>
        <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
        <line x1="1" y1="18" x2="3" y2="18"/>
        <line x1="21" y1="18" x2="23" y2="18"/>
        <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
        <line x1="23" y1="22" x2="1" y2="22"/>
        <polyline points="8 6 12 2 16 6"/>
    </svg>`,

    sunset: `<svg viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2">
        <path d="M17 18a5 5 0 00-10 0"/>
        <line x1="12" y1="9" x2="12" y2="2"/>
        <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
        <line x1="1" y1="18" x2="3" y2="18"/>
        <line x1="21" y1="18" x2="23" y2="18"/>
        <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
        <line x1="23" y1="22" x2="1" y2="22"/>
        <polyline points="16 6 12 10 8 6"/>
    </svg>`,

    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="#af52de" stroke-width="2">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>`,

    arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2.5">
        <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>`,

    arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="#007aff" stroke-width="2.5">
        <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>`,

    drop: `<svg viewBox="0 0 24 24" fill="none" stroke="#32ade6" stroke-width="2">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
    </svg>`
};

// ========================================
// DOM Elements
// ========================================
const DOM = {
    get tickerContent() { return document.getElementById('tickerContent'); },
    get citySelect() { return document.getElementById('citySelect'); },
    get districtSelect() { return document.getElementById('districtSelect'); },
    get districtSelectBox() { return document.getElementById('districtSelectBox'); },
    get autoLocateBtn() { return document.getElementById('autoLocateBtn'); },
    get refreshBtn() { return document.getElementById('refreshBtn'); },
    get updateTime() { return document.getElementById('updateTime'); },

    get typhoonBanner() { return document.getElementById('typhoonBanner'); },
    get typhoonTitle() { return document.getElementById('typhoonTitle'); },
    get typhoonDesc() { return document.getElementById('typhoonDesc'); },

    get heroWeather() { return document.getElementById('heroWeather'); },
    get statHumidity() { return document.getElementById('statHumidity'); },
    get statWind() { return document.getElementById('statWind'); },
    get statRain() { return document.getElementById('statRain'); },
    get statFeels() { return document.getElementById('statFeels'); },
    get forecastScroll() { return document.getElementById('forecastScroll'); },
    get weekForecastGrid() { return document.getElementById('weekForecastGrid'); },

    get obsGrid() { return document.getElementById('obsGrid'); },
    get obsSearch() { return document.getElementById('obsSearch'); },
    get earthquakeList() { return document.getElementById('earthquakeList'); },
    get warningSection() { return document.getElementById('warningSection'); },
    get warningList() { return document.getElementById('warningList'); },
    get astroCards() { return document.getElementById('astroCards'); },
    get taiwanWeatherList() { return document.getElementById('taiwanWeatherList'); },

    get modalOverlay() { return document.getElementById('modalOverlay'); },
    get modalClose() { return document.getElementById('modalClose'); },
    get modalCancel() { return document.getElementById('modalCancel'); },
    get modalSave() { return document.getElementById('modalSave'); },
    get apiKeyInput() { return document.getElementById('apiKeyInput'); },

    get imageModal() { return document.getElementById('imageModal'); },
    get imageModalClose() { return document.getElementById('imageModalClose'); },
    get modalImage() { return document.getElementById('modalImage'); },

    get satelliteModal() { return document.getElementById('satelliteModal'); },
    get satelliteModalClose() { return document.getElementById('satelliteModalClose'); },
    get satelliteImage() { return document.getElementById('satelliteImage'); },

    get toast() { return document.getElementById('toast'); },
    get loadingOverlay() { return document.getElementById('loadingOverlay'); },

    get tabs() { return document.querySelectorAll('.tab'); }
};

// ========================================
// State
// ========================================
let state = {
    currentCity: '',
    currentDistrict: '',
    currentObsType: 'weather',
    obsSearchQuery: '',
    obsStationsCache: [],
    districtData: null,
    weatherData: null,
    map: null,
    markers: [],
    autoRefreshTimer: null,
    refreshInterval: 300000
};

// ========================================
// 初始化
// ========================================
document.addEventListener('DOMContentLoaded', init);

function init() {
    initCitySelect();
    initMap();
    loadSettings();
    bindEvents();
    initTickerLoop();

    if (getApiKey()) {
        loadAllData();

        // 每次打開應用都自動定位
        autoLocate();
    }
}

// 初始化跑馬燈循環更新
function initTickerLoop() {
    // 使用定時器定期更新跑馬燈數據（每5分鐘）
    // 而不是在每次動畫循環時更新，避免閃爍
    setInterval(() => {
        loadTicker();
    }, 5 * 60 * 1000); // 5分鐘
}

function initCitySelect() {
    const select = DOM.citySelect;
    if (!select) return;

    CITIES.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        select.appendChild(option);
    });
}

function initMap() {
    const mapContainer = document.getElementById('taiwanMap');
    if (!mapContainer) return;

    // 建立 Leaflet 地圖
    state.map = L.map('taiwanMap', {
        center: [23.7, 120.9],
        zoom: 7,
        zoomControl: true,
        attributionControl: false
    });

    // 根據系統主題選擇地圖樣式
    var isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    state.mapTileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd'
    }).addTo(state.map);

    // 監聽系統主題變化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        var newTileUrl = e.matches
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        state.mapTileLayer.setUrl(newTileUrl);
    });
}

function loadSettings() {
    const savedCity = localStorage.getItem('selected_city');
    const savedApiKey = localStorage.getItem('cwa_api_key');

    if (savedCity) {
        state.currentCity = savedCity;
        if (DOM.citySelect) DOM.citySelect.value = savedCity;
    }

    if (savedApiKey && DOM.apiKeyInput) {
        DOM.apiKeyInput.value = savedApiKey;
    }
}

function bindEvents() {
    DOM.citySelect?.addEventListener('change', e => {
        state.currentCity = e.target.value;
        state.currentDistrict = '';
        localStorage.setItem('selected_city', e.target.value);
        loadCityData(); // 使用 loadCityData 而非 loadAllData，避免跑馬燈重跑
    });

    DOM.districtSelect?.addEventListener('change', e => {
        state.currentDistrict = e.target.value;
        if (state.currentDistrict) {
            renderTownshipWeather(state.currentDistrict);
        } else {
            // 如果選回"選擇鄉鎮"，顯示全縣市資訊
            if (state.weatherData && state.currentCity) {
                const locations = state.weatherData.records.location;
                const loc = locations.find(l => l.locationName === state.currentCity);
                if (loc) renderHeroWeather(loc);
            }
        }
    });

    DOM.autoLocateBtn?.addEventListener('click', autoLocate);

    DOM.modalClose?.addEventListener('click', () => closeModal());
    DOM.modalCancel?.addEventListener('click', () => closeModal());
    DOM.modalSave?.addEventListener('click', saveApiKey);
    DOM.modalOverlay?.addEventListener('click', e => {
        if (e.target === DOM.modalOverlay) closeModal();
    });

    DOM.refreshBtn?.addEventListener('click', () => {
        refreshData();
        showToast('重新載入中...');
    });

    DOM.imageModalClose?.addEventListener('click', closeImageModal);
    DOM.imageModal?.addEventListener('click', e => {
        if (e.target === DOM.imageModal) closeImageModal();
    });

    // 衛星雲圖 Modal 事件
    DOM.satelliteModalClose?.addEventListener('click', closeSatelliteModal);
    DOM.satelliteModal?.addEventListener('click', e => {
        if (e.target === DOM.satelliteModal) closeSatelliteModal();
    });

    DOM.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            DOM.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentObsType = tab.dataset.type;
            state.obsSearchQuery = '';
            if (DOM.obsSearch) DOM.obsSearch.value = '';
            loadObservation();
        });
    });

    // 觀測站搜尋
    DOM.obsSearch?.addEventListener('input', e => {
        state.obsSearchQuery = e.target.value.trim().toLowerCase();
        filterAndRenderObs();
    });
}

// ========================================
// API 管理
// ========================================
function getApiKey() {
    // 優先使用設定檔中的 API Key，若無則從 localStorage 讀取
    return CONFIG.API_KEY || localStorage.getItem('cwa_api_key');
}

function saveApiKey() {
    const key = DOM.apiKeyInput?.value?.trim();
    if (!key) {
        showToast('請輸入 API 授權碼');
        return;
    }

    localStorage.setItem('cwa_api_key', key);
    closeModal();
    showToast('API 授權碼已儲存');
    loadAllData();
}

async function apiRequest(endpoint, params = {}) {
    const apiKey = getApiKey();
    if (!apiKey) {
        showToast('請先設定 API 授權碼');
        openModal();
        return null;
    }

    const url = new URL(`${CONFIG.API_BASE}/${endpoint}`);
    url.searchParams.append('Authorization', apiKey);

    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('API Error:', endpoint, err);
        return null;
    }
}

// ========================================
// 資料載入
// ========================================
function loadAllData() {
    setLoading(true);

    Promise.all([
        loadTicker(),
        loadForecast(),
        loadTownshipForecast(), // Ensure township data is loaded
        loadWeekForecast(),
        loadObservation(),
        loadEarthquake(),
        loadWarnings(),
        loadTyphoon(),
        loadAstronomy(),
        loadTaiwanWeather()
    ]).finally(function () {
        setLoading(false);
        updateLastTime();
    });
}

// 重新載入資料（不顯示全螢幕載入畫面）
function refreshData() {
    Promise.all([
        loadTicker(),
        loadForecast(),
        loadWeekForecast(),
        loadObservation(),
        loadEarthquake(),
        loadWarnings(),
        loadTyphoon(),
        loadAstronomy(),
        loadTaiwanWeather()
    ]).finally(() => {
        updateLastTime();
        showToast('資料已更新');
    });
}

// 載入縣市相關資料（不重新載入跑馬燈，避免動畫重置）
function loadCityData() {
    setLoading(true);

    return Promise.all([
        loadForecast(),
        loadTownshipForecast(),
        loadWeekForecast(),
        loadObservation(),
        loadAstronomy(),
        loadTaiwanWeather()
    ]).finally(() => {
        setLoading(false);
        updateLastTime();
    });
}

// ========================================
// 跑馬燈 - 現代標籤式設計
// ========================================
async function loadTicker() {
    // 同時載入天氣預報、警特報和地震資訊
    const [forecastData, warningData, significantEqData, smallEqData] = await Promise.all([
        apiRequest(CONFIG.ENDPOINTS.FORECAST),
        apiRequest(CONFIG.ENDPOINTS.WARNING),
        apiRequest(CONFIG.ENDPOINTS.EARTHQUAKE),
        apiRequest(CONFIG.ENDPOINTS.EARTHQUAKE_SMALL)
    ]);

    const warningDataToUse = warningData; // 真實數據

    // 合併地震資料
    const significantQuakes = significantEqData?.records?.Earthquake || [];
    const smallQuakes = smallEqData?.records?.Earthquake || [];
    const allQuakes = [...significantQuakes, ...smallQuakes].sort((a, b) => {
        const timeA = new Date(a.EarthquakeInfo?.OriginTime || 0);
        const timeB = new Date(b.EarthquakeInfo?.OriginTime || 0);
        return timeB - timeA;
    });

    let items = [];

    // 1. 先加入最新的地震 (僅顯示近 6 小時內)
    if (allQuakes.length > 0) {
        // 只取最新的地震
        const eq = allQuakes[0];
        const info = eq.EarthquakeInfo;
        const time = new Date(info.OriginTime);
        const now = new Date();

        // 計算時間差 (毫秒)
        const diffHours = (now - time) / (1000 * 60 * 60);

        // 只有 6 小時內的地震才顯示
        if (diffHours <= 6) {
            const magnitude = info.EarthquakeMagnitude.MagnitudeValue;
            const location = info.Epicenter.Location;

            // 取得最大震度
            const shakingAreas = eq.Intensity?.ShakingArea || [];
            const rawIntensity = shakingAreas.length > 0
                ? (shakingAreas[0].AreaIntensity || shakingAreas[0].ShakingDegree || '4')
                : '4';
            const maxIntensity = String(rawIntensity).replace('級', '');

            const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;

            const reportImg = eq.ReportImageURI || '';
            const clickHandler = reportImg ? `onclick="showEarthquakeImage('${reportImg}')" style="cursor: pointer;"` : '';

            items.push(`<div class="ticker-item ticker-warning" ${clickHandler}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <span class="ticker-alert-text">地震報告：${timeStr} ${location} 規模 ${magnitude} 最大震度 ${maxIntensity} 級</span>
            </div>`);
        }
    }

    // 2. 再加入警特報（如果有的話）
    if (warningDataToUse?.records?.record?.length) {
        warningDataToUse.records.record.forEach(record => {
            const title = record.datasetInfo?.datasetDescription || '氣象特報';

            // 提取受影響縣市
            const hazards = record.hazardConditions?.hazards?.hazard || [];
            let affectedAreas = [];
            hazards.forEach(h => {
                const locations = h.info?.affectedAreas?.location || [];
                locations.forEach(l => {
                    if (l.locationName && !affectedAreas.includes(l.locationName)) {
                        affectedAreas.push(l.locationName);
                    }
                });
            });

            const locationStr = affectedAreas.length > 0 ? `：${affectedAreas.join('、')}` : '';

            items.push(`<div class="ticker-item ticker-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span class="ticker-alert-text">${title}${locationStr}</span>
            </div>`);
        });
    }

    if (!forecastData?.records?.location) {
        if (DOM.tickerContent && items.length > 0) {
            const tickerHtml = items.join('');
            if (DOM.tickerContent.innerHTML !== tickerHtml) {
                DOM.tickerContent.innerHTML = tickerHtml;
                updateTickerAnimation();
            }
        }
        return;
    }

    const locations = forecastData.records.location;

    // 依照北到南排序
    const sortedLocations = [...locations].sort((a, b) => {
        const indexA = CITIES_NORTH_TO_SOUTH.indexOf(a.locationName);
        const indexB = CITIES_NORTH_TO_SOUTH.indexOf(b.locationName);
        const orderA = indexA === -1 ? 999 : indexA;
        const orderB = indexB === -1 ? 999 : indexB;
        return orderA - orderB;
    });

    // 所有縣市天氣
    sortedLocations.forEach(loc => {
        const els = loc.weatherElement || [];
        const wx = els.find(e => e.elementName === 'Wx');
        const maxT = els.find(e => e.elementName === 'MaxT');
        const minT = els.find(e => e.elementName === 'MinT');
        const pop = els.find(e => e.elementName === 'PoP');

        const weatherDesc = wx?.time?.[0]?.parameter?.parameterName || '';
        const tempMax = maxT?.time?.[0]?.parameter?.parameterName || '-';
        const tempMin = minT?.time?.[0]?.parameter?.parameterName || '-';
        const rainProb = parseInt(pop?.time?.[0]?.parameter?.parameterName || '0');

        // 取得天氣圖示
        const weatherIcon = getWeatherIcon(weatherDesc);

        let itemHtml = `<div class="ticker-item" onclick="handleTickerClick('${loc.locationName}')" style="cursor: pointer">
            <span class="ticker-weather-icon">${weatherIcon}</span>
            <span class="ticker-city">${loc.locationName}</span>
            <span class="ticker-temp">${tempMin}° ~ ${tempMax}°</span>`;

        if (rainProb > 0) {
            itemHtml += `<span class="ticker-rain">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
                </svg>
                ${rainProb}%
            </span>`;
        }

        itemHtml += `</div>`;
        items.push(itemHtml);
    });

    // 無縫循環跑馬燈：複製一份內容，確保間距一致
    const singleContent = items.join('');
    const tickerHtml = singleContent + singleContent;

    if (DOM.tickerContent) {
        // 只有當內容改變時才更新，避免不必要的重繪導致動畫重置
        if (DOM.tickerContent.innerHTML !== tickerHtml) {
            DOM.tickerContent.innerHTML = tickerHtml;
            updateTickerAnimation();
        }
    }
}

// 獲取並顯示特定縣市天氣
async function getWeatherData(city) {
    state.currentCity = city;
    state.currentDistrict = '';
    localStorage.setItem('selected_city', city);

    // 顯示載入中
    setLoading(true);

    try {
        await Promise.all([
            loadForecast(),
            loadTownshipForecast(),
            loadWeekForecast(),
            loadObservation(),
            loadAstronomy(),
            loadTaiwanWeather() // 更新地圖選取狀態
        ]);
        updateLastTime();
    } catch (error) {
        console.error('載入天氣失敗:', error);
        showToast('載入失敗，請稍後再試');
    } finally {
        setLoading(false);
    }
}

// 處理跑馬燈點擊事件
window.handleTickerClick = async (city) => {
    // 更新搜尋框
    if (DOM.searchInput) {
        DOM.searchInput.value = city;
    }
    // 更新下拉選單 (如果存在)
    if (DOM.citySelect) {
        DOM.citySelect.value = city;
    }

    // 獲取並顯示該縣市天氣
    await getWeatherData(city);

    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 處理縣市卡片點擊事件 (與跑馬燈點擊邏輯相同)
window.selectCity = window.handleTickerClick;

// 獨立出動畫更新邏輯
function updateTickerAnimation() {
    if (!DOM.tickerContent) return;

    // 檢查是否已經在循環動畫中
    const currentAnimation = DOM.tickerContent.style.animation;
    const isLooping = currentAnimation && currentAnimation.includes('tickerSlide') && currentAnimation.includes('infinite');

    // 如果已經在循環中，只需要等待下一次自然的循環更新內容
    // 不要打斷正在進行的動畫，避免閃爍
    if (isLooping) {
        return;
    }

    // 首次載入或動畫未運行時，才重新初始化動畫
    DOM.tickerContent.style.animation = 'none';

    // 移除之前的事件監聽器 (如果有)
    const newContent = DOM.tickerContent.cloneNode(true);
    DOM.tickerContent.parentNode.replaceChild(newContent, DOM.tickerContent);
    DOM.tickerContent = newContent;

    // 使用 requestAnimationFrame 確保 DOM 已經更新
    requestAnimationFrame(() => {
        // 強制重繪
        void DOM.tickerContent.offsetHeight;

        const totalWidth = DOM.tickerContent.scrollWidth;
        const oneCycleDistance = totalWidth / 2;
        const viewportWidth = window.innerWidth;

        const speed = 50; // pixels per second

        // 1. 進場動畫時間 (從 100vw 到 0)
        const enterDistance = viewportWidth;
        const enterDuration = enterDistance / speed;

        // 2. 循環動畫時間 (移動一份內容長度)
        const loopDuration = oneCycleDistance / speed;

        // 設定進場動畫
        DOM.tickerContent.style.animation = `tickerEnter ${enterDuration}s linear forwards`;

        // 監聽進場結束，切換到循環動畫
        DOM.tickerContent.addEventListener('animationend', () => {
            DOM.tickerContent.style.animation = `tickerSlide ${loopDuration}s linear infinite`;
        }, { once: true });
    });
}

// ========================================
// 天氣圖示
// ========================================
function getWeatherIcon(desc) {
    if (!desc) return ICONS.sun;
    if (desc.includes('雷')) return ICONS.thunder;
    if (desc.includes('雨')) return ICONS.rain;
    if (desc.includes('雪')) return ICONS.snow;
    if (desc.includes('霧')) return ICONS.fog;
    if (desc.includes('陰')) return ICONS.cloud;
    if (desc.includes('雲')) return ICONS.cloudSun;
    if (desc.includes('晴')) return ICONS.sun;
    return ICONS.sun;
}

// ========================================
// 動態背景 - 根據天氣和時間
// ========================================
function getHeroBackground(weatherDesc) {
    const now = new Date();
    const hour = now.getHours();

    // 判斷是白天還是晚上 (6:00-18:00 為白天)
    const isDaytime = hour >= 6 && hour < 18;

    // 根據天氣和時間選擇背景
    if (weatherDesc.includes('雷')) {
        // 雷雨 - 深灰色
        return 'linear-gradient(135deg, #434343 0%, #000000 100%)';
    } else if (weatherDesc.includes('雨')) {
        // 下雨
        if (isDaytime) {
            return 'linear-gradient(135deg, #536976 0%, #292E49 100%)';
        } else {
            return 'linear-gradient(135deg, #2C3E50 0%, #000000 100%)';
        }
    } else if (weatherDesc.includes('陰')) {
        // 陰天
        if (isDaytime) {
            return 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)';
        } else {
            return 'linear-gradient(135deg, #232526 0%, #414345 100%)';
        }
    } else if (weatherDesc.includes('晴')) {
        // 晴天
        if (isDaytime) {
            return 'linear-gradient(135deg, #4CA1AF 0%, #C4E0E5 100%)';
        } else {
            // 晚上晴天 - 深藍夜空
            return 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)';
        }
    } else if (weatherDesc.includes('雲')) {
        // 多雲
        if (isDaytime) {
            return 'linear-gradient(135deg, #8E9EAB 0%, #EEF2F3 100%)';
        } else {
            return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
        }
    } else {
        // 預設
        if (isDaytime) {
            return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        } else {
            return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
        }
    }
}

// ========================================
// 天氣預報
// ========================================
async function loadForecast() {
    const params = state.currentCity ? { locationName: state.currentCity } : {};
    const data = await apiRequest(CONFIG.ENDPOINTS.FORECAST, params);

    if (!data?.records?.location?.length) return;

    state.weatherData = data;
    const locations = data.records.location;

    if (state.currentCity) {
        const loc = locations.find(l => l.locationName === state.currentCity) || locations[0];
        renderHeroWeather(loc);
    } else {
        DOM.heroWeather.innerHTML = `
            <div class="hero-empty">
                ${ICONS.sun}
                <p>選擇縣市查看天氣</p>
            </div>
        `;
    }

    renderForecastCards(locations);
}

async function loadTownshipForecast() {
    if (!state.currentCity) {
        // if (DOM.districtSelectBox) DOM.districtSelectBox.classList.add('hidden');
        if (DOM.districtSelect) {
            DOM.districtSelect.innerHTML = '<option value="">選擇鄉鎮</option>';
            DOM.districtSelect.disabled = true;
        }
        return;
    }

    const endpoint = CITY_FORECAST_ENDPOINTS[state.currentCity];
    if (!endpoint) return;

    const data = await apiRequest(endpoint);
    if (!data?.records?.Locations?.[0]?.Location) return;

    state.districtData = data.records.Locations[0].Location;

    // Populate district select
    if (DOM.districtSelect) {
        DOM.districtSelect.innerHTML = '<option value="">選擇鄉鎮</option>';
        state.districtData.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc.LocationName;
            option.textContent = loc.LocationName;
            DOM.districtSelect.appendChild(option);
        });
        DOM.districtSelect.disabled = false;
    }

    // if (DOM.districtSelectBox) DOM.districtSelectBox.classList.remove('hidden');
}

async function renderTownshipWeather(districtName) {
    if (!state.districtData) return;

    setLoading(true);

    try {
        const loc = state.districtData.find(l => l.LocationName === districtName);
        if (!loc) return;

        // Pre-fetch real-time stats (including gust) from weather station
        const stationStats = await getStationStats(state.currentCity, loc.LocationName);

        // Race condition check: ensure we are still on the same district
        if (state.currentDistrict !== districtName) return;

        // Normalize data to match renderHeroWeather format
        // For forecast cards, we need to construct a time-series array
        // Township data has 3-hour intervals for Wx, and point data for T

        const wxElement = loc.WeatherElement.find(e => e.ElementName === '天氣現象');
        const tElement = loc.WeatherElement.find(e => e.ElementName === '溫度');
        const popElement = loc.WeatherElement.find(e => e.ElementName === '3小時降雨機率');
        const minTElement = loc.WeatherElement.find(e => e.ElementName === '最低溫度'); // Some datasets have this
        const maxTElement = loc.WeatherElement.find(e => e.ElementName === '最高溫度'); // Some datasets have this

        // Construct 72-hour forecast data
        const forecastTimes = [];
        if (wxElement && wxElement.Time) {
            const now = new Date();
            const endTimeLimit = new Date(now.getTime() + 72 * 60 * 60 * 1000);

            wxElement.Time.forEach((t, index) => {
                const startTime = new Date(t.StartTime);
                if (startTime > endTimeLimit) return;

                const endTime = new Date(t.EndTime);
                const wx = t.ElementValue[0].Weather;

                // Find matching temperature (closest point data)
                // T element usually has DataTime. We find the one that falls within or is closest to this interval
                let temp = '-';
                if (tElement && tElement.Time) {
                    const match = tElement.Time.find(tt => {
                        const dt = new Date(tt.DataTime);
                        return dt >= startTime && dt < endTime;
                    });
                    if (match) temp = match.ElementValue[0].Temperature;
                }

                // Pop
                let pop = '0';
                if (popElement && popElement.Time) {
                    const match = popElement.Time[index]; // Usually aligned
                    if (match) pop = match.ElementValue[0].ProbabilityOfPrecipitation;
                }

                forecastTimes.push({
                    startTime: t.StartTime,
                    endTime: t.EndTime,
                    parameter: { parameterName: wx },
                    temperature: temp,
                    pop: pop
                });
            });
        }

        const normalizedLoc = {
            locationName: `${state.currentCity} · ${loc.LocationName}`,
            township: loc.LocationName, // Pass raw township name for fetchQuickStats
            isTownship: true, // Flag to indicate township data
            stationStats: stationStats, // Pass pre-fetched stats
            forecastTimes: forecastTimes, // Custom field for 72h forecast
            weatherElement: [
                {
                    elementName: 'Wx',
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '天氣現象')
                        }
                    }]
                },
                {
                    elementName: 'T', // Current Temp
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '溫度')
                        }
                    }]
                },
                {
                    elementName: 'MinT',
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '溫度')
                        }
                    }]
                },
                {
                    elementName: 'MaxT',
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '溫度')
                        }
                    }]
                },
                {
                    elementName: 'PoP',
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '3小時降雨機率')
                        }
                    }]
                },
                {
                    elementName: 'CI',
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '舒適度指數')
                        }
                    }]
                },
                {
                    elementName: 'RH',
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '相對濕度')
                        }
                    }]
                },
                {
                    elementName: 'WS',
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '風速')
                        }
                    }]
                },
                {
                    elementName: 'WD',
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '風向')
                        }
                    }]
                },
                {
                    elementName: 'AT',
                    time: [{
                        parameter: {
                            parameterName: getElementValue(loc, '體感溫度')
                        }
                    }]
                }
            ]
        };

        renderHeroWeather(normalizedLoc);
        // Render 72h forecast cards
        renderForecastCards([normalizedLoc], true);
    } finally {
        setLoading(false);
    }
}

function getElementValue(loc, elementName) {
    const el = loc.WeatherElement.find(e => e.ElementName === elementName);
    // For WindSpeed, we prefer BeaufortScale if available
    if (elementName === '風速') {
        return el?.Time?.[0]?.ElementValue?.[0]?.BeaufortScale ||
            el?.Time?.[0]?.ElementValue?.[0]?.WindSpeed || '-';
    }

    return el?.Time?.[0]?.ElementValue?.[0]?.Weather ||
        el?.Time?.[0]?.ElementValue?.[0]?.Temperature ||
        el?.Time?.[0]?.ElementValue?.[0]?.ProbabilityOfPrecipitation ||
        el?.Time?.[0]?.ElementValue?.[0]?.ComfortIndexDescription || // For Comfort Index
        el?.Time?.[0]?.ElementValue?.[0]?.RelativeHumidity ||
        el?.Time?.[0]?.ElementValue?.[0]?.WindSpeed ||
        el?.Time?.[0]?.ElementValue?.[0]?.WindDirection ||
        el?.Time?.[0]?.ElementValue?.[0]?.ApparentTemperature || '-';
}

function renderHeroWeather(location) {
    const els = location.weatherElement || [];
    const wx = els.find(e => e.elementName === 'Wx');
    const minT = els.find(e => e.elementName === 'MinT');
    const maxT = els.find(e => e.elementName === 'MaxT');
    const ci = els.find(e => e.elementName === 'CI');
    const pop = els.find(e => e.elementName === 'PoP');

    const desc = wx?.time?.[0]?.parameter?.parameterName || '-';
    const tempMin = minT?.time?.[0]?.parameter?.parameterName || '-';
    const tempMax = maxT?.time?.[0]?.parameter?.parameterName || '-';
    const comfort = ci?.time?.[0]?.parameter?.parameterName || '';

    // 判斷當前是白天還是晚上
    const now = new Date();
    const hour = now.getHours();
    const isDaytime = hour >= 6 && hour < 18;
    const rainProb = parseInt(pop?.time?.[0]?.parameter?.parameterName || '0');

    let weatherIcon = getWeatherIcon(desc);
    // 晚上將太陽圖示改為月亮
    if (!isDaytime && weatherIcon === ICONS.sun) {
        weatherIcon = ICONS.moon;
    } else if (!isDaytime && weatherIcon === ICONS.cloudSun) {
        weatherIcon = ICONS.cloud;
    }

    // 取得動態背景
    const bgGradient = getHeroBackground(desc);

    // 生成穿著建議
    const advice = getWeatherAdvice(desc, tempMin, tempMax, rainProb);

    DOM.heroWeather.innerHTML = `
        <div class="hero-content">
            <div class="hero-left">
                <div class="hero-top">
                    <div class="hero-location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        ${location.locationName}
                    </div>
                </div>
                <div class="hero-main">
                    <span class="hero-temp">${tempMax}</span>
                    <span class="hero-unit">°C</span>
                </div>
                <div class="hero-range">最低 ${tempMin}° / 最高 ${tempMax}°</div>
                <div class="hero-desc">${desc} ${comfort ? '· ' + comfort : ''}</div>
            </div>
            <div class="hero-icon">${weatherIcon}</div>
        </div>
        <div class="advice-items">${advice}</div>
    `;

    // 應用動態背景
    DOM.heroWeather.style.background = bgGradient;

    // 更新降雨機率
    if (DOM.statRain) DOM.statRain.textContent = `${rainProb}%`;

    if (location.isTownship) {
        // Township mode: use extracted stats
        const rh = els.find(e => e.elementName === 'RH')?.time?.[0]?.parameter?.parameterName || '--';
        const ws = els.find(e => e.elementName === 'WS')?.time?.[0]?.parameter?.parameterName || '-';
        const wd = els.find(e => e.elementName === 'WD')?.time?.[0]?.parameter?.parameterName || '';
        const at = els.find(e => e.elementName === 'AT')?.time?.[0]?.parameter?.parameterName || '-';

        if (DOM.statHumidity) DOM.statHumidity.textContent = `${rh}%`;

        if (DOM.statWind) {
            // Township data now returns BeaufortScale (e.g., "3") or m/s if not available
            DOM.statWind.textContent = `${ws} 級`;

            // Update label if needed, or just leave as "風速"
            var windLabel = DOM.statWind.parentElement.querySelector('.stat-name');
            if (windLabel) windLabel.textContent = '風速';
        }

        if (DOM.statFeels) DOM.statFeels.textContent = `${at}°`;

        // Use pre-fetched stats if available, otherwise try to fetch
        if (location.stationStats) {
            updateQuickStatsDOM(location.stationStats);
        } else {
            fetchQuickStats(state.currentCity, location.township);
        }
    } else {
        fetchQuickStats(location.locationName);
    }
}

// 天氣穿著建議
function getWeatherAdvice(desc, tempMin, tempMax, rainProb) {
    const items = [];
    const minTemp = parseInt(tempMin) || 20;
    const maxTemp = parseInt(tempMax) || 25;
    const avgTemp = (minTemp + maxTemp) / 2;

    // 雨具建議
    if (rainProb >= 60 || desc.includes('雨')) {
        items.push({ icon: '☔', text: '攜帶雨具' });
    } else if (rainProb >= 30) {
        items.push({ icon: '🌂', text: '備妥雨傘' });
    }

    // 溫度穿著建議
    if (maxTemp >= 32) {
        items.push({ icon: '🧴', text: '注意防曬' });
        items.push({ icon: '💧', text: '多喝水' });
    } else if (maxTemp >= 28) {
        items.push({ icon: '👕', text: '輕便服裝' });
    }

    if (minTemp <= 15) {
        items.push({ icon: '🧥', text: '穿著外套' });
    } else if (minTemp <= 20) {
        items.push({ icon: '🧣', text: '攜帶薄外套' });
    }

    // 特殊天氣
    if (desc.includes('雷')) {
        items.push({ icon: '⚡', text: '避免戶外' });
    }
    if (desc.includes('霧')) {
        items.push({ icon: '🚗', text: '注意行車' });
    }
    if (desc.includes('晴') && !desc.includes('雨') && maxTemp >= 25) {
        items.push({ icon: '🕶️', text: '配戴太陽眼鏡' });
    }

    // 如果沒有特別建議，給個通用的
    if (items.length === 0) {
        items.push({ icon: '✨', text: '適合外出' });
    }

    return items.map(item =>
        `<span class="advice-item"><span class="advice-icon">${item.icon}</span>${item.text}</span>`
    ).join('');
}

async function getStationStats(cityName, townshipName = null) {
    const data = await apiRequest(CONFIG.ENDPOINTS.WEATHER_STATION);
    if (!data?.records?.Station) return null;

    const stations = data.records.Station.filter(s => {
        const county = s.GeoInfo?.CountyName || '';
        const town = s.GeoInfo?.TownName || '';
        const cityMatch = county.includes(cityName) || cityName.includes(county);

        if (townshipName) {
            return cityMatch && town === townshipName;
        }
        return cityMatch;
    });

    if (!stations.length) return null;

    const station = stations[0];
    const obs = station.WeatherElement || {};

    const humidity = obs.RelativeHumidity ?? '--';
    const wind = obs.WindSpeed ?? '-';
    const temp = obs.AirTemperature ?? '--';
    const gust = obs.GustInfo?.PeakGustSpeed ?? null;

    const windScale = getWindScale(parseFloat(wind));
    const gustScale = gust ? getWindScale(parseFloat(gust)) : 0;
    const hasGust = gust && gustScale > 0;

    return {
        humidity,
        wind,
        temp,
        gust,
        windScale,
        gustScale,
        hasGust
    };
}

async function fetchQuickStats(cityName, townshipName = null) {
    const stats = await getStationStats(cityName, townshipName);
    if (!stats) return;

    // Race condition check
    if (townshipName) {
        if (state.currentDistrict !== townshipName) return;
    } else {
        // If fetching for city, ensure we haven't selected a district
        if (state.currentDistrict) return;
        // And ensure we are still on the same city
        if (state.currentCity !== cityName) return;
    }

    updateQuickStatsDOM(stats);
}

function updateQuickStatsDOM(stats) {
    if (DOM.statHumidity) DOM.statHumidity.textContent = stats.humidity + '%';
    if (DOM.statWind) {
        // 陣風為 0 級或沒有陣風資料時，只顯示風速
        DOM.statWind.textContent = stats.hasGust ? (stats.windScale + ' 級 · ' + stats.gustScale + ' 級') : (stats.windScale + ' 級');
        // 更新標籤
        var windLabel = DOM.statWind.parentElement.querySelector('.stat-name');
        if (windLabel) {
            windLabel.textContent = stats.hasGust ? '風速 · 陣風' : '風速';
        }
    }
    if (DOM.statFeels) DOM.statFeels.textContent = stats.temp + '°';
}

function renderForecastCards(locations, isTownship = false) {
    if (!DOM.forecastScroll) return;

    // 更新標題（保留 SVG 圖示）
    const forecastTitle = document.getElementById('forecastTitle');
    const forecastIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 18a5 5 0 00-10 0"/>
        <line x1="12" y1="9" x2="12" y2="2"/>
        <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
        <line x1="1" y1="18" x2="3" y2="18"/>
        <line x1="21" y1="18" x2="23" y2="18"/>
        <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
        <line x1="23" y1="22" x2="1" y2="22"/>
        <polyline points="16,5 12,9 8,5"/>
    </svg>`;

    if (!state.currentCity) {
        // 未選擇城市時，顯示各縣市天氣卡片（網格版面）
        if (forecastTitle) forecastTitle.innerHTML = `${forecastIcon}未來36小時天氣`;
        // 依照北到南排序
        const sortedLocations = [...locations].sort((a, b) => {
            const indexA = CITIES_NORTH_TO_SOUTH.indexOf(a.locationName);
            const indexB = CITIES_NORTH_TO_SOUTH.indexOf(b.locationName);
            const orderA = indexA === -1 ? 999 : indexA;
            const orderB = indexB === -1 ? 999 : indexB;
            return orderA - orderB;
        });

        const cardsHtml = sortedLocations.map(loc => {
            const els = loc.weatherElement || [];
            const wx = els.find(e => e.elementName === 'Wx');
            const maxT = els.find(e => e.elementName === 'MaxT');
            const minT = els.find(e => e.elementName === 'MinT');
            const pop = els.find(e => e.elementName === 'PoP');

            const desc = wx?.time?.[0]?.parameter?.parameterName || '-';
            const tempMax = maxT?.time?.[0]?.parameter?.parameterName || '-';
            const tempMin = minT?.time?.[0]?.parameter?.parameterName || '-';
            const rainProb = parseInt(pop?.time?.[0]?.parameter?.parameterName || '0');

            return `
                <div class="city-card" onclick="selectCity('${loc.locationName}')">
                    <div class="city-card-name">${loc.locationName}</div>
                    <div class="city-card-icon">${getWeatherIcon(desc)}</div>
                    <div class="city-card-temp">
                        <span class="current">${tempMax}°</span>
                    </div>
                    <div class="city-card-desc">${desc}</div>
                    <div class="city-card-rain">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                            <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
                        </svg>
                        ${rainProb}%
                    </div>
                </div>
            `;
        }).join('');

        DOM.forecastScroll.innerHTML = cardsHtml;
    } else {
        // 選擇城市後，先顯示36小時預報，然後載入一週預報
        // 如果是鄉鎮模式，顯示72小時預報
        if (isTownship) {
            if (forecastTitle) forecastTitle.innerHTML = `${forecastIcon}72 小時天氣預報`;
            // renderForecastCards 被呼叫時傳入的是單一 location 的 array
            render72HourForecast(locations[0]);
        } else {
            if (forecastTitle) forecastTitle.innerHTML = `${forecastIcon}36 小時天氣預報`;
            const loc = locations.find(l => l.locationName === state.currentCity);
            if (loc) {
                render36HourForecast(loc);
            }
        }
        // 同時載入一週預報
        loadWeekForecast();
    }
}

function render72HourForecast(loc) {
    if (!DOM.forecastScroll || !loc.forecastTimes) return;

    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const forecastCards = loc.forecastTimes.map(time => {
        const desc = time.parameter?.parameterName || '-';
        const temp = time.temperature || '-';
        const rainProb = time.pop || '0';

        const startTime = new Date(time.startTime);

        // 判斷時段
        const hour = startTime.getHours();
        const isDaytime = hour >= 6 && hour < 18;
        const timeStr = `${String(hour).padStart(2, '0')}:00`;

        const dateStr = `${startTime.getMonth() + 1}/${startTime.getDate()}`;

        // 根據時間調整天氣圖示
        let weatherIcon = getWeatherIcon(desc);
        if (!isDaytime && weatherIcon === ICONS.sun) {
            weatherIcon = ICONS.moon;
        } else if (!isDaytime && weatherIcon === ICONS.cloudSun) {
            weatherIcon = ICONS.cloud;
        }

        // 判斷是否為今天
        const forecastDate = new Date(startTime);
        forecastDate.setHours(0, 0, 0, 0);
        const isToday = forecastDate.getTime() === today.getTime();
        const dayLabel = isToday ? '今天' : weekdays[startTime.getDay()];

        return `
            <div class="city-card forecast-card">
                <div class="city-card-weekday">${dayLabel}</div>
                <div class="city-card-name">${dateStr} ${timeStr}</div>
                <div class="city-card-icon">${weatherIcon}</div>
                <div class="city-card-temp">
                    <span class="current">${temp}°</span>
                </div>
                <div class="city-card-rain">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
                    </svg>
                    ${rainProb}%
                </div>
            </div>
        `;
    }).join('');

    DOM.forecastScroll.innerHTML = forecastCards;
}

function render36HourForecast(loc) {
    if (!DOM.forecastScroll) return;

    const wx = loc.weatherElement?.find(e => e.elementName === 'Wx');
    const minT = loc.weatherElement?.find(e => e.elementName === 'MinT');
    const maxT = loc.weatherElement?.find(e => e.elementName === 'MaxT');
    const pop = loc.weatherElement?.find(e => e.elementName === 'PoP');

    const times = wx?.time || [];

    if (times.length === 0) {
        DOM.forecastScroll.innerHTML = '<div class="empty">無預報資料</div>';
        return;
    }

    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 用於追蹤已顯示的時段，避免重複
    const shownPeriods = new Set();

    const forecastCards = times.map((time, i) => {
        const desc = time.parameter?.parameterName || '-';
        const tMin = minT?.time?.[i]?.parameter?.parameterName || '-';
        const tMax = maxT?.time?.[i]?.parameter?.parameterName || '-';
        const rainProb = pop?.time?.[i]?.parameter?.parameterName || '0';

        const startTime = new Date(time.startTime);
        const endTime = new Date(time.endTime);

        // 判斷時段（早上、下午、晚上）
        const hour = startTime.getHours();
        const isDaytime = hour >= 6 && hour < 18;
        let periodLabel = '';
        if (hour >= 6 && hour < 12) periodLabel = '上午';
        else if (hour >= 12 && hour < 18) periodLabel = '下午';
        else periodLabel = '晚間';

        const dateStr = `${startTime.getMonth() + 1}/${startTime.getDate()}`;
        const periodKey = `${dateStr}-${periodLabel}`;

        // 如果這個時段已經顯示過，跳過
        if (shownPeriods.has(periodKey)) {
            return '';
        }
        shownPeriods.add(periodKey);

        // 根據時間調整天氣圖示
        let weatherIcon = getWeatherIcon(desc);
        if (!isDaytime && weatherIcon === ICONS.sun) {
            weatherIcon = ICONS.moon;
        } else if (!isDaytime && weatherIcon === ICONS.cloudSun) {
            weatherIcon = ICONS.cloud;
        }

        // 判斷是否為今天
        const forecastDate = new Date(startTime);
        forecastDate.setHours(0, 0, 0, 0);
        const isToday = forecastDate.getTime() === today.getTime();
        const dayLabel = isToday ? '今天' : weekdays[startTime.getDay()];

        return `
            <div class="city-card forecast-card">
                <div class="city-card-weekday">${dayLabel}</div>
                <div class="city-card-name">${dateStr} ${periodLabel}</div>
                <div class="city-card-icon">${weatherIcon}</div>
                <div class="city-card-temp">
                    <span class="temp-range">${tMin}°~${tMax}°</span>
                </div>
                <div class="city-card-rain">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
                    </svg>
                    ${rainProb}%
                </div>
            </div>
        `;
    }).filter(card => card !== '').join('');

    DOM.forecastScroll.innerHTML = forecastCards;
}

async function loadWeekForecast() {
    if (!state.currentCity) {
        if (DOM.weekForecastGrid) {
            DOM.weekForecastGrid.innerHTML = '<div class="empty">選擇縣市查看一週天氣</div>';
        }
        return;
    }

    try {
        // 使用 F-D0047-091 一週預報 API，支援完整 7 天
        var url = CONFIG.API_BASE + '/' + CONFIG.ENDPOINTS.FORECAST_WEEK +
            '?Authorization=' + CONFIG.API_KEY +
            '&locationName=' + encodeURIComponent(state.currentCity);

        var response = await fetch(url);
        var data = await response.json();

        var records = data && data.records;
        var locationsArr = records && records.Locations;
        if (!locationsArr || !locationsArr[0] || !locationsArr[0].Location) {
            if (DOM.weekForecastGrid) {
                DOM.weekForecastGrid.innerHTML = '<div class="empty">無一週預報資料</div>';
            }
            return;
        }

        // 找到對應的城市
        var locList = locationsArr[0].Location;
        var loc = null;
        for (var i = 0; i < locList.length; i++) {
            if (locList[i].LocationName === state.currentCity) {
                loc = locList[i];
                break;
            }
        }

        if (!loc) {
            if (DOM.weekForecastGrid) {
                DOM.weekForecastGrid.innerHTML = '<div class="empty">無一週預報資料</div>';
            }
            return;
        }

        var els = loc.WeatherElement || [];

        // 找天氣相關元素
        var wx = null, maxT = null, minT = null, pop = null;
        for (var i = 0; i < els.length; i++) {
            if (els[i].ElementName === '天氣現象') wx = els[i];
            if (els[i].ElementName === '最高溫度') maxT = els[i];
            if (els[i].ElementName === '最低溫度') minT = els[i];
            if (els[i].ElementName === '12小時降雨機率') pop = els[i];
        }

        if (!wx || !wx.Time || wx.Time.length === 0) {
            if (DOM.weekForecastGrid) {
                DOM.weekForecastGrid.innerHTML = '<div class="empty">無一週預報資料</div>';
            }
            return;
        }

        // 按日期分組預報資料
        var dailyForecasts = {};
        var weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

        for (var i = 0; i < wx.Time.length; i++) {
            var t = wx.Time[i];
            var dateKey = t.StartTime.substring(0, 10);

            if (!dailyForecasts[dateKey]) {
                var startTime = new Date(t.StartTime);
                dailyForecasts[dateKey] = {
                    date: startTime,
                    dateStr: (startTime.getMonth() + 1) + '/' + startTime.getDate(),
                    weekday: weekdays[startTime.getDay()],
                    descs: [],
                    maxTemps: [],
                    minTemps: [],
                    pops: []
                };
            }

            // 天氣現象
            var elVal = t.ElementValue && t.ElementValue[0];
            var desc = elVal && elVal.Weather ? elVal.Weather : '';
            if (desc) dailyForecasts[dateKey].descs.push(desc);
        }

        // 處理最高溫度
        if (maxT && maxT.Time) {
            for (var i = 0; i < maxT.Time.length; i++) {
                var t = maxT.Time[i];
                var dateKey = t.StartTime.substring(0, 10);
                if (dailyForecasts[dateKey]) {
                    var elVal = t.ElementValue && t.ElementValue[0];
                    var tempVal = elVal && elVal.MaxTemperature;
                    if (tempVal) dailyForecasts[dateKey].maxTemps.push(parseInt(tempVal));
                }
            }
        }

        // 處理最低溫度
        if (minT && minT.Time) {
            for (var i = 0; i < minT.Time.length; i++) {
                var t = minT.Time[i];
                var dateKey = t.StartTime.substring(0, 10);
                if (dailyForecasts[dateKey]) {
                    var elVal = t.ElementValue && t.ElementValue[0];
                    var tempVal = elVal && elVal.MinTemperature;
                    if (tempVal) dailyForecasts[dateKey].minTemps.push(parseInt(tempVal));
                }
            }
        }

        // 處理降雨機率
        if (pop && pop.Time) {
            for (var i = 0; i < pop.Time.length; i++) {
                var t = pop.Time[i];
                var dateKey = t.StartTime.substring(0, 10);
                if (dailyForecasts[dateKey]) {
                    var elVal = t.ElementValue && t.ElementValue[0];
                    var popVal = elVal && elVal.ProbabilityOfPrecipitation;
                    if (popVal && !isNaN(parseInt(popVal))) {
                        dailyForecasts[dateKey].pops.push(parseInt(popVal));
                    }
                }
            }
        }

        // 轉換為陣列並排序
        var forecastKeys = Object.keys(dailyForecasts);
        var forecasts = [];
        for (var i = 0; i < forecastKeys.length; i++) {
            forecasts.push(dailyForecasts[forecastKeys[i]]);
        }
        forecasts.sort(function (a, b) { return a.date - b.date; });
        forecasts = forecasts.slice(0, 7); // 只取7天

        if (forecasts.length === 0) {
            if (DOM.weekForecastGrid) {
                DOM.weekForecastGrid.innerHTML = '<div class="empty">無一週預報資料</div>';
            }
            return;
        }

        var today = new Date();
        today.setHours(0, 0, 0, 0);

        // 生成一週預報 HTML
        var weekHtml = '';
        for (var i = 0; i < forecasts.length; i++) {
            var f = forecasts[i];
            var desc = f.descs[0] || '晴';
            var minTemp = f.minTemps.length ? Math.min.apply(null, f.minTemps) : '-';
            var maxTemp = f.maxTemps.length ? Math.max.apply(null, f.maxTemps) : '-';
            var maxPop = f.pops.length ? Math.max.apply(null, f.pops) : 0;

            var forecastDate = new Date(f.date);
            forecastDate.setHours(0, 0, 0, 0);
            var isToday = forecastDate.getTime() === today.getTime();
            var dayLabel = isToday ? '今天' : f.weekday;

            weekHtml += '<div class="city-card forecast-card">' +
                '<div class="city-card-weekday">' + dayLabel + '</div>' +
                '<div class="city-card-name">' + f.dateStr + '</div>' +
                '<div class="city-card-icon">' + getWeatherIcon(desc) + '</div>' +
                '<div class="city-card-temp">' +
                '<span class="temp-range">' + minTemp + '°~' + maxTemp + '°</span>' +
                '</div>' +
                '<div class="city-card-rain">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">' +
                '<path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>' +
                '</svg>' +
                maxPop + '%' +
                '</div>' +
                '</div>';
        }

        // 在獨立的一週預報區塊顯示
        if (DOM.weekForecastGrid) {
            DOM.weekForecastGrid.innerHTML = weekHtml;
        }
    } catch (error) {
        console.error('一週預報載入失敗:', error);
        if (DOM.weekForecastGrid) {
            DOM.weekForecastGrid.innerHTML = '<div class="empty">載入失敗</div>';
        }
    }
}

// ========================================
// 觀測站
// ========================================
async function loadObservation() {
    // 根據類型選擇 endpoint
    let endpoint;
    if (state.currentObsType === 'rain') {
        endpoint = CONFIG.ENDPOINTS.RAIN_STATION;
    } else if (state.currentObsType === 'uv') {
        endpoint = CONFIG.ENDPOINTS.UV_INDEX;
    } else {
        endpoint = CONFIG.ENDPOINTS.WEATHER_STATION;
    }

    const data = await apiRequest(endpoint);

    // UV API 回傳格式不同
    if (state.currentObsType === 'uv') {
        const we = data?.records?.weatherElement;
        if (!we?.location) {
            DOM.obsGrid.innerHTML = '<div class="empty">無紫外線資料</div>';
            state.obsStationsCache = [];
            return;
        }
        // 將 UV 資料轉換為統一格式，包含日期資訊
        let uvStations = we.location.map(loc => {
            const stationId = String(loc.StationID);
            return {
                StationID: stationId,
                UVIndex: loc.UVIndex,
                Date: we.Date,
                City: UV_STATION_CITY[stationId] || ''
            };
        });

        // 根據選擇的縣市過濾
        if (state.currentCity) {
            uvStations = uvStations.filter(s => {
                return s.City.includes(state.currentCity) || state.currentCity.includes(s.City);
            });
        }

        // 緩存 UV 觀測站資料供搜尋使用
        state.obsStationsCache = uvStations;
        filterAndRenderObs(); // 這裡會呼叫 renderUVObs
        // 重置滾動位置
        if (DOM.obsGrid) DOM.obsGrid.scrollTop = 0;
        return;
    }

    // 一般觀測站 (天氣、雨量)
    if (!data?.records?.Station) {
        DOM.obsGrid.innerHTML = '<div class="empty">無觀測資料</div>';
        state.obsStationsCache = [];
        return;
    }

    let stations = data.records.Station;

    if (state.currentCity) {
        stations = stations.filter(s => {
            const county = s.GeoInfo?.CountyName || '';
            return county.includes(state.currentCity) || state.currentCity.includes(county);
        });
    }

    // 緩存觀測站資料供搜尋使用
    state.obsStationsCache = stations;

    filterAndRenderObs();
    // 重置滾動位置
    if (DOM.obsGrid) DOM.obsGrid.scrollTop = 0;
}

function filterAndRenderObs() {
    let stations = state.obsStationsCache;

    // 根據搜尋詞過濾
    if (state.obsSearchQuery) {
        if (state.currentObsType === 'uv') {
            // UV 資料格式不同，用測站名稱過濾
            stations = stations.filter(s => {
                const name = (UV_STATION_NAMES[s.StationID] || '').toLowerCase();
                return name.includes(state.obsSearchQuery);
            });
        } else {
            stations = stations.filter(s => {
                const name = (s.StationName || '').toLowerCase();
                const county = (s.GeoInfo?.CountyName || '').toLowerCase();
                const town = (s.GeoInfo?.TownName || '').toLowerCase();
                return name.includes(state.obsSearchQuery) ||
                    county.includes(state.obsSearchQuery) ||
                    town.includes(state.obsSearchQuery);
            });
        }
    }

    if (state.currentObsType === 'weather') {
        renderWeatherObs(stations);
    } else if (state.currentObsType === 'uv') {
        renderUVObs(stations);
    } else {
        renderRainObs(stations);
    }
}

function renderWeatherObs(stations) {
    if (!stations.length) {
        DOM.obsGrid.innerHTML = '<div class="empty">此區域無觀測站</div>';
        return;
    }

    DOM.obsGrid.innerHTML = stations.map(s => {
        const name = s.StationName || '未知';
        const county = s.GeoInfo?.CountyName || '';
        const town = s.GeoInfo?.TownName || '';
        const obs = s.WeatherElement || {};

        const temp = obs.AirTemperature ?? '-';
        const humidity = obs.RelativeHumidity ?? '-';
        const wind = obs.WindSpeed ?? '-';
        const gust = obs.GustInfo?.PeakGustSpeed ?? null;
        const windScale = getWindScale(parseFloat(wind));
        const gustScale = gust ? getWindScale(parseFloat(gust)) : null;
        const weather = obs.Weather || '';

        // 判斷當前是白天還是晚上
        const now = new Date();
        const hour = now.getHours();
        const isDaytime = hour >= 6 && hour < 18;

        // 根據時間、溫度和天氣狀況判斷圖示
        let weatherIcon = '';

        if (weather) {
            weatherIcon = getWeatherIcon(weather);
            // 如果是晚上且圖示是太陽，改為月亮
            if (!isDaytime && weatherIcon === ICONS.sun) {
                weatherIcon = ICONS.moon;
            } else if (!isDaytime && weatherIcon === ICONS.cloudSun) {
                // 晚上的雲+太陽改為雲
                weatherIcon = ICONS.cloud;
            }
        } else {
            // 如果沒有天氣描述，根據溫度和時間給出簡單圖示
            const tempValue = parseFloat(temp);
            if (!isNaN(tempValue)) {
                if (isDaytime) {
                    // 白天
                    if (tempValue >= 30) {
                        weatherIcon = ICONS.sun;
                    } else if (tempValue >= 25) {
                        weatherIcon = ICONS.cloudSun;
                    } else {
                        weatherIcon = ICONS.cloud;
                    }
                } else {
                    // 晚上
                    if (tempValue >= 25) {
                        weatherIcon = ICONS.moon;
                    } else {
                        weatherIcon = ICONS.cloud;
                    }
                }
            }
        }

        // 陣風作為獨立第四欄
        const gustHtml = gustScale ? `
                    <div class="obs-val gust">
                        <span class="obs-val-num">${gustScale} 級</span>
                        <span class="obs-val-label">陣風</span>
                    </div>` : '';

        // 根據是否有陣風調整 grid columns
        const gridClass = gustScale ? 'obs-values obs-values-four' : 'obs-values';

        return `
            <div class="obs-item">
                <div class="obs-header">
                    <div class="obs-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>
                        </svg>
                    </div>
                    <div class="obs-header-info">
                        <div class="obs-name">${name}</div>
                        <div class="obs-location">${county} · ${town}</div>
                    </div>
                    ${weatherIcon ? `<div class="obs-weather-icon-right">${weatherIcon}</div>` : ''}
                </div>
                <div class="${gridClass}">
                    <div class="obs-val temp">
                        <span class="obs-val-num">${temp}°</span>
                        <span class="obs-val-label">溫度</span>
                    </div>
                    <div class="obs-val humidity">
                        <span class="obs-val-num">${humidity}%</span>
                        <span class="obs-val-label">濕度</span>
                    </div>
                    <div class="obs-val wind">
                        <span class="obs-val-num">${windScale} 級</span>
                        <span class="obs-val-label">風速</span>
                    </div>${gustHtml}
                </div>
            </div>
        `;
    }).join('');
}

function renderRainObs(stations) {
    if (!stations.length) {
        DOM.obsGrid.innerHTML = '<div class="empty">此區域無雨量站</div>';
        return;
    }

    DOM.obsGrid.innerHTML = stations.map(s => {
        const name = s.StationName || '未知';
        const county = s.GeoInfo?.CountyName || '';
        const town = s.GeoInfo?.TownName || '';
        const rain = s.RainfallElement || {};

        const now = rain.Now?.Precipitation ?? '-';
        const hour = rain.Past1hr?.Precipitation ?? '-';
        const day = rain.Past24hr?.Precipitation ?? '-';

        return `
            <div class="obs-item">
                <div class="obs-header">
                    <div class="obs-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
                        </svg>
                    </div>
                    <div>
                        <div class="obs-name">${name}</div>
                        <div class="obs-location">${county} · ${town}</div>
                    </div>
                </div>
                <div class="obs-values">
                    <div class="obs-val">
                        <span class="obs-val-num">${now}</span>
                        <span class="obs-val-label">目前 mm</span>
                    </div>
                    <div class="obs-val">
                        <span class="obs-val-num">${hour}</span>
                        <span class="obs-val-label">1 小時</span>
                    </div>
                    <div class="obs-val">
                        <span class="obs-val-num">${day}</span>
                        <span class="obs-val-label">24 小時</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderUVObs(stations) {
    if (!stations.length) {
        DOM.obsGrid.innerHTML = '<div class="empty">此區域無紫外線觀測站</div>';
        return;
    }

    // 過濾掉名稱是數字的測站
    const validStations = stations.filter(s => {
        const stationId = String(s.StationID);
        const name = UV_STATION_NAMES[stationId];
        // 如果沒有對應的名稱（會顯示數字 ID），則不顯示
        return name && !/^\d+$/.test(name);
    });

    if (!validStations.length) {
        DOM.obsGrid.innerHTML = '<div class="empty">此區域無紫外線觀測站</div>';
        return;
    }

    DOM.obsGrid.innerHTML = validStations.map(s => {
        const stationId = String(s.StationID);
        const name = UV_STATION_NAMES[stationId];
        const city = s.City || '';
        const uvIndex = s.UVIndex ?? '-';
        const dateStr = s.Date || '';

        // UV 等級對應顏色
        const uvValue = parseFloat(uvIndex);
        let uvColor = '#30d158'; // 低量 (0-2)
        let uvLabel = '低量';
        if (uvValue >= 11) {
            uvColor = '#bf5af2'; uvLabel = '危險';
        } else if (uvValue >= 8) {
            uvColor = '#ff375f'; uvLabel = '過量';
        } else if (uvValue >= 6) {
            uvColor = '#ff9500'; uvLabel = '高量';
        } else if (uvValue >= 3) {
            uvColor = '#ffd60a'; uvLabel = '中量';
        }

        return `
            <div class="obs-item uv-item">
                <div class="obs-header">
                    <div class="obs-icon" style="color: ${uvColor}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"/>
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                    </div>
                    <div>
                        <div class="obs-name">${name}</div>
                        <div class="obs-location">${city} · ${dateStr}</div>
                    </div>
                </div>
                <div class="obs-values uv-values-row">
                    <div class="uv-val-group">
                        <div class="uv-value-wrapper">
                            <span class="obs-val-num" style="color: ${uvColor}">${uvIndex}</span>
                        </div>
                        <span class="obs-val-label">UVI</span>
                    </div>
                    <div class="uv-level-group">
                        <div class="uv-value-wrapper">
                            <span class="uv-badge" style="background: ${uvColor}">${uvLabel}</span>
                        </div>
                        <span class="obs-val-label">曝曬級數</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getWindScale(speed) {
    if (isNaN(speed)) return '-';
    if (speed < 0.3) return 0;
    if (speed < 1.6) return 1;
    if (speed < 3.4) return 2;
    if (speed < 5.5) return 3;
    if (speed < 8.0) return 4;
    if (speed < 10.8) return 5;
    if (speed < 13.9) return 6;
    if (speed < 17.2) return 7;
    if (speed < 20.8) return 8;
    if (speed < 24.5) return 9;
    if (speed < 28.5) return 10;
    if (speed < 32.7) return 11;
    return 12;
}

// ========================================
// 地震
// ========================================
async function loadEarthquake() {
    const [significantData, smallData] = await Promise.all([
        apiRequest(CONFIG.ENDPOINTS.EARTHQUAKE),
        apiRequest(CONFIG.ENDPOINTS.EARTHQUAKE_SMALL)
    ]);

    const significantQuakes = significantData?.records?.Earthquake || [];
    const smallQuakes = smallData?.records?.Earthquake || [];

    // 合併並依時間排序
    const allQuakes = [...significantQuakes, ...smallQuakes]
        .sort((a, b) => {
            const timeA = new Date(a.EarthquakeInfo?.OriginTime || 0);
            const timeB = new Date(b.EarthquakeInfo?.OriginTime || 0);
            return timeB - timeA; // 新的在前
        })
        .slice(0, 15); // 取前15筆 (增加顯示數量以容納更多小區域地震)



    if (!allQuakes.length) {
        if (DOM.earthquakeList) {
            DOM.earthquakeList.innerHTML = '<div class="empty">近期無地震</div>';
        }
        return;
    }

    if (DOM.earthquakeList) {
        DOM.earthquakeList.innerHTML = allQuakes.map(eq => {
            const info = eq.EarthquakeInfo;
            const time = new Date(info.OriginTime);
            const magnitude = info.EarthquakeMagnitude.MagnitudeValue;
            const depth = info.FocalDepth;
            // 移除 (位於...) 或 （位於...） 的內容
            let location = info.Epicenter.Location;
            location = location.replace(/[\(（]位於.*[\)）]/, '').trim();

            // 取得最大震度
            const shakingAreas = eq.Intensity?.ShakingArea || [];
            // 這裡簡化處理，若無資料則顯示 '4' (模擬)
            const rawIntensity = shakingAreas.length > 0
                ? (shakingAreas[0].AreaIntensity || shakingAreas[0].ShakingDegree || '4')
                : '4';
            const maxIntensity = String(rawIntensity).replace('級', '');

            // 格式化時間
            const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

            // 判斷規模顏色
            let magClass = 'low';
            if (magnitude >= 6.0) magClass = 'high';
            else if (magnitude >= 5.0) magClass = 'mid';

            const reportImg = eq.ReportImageURI || '';

            return `
                <div class="eq-item" ${reportImg ? `onclick="showEarthquakeImage('${reportImg}')"` : ''}>
                    <div class="eq-mag ${magClass}">${magnitude}</div>
                    <div class="eq-info">
                        <div class="eq-location">${location}</div>
                        <div class="eq-details">
                            <span class="eq-detail">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                                ${depth}km
                            </span>
                            <span class="eq-detail">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                                    <line x1="4" y1="22" x2="4" y2="15"/>
                                </svg>
                                最大 ${maxIntensity} 級
                            </span>
                            <span class="eq-detail">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                ${timeStr}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ========================================
// 警報
// ========================================
async function loadWarnings() {
    const data = await apiRequest(CONFIG.ENDPOINTS.WARNING);
    console.log('警特報 API 回應:', data);

    // W-C0033-002 回傳的是 records.record 結構
    if (!data?.records?.record?.length) {
        console.log('目前沒有警特報資料');
        DOM.warningSection?.classList.add('hidden');
        return;
    }

    console.log('發現警特報:', data.records.record.length, '筆');

    DOM.warningSection?.classList.remove('hidden');
    if (!DOM.warningList) return;

    // 生成 HTML
    let html = '';

    data.records.record.forEach(record => {
        const datasetInfo = record.datasetInfo;
        const content = record.contents?.content;
        const hazard = record.hazardConditions?.hazards?.hazard?.[0];

        if (!datasetInfo) return;

        const title = datasetInfo.datasetDescription || '氣象特報';
        const phenomena = hazard?.info?.phenomena || '';
        const significance = hazard?.info?.significance || '';
        const contentText = content?.contentText || '';

        // 格式化時間
        let timeStr = '';
        if (datasetInfo.validTime?.startTime && datasetInfo.validTime?.endTime) {
            const start = new Date(datasetInfo.validTime.startTime);
            const end = new Date(datasetInfo.validTime.endTime);
            const formatTime = (date) => {
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${month}/${day} ${hours}:${minutes}`;
            };
            timeStr = `<div class="warning-time">生效時間：${formatTime(start)} ~ ${formatTime(end)}</div>`;
        }

        // 發布和更新時間
        let issueInfo = '';
        if (datasetInfo.issueTime) {
            const issueDate = new Date(datasetInfo.issueTime);
            const formatDateTime = (date) => {
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${month}/${day} ${hours}:${minutes}`;
            };
            issueInfo = `<div class="warning-issue">發布時間：${formatDateTime(issueDate)}</div>`;
        }

        // 處理描述文字（保留換行和格式）
        const formattedContent = contentText.trim().replace(/\n/g, '<br>');

        html += `
            <div class="warning-item">
                <div class="warning-title">${title}</div>
                ${issueInfo}
                ${timeStr}
                <div class="warning-content">${formattedContent}</div>
            </div>
        `;
    });

    DOM.warningList.innerHTML = html;
}

// ========================================
// 颱風
// ========================================
async function loadTyphoon() {
    const data = await apiRequest(CONFIG.ENDPOINTS.TYPHOON);

    if (!data?.records?.tropicalCyclones?.tropicalCyclone?.length) {
        DOM.typhoonBanner?.classList.add('hidden');
        return;
    }

    const typhoons = data.records.tropicalCyclones.tropicalCyclone;
    const validTyphoons = [];

    // 移動方向英文轉中文
    const directionMap = {
        'N': '北', 'S': '南', 'E': '東', 'W': '西',
        'NE': '東北', 'NW': '西北', 'SE': '東南', 'SW': '西南',
        'NNE': '北北東', 'NNW': '北北西', 'ENE': '東北東', 'ESE': '東南東',
        'SSE': '南南東', 'SSW': '南南西', 'WNW': '西北西', 'WSW': '西南西'
    };

    // 收集所有有效的颱風資訊
    typhoons.forEach(tc => {
        const nameEn = tc.typhoonName || '熱帶氣旋';
        const nameCh = tc.cwaTyphoonName || '';
        const displayName = nameCh ? `${nameCh}（${nameEn}）` : nameEn;
        const fixData = tc.analysisData?.fix;

        // 取得最新的觀測資料（陣列最後一個）
        const info = fixData?.[fixData.length - 1] || fixData?.[0];

        if (info) {
            const pressure = info.pressure || '-';
            const maxWind = info.maxWindSpeed || '-';
            const maxGust = info.maxGustSpeed || '-';
            const movingSpeed = info.movingSpeed || '-';
            const movingDir = info.movingDirection || '';
            const movingDirCh = directionMap[movingDir] || movingDir;
            const fixTime = info.fixTime || '';

            // 解析座標 (格式可能是 "128.7,9.0" 或物件)
            let lat = '', lng = '';
            if (typeof info.coordinate === 'string') {
                const coords = info.coordinate.split(',');
                if (coords.length === 2) {
                    lng = coords[0];
                    lat = coords[1];
                }
            } else {
                lat = info.coordinate?.lat || '';
                lng = info.coordinate?.lng || '';
            }

            // 格式化時間
            let timeStr = '';
            if (fixTime) {
                const d = new Date(fixTime);
                timeStr = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00`;
            }

            validTyphoons.push({
                name: displayName,
                nameShort: nameCh || nameEn,
                pressure,
                maxWind,
                maxGust,
                movingSpeed,
                movingDir: movingDirCh,
                position: (lat && lng) ? `北緯${lat}° 東經${lng}°` : '',
                time: timeStr
            });
        }
    });

    if (validTyphoons.length === 0) {
        DOM.typhoonBanner?.classList.add('hidden');
        return;
    }

    DOM.typhoonBanner?.classList.remove('hidden');

    if (validTyphoons.length === 1) {
        // 只有一個颱風
        const tc = validTyphoons[0];
        if (DOM.typhoonTitle) DOM.typhoonTitle.textContent = `颱風警報`;
        if (DOM.typhoonDesc) {
            DOM.typhoonDesc.innerHTML = `
                <div class="typhoon-stat typhoon-clickable" onclick="openSatelliteModal();">
                    <span class="typhoon-stat-name">${tc.nameShort}</span>
                    <span class="typhoon-stat-info">風速 ${tc.maxWind}m/s</span>
                    <span class="typhoon-stat-info">陣風 ${tc.maxGust}m/s</span>
                    <span class="typhoon-stat-info">氣壓 ${tc.pressure}hPa</span>
                    <span class="typhoon-stat-info">向${tc.movingDir} ${tc.movingSpeed}km/h</span>
                </div>
            `;
        }
    } else {
        // 多個颱風
        if (DOM.typhoonTitle) DOM.typhoonTitle.textContent = `颱風警報`;
        if (DOM.typhoonDesc) {
            DOM.typhoonDesc.innerHTML = validTyphoons.map(tc => `
                <div class="typhoon-stat typhoon-clickable" onclick="openSatelliteModal();">
                    <span class="typhoon-stat-name">${tc.nameShort}</span>
                    <span class="typhoon-stat-info">風速 ${tc.maxWind}m/s</span>
                    <span class="typhoon-stat-info">陣風 ${tc.maxGust}m/s</span>
                    <span class="typhoon-stat-info">氣壓 ${tc.pressure}hPa</span>
                    <span class="typhoon-stat-info">向${tc.movingDir} ${tc.movingSpeed}km/h</span>
                </div>
            `).join('');
        }
    }
}

// ========================================
// 天文
// ========================================
async function loadAstronomy() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const city = state.currentCity || '臺北市';

    const [sunData, moonData] = await Promise.all([
        apiRequest(CONFIG.ENDPOINTS.SUNRISE, { CountyName: city, Date: dateStr }),
        apiRequest(CONFIG.ENDPOINTS.MOONRISE, { CountyName: city, Date: dateStr })
    ]);

    let sunrise = '--:--', sunset = '--:--', moonrise = '--:--';

    if (sunData?.records?.locations?.location?.[0]?.time?.[0]) {
        const sunTime = sunData.records.locations.location[0].time[0];
        sunrise = sunTime.SunRiseTime || '--:--';
        sunset = sunTime.SunSetTime || '--:--';
    }

    if (moonData?.records?.locations?.location?.[0]?.time?.[0]) {
        const moonTime = moonData.records.locations.location[0].time[0];
        moonrise = moonTime.MoonRiseTime || moonTime.moonRiseTime || '--:--';
    }

    if (!DOM.astroCards) return;

    DOM.astroCards.innerHTML = `
        <div class="astro-card">
            <div class="astro-icon sunrise">${ICONS.sunrise}</div>
            <div class="astro-label">日出</div>
            <div class="astro-value">${sunrise}</div>
        </div>
        <div class="astro-card">
            <div class="astro-icon sunset">${ICONS.sunset}</div>
            <div class="astro-label">日落</div>
            <div class="astro-value">${sunset}</div>
        </div>
        <div class="astro-card">
            <div class="astro-icon moon">${ICONS.moon}</div>
            <div class="astro-label">月出</div>
            <div class="astro-value">${moonrise}</div>
        </div>
    `;
}

// ========================================
// 台灣天氣地圖
// ========================================
async function loadTaiwanWeather() {
    const data = await apiRequest(CONFIG.ENDPOINTS.FORECAST);
    if (!data?.records?.location) return;

    const locations = data.records.location;

    // 更新地圖標記
    updateMapMarkers(locations);

    // 更新城市列表
    renderCityList(locations);
}

function updateMapMarkers(locations) {
    if (!state.map) return;

    // 清除舊標記
    state.markers.forEach(m => state.map.removeLayer(m));
    state.markers = [];

    // 添加新標記
    locations.forEach(loc => {
        const coords = CITY_COORDS[loc.locationName];
        if (!coords) return;

        const els = loc.weatherElement || [];
        const maxT = els.find(e => e.elementName === 'MaxT');
        const minT = els.find(e => e.elementName === 'MinT');
        const wx = els.find(e => e.elementName === 'Wx');
        const pop = els.find(e => e.elementName === 'PoP');

        const tempMax = maxT?.time?.[0]?.parameter?.parameterName || '-';
        const tempMin = minT?.time?.[0]?.parameter?.parameterName || '-';
        const desc = wx?.time?.[0]?.parameter?.parameterName || '';
        const rainProb = pop?.time?.[0]?.parameter?.parameterName || '0';

        // 自定義圖標
        const iconHtml = `
            <div class="weather-marker">
                <div class="weather-marker-icon">${getWeatherIcon(desc)}</div>
                <div class="weather-marker-temp">${tempMax}°</div>
            </div>
        `;

        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: [50, 60],
            iconAnchor: [25, 60]
        });

        const marker = L.marker(coords, { icon: customIcon }).addTo(state.map);

        // Popup 內容
        marker.bindPopup(`
            <div class="map-popup">
                <div class="map-popup-title">${loc.locationName}</div>
                <div class="map-popup-temp">${tempMin}° ~ ${tempMax}°</div>
                <div class="map-popup-desc">${desc} · 降雨 ${rainProb}%</div>
            </div>
        `);

        marker.on('click', () => {
            selectCity(loc.locationName);
        });

        state.markers.push(marker);
    });

    // 如果有選定城市，移動視角
    if (state.currentCity && CITY_COORDS[state.currentCity]) {
        state.map.setView(CITY_COORDS[state.currentCity], 10);
    }
}

function renderCityList(locations) {
    if (!DOM.taiwanWeatherList) return;

    // 將 locations 依照北到南的順序排序
    const sortedLocations = [...locations].sort((a, b) => {
        const indexA = CITIES_NORTH_TO_SOUTH.indexOf(a.locationName);
        const indexB = CITIES_NORTH_TO_SOUTH.indexOf(b.locationName);
        // 如果找不到，放到最後
        const orderA = indexA === -1 ? 999 : indexA;
        const orderB = indexB === -1 ? 999 : indexB;
        return orderA - orderB;
    });

    // 判斷當前是白天還是晚上
    const now = new Date();
    const hour = now.getHours();
    const isDaytime = hour >= 6 && hour < 18;

    let html = '';

    sortedLocations.forEach(loc => {
        const els = loc.weatherElement || [];
        const wx = els.find(e => e.elementName === 'Wx');
        const maxT = els.find(e => e.elementName === 'MaxT');
        const minT = els.find(e => e.elementName === 'MinT');
        const pop = els.find(e => e.elementName === 'PoP');

        const desc = wx?.time?.[0]?.parameter?.parameterName || '-';
        const tempMax = maxT?.time?.[0]?.parameter?.parameterName || '-';
        const tempMin = minT?.time?.[0]?.parameter?.parameterName || '-';
        const rainProb = pop?.time?.[0]?.parameter?.parameterName || '0';

        const isActive = loc.locationName === state.currentCity;

        let weatherIcon = getWeatherIcon(desc);
        // 晚上將太陽圖示改為月亮
        if (!isDaytime && weatherIcon === ICONS.sun) {
            weatherIcon = ICONS.moon;
        } else if (!isDaytime && weatherIcon === ICONS.cloudSun) {
            weatherIcon = ICONS.cloud;
        }

        html += `
            <div class="city-row ${isActive ? 'active' : ''}" onclick="selectCity('${loc.locationName}')">
                <div class="city-row-icon">${weatherIcon}</div>
                <div class="city-row-name">${loc.locationName}</div>
                <div class="city-row-temps">
                    <span class="city-row-temp high">${ICONS.arrowUp}${tempMax}°</span>
                    <span class="city-row-temp low">${ICONS.arrowDown}${tempMin}°</span>
                </div>
                <div class="city-row-rain">${ICONS.drop}${rainProb}%</div>
            </div>
        `;
    });

    DOM.taiwanWeatherList.innerHTML = html;
}

// ========================================
// 選擇城市
// ========================================
async function selectCity(cityName) {
    state.currentCity = cityName;
    state.currentDistrict = '';

    if (DOM.citySelect) {
        DOM.citySelect.value = cityName;
    }

    localStorage.setItem('selected_city', cityName);

    // 使用 loadCityData 統一管理載入狀態
    await loadCityData();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`已切換至 ${cityName}`);
}

// ========================================
// 工具函數
// ========================================
function autoLocate() {
    if (!navigator.geolocation) {
        showToast('瀏覽器不支援定位功能');
        return;
    }

    showToast('定位中...');

    navigator.geolocation.getCurrentPosition(
        async pos => {
            const { latitude, longitude } = pos.coords;
            const result = findNearestLocation(latitude, longitude);

            if (result.city) {
                // 如果城市不同，先切換城市
                if (state.currentCity !== result.city) {
                    await selectCity(result.city);
                } else {
                    // 如果城市相同，但沒有鄉鎮資料，嘗試載入
                    if (!state.districtData || state.districtData.length === 0) {
                        await loadTownshipForecast();
                    }
                }

                // 如果有定位到鄉鎮，且該鄉鎮在目前的選單中
                if (result.township && DOM.districtSelect) {
                    // 檢查該鄉鎮是否存在於選單中
                    const option = Array.from(DOM.districtSelect.options).find(opt => opt.value === result.township);
                    if (option) {
                        DOM.districtSelect.value = result.township;
                        // 觸發 change 事件以更新天氣
                        DOM.districtSelect.dispatchEvent(new Event('change'));
                        showToast(`已定位至 ${result.city}${result.township}`);
                    } else {
                        showToast(`已定位至 ${result.city}`);
                    }
                } else {
                    showToast(`已定位至 ${result.city}`);
                }
            }
        },
        () => {
            showToast('定位失敗，請手動選擇');
        }
    );
}

function findNearestLocation(lat, lng) {
    let nearest = { city: '臺北市', dist: Infinity };

    // 1. 檢查縣市中心
    Object.entries(CITY_COORDS).forEach(([city, [cLat, cLng]]) => {
        const dist = Math.sqrt(Math.pow(lat - cLat, 2) + Math.pow(lng - cLng, 2));
        if (dist < nearest.dist) {
            nearest = { city, dist };
        }
    });

    // 2. 檢查鄉鎮市區
    if (typeof TOWNSHIP_COORDS !== 'undefined') {
        Object.entries(TOWNSHIP_COORDS).forEach(([city, townships]) => {
            Object.entries(townships).forEach(([town, [tLat, tLng]]) => {
                const dist = Math.sqrt(Math.pow(lat - tLat, 2) + Math.pow(lng - tLng, 2));
                if (dist < nearest.dist) {
                    nearest = { city, township: town, dist };
                }
            });
        });
    }

    return nearest;
}

function updateLastTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    const span = DOM.updateTime?.querySelector('span');
    if (span) span.textContent = timeStr;
}

function setLoading(show) {
    if (show) {
        DOM.loadingOverlay?.classList.remove('hidden');
    } else {
        DOM.loadingOverlay?.classList.add('hidden');
    }
}

function showToast(msg, duration = 2000) {
    if (!DOM.toast) return;
    DOM.toast.textContent = msg;
    DOM.toast.classList.add('show');

    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, duration);
}

function openModal() {
    DOM.modalOverlay?.classList.add('active');
}

function closeModal() {
    DOM.modalOverlay?.classList.remove('active');
}

function showEqImage(url) {
    if (!url) return;
    if (DOM.modalImage) DOM.modalImage.src = url;
    DOM.imageModal?.classList.add('active');
}

function closeImageModal() {
    DOM.imageModal?.classList.remove('active');
}

// 開啟衛星雲圖 Modal
function openSatelliteModal() {
    // 重新載入圖片以獲取最新衛星雲圖（加上時間戳避免快取）
    if (DOM.satelliteImage) {
        const timestamp = new Date().getTime();
        DOM.satelliteImage.src = `https://www.cwa.gov.tw/Data/satellite/LCC_IR1_CR_2750/LCC_IR1_CR_2750.jpg?t=${timestamp}`;
    }
    DOM.satelliteModal?.classList.add('active');
}

// 關閉衛星雲圖 Modal
function closeSatelliteModal() {
    DOM.satelliteModal?.classList.remove('active');
}

// 全域函數
window.selectCity = selectCity;
window.showEqImage = showEqImage;
window.openSatelliteModal = openSatelliteModal;


// 顯示地震報告圖片（使用統一的 lightbox 樣式）
function showEarthquakeImage(url) {
    if (!url) return;
    if (DOM.modalImage) DOM.modalImage.src = url;
    DOM.imageModal?.classList.add('active');
}

// 將函數導出到 window，讓 HTML onclick 可以使用
window.showEarthquakeImage = showEarthquakeImage;
