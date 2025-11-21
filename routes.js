// Route Definitions (Simulated Paths for Taiwan Transit)

const ROUTES = {
    // === Intercity ===
    HSR: {
        color: '#FF9500', // Apple Orange
        type: 'hsr',
        path: [
            [25.0478, 121.5170], // Taipei
            [25.0132, 121.4638], // Banqiao
            [24.8083, 121.0402], // Hsinchu
            [24.1120, 120.6160], // Taichung
            [23.4591, 120.3235], // Chiayi
            [22.9248, 120.2858], // Tainan
            [22.6866, 120.3085]  // Zuoying
        ]
    },
    TRA_WEST: {
        color: '#007AFF', // Apple Blue
        type: 'tra',
        path: [
            [25.1276, 121.7411], // Keelung
            [25.0478, 121.5170], // Taipei
            [24.9536, 121.2257], // Taoyuan
            [24.8016, 120.9716], // Hsinchu
            [24.1368, 120.6850], // Taichung
            [23.4792, 120.4411], // Chiayi
            [22.9971, 120.2126], // Tainan
            [22.6397, 120.3026]  // Kaohsiung
        ]
    },

    // === Taipei MRT (TRTC) ===
    MRT_BL: { // Bannan Line
        color: '#0070C9',
        type: 'mrt_tpe',
        path: [[25.0410, 121.5760], [25.0414, 121.5434], [25.0478, 121.5170], [25.0421, 121.5083], [25.0297, 121.4624]]
    },
    MRT_R: { // Tamsui-Xinyi Line
        color: '#FF3B30', // Apple Red
        type: 'mrt_tpe',
        path: [[25.1678, 121.4456], [25.0931, 121.5246], [25.0478, 121.5170], [25.0327, 121.5185], [25.0330, 121.5645]]
    },
    MRT_G: { // Songshan-Xindian Line
        color: '#34C759', // Apple Green
        type: 'mrt_tpe',
        path: [[25.0504, 121.5777], [25.0518, 121.5443], [25.0353, 121.5204], [24.9731, 121.5429]]
    },
    MRT_O: { // Zhonghe-Xinlu Line
        color: '#FF9F0A',
        type: 'mrt_tpe',
        path: [[25.0843, 121.4705], [25.0632, 121.5238], [25.0264, 121.5229], [24.9896, 121.5103]]
    },
    MRT_BR: { // Wenhu Line
        color: '#AC8E68', // Brown
        type: 'mrt_tpe',
        path: [[25.0838, 121.5574], [25.0553, 121.5448], [25.0166, 121.5433], [24.9961, 121.5583]]
    },
    MRT_Y: { // Circular Line
        color: '#FFD60A', // Yellow
        type: 'mrt_tpe',
        path: [[25.0615, 121.4599], [25.0125, 121.4654], [24.9902, 121.5090], [24.9841, 121.5407]]
    },

    // === Kaohsiung MRT (KRTC) ===
    KMRT_R: { // Red Line
        color: '#FF3B30',
        type: 'mrt_kh',
        path: [[22.8023, 120.2965], [22.6880, 120.3089], [22.6314, 120.3018], [22.5643, 120.3551]]
    },
    KMRT_O: { // Orange Line
        color: '#FF9500',
        type: 'mrt_kh',
        path: [[22.6212, 120.2633], [22.6314, 120.3018], [22.6265, 120.3445], [22.6198, 120.3756]]
    },
    KLRT_C: { // Circular Light Rail
        color: '#30D158', // Light Green
        type: 'mrt_kh',
        path: [[22.6047, 120.3101], [22.6133, 120.2863], [22.6517, 120.2831], [22.6613, 120.3093]]
    },

    // === Taichung MRT (TMRT) ===
    TMRT_G: { // Green Line
        color: '#34C759',
        type: 'mrt_tc',
        path: [[24.1884, 120.6158], [24.1627, 120.6457], [24.1368, 120.6850], [24.1118, 120.6161]]
    },

    // === Taoyuan MRT (TYMC) ===
    TYMRT_A: { // Airport Line
        color: '#5856D6', // Purple
        type: 'mrt_ty',
        path: [[25.0478, 121.5170], [25.0615, 121.3833], [25.0776, 121.2323], [24.9536, 121.2257]]
    },

    // === New Taipei LRT ===
    LRT_DH: { // Danhai LRT
        color: '#AF52DE', // Light Purple
        type: 'lrt_ntpc',
        path: [[25.1768, 121.4456], [25.1915, 121.4231], [25.1837, 121.4124]]
    },
    LRT_AK: { // Ankeng LRT
        color: '#C69C6D', // Light Brown
        type: 'lrt_ntpc',
        path: [[24.9832, 121.5407], [24.9675, 121.5134], [24.9568, 121.4895]]
    }
};
