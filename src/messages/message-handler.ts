import { Message } from "./message";
import { MessagePair } from "./message-pair";

export interface MessageHandler {

    handleMessage(message: Message | MessagePair): void;

}