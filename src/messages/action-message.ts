import { Message } from "./message";
import { Action } from "../actions/action";

export class ActionMessage extends Message {

    public action: Action;

    constructor(action: Action, userID?: number) {

        // No separate text in an action Message
        super(null, userID);

        this.action = action;

    }


}