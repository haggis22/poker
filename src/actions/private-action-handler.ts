import { Action } from "./action";
import { PrivateAction } from "./private-action";

export interface PrivateActionHandler {

    handleAction(publicAction: Action, privateAction?: PrivateAction): void;

}