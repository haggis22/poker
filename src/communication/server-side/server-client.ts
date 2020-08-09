import { ClientManager } from "./client-manager";
import { MessageHandler } from "../../messages/message-handler";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { CommandHandler } from "../../commands/command-handler";
import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { Command } from "../../commands/command";
import { Message } from "../../messages/message";
import { DannySocket } from "../danny-socket";
import { Haggis22Serializer } from "../haggis22-serializer";

export class ServerClient implements MessageHandler, CommandBroadcaster, DannySocket {

    private socket: DannySocket;
    private serializer: Haggis22Serializer;

    public userID: number;

    private commandHandlers: CommandHandler[];

    constructor(userID: number) {

        this.userID = userID;

        this.commandHandlers = new Array<CommandHandler>();

        this.serializer = new Haggis22Serializer();


    }

    public connect(socket: DannySocket) {
        this.socket = socket;
    }

    private send(o: any): void {

        if (this.socket) {
            this.socket.receive(this.serializer.serialize(o));
        }

    }

    receive(msg: string): void {

        let o: any = this.serializer.deserialize(msg);

        if (o && o instanceof Command) {

            // Pass the message along
            for (let handler of this.commandHandlers) {

                handler.handleCommand(o);

            }

        }

    }



    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }


    handleMessage(publicMessage: Message, privateMessage?: Message): void {

        if (this.socket) {

            // ServerClient objects only get the message object that is suitable for passing down the link.
            // The privateMessage will always be null because the ClientManager will have decided whether this
            // serverClient is allowed to have the private message (if there was one)
            this.socket.receive(this.serializer.serialize(publicMessage));

        }

    }


}