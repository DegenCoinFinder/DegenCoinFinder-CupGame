const fs = require('fs');
const idl = require('../myepicproject/target/idl/myepicproject.json');

fs.writeFileSync('./src/idl.json', JSON.stringify(idl));

