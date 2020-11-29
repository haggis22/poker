import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { TableController } from "../../casino/tables/table-controller";
import { ActionMessage } from "../../messages/action-message";
import { TableConnectedAction } from "../../actions/table/state/table-connected-action";
import { MessagePair } from "../../messages/message-pair";
import { IServerClient } from "./i-server-client";

export class ClientManager implements MessageHandler, CommandHandler {


    private tableID: number;
    private tableController: TableController;

    private clients: IServerClient[];


    constructor(tableID: number)
    {
        this.tableID = tableID;

        this.clients = new Array<IServerClient>();
    }


    setTableController(tableController: TableController) {

        this.tableController = tableController;


/*
        for (let client of this.clients) {

            client.handleMessage(new ActionMessage(new TableConnectedAction(this.tableController.table.id)));

        }
*/

    }

    addClient(client: IServerClient) {

        this.clients.push(client);

        // Set this manager to listen to commands from this new client
        client.registerCommandHandler(this);

        this.log(`Connected client for userID ${client.userID}`);

        client.handleMessage(new ActionMessage(new TableConnectedAction(this.tableID)));

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

        if (this.tableController) {
            this.tableController.handleCommand(command);
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