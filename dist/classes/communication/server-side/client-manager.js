"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientManager = void 0;
const action_message_1 = require("../../messages/action-message");
const table_connected_action_1 = require("../../actions/table/state/table-connected-action");
const message_pair_1 = require("../../messages/message-pair");
class ClientManager {
    constructor() {
        this.clients = new Array();
    }
    setTableManager(tableManager) {
        this.tableManager = tableManager;
        this.tableManager.registerMessageHandler(this);
        for (let client of this.clients) {
            client.handleMessage(new action_message_1.ActionMessage(new table_connected_action_1.TableConnectedAction(this.tableManager.tableID)));
        }
    }
    addClient(client) {
        this.clients.push(client);
        // Set this manager to listen to commands from this new client
        client.registerCommandHandler(this);
        this.log(`Connected client for userID ${client.userID}`);
        client.handleMessage(new action_message_1.ActionMessage(new table_connected_action_1.TableConnectedAction(this.tableManager.tableID)));
    }
    removeClient(client) {
        this.clients = this.clients.filter(c => c !== client);
    }
    log(msg) {
        // console.log('\x1b[33m%s\x1b[0m', msg);
    }
    handleCommand(command) {
        this.log(`heard: ${command.constructor.name}`);
        this.broadcastCommand(command);
    }
    broadcastCommand(command) {
        if (this.tableManager) {
            this.tableManager.handleCommand(command);
        }
    }
    handleMessage(message) {
        for (let client of this.clients) {
            if (message instanceof message_pair_1.MessagePair) {
                if (client.userID === message.privateMessage.userID) {
                    // just send the private message to this client
                    client.handleMessage(message.privateMessage);
                }
                else if (message.publicMessage) {
                    // If there is a public message, then send it instead to this client
                    client.handleMessage(message.publicMessage);
                }
            }
            else {
                if (message.userID == null || message.userID == client.userID) {
                    // this is either a public message, or it is marked for this client
                    client.handleMessage(message);
                }
            }
        }
    }
}
exports.ClientManager = ClientManager;
