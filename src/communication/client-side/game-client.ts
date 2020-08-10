import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { DannySocket } from "../danny-socket";
import { Serializer } from "../serializer";
import { ActionMessage } from "../../messages/action-message";

export class GameClient implements MessageBroadcaster, CommandHandler, DannySocket {

    private socket: DannySocket;
    private serializer: Serializer;

    private messageHandlers: MessageHandler[];


    constructor() {

        this.messageHandlers = new Array<MessageHandler>();
        this.serializer = new Serializer();

    }


    public connect(socket: DannySocket) {

        this.socket = socket;

    }

    private send(o: any): void {

        if (this.socket) {
            this.socket.receive(o.constructor.name, this.serializer.serialize(o));
        }

    }

    receive(msgType: string, msg: string): void {

        console.log(`GameClient: received ${msgType}`);

        let o: any = this.serializer.deserialize(msg);

        console.log(`GameClient deserialization of type ${o.constructor.name} SUCCESS`);

        if (o && o instanceof Message) {

            console.log('Yes, it is a Message');

            let message: ActionMessage = o as ActionMessage;

            if (message) {

                console.log(`Yes, it is an ActionMessage, action class = ${message.action.constructor.name}`);

                // && message.action instanceof TableAction) 
            }


            // Pass the message along
            for (let handler of this.messageHandlers) {

                handler.handleMessage(o);

            }

        }

        else {

            console.log('No, it is NOT a Message');

        }
   

    }


    registerMessageHandler(handler: MessageHandler) {

        this.messageHandlers.push(handler);

    }

    unregisterMessageHandler(handler: MessageHandler) {

        this.messageHandlers = this.messageHandlers.filter(mh => mh !== handler);

    }

    handleCommand(command: Command): void {

        this.send(command);

    }

}