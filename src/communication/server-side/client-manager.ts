import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { ServerClient } from "./server-client";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";

export class ClientManager implements MessageHandler, MessageBroadcaster, CommandHandler, CommandBroadcaster {


    private commandHandlers: CommandHandler[];
    private messageHandlers: MessageHandler[];


    constructor()
    {

        this.commandHandlers = new Array<CommandHandler>();
        this.messageHandlers = new Array<MessageHandler>();
    }

    handleCommand(command: Command): void {

        console.log(`ClientManager heard: ${command.constructor.name}`);

        for (let handler of this.commandHandlers) {
            handler.handleCommand(command);
        }

    }

    registerMessageHandler(handler: MessageHandler) {

        this.messageHandlers.push(handler);
    }

    unregisterMessageHandler(handler: MessageHandler) {

        this.messageHandlers = this.messageHandlers.filter(ah => ah !== handler);

    }



    public registerCommandHandler(handler: CommandHandler) {
        this.commandHandlers.push(handler);
    }

    public unregisterCommandHandler(handler: CommandHandler) {
        this.commandHandlers = this.commandHandlers.filter(ch => ch != handler);
    }

    private broadcastCommand(command: Command) {

        for (let handler of this.commandHandlers) {
            handler.handleCommand(command);
        }

    }

    public handleMessage(publicMessage: Message, privateMessage?: Message): void {

        for (let handler of this.messageHandlers) {

            if (handler instanceof ServerClient) {

                if (privateMessage) {

                    if (handler.userID === privateMessage.userID) {
                        handler.handleMessage(privateMessage);
                    }
                    else {

                        if (publicMessage) {

                            handler.handleMessage(publicMessage);

                        }

                    }

                }
                else {
                    // there is no private message, so just send them the publicly-available one
                    handler.handleMessage(publicMessage);
                }

            }
            else {
                handler.handleMessage(publicMessage);
            }

        }

    }


}