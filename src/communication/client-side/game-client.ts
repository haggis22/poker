import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";

export class GameClient implements MessageBroadcaster, CommandHandler {


    private commandHandler: CommandHandler;
    private messageHandlers: MessageHandler[];


    constructor() {

        this.messageHandlers = new Array<MessageHandler>();

    }

    registerMessageHandler(handler: MessageHandler) {

        this.messageHandlers.push(handler);

    }

    unregisterMessageHandler(handler: MessageHandler) {

        this.messageHandlers = this.messageHandlers.filter(mh => mh !== handler);

    }


    handleCommand(command: Command): void {

        if (this.commandHandler) {

            this.commandHandler.handleCommand(command);

        }

    }





}