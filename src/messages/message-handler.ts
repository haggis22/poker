import { Message } from "./message";

export interface MessageHandler {

    handleMessage(publicMessage: Message, privateMessage?: Message): void;

}