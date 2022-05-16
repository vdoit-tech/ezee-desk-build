const log = require("electron-log");
const path = require("path");

const logFormat = "{y}-{m}-{d} {h}:{i}:{s} | {level} | {text}";
log.transports.console.format = logFormat;
log.info("Hello guysss");

log.transports.file.resolvePath = () => __dirname + "/log.log";
console.log(log.transports.file.getFile());
log.info("Hello guysss");

// console.log(path.join(__dirname, '/logsmain.log'));
// const path = require("path");
// const log = require('electron-log');

// log.transports.file.resolvePath = () => path.join(__dirname, '/logsmain.log');
// log.transports.file.level = "info";

export default log;
