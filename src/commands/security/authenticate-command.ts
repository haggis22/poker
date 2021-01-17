import { SecurityCommand } from "./security-command";

export class AuthenticateCommand extends SecurityCommand {

    authToken: string;


    constructor(authToken: string) {

        super();

        this.authToken = authToken;

    }

}