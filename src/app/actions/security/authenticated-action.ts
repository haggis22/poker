import { SecurityAction } from "./security-action";
import { UserSummary } from "../../players/user-summary";

export class AuthenticatedAction extends SecurityAction {

    public user: UserSummary;

    constructor(user: UserSummary) {

        super();

        this.user = user;

    }


}