import { Message } from "./message";
import { Action } from "../actions/action";
import { Serializable } from "../communication/serializable";

export class ActionMessage extends Message implements Serializable {

    public isSerializable: boolean = true;

    public action: Action;

    constructor(action: Action, userID?: number) {

        // No separate text in an action Message
        super(null, userID);

        this.action = action;

    }


}