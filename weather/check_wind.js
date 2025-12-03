const fs = require('fs');
const data = JSON.parse(fs.readFileSync('response.json', 'utf8'));
const loc = data.records.Locations[0].Location[0];
const wsElement = loc.WeatherElement.find(e => e.ElementName === '風速');
const gustElement = loc.WeatherElement.find(e => e.ElementName === '最大陣風'); // Check if this exists

console.log('Wind Speed:', JSON.stringify(wsElement.Time[0], null, 2));
if (gustElement) {
    console.log('Gust:', JSON.stringify(gustElement.Time[0], null, 2));
} else {
    console.log('Gust element not found');
    // List all element names to be sure
    console.log('All Elements:', loc.WeatherElement.map(e => e.ElementName));
}
