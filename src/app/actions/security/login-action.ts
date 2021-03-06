import { SecurityAction } from "./security-action";
import { UserSummary } from "../../players/user-summary";

export class LoginAction extends SecurityAction {

    public user: UserSummary;
    public authToken: string;

    constructor(user: UserSummary, authToken: string) {

        super();

        this.user = user;
        this.authToken = authToken;

    }


}