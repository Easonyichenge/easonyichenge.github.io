// Main Application Logic
console.log('Main script loaded');

// Configuration
const CONFIG = {
    mapCenter: [23.97565, 120.9738819], // Center of Taiwan
    mapZoom: 8,
    // CartoDB Positron (Light/Clean)
    tileLayer: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
};

// TDX API Configuration
// Get your keys from: https://tdx.transportdata.tw/
const TDX_CONFIG = {
    clientId: '14131412-14210600-fd67-4f18', // 填入您的 Client ID
    clientSecret: '2d37d31e-9376-4f50-bf8a-3312cb09f520', // 填入您的 Client Secret
    authUrl: 'https://tdx.transportdata.tw/auth/realms/TDXW/protocol/openid-connect/token',
    apiUrl: 'https://tdx.transportdata.tw/api/basic/v2'
};

class TdxService {
    constructor() {
        this.accessToken = null;
    }

    async getAuthToken() {
        if (this.accessToken) return this.accessToken;

        if (TDX_CONFIG.clientId === 'YOUR_CLIENT_ID_HERE') {
            console.warn('TDX API: Client ID not set. Using simulation mode.');
            return null;
        }

        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('client_id', TDX_CONFIG.clientId);
            params.append('client_secret', TDX_CONFIG.clientSecret);

            const response = await fetch(TDX_CONFIG.authUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            if (!response.ok) throw new Error('Auth failed');
            const data = await response.json();
            this.accessToken = data.access_token;
            console.log('TDX API: Auth successful');
            return this.accessToken;
        } catch (e) {
            console.error('TDX API Auth Error:', e);
            if (e.message.includes('Failed to fetch') || e.name === 'TypeError') {
                console.warn('⚠️ CORS Error Detected: Browsers block direct API calls from file://. Please run this project using a local server (e.g., VS Code Live Server, python -m http.server) or use a CORS bypass extension.');
                updateSystemStatus('warning', 'API 連線受阻 (CORS)');
            }
            return null;
        }
    }

    async fetchData(endpoint) {
        const token = await this.getAuthToken();
        if (!token) return null;

        try {
            const response = await fetch(`${TDX_CONFIG.apiUrl}${endpoint}?$format=JSON`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error(`TDX API Fetch Error (${endpoint}):`, e);
            return null;
        }
    }

    async getTraLiveTrains() {
        // 取得台鐵列車即時位置
        return await this.fetchData('/Rail/TRA/LiveTrainDelay');
    }

    async getHsrLiveTrains() {
        // 高鐵沒有公開即時位置 API，通常用時刻表或車站資訊模擬
        // 這裡示範取得即時車站資訊作為替代，或者我們繼續用模擬
        // 為了演示，我們先回傳 null 讓系統 fallback 到模擬
        return null;
    }
}

const tdxService = new TdxService();

// State
const state = {
    map: null,
    layers: {
        hsr: null,
        tra: null,
        mrt: null, // General group if needed, but we use specific ones below
        mrt_tpe: null,
        mrt_kh: null,
        mrt_tc: null,
        mrt_ty: null,
        lrt_ntpc: null
    }
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        initClock();
        initMap();
        initSimulations();
        console.log('OCC System Initialized.');
    } catch (e) {
        console.error('Initialization failed:', e);
        updateSystemStatus('error', '系統初始化失敗');
    }
});

function updateSystemStatus(status, message) {
    const indicator = document.querySelector('.system-status-indicator');
    const dot = document.querySelector('.status-dot');
    const text = document.querySelector('.status-text');

    if (!indicator || !dot || !text) return;

    text.textContent = message;

    // Reset classes
    dot.style.backgroundColor = '';
    indicator.style.color = '';
    indicator.style.background = '';

    if (status === 'error') {
        dot.style.backgroundColor = '#FF3B30'; // Red
        indicator.style.color = '#FF3B30';
        indicator.style.background = 'rgba(255, 59, 48, 0.1)';
    } else if (status === 'warning') {
        dot.style.backgroundColor = '#FF9500'; // Orange
        indicator.style.color = '#FF9500';
        indicator.style.background = 'rgba(255, 149, 0, 0.1)';
    } else {
        dot.style.backgroundColor = '#34C759'; // Green
        indicator.style.color = '#34C759';
        indicator.style.background = 'rgba(52, 199, 89, 0.1)';
    }
}

function initClock() {
    const clockEl = document.getElementById('main-clock');
    const dateEl = document.getElementById('main-date');

    function update() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('zh-TW', { hour12: false });
        dateEl.textContent = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    setInterval(update, 1000);
    update();
}

function initMap() {
    // Initialize Leaflet Map
    state.map = L.map('map', {
        center: CONFIG.mapCenter,
        zoom: CONFIG.mapZoom,
        zoomControl: false, // We'll add custom controls if needed, or move them
        attributionControl: false
    });

    // Add Light Tiles
    L.tileLayer(CONFIG.tileLayer, {
        attribution: CONFIG.attribution,
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(state.map);

    // Layer Groups
    // Initialize all layer groups defined in state
    for (const key in state.layers) {
        state.layers[key] = L.layerGroup().addTo(state.map);
    }
}

function initSimulations() {
    console.log('Starting simulations...');

    // Draw Route Lines
    if (typeof ROUTES !== 'undefined') {
        Object.values(ROUTES).forEach(route => {
            L.polyline(route.path, {
                color: route.color,
                weight: 3,
                opacity: 0.8,
                dashArray: '0', // Solid lines for cleaner Apple look
                className: 'route-line' // Keep animation class if we want flow
            }).addTo(state.map);
        });

        // Simulate Trains
        // HSR (High Speed) - 0.0008
        spawnTrain(ROUTES.HSR, 0.0008, 'HSR-101');
        spawnTrain(ROUTES.HSR, 0.0008, 'HSR-205', true);
        spawnTrain(ROUTES.HSR, 0.0008, 'HSR-303');

        // TRA (Intercity) - 0.0004
        spawnTrain(ROUTES.TRA_WEST, 0.0004, 'TRA-118');
        spawnTrain(ROUTES.TRA_WEST, 0.0004, 'TRA-122', true);
        spawnTrain(ROUTES.TRA_WEST, 0.0004, 'TRA-408');

        // Taipei MRT (Metro) - 0.0002
        spawnTrain(ROUTES.MRT_BL, 0.0002, 'BL-01');
        spawnTrain(ROUTES.MRT_BL, 0.0002, 'BL-15', true);
        spawnTrain(ROUTES.MRT_R, 0.0002, 'R-03');
        spawnTrain(ROUTES.MRT_R, 0.0002, 'R-10', true);
        spawnTrain(ROUTES.MRT_G, 0.0002, 'G-05');
        spawnTrain(ROUTES.MRT_O, 0.0002, 'O-08');
        spawnTrain(ROUTES.MRT_BR, 0.0002, 'BR-04');
        spawnTrain(ROUTES.MRT_Y, 0.0002, 'Y-12');

        // Kaohsiung MRT/LRT
        spawnTrain(ROUTES.KMRT_R, 0.0002, 'KR-01');
        spawnTrain(ROUTES.KMRT_O, 0.0002, 'KO-06');
        spawnTrain(ROUTES.KLRT_C, 0.0002, 'C-01');

        // Taichung MRT
        spawnTrain(ROUTES.TMRT_G, 0.0002, 'TG-01');

        // Taoyuan MRT (Express) - 0.0005
        spawnTrain(ROUTES.TYMRT_A, 0.0005, 'A-01');
        spawnTrain(ROUTES.TYMRT_A, 0.0005, 'A-12', true);

        // New Taipei LRT
        spawnTrain(ROUTES.LRT_DH, 0.0002, 'V-01');
        spawnTrain(ROUTES.LRT_AK, 0.0002, 'K-01');
    } else {
        console.error('ROUTES data not found!');
        updateSystemStatus('error', '路線資料遺失');
    }

    initWeather();
    initDashboardUpdates();
    initTheme();
}

function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const icon = toggle.querySelector('.icon');
    const body = document.body;

    // Check preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        body.setAttribute('data-theme', 'dark');
        icon.textContent = '☀️';
        setMapTheme('dark');
    }

    toggle.addEventListener('click', () => {
        const isDark = body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            body.removeAttribute('data-theme');
            icon.textContent = '🌙';
            setMapTheme('light');
        } else {
            body.setAttribute('data-theme', 'dark');
            icon.textContent = '☀️';
            setMapTheme('dark');
        }
    });
}

function setMapTheme(theme) {
    if (!state.map) return;

    // Remove existing tile layer
    state.map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
            state.map.removeLayer(layer);
        }
    });

    const url = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(url, {
        attribution: CONFIG.attribution,
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(state.map);
}

function initDashboardUpdates() {
    // 1. System Health
    const updateAllHealth = () => {
        updateHealth('status-hsr', 98, 100);
        updateHealth('status-tra', 90, 98);
        updateHealth('status-trtc', 99, 100); // Taipei
        updateHealth('status-krtc', 98, 100); // Kaohsiung
        updateHealth('status-tmrt', 99, 100); // Taichung
        updateHealth('status-tymrt', 97, 100); // Taoyuan
        updateHealth('status-ntpc', 96, 100); // New Taipei
    };
    updateAllHealth(); // Immediate
    setInterval(updateAllHealth, 5000);

    // 2. Alerts (Localized & API)
    const alerts = [
        { type: 'info', msg: '夜間軌道維護排程確認。' },
        { type: 'info', msg: '台北車站人流狀況正常。' },
        { type: 'warning', msg: '板橋站信號微幅延遲。' },
        { type: 'info', msg: '氣象更新：基隆地區大雨特報。' },
        { type: 'warning', msg: '台鐵東部幹線強風速限管制。' },
        { type: 'info', msg: '全系統運作正常。' },
        { type: 'info', msg: '高雄捷運紅線班距調整。' },
        { type: 'info', msg: '桃園機場捷運直達車準點。' }
    ];

    const pushAlert = async () => {
        // Try API first
        const traData = await tdxService.getTraLiveTrains();
        if (traData && traData.length > 0) {
            // Find delayed trains
            const delayed = traData.filter(t => t.DelayTime > 0);
            if (delayed.length > 0) {
                const train = delayed[Math.floor(Math.random() * delayed.length)];
                addAlert({
                    type: 'warning',
                    msg: `台鐵 ${train.TrainNo} 次列車 延誤 ${train.DelayTime} 分鐘`
                });
                return; // Skip fake alert if we have real one
            }
        }

        // Fallback to simulation
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        addAlert(randomAlert);
    };
    pushAlert(); // Immediate
    setInterval(pushAlert, 8000);

    // 3. Charts
    try {
        initCharts();
    } catch (e) {
        console.error('Chart initialization failed:', e);
    }

    // Stats
    const updateStats = () => {
        const count = Math.floor(Math.random() * 50) + 120;
        document.getElementById('active-trains-count').textContent = count;

        const passengers = Math.floor(Math.random() * 1000) + 45000;
        document.getElementById('passenger-count').textContent = passengers.toLocaleString();
    };
    updateStats(); // Immediate
    setInterval(updateStats, 3000);
}

// Weather Integration (Open-Meteo)
async function initWeather() {
    const weatherIconEl = document.querySelector('.weather-icon');
    const weatherTempEl = document.querySelector('.weather-temp');
    const weatherLocEl = document.querySelector('.weather-loc');

    async function fetchWeather() {
        try {
            // Taipei Coordinates: 25.0330, 121.5654
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.0330&longitude=121.5654&current=temperature_2m,weather_code&timezone=Asia%2FTaipei');

            if (!response.ok) throw new Error('Weather API Error');

            const data = await response.json();

            const temp = Math.round(data.current.temperature_2m);
            const code = data.current.weather_code;

            // WMO Weather interpretation
            let icon = '🌤';
            if (code === 0) icon = '☀️';
            else if (code >= 1 && code <= 3) icon = '⛅';
            else if (code >= 45 && code <= 48) icon = '🌫';
            else if (code >= 51 && code <= 67) icon = '🌧';
            else if (code >= 71) icon = '🌨';
            else if (code >= 95) icon = '⚡️';

            weatherTempEl.textContent = `${temp}°C`;
            weatherIconEl.textContent = icon;
            weatherLocEl.textContent = '台北市'; // Default to Taipei for OCC

            // If weather is successful, we assume system connectivity is good
            updateSystemStatus('normal', '系統正常運作');

        } catch (e) {
            console.error('Weather fetch failed:', e);
            weatherTempEl.textContent = '--°C';
            updateSystemStatus('warning', '氣象資料連線異常');
        }
    }

    fetchWeather();
    setInterval(fetchWeather, 600000); // Update every 10 mins
}

let passengerChart, speedChart;

function initCharts() {
    // Passenger Flow Chart (Line)
    const ctxPass = document.getElementById('passenger-chart').getContext('2d');

    // Gradient
    const gradientPass = ctxPass.createLinearGradient(0, 0, 0, 140);
    gradientPass.addColorStop(0, 'rgba(0, 122, 255, 0.2)');
    gradientPass.addColorStop(1, 'rgba(0, 122, 255, 0)');

    passengerChart = new Chart(ctxPass, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                label: '人流',
                data: Array(20).fill(0).map(() => Math.random() * 100 + 500),
                borderColor: '#007AFF',
                backgroundColor: gradientPass,
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: {
                    display: true,
                    grid: { display: false },
                    ticks: { color: '#86868B', font: { family: '-apple-system' } }
                }
            },
            animation: { duration: 0 }
        }
    });

    // Speed Chart (Bar)
    const ctxSpeed = document.getElementById('speed-chart').getContext('2d');
    speedChart = new Chart(ctxSpeed, {
        type: 'bar',
        data: {
            labels: ['高鐵', '台鐵', '捷運'],
            datasets: [{
                label: '平均速率',
                data: [280, 110, 65],
                backgroundColor: ['#FF9500', '#007AFF', '#34C759'],
                barThickness: 16,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#1D1D1F', font: { family: '-apple-system' } }
                },
                y: {
                    display: false
                }
            }
        }
    });

    // Update Loop
    setInterval(() => {
        const newData = Math.floor(Math.random() * 200) + 800;
        passengerChart.data.datasets[0].data.push(newData);
        passengerChart.data.datasets[0].data.shift();
        passengerChart.update('none'); // 'none' for performance

        // Update Speed Data (Micro fluctuations)
        speedChart.data.datasets[0].data = [
            280 + Math.random() * 10 - 5,
            110 + Math.random() * 5 - 2.5,
            65 + Math.random() * 2 - 1
        ];
        speedChart.update('none');
    }, 1000);
}

function updateHealth(id, min, max) {
    const el = document.getElementById(id);
    if (!el) return;

    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    const bar = el.querySelector('.fill');
    const valDisplay = el.querySelector('.card-value');

    valDisplay.textContent = val + '%';
    bar.style.width = val + '%';

    // Color logic
    bar.className = 'fill'; // reset
    if (val < 90) bar.classList.add('warning');
}

function addAlert(alert) {
    const list = document.getElementById('alert-list');
    const item = document.createElement('li');
    item.className = `alert-item ${alert.type}`;
    item.innerHTML = `<span class="alert-tag">${alert.type === 'info' ? '資訊' : '警告'}</span> ${alert.msg}`;

    list.prepend(item);

    if (list.children.length > 5) {
        list.lastElementChild.remove();
    }
}

function spawnTrain(routeDef, speed, id, reverse = false) {
    if (!routeDef) {
        console.warn('Invalid route definition for train:', id);
        return;
    }

    // Check if layer exists
    if (!state.layers[routeDef.type]) {
        console.warn(`Layer group '${routeDef.type}' not found. Creating fallback or skipping.`);
        // Fallback: Try to add to map directly if layer missing, or just skip to prevent crash
        // Better to skip and warn
        return;
    }

    const path = reverse ? [...routeDef.path].reverse() : routeDef.path;
    let currentSegment = 0;
    let progress = 0; // 0 to 1 along the segment

    // Create Marker
    const icon = L.divIcon({
        className: 'train-marker',
        html: `<div class="train-dot" style="background-color: ${routeDef.color}; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
    });

    const marker = L.marker(path[0], { icon: icon }).addTo(state.layers[routeDef.type]);
    marker.bindPopup(`<b>${id}</b><br>車速: ${(speed * 1000).toFixed(0)} km/h`);

    // Animation Loop
    function animate() {
        if (!marker._map) return; // Stop if removed

        progress += speed;

        if (progress >= 1) {
            progress = 0;
            currentSegment++;
            if (currentSegment >= path.length - 1) {
                // Loop back
                currentSegment = 0;
            }
        }

        const start = path[currentSegment];
        const end = path[currentSegment + 1];

        const lat = start[0] + (end[0] - start[0]) * progress;
        const lng = start[1] + (end[1] - start[1]) * progress;

        marker.setLatLng([lat, lng]);

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}
