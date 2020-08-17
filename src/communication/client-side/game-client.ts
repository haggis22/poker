import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { DannySocket } from "../danny-socket";
import { Serializer } from "../serializer";
import { ActionMessage } from "../../messages/action-message";
import { TableConnectedAction } from "../../actions/table/state/table-connected-action";

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

            this.log(`Sending ${o.constructor.name}`);

            this.socket.receive(this.serializer.serialize(o));
        }

    }

    receive(msg: string): void {

        let msgObj: any = this.serializer.deserialize(msg);

        this.log(`received ${msgObj.constructor.name}: ${msg}`);

        if (msgObj instanceof Message) {

            // this.log('Yes, it is a Message');

            if (msgObj instanceof ActionMessage) {


                this.log(`received action ${msgObj.action.constructor.name}`);


            }

            // Pass the message along
            for (let handler of this.messageHandlers) {

                this.log(`Passed message to ${handler.constructor.name}`);
                handler.handleMessage(msgObj);

            }

        }

        else {

            this.log('No, it is NOT a Message');

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

    private log(msg: string): void {

        // console.log('\x1b[36m%s\x1b[0m', `GameClient ${msg}`);

    }

}