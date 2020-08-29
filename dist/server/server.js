"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const web_server = express_1.default();
const PORT = 3000;
web_server.get('/', (req, res) => res.send('Le sigh...'));
let clientPath = __dirname + '/../client';
console.log(`Serving files from client path ${clientPath}`);
web_server.use(express_1.default.static(clientPath));
web_server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
