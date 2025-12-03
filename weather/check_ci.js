const fs = require('fs');
const data = JSON.parse(fs.readFileSync('response.json', 'utf8'));
const ciElement = data.records.Locations[0].Location[0].WeatherElement.find(e => e.ElementName === '舒適度指數');
console.log(JSON.stringify(ciElement.Time[0], null, 2));
