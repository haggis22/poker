import { SecurityAction } from "./security-action";
import { UserSummary } from "../../players/user-summary";

export class LoginFailedAction extends SecurityAction {

    public message: string;

    constructor(message: string) {

        super();

        this.message = message;

    }


}