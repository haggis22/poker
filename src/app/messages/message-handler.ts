import { Message } from "./message";

export interface MessageHandler {

    handleMessage(message: Message): void;

}