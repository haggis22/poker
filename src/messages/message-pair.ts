import { Message } from "./message";

export class MessagePair {

    public publicMessage: Message;
    public privateMessage: Message;

    constructor(publicMessage: Message, privateMessage: Message) {

        this.publicMessage = publicMessage;
        this.privateMessage = privateMessage;

    }

}