import { SecurityAction } from "./security-action";

export class LoginFailedAction extends SecurityAction {

    public message: string;

    constructor(message: string) {

        super();

        this.message = message;

    }


}