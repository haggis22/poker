import { Message } from "./message";

export interface MessageHandler {

    id: string;

    isAlive: boolean;

    handleMessage(message: Message): void;

}