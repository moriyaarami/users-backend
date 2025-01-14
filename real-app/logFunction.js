const fs = require('fs');
const path = require('path');

const logDirectory = 'logs';
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

function getLogFileName() {
    // Log file name format: YYYY-MM-DD.log
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}.log`;
};

function logRequest(statusCode, message) {
    if (statusCode >= 400) {
        const logFileName = path.join(logDirectory, getLogFileName());
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - ${statusCode} - ${message}\n`;

        fs.appendFile(logFileName, logMessage, (err) => {
            if (err) {
                console.error(`Error writing to log file: ${err}`);
            }
        })
    }

}
module.exports = { logRequest } 