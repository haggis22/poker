import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { TableCommand } from "../../commands/table/table-command";
import { Message } from "../../messages/message";
import { FakeSocket } from "../fake-socket";
import { Serializer } from "../serializer";
import { IServerClient } from "./i-server-client";
import { LobbyManager } from '../../casino/lobby/lobby-manager';

export class LocalServerClient implements IServerClient
    {

    private socket: FakeSocket;
    private serializer: Serializer;

    public userID: number;

    private lobbyManager: LobbyManager;


    private commandHandlers: CommandHandler[];

    constructor(tableID: number, lobbyManager: LobbyManager, userID: number) {

        this.lobbyManager = lobbyManager;
        this.userID = userID;

        this.commandHandlers = new Array<CommandHandler>();

        this.serializer = new Serializer();

    }

    public connect(socket: FakeSocket) {
        this.socket = socket;
    }

    private send(o: any): void {

        if (this.socket) {

            // introduce a slight delay so that all the robotic activity isn't just direct method invocations
            setTimeout(() => { this.socket.receive(this.serializer.serialize(o)); }, 0);

        }

    }

    receive(msg: string): void {

        let o: any = this.serializer.deserialize(msg);

        if (o && o instanceof Command) {

            // Always mark the User ID as the one belonging to this server - not anything 
            // that might have been passed in from the message - that could always be spoofed
            if (o instanceof TableCommand) {
                o.userID = this.userID;
            }

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