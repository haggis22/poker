import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { DannySocket } from "../danny-socket";
import { Haggis22Serializer } from "../haggis22-serializer";

export class GameClient implements MessageBroadcaster, CommandHandler, DannySocket {

    private socket: DannySocket;
    private serializer: Haggis22Serializer;

    private messageHandlers: MessageHandler[];


    constructor() {

        this.messageHandlers = new Array<MessageHandler>();
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

        if (o && o instanceof Message) {

            // Pass the message along
            for (let handler of this.messageHandlers) {

                handler.handleMessage(o);

            }

        }

    }


    registerMessageHandler(handler: MessageHandler) {

        this.messageHandlers.push(handler);

    }

    unregisterMessageHandler(handler: MessageHandler) {

        this.messageHandlers = this.messageHandlers.filter(mh => mh !== handler);

    }

    handleCommand(command: Command): void {

        if (this.socket) {

            this.socket.receive(this.serializer.serialize(command));

        }

    }

}