import { MessageHandler } from "./message-handler";

export interface MessageBroadcaster {

    registerMessageHandler(handler: MessageHandler);

    unregisterMessageHandler(handler: MessageHandler);

}