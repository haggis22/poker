import { SecurityAction } from "./security-action";

export class AuthenticationFailedAction extends SecurityAction {

    public message: string;

    constructor(message: string) {

        super();

        this.message = message;

    }


}