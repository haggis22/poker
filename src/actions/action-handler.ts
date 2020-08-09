import { Action } from "./action";

export interface ActionHandler {

    handleAction(action: Action): void;

}