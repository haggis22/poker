import { SecurityCommand } from "./security-command";

export class AuthenticateCommand extends SecurityCommand {

    username: string;
    password: string;


    constructor(username: string, password: string) {

        super();

        this.username = username;
        this.password = password;

    }

}