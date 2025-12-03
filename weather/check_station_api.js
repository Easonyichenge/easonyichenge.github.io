const https = require('https');

const API_KEY = 'CWA-B5914331-BEC0-45B6-84B8-7A5A415C2B7D';
const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=${API_KEY}&limit=5`;

https.get(URL, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        if (json.records && json.records.Station) {
            const station = json.records.Station[0];
            console.log('GeoInfo:', JSON.stringify(station.GeoInfo, null, 2));
            console.log('WeatherElement:', JSON.stringify(station.WeatherElement, null, 2));
        } else {
            console.log('No station data found');
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
