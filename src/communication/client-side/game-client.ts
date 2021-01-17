import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { Serializer } from "../serializer";
import { ActionMessage } from "../../messages/action-message";
import { TableConnectedAction } from "../../actions/table/state/table-connected-action";

export class GameClient implements MessageBroadcaster, CommandHandler {

    private socket: WebSocket;
    private authToken: string;

    private serializer: Serializer;

    private messageHandlers: MessageHandler[];


    constructor(socket: WebSocket, authToken: string) {

        this.socket = socket;
        this.authToken = authToken;

        console.log('Setting up web socket listener');

        this.socket.onmessage = (evt: MessageEvent) => {

            this.receive(evt.data);

        };


        this.messageHandlers = new Array<MessageHandler>();
        this.serializer = new Serializer();

    }


    receive(msg: string): void {

        let msgObj: any = this.serializer.deserialize(msg);

        // this.log(`received ${msgObj.constructor.name}: ${msg}`);

        if (msgObj instanceof Message) {

            // this.log('Yes, it is a Message');

            if (msgObj instanceof ActionMessage) {


                // this.log(`received action ${msgObj.action.constructor.name}`);


            }

            // Pass the message along
            for (let handler of this.messageHandlers) {

                // this.log(`Passed message to ${handler.constructor.name}`);
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

        this.log(`Sending ${command.constructor.name}`);

        // Stamp every outgoing message with the saved authorization token
        command.authToken = this.authToken;

        this.socket.send(this.serializer.serialize(command));

    }  // handleCommand


    private log(msg: string): void {

        console.log('\x1b[36m%s\x1b[0m', `GameClient ${msg}`);

    }

}