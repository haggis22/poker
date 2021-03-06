import { MessageHandler } from "./message-handler";

export interface MessageBroadcaster {

    registerMessageHandler(handler: MessageHandler): void;

    unregisterMessageHandler(handler: MessageHandler): void;

}