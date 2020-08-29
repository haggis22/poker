"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor() {
        this.path = "logs/poker.log";
    }
    write(message) {
        console.log(message);
        /*
                return new Promise((resolve, reject) => {
        
                    fs.appendFile(this.path, message + '\n', 'utf8', (err) => {
        
                        if (err) { return reject(err); }
        
                        resolve();
        
                    });  // fs.appendFile
        
                });
        */
    }
    debug(message) {
        return this.write(message);
    }
    info(message) {
        return this.write(message);
    }
}
exports.Logger = Logger;
