import { PrivateActionHandler } from "./private-action-handler";

export interface PrivateActionBroadcaster {

    registerPrivateActionHandler(handler: PrivateActionHandler);

    unregisterPrivateActionHandler(handler: PrivateActionHandler);

}