import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { TableManager } from "../../casino/tables/table-manager";
import { ActionMessage } from "../../messages/action-message";
import { TableConnectedAction } from "../../actions/table/state/table-connected-action";
import { MessagePair } from "../../messages/message-pair";
import { IServerClient } from "./i-server-client";

export class ClientManager implements MessageHandler, CommandHandler {


    private tableManager: TableManager;

    private clients: IServerClient[];


    constructor()
    {
        this.clients = new Array<IServerClient>();
    }

    setTableManager(tableManager: TableManager) {

        this.tableManager = tableManager;

        this.tableManager.registerMessageHandler(this);

        for (let client of this.clients) {

            client.handleMessage(new ActionMessage(new TableConnectedAction(this.tableManager.tableID)));

        }

    }

    addClient(client: IServerClient) {

        this.clients.push(client);

        // Set this manager to listen to commands from this new client
        client.registerCommandHandler(this);

        this.log(`Connected client for userID ${client.userID}`);

        client.handleMessage(new ActionMessage(new TableConnectedAction(this.tableManager.tableID)));

    }

    removeClient(client: IServerClient) {

        this.clients = this.clients.filter(c => c !== client);

    }


    private log(msg: string): void {

        // console.log('\x1b[33m%s\x1b[0m', msg);

    }


    handleCommand(command: Command): void {

        this.log(`heard: ${command.constructor.name}`);

        this.broadcastCommand(command);

    }


    private broadcastCommand(command: Command) {

        if (this.tableManager) {
            this.tableManager.handleCommand(command);
        }

    }

    public handleMessage(message: Message | MessagePair): void {

        for (let client of this.clients) {

            if (message instanceof MessagePair) {

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