import { SecurityAction } from "./security-action";
import { User } from "../../players/user";

export class LoginAction extends SecurityAction {

    public user: User;

    constructor(user: User) {

        super();

        this.user = user;

    }


}