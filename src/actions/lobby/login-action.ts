import { LobbyAction } from "./lobby-action";
import { User } from "../../players/user";

export class LoginAction extends LobbyAction {

    public user: User;

    constructor(user: User) {

        super();

        this.user = user;

    }


}