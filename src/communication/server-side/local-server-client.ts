import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { Message } from "../../messages/message";
import { FakeSocket } from "../fake-socket";
import { Serializer } from "../serializer";
import { IServerClient } from "./i-server-client";
import { LobbyManager } from '../../casino/lobby/lobby-manager';
import { UserSummary } from "../../players/user-summary";
import { LobbyCommand } from "../../commands/lobby/lobby-command";

export class LocalServerClient implements IServerClient
{

    private socket: FakeSocket;
    private serializer: Serializer;

    public userID: number;
    public user: UserSummary;

    private lobbyManager: LobbyManager;


    private commandHandlers: CommandHandler[];

    constructor(lobbyManager: LobbyManager, user: UserSummary) {

        this.lobbyManager = lobbyManager;

        this.user = user;

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

        if (o) {

            if (!(o instanceof Command)) {

                // Can't do anything with messages that aren't Commands
                return;
            }

            o.user = this.user;
            this.userID = o.userID = this.user.id;

            if (o instanceof LobbyCommand) {

                return this.lobbyManager.handleCommand(o, this);

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