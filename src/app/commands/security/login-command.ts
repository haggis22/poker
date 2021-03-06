import { SecurityCommand } from "./security-command";

export class LoginCommand extends SecurityCommand {

    username: string;
    password: string;


    constructor(username: string, password: string) {

        super();

        this.username = username;
        this.password = password;

    }

}