import { Action } from "./action";
import { ActionHandler } from "./action-handler";

export interface ActionBroadcaster {

    registerActionHandler(handler: ActionHandler);

    unregisterActionHandler(handler: ActionHandler);

}