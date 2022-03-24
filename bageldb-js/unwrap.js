// const fs = require('fs');
// const { join } = require('path');
// // const semver = require('semver')
// const TARGET = './dist';


// // const beta  = semver.inc('0.3.14-beta.9', 'prerelease', 'beta')
// // console.log('beta version :>> ', beta);

// fs.readdirSync(TARGET).forEach((file) => {
//   const entry = join(TARGET, file);
//   const output = join(__dirname, file);

//   if (fs.existsSync(output)) {
//     throw new Error(
//       `Can't unwrap @bageldb/bagel-db. File ${file} already exists in root folder.`,
//     );
//   } else {
//     fs.copyFileSync(entry, output);
//   }
// });