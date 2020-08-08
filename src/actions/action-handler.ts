import { Action } from "./action";

export interface ActionHandler {

    handleAction(publicAction: Action, privateAction?: Action);

}