import { Message } from "./message";

export class ErrorMessage extends Message {

    constructor(text: string, userID: number) {

        super(text, userID);

    }


}