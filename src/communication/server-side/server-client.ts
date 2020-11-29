import * as WebSocket from 'ws';

import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { Message } from "../../messages/message";
import { Serializer } from "../serializer";
import { IServerClient } from "./i-server-client";
import { ActionMessage } from '../../messages/action-message';

export class ServerClient implements IServerClient {

    private socket: WebSocket;
    private serializer: Serializer;

    public userID: number;

    private commandHandlers: CommandHandler[];

    constructor(socket: WebSocket, userID: number) {

        this.socket = socket;

        this.socket.on('message', (message: string) => {
            this.receive(message);
        });

        this.userID = userID;

        this.commandHandlers = new Array<CommandHandler>();

        this.serializer = new Serializer();


    }

    private send(o: any): void {

        if (this.socket) {
            this.socket.send(this.serializer.serialize(o));
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

        console.log(`ServerClient sending ${message.constructor.name}`);
        if (message instanceof ActionMessage) {
            console.log(`  ServerClient sending message ${message.action.constructor.name}`);
        }

        this.send(message);

    }


}