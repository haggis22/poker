"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStore = void 0;
const fs = __importStar(require("fs"));
class DataStore {
    static async write(path, data) {
        return new Promise((resolve, reject) => {
            fs.open(path, 'w', (err, fd) => {
                if (err) {
                    return reject(err);
                }
                let str = JSON.stringify(data);
                fs.write(fd, str, (err, written) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(written);
                    }
                });
            });
        });
    }
    static async list(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) {
                    return reject(err);
                }
                let vehicles = [];
                files.forEach((file) => {
                    let bytes = fs.readFileSync(path + file);
                    let vehicle = JSON.parse(bytes.toString());
                    vehicles.push(vehicle);
                });
                return resolve(vehicles);
            });
        });
    }
}
exports.DataStore = DataStore;
