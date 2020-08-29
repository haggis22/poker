"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameClient = void 0;
const message_1 = require("../../messages/message");
const serializer_1 = require("../serializer");
const action_message_1 = require("../../messages/action-message");
class GameClient {
    constructor() {
        this.messageHandlers = new Array();
        this.serializer = new serializer_1.Serializer();
    }
    connect(socket) {
        this.socket = socket;
    }
    send(o) {
        if (this.socket) {
            this.log(`Sending ${o.constructor.name}`);
            this.socket.receive(this.serializer.serialize(o));
        }
    }
    receive(msg) {
        let msgObj = this.serializer.deserialize(msg);
        this.log(`received ${msgObj.constructor.name}: ${msg}`);
        if (msgObj instanceof message_1.Message) {
            // this.log('Yes, it is a Message');
            if (msgObj instanceof action_message_1.ActionMessage) {
                this.log(`received action ${msgObj.action.constructor.name}`);
            }
            // Pass the message along
            for (let handler of this.messageHandlers) {
                this.log(`Passed message to ${handler.constructor.name}`);
                handler.handleMessage(msgObj);
            }
        }
        else {
            this.log('No, it is NOT a Message');
        }
    }
    registerMessageHandler(handler) {
        this.messageHandlers.push(handler);
    }
    unregisterMessageHandler(handler) {
        this.messageHandlers = this.messageHandlers.filter(mh => mh !== handler);
    }
    handleCommand(command) {
        this.send(command);
    }
    log(msg) {
        // console.log('\x1b[36m%s\x1b[0m', `GameClient ${msg}`);
    }
}
exports.GameClient = GameClient;
