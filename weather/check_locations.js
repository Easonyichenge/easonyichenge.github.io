const fs = require('fs');
const data = JSON.parse(fs.readFileSync('response.json', 'utf8'));
console.log(JSON.stringify(data.records, null, 2).substring(0, 500));
