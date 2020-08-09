import { MessageHandler } from "../messages/message-handler";
import { CommandBroadcaster } from "../commands/command-broadcaster";
import { User } from "../players/user";
import { CommandHandler } from "../commands/command-handler";
import { Message } from "../messages/message";
import { ActionMessage } from "../messages/action-message";
import { Command } from "../commands/command";

export class ClientUI implements MessageHandler, CommandBroadcaster {

    private user: User;
    private commandHandlers: CommandHandler[];

    constructor(user: User) {

        this.user = user;

        this.commandHandlers = new Array<CommandHandler>();

    }


    handleMessage(publicMessage: Message, privateMessage?: Message): void {

        let text = `${this.user.name}:`;
        if (publicMessage && publicMessage.text) {

            text += ' ' + publicMessage.text;

        }

        if (publicMessage instanceof ActionMessage)
        {
            text += ` ${(typeof publicMessage.action)}`;
        }

        console.log(text);

    }

    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }

    private broadcastCommand(command: Command) {

        for (let handler of this.commandHandlers) {

            handler.handleCommand(command);

        }

    }


}