"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerClient = void 0;
const command_1 = require("../../commands/command");
const serializer_1 = require("../serializer");
class ServerClient {
    constructor(userID) {
        this.userID = userID;
        this.commandHandlers = new Array();
        this.serializer = new serializer_1.Serializer();
    }
    connect(socket) {
        this.socket = socket;
    }
    send(o) {
        if (this.socket) {
            this.socket.receive(this.serializer.serialize(o));
        }
    }
    receive(msg) {
        let o = this.serializer.deserialize(msg);
        if (o && o instanceof command_1.Command) {
            // Pass the message along
            for (let handler of this.commandHandlers) {
                handler.handleCommand(o);
            }
        }
    }
    registerCommandHandler(handler) {
        this.commandHandlers.push(handler);
    }
    unregisterCommandHandler(handler) {
        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);
    }
    handleMessage(message) {
        // ServerClient objects only get the message object that is suitable for passing down the link, so ship it!
        this.send(message);
    }
}
exports.ServerClient = ServerClient;
