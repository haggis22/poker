import { Message } from "./message";

export interface MessageHandler {

    id: string;

    handleMessage(message: Message): void;

}