﻿import * as WebSocket from 'ws';

import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { Message } from "../../messages/message";
import { Serializer } from "../serializer";
import { IServerClient } from "./i-server-client";
import { ActionMessage } from '../../messages/action-message';
import { LobbyManager } from '../../casino/lobby/lobby-manager';
import { LobbyCommand } from '../../commands/lobby/lobby-command';
import { UserSummary } from "../../players/user-summary";
import { UserManager } from '../../players/user-manager';
import { SecurityCommand } from '../../commands/security/security-command';


export class ServerClient implements IServerClient {

    private socket: WebSocket;
    private serializer: Serializer;

    private userManager: UserManager;
    private lobbyManager: LobbyManager;

    public userID: number;

    private commandHandlers: CommandHandler[];

    constructor(socket: WebSocket, userManager: UserManager, lobbyManager: LobbyManager) {

        this.socket = socket;

        this.userManager = userManager;
        this.lobbyManager = lobbyManager;

        this.socket.on('message', (message: string) => {
            this.receive(message);
        });

        this.commandHandlers = new Array<CommandHandler>();

        this.serializer = new Serializer();

    }

    private log(msg: string): void {

        console.log('\x1b[33m%s\x1b[0m', `ServerClient ${msg}`);

    }



    private send(o: any): void {

        if (this.socket) {
            this.socket.send(this.serializer.serialize(o));
        }

    }

    receive(msg: string): void {

        let o: any = this.serializer.deserialize(msg);

        if (o) {

            this.log(`Heard ${o.constructor.name}: ${JSON.stringify(o)}`);

            if (!(o instanceof Command)) {

                // Can't do anything with messages that aren't Commands
                return;

            }

            // Authenticate the user on every message so that a logged-out user does not continue to act
            let user: UserSummary = this.userManager.authenticate(o.authToken);

            if (user) {

                o.user = user;
                this.userID = o.userID = user.id;

            }
            else {
                o.user = null;
                this.userID = o.userID = null;
            }


            if (o instanceof SecurityCommand) {

                return this.handleMessage(this.userManager.handleCommand(o, this));

            }

            if (o instanceof LobbyCommand) {

                return this.lobbyManager.handleCommand(o, this);

            }


            // Pass the message along
            for (let handler of this.commandHandlers) {

                handler.handleCommand(o);

            }


        }  // o is not null

    }   // receive



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