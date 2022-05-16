const path = require("path");
const log = require("electron-log");
const fs = require("fs");

// log.transports.file.resolvePath = () => path.join(__dirname, "/logsfile.log");
// log.transports.file.level = "info";

// exports.logInfo = (text) => log.info(text);
// exports.logWarn = (text) => log.warn(text);

//logger for console logs
// export const detailsLogger = (text) => {
//   fs.writeFile(
//     "logger.log",
//     `\n[${new Date().toLocaleString()}] [info] :${text}`,
//     (err) => {
//       if (err) {
//         console.log("An error ocurred creating the file " + err.message);
//       }

//       console.log("The file has been succesfully saved");
//     }
//   );
// };
