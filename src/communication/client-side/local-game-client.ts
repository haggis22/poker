import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { FakeSocket } from "../fake-socket";
import { Serializer } from "../serializer";
import { ActionMessage } from "../../messages/action-message";

export class LocalGameClient implements MessageBroadcaster, CommandHandler, FakeSocket {

    private socket: FakeSocket;
    private authToken: string;

    private serializer: Serializer;

    private messageHandlers: MessageHandler[];


    constructor(socket: FakeSocket, authToken: string) {

        this.socket = socket;
        this.authToken = authToken;

        this.messageHandlers = new Array<MessageHandler>();
        this.serializer = new Serializer();

    }


    receive(msg: string): void {

        let msgObj: any = this.serializer.deserialize(msg);

        this.log(`received ${msgObj.constructor.name}`);

        if (msgObj instanceof Message) {

            // this.log('Yes, it is a Message');

            if (msgObj instanceof ActionMessage) {


                this.log(`received action ${msgObj.action.constructor.name}`);


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

        // Stamp every outgoing message with the saved authorization token
        command.authToken = this.authToken;

        this.log(`Sending ${command.constructor.name} with authToken ${this.authToken}`);

        // introduce a slight delay so that all the robotic activity isn't just direct method invocations
        setTimeout(() => { this.socket.receive(this.serializer.serialize(command)); }, 0);

    }

    private log(msg: string): void {

        console.log('\x1b[36m%s\x1b[0m', `LocalGameClient (${this.authToken}): ${msg}`);

    }

}