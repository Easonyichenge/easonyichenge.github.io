const fs = require('fs');
const data = JSON.parse(fs.readFileSync('response.json', 'utf8'));
const elements = data.records.Locations[0].Location[0].WeatherElement;
elements.forEach(e => console.log(e.ElementName));
