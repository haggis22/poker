import { LobbyCommand } from "./lobby-command";

export class LoginCommand extends LobbyCommand {

    username: string;
    password: string;


    constructor(username: string, password: string) {

        super();

        this.username = username;
        this.password = password;

    }

}