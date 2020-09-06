import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { Message } from "../../messages/message";
import { DannySocket } from "../danny-socket";
import { Serializer } from "../serializer";
import { IServerClient } from "./i-server-client";

export class LocalServerClient implements IServerClient
     {

    private socket: DannySocket;
    private serializer: Serializer;

    public userID: number;

    private commandHandlers: CommandHandler[];

    constructor(userID: number) {

        this.userID = userID;

        this.commandHandlers = new Array<CommandHandler>();

        this.serializer = new Serializer();


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


    handleMessage(message: Message): void {

        // ServerClient objects only get the message object that is suitable for passing down the link, so ship it!
        this.send(message);

    }


}