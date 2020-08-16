import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { ServerClient } from "./server-client";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { TableManager } from "../../casino/tables/table-manager";
import { ActionMessage } from "../../messages/action-message";
import { TableConnectedAction } from "../../actions/table/state/table-connected-action";

export class ClientManager implements MessageHandler, CommandHandler {


    private tableManager: TableManager;

    private clients: ServerClient[];


    constructor()
    {
        this.clients = new Array<ServerClient>();
    }

    setTableManager(tableManager: TableManager) {

        this.tableManager = tableManager;

        this.tableManager.registerMessageHandler(this);

        for (let client of this.clients) {

            client.handleMessage(new ActionMessage(new TableConnectedAction(this.tableManager.tableID)));

        }

    }

    addClient(client: ServerClient) {

        this.clients.push(client);

        // Set this manager to listen to commands from this new client
        client.registerCommandHandler(this);

        this.log(`Connected client for userID ${client.userID}`);

        client.handleMessage(new ActionMessage(new TableConnectedAction(this.tableManager.tableID)));

    }

    removeClient(client: ServerClient) {

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

    public handleMessage(publicMessage: Message, privateMessage?: Message): void {

        for (let client of this.clients) {

            if (privateMessage) {

                if (client.userID === privateMessage.userID) {

                    client.handleMessage(privateMessage);

                }
                else {

                    if (publicMessage) {

                        client.handleMessage(publicMessage);

                    }

                }

            }
            else {
                // there is no private message, so just send them the publicly-available one
                client.handleMessage(publicMessage);
            }

        }

    }


}