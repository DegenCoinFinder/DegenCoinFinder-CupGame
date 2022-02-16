const fs = require('fs');

fs.copyFile('../myepicproject/target/idl/myepicproject.json', './idl.json', (err) => {
    if (err) throw err;
    console.log('idl was copied to destination...');
});

