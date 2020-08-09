import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";

export class ClientUI implements MessageHandler, CommandBroadcaster {

    handleMessage(publicMessage: Message, privateMessage?: Message): void {
        throw new Error("Method not implemented.");
    }

    registerCommandHandler(handler: CommandHandler) {
        throw new Error("Method not implemented.");
    }

    unregisterCommandHandler(handler: CommandHandler) {
        throw new Error("Method not implemented.");
    }

    broadcastCommand(command: Command) {
        throw new Error("Method not implemented.");
    }


}