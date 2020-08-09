import { ClientManager } from "./client-manager";
import { MessageHandler } from "../../messages/message-handler";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { CommandHandler } from "../../commands/command-handler";
import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { Command } from "../../commands/command";
import { Message } from "../../messages/message";

export class ServerClient implements MessageHandler, MessageBroadcaster, CommandHandler, CommandBroadcaster {

    public userID: number;

    private commandHandler: CommandHandler;
    private messageHandler: MessageHandler;

    constructor(userID: number, clientManager: ClientManager) {

        this.userID = userID;

        this.registerCommandHandler(clientManager);
        clientManager.registerMessageHandler(this);

    }


    registerCommandHandler(handler: CommandHandler) {
        this.commandHandler = handler;
    }

    unregisterCommandHandler(handler: CommandHandler) {

        if (this.commandHandler == handler) {

            this.commandHandler = null;

        }
    }

    handleCommand(command: Command): void {

        if (this.commandHandler != null) {
            this.commandHandler.handleCommand(command);
        }

    }

    registerMessageHandler(handler: MessageHandler) {
        this.messageHandler = handler;
    }

    unregisterMessageHandler(handler: MessageHandler) {

        if (this.messageHandler === handler) {

            this.messageHandler = null;

        }
    }

    handleMessage(publicMessage: Message, privateMessage?: Message): void {

        if (this.messageHandler != null) {

            // ServerClient objects only get the message object that is suitable for passing down the link.
            // The privateMessage will always be null because the ClientManager will have decided whether this
            // serverClient is allowed to have the private message (if there was one)
            this.messageHandler.handleMessage(publicMessage);

        }

    }


}