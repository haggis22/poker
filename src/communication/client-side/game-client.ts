import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { CommandBroadcaster } from "../../commands/command-broadcaster";

export class GameClient implements MessageHandler, MessageBroadcaster, CommandBroadcaster {


    private commandHandler: CommandHandler;
    private messageHandlers: MessageHandler[];


    constructor() {

        this.messageHandlers = new Array<MessageHandler>();

    }

    handleMessage(publicMessage: Message, privateMessage?: Message): void {

        // Pass the message along
        for (let handler of this.messageHandlers) {

            handler.handleMessage(publicMessage, privateMessage);

        }

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

    registerCommandHandler(handler: CommandHandler): void {

        this.commandHandler = handler;

    }

    unregisterCommandHandler(handler: CommandHandler): void {

        if (this.commandHandler === handler) {

            this.commandHandler = null;

        }

    }




}