const fs = require('fs');

const fileName = 'lethanhpa.txt';
const content = 'Hello content!';

fs.appendFile(fileName, content, function (err) {
  if (err) throw err;
  console.log('Saved!');
});
