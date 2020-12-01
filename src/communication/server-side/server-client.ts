import * as WebSocket from 'ws';

import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { Message } from "../../messages/message";
import { Serializer } from "../serializer";
import { IServerClient } from "./i-server-client";
import { ActionMessage } from '../../messages/action-message';
import { LobbyManager } from '../../casino/lobby/lobby-manager';
import { LobbyCommand } from '../../commands/lobby/lobby-command';
import { JoinTableCommand } from '../../commands/lobby/join-table-command';
import { LoginCommand } from '../../commands/lobby/login-command';
import { User } from "../../players/user";
import { LoginAction } from '../../actions/lobby/login-action';


export class ServerClient implements IServerClient {

    private socket: WebSocket;
    private serializer: Serializer;

    private lobbyManager: LobbyManager;

    public userID: number;

    private commandHandlers: CommandHandler[];

    constructor(socket: WebSocket, lobbyManager: LobbyManager) {

        this.socket = socket;
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

            if (o instanceof LobbyCommand) {

                return this.handleLobbyCommand(o);

            }

            if (o instanceof Command) {

                // Pass the message along
                for (let handler of this.commandHandlers) {

                    handler.handleCommand(o);

                }

            }

        }  // o is not null

    }   // receive


    private handleLobbyCommand(command: LobbyCommand): void {

        if (command instanceof JoinTableCommand) {

            this.lobbyManager.addTableClient(command.tableID, this);
            return;

        }

        if (command instanceof LoginCommand) {

            let user: User = this.lobbyManager.login(command.username, command.password);
            this.log(`Login for ${command.username} successful? ${(user != null)}`);

            if (user) {

                this.userID = user.id;

                // TODO: Who should be in charge of creating the LoginAction?
                // Should it be this class? the Lobby Manager?
                this.handleMessage(new ActionMessage(new LoginAction(user)));


            }
            else {
                // TODO: send message back to player about incorrect login
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