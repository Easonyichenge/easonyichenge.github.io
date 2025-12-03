const fs = require('fs');
const data = JSON.parse(fs.readFileSync('response.json', 'utf8'));
// Use '天氣現象' (Wx) which usually has StartTime/EndTime, or check Temperature again
const wxElement = data.records.Locations[0].Location[0].WeatherElement.find(e => e.ElementName === '天氣現象');
const tempElement = data.records.Locations[0].Location[0].WeatherElement.find(e => e.ElementName === '溫度');

if (wxElement) {
    const timeArray = wxElement.Time;
    const startTime = new Date(timeArray[0].StartTime);
    const endTime = new Date(timeArray[timeArray.length - 1].EndTime);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    console.log(`Wx Duration: ${durationHours} hours`);
}

if (tempElement) {
    const timeArray = tempElement.Time;
    // Temperature might use DataTime (point data)
    const startTime = new Date(timeArray[0].DataTime);
    const endTime = new Date(timeArray[timeArray.length - 1].DataTime);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    console.log(`Temp Duration: ${durationHours} hours`);
}
